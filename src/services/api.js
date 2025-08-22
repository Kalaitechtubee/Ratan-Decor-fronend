import axios from 'axios';

// Use import.meta.env for Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
// For absolute URLs, keep as is; for relative URLs, use window.location.origin
const FULL_API_URL = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;

class API {
  constructor() {
    this.AUTH_ENDPOINT = AUTH_ENDPOINT;
    this.FULL_API_URL = FULL_API_URL;
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.cache = new Map(); // Cache with TTL
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes TTL
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Request-ID'] = this.generateRequestId();
        if (import.meta.env.MODE === 'development') {
          console.log(`🚀 [API] Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }
        return config;
      },
      (error) => {
        console.error(`🚫 [API] Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        if (import.meta.env.MODE === 'development') {
          console.log(`✅ [API] Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        if (response.config.method?.toLowerCase() === 'get') {
          this.cache.set(response.config.url, {
            data: response.data,
            timestamp: Date.now(),
          });
        }
        return response;
      },
      async (error) => {
        if (error.response) {
          const { status, data } = error.response;
          if (import.meta.env.MODE === 'development') {
            console.error(`❌ [API] Error: ${status} ${data?.message || 'No message'}`, {
              url: error.config?.url,
              method: error.config?.method,
              data: data,
            });
          }
          switch (status) {
            case 400:
              if (data?.message.includes('user type') || data?.message.includes('UserType')) {
                await this.handleUserTypeError();
              }
              return Promise.reject(new Error(data?.message || 'Invalid data provided.'));
            case 401:
              await this.handleUnauthorized();
              return Promise.reject(new Error('Session expired. Please log in again.'));
            case 403:
              return Promise.reject(new Error(data?.message || 'Access forbidden. Insufficient permissions.'));
            case 404:
              return Promise.reject(new Error(data?.message || `Resource not found at ${error.config?.url}.`));
            case 409:
              return Promise.reject(new Error(data?.message || 'Conflict: Resource already exists.'));
            case 429:
              return Promise.reject(new Error('Too many requests. Please try again later.'));
            case 500:
              return Promise.reject(new Error(data?.message || 'Server error. Please try again later.'));
            default:
              return Promise.reject(new Error(data?.message || `Request failed with status ${status}`));
          }
        } else if (error.request) {
          console.error('Network error details:', error.request);
          let errorMessage = 'Network error. ';
          
          if (error.message && error.message.includes('Network Error')) {
            errorMessage += 'This might be a CORS issue. ';
          }
          
          errorMessage += 'Please check your connection and ensure the backend server is running.';
          return Promise.reject(new Error(errorMessage));
        } else {
          return Promise.reject(new Error(error.message || 'An unexpected error occurred.'));
        }
      }
    );
  }

  // ============= UTILITY METHODS =============
  generateRequestId() {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  validateInput(data, requiredFields = [], options = {}) {
    // Check required fields
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    }
    
    // Validate email if needed
    if (options.validateEmail && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
    }
    
    // Validate role if needed
    if (options.validRoles && data.role) {
      const role = data.role.toString().toLowerCase();
      if (!options.validRoles.map(r => r.toLowerCase()).includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${options.validRoles.join(', ')}`);
      }
    }
    
    return true;
  }

  getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  getUserData() {
    if (typeof window === 'undefined') return null;
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;
      return {
        id: userId,
        userId,
        email: localStorage.getItem('email'),
        name: localStorage.getItem('username'),
        userType: localStorage.getItem('userType'),
        userTypeName: localStorage.getItem('userTypeName'),
        role: localStorage.getItem('userRole'),
        status: localStorage.getItem('userStatus'),
      };
    } catch {
      return null;
    }
  }

  setAuthData(data) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('email', data.user.email);
    localStorage.setItem('username', data.user.name || data.user.username);
    localStorage.setItem('userRole', data.user.role || 'General');
    localStorage.setItem('userStatus', data.user.status || 'Approved');
    localStorage.setItem('userTypeId', data.user.userTypeId || '');
    localStorage.setItem('userTypeName', data.user.userTypeName || '');
    this.invalidateCache(); // Invalidate cache on auth data change
  }

  clearAuthData() {
    if (typeof window === 'undefined') return;
    const keysToRemove = ['token', 'userId', 'email', 'username', 'userRole', 'userStatus', 'userTypeId', 'userTypeName'];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    this.invalidateCache(); // Invalidate cache on logout
  }

  async handleUnauthorized() {
    this.clearAuthData();
    if (typeof window !== 'undefined') {
      localStorage.setItem('intendedPath', window.location.pathname);
      window.location.href = '/login';
    }
    return false;
  }

  async handleUserTypeError() {
    const userData = this.getUserData();
    if (userData?.id && userData.role === 'Admin') {
      // For admins, try to fetch profile to get updated userType
      try {
        const profile = await this.getProfile();
        if (profile?.user) {
          this.setAuthData({ token: this.getToken(), user: profile.user });
        }
        return;
      } catch (error) {
        console.warn('Failed to fetch profile:', error.message);
      }
    }
    // For non-admins or if profile fetch fails, redirect to contact admin page
    if (typeof window !== 'undefined') {
      window.location.href = '/contact-admin';
    }
  }

  invalidateCache() {
    this.cache.clear(); // Clear all cache on auth-related changes
  }

  async request(endpoint, method = 'GET', data = null, options = {}, retryCount = 0, handleRateLimiting = false) {
    try {
      const cacheKey = `${method.toUpperCase()}:${endpoint}${data ? JSON.stringify(data) : ''}${JSON.stringify(options.params || {})}`;
      const cached = this.cache.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
        return cached.data;
      }

      const config = {
        method: method.toLowerCase(),
        url: endpoint,
        ...options,
      };

      if (data) {
        if (method.toLowerCase() === 'get') {
          config.params = data;
        } else {
          config.data = data;
        }
      }

      try {
        const response = await this.instance(config);
        return response.data;
      } catch (requestError) {
        // Handle rate limiting (429) errors with special retry logic
        if (handleRateLimiting && requestError.response && requestError.response.status === 429) {
          if (retryCount < 3) { // Allow more retries for rate limiting
            console.log(`🔄 [API] Rate limited, retrying with backoff (${retryCount + 1}/3): ${method} ${endpoint}`);
            // Exponential backoff with jitter: 2s, 4s, 8s + random jitter
            const baseDelay = 2000 * Math.pow(2, retryCount);
            const jitter = Math.random() * 1000; // Add up to 1s of random jitter
            const delay = baseDelay + jitter;
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.request(endpoint, method, data, options, retryCount + 1, handleRateLimiting);
          }
        }
        // Standard retry logic for network errors or 5xx server errors
        else if (retryCount < 2 && (
            !requestError.response || // Network error
            (requestError.response && requestError.response.status >= 500) // Server error
          )) {
          console.log(`🔄 [API] Retrying request (${retryCount + 1}/2): ${method} ${endpoint}`);
          // Exponential backoff: 1s, 2s
          const delay = 1000 * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request(endpoint, method, data, options, retryCount + 1, handleRateLimiting);
        }
        throw requestError;
      }
    } catch (error) {
      console.error(`🚫 [API] Error (${method} ${endpoint}):`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      throw error;
    }
  }

  // Helper method to get auth headers for fetch requests
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Handle fetch API responses
  async handleResponse(response) {
    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        await this.handleUnauthorized();
      }
      
      // Try to extract error message from response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse JSON response
    try {
      return await response.json();
    } catch (e) {
      // If response cannot be parsed as JSON, return empty object
      return {};
    }
  }

  // Check if the backend server is available
  async checkServerAvailability() {
    try {
      // Try multiple approaches to check server availability
      
      // 1. First try with fetch API to the health endpoint
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('Server health check successful with fetch API');
          return true;
        }
      } catch (fetchError) {
        console.log('Fetch health check failed:', fetchError.message);
        // Continue to next approach
      }
      
      // 2. Try with fetch API to the base URL
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok || response.status === 404) {
          // Even a 404 means the server is running
          console.log('Server base URL check successful with fetch API');
          return true;
        }
      } catch (fetchError) {
        console.log('Fetch base URL check failed:', fetchError.message);
        // Continue to next approach
      }
      
      // 3. Try with fetch API using the full URL (with origin)
      try {
        const response = await fetch(FULL_API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok || response.status === 404) {
          // Even a 404 means the server is running
          console.log('Server full URL check successful with fetch API');
          return true;
        }
      } catch (fetchError) {
        console.log('Fetch full URL check failed:', fetchError.message);
        // Continue to next approach
      }
      
      // 4. Fallback to axios
      try {
        await this.instance.get('/health', { timeout: 5000 });
        console.log('Server health check successful with axios');
        return true;
      } catch (axiosError) {
        if (axiosError.response) {
          // Any response means server is running
          console.log('Server responded with status:', axiosError.response.status);
          return true;
        }
        throw axiosError; // Re-throw for the outer catch block
      }
    } catch (error) {
      let errorMessage = 'Backend server may not be available: ';
      
      if (error.message && error.message.includes('Network Error')) {
        errorMessage += 'Network error. This might be a CORS issue. Please check your connection and ensure the backend server is running.';
      } else if (error.response) {
        // Server responded with an error status - but this means it's running
        return true;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response received from server. Server might be down or unreachable.';
      } else {
        // Something else happened
        errorMessage += error.message || 'Unknown error';
      }
      
      console.warn(errorMessage);
      return false;
    }
  }

  // ============= AUTHENTICATION ROUTES =============
  
  async login({ email, password }) {
    // Validate input
    this.validateInput({ email, password }, ['email', 'password'], { validateEmail: true });
    
    try {
      const response = await this.request('/auth/login', 'POST', { email, password });
      
      if (response && response.token) {
        // Set auth data in local storage
        this.setAuthData(response);
        
        return {
          success: true,
          token: response.token,
          user: response.user,
          message: response.message || 'Login successful',
        };
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid credentials. Please try again.');
    }
  }

  async register(userData) {
    const validRoles = ['General', 'customer', 'Architect', 'Dealer', 'Admin', 'Manager', 'Sales', 'Support'];
    this.validateInput(userData, ['name', 'email', 'password'], {
      validateEmail: true,
      validRoles
    });
  
    try {
      const response = await this.request('/auth/register', 'POST', userData);
      return {
        success: true,
        userId: response.userId,
        message: response.message,
        requiresApproval: response.requiresApproval,
        status: response.status
      };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }
  
  async logout() {
    try {
      await this.request('/auth/logout', 'POST');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error.message);
      return { success: false, message: error.message };
    } finally {
      this.clearAuthData();
    }
  }
  
  async checkUserStatus(email) {
    this.validateInput({ email }, ['email'], { validateEmail: true });
    try {
      const response = await this.request(`/auth/status/${encodeURIComponent(email)}`, 'GET');
      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to check user status');
    }
  }
  
  async resendApproval(email) {
    this.validateInput({ email }, ['email'], { validateEmail: true });
    try {
      const response = await this.request('/auth/resend-approval', 'POST', { email });
      return {
        success: true,
        message: response.message,
        status: response.status,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to resend approval request');
    }
  }
  
  async forgotPassword(email) {
    this.validateInput({ email }, ['email'], { validateEmail: true });
    try {
      const response = await this.request('/auth/forgot-password', 'POST', { email });
      return {
        success: true,
        message: response.message,
        otpSent: response.otpSent,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send password reset OTP');
    }
  }
  
  async verifyOTP({ email, otp }) {
    this.validateInput({ email, otp }, ['email', 'otp'], { validateEmail: true });
    try {
      const response = await this.request('/auth/verify-otp', 'POST', { email, otp });
      return {
        success: true,
        message: response.message,
        resetToken: response.resetToken,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }
  
  async resetPassword({ resetToken, newPassword }) {
    this.validateInput({ resetToken, newPassword }, ['resetToken', 'newPassword']);
    try {
      const response = await this.request('/auth/reset-password', 'POST', { resetToken, newPassword });
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  // Track last profile fetch time to prevent rate limiting
  #lastProfileFetch = 0;
  #profileFetchMinInterval = 5000; // 5 seconds minimum between requests
  
  async getProfile() {
    try {
      // Check if we've fetched profile recently
      const now = Date.now();
      const timeSinceLastFetch = now - this.#lastProfileFetch;
      
      // If cached in localStorage and fetched recently, use that instead
      const cachedUsername = localStorage.getItem('username');
      if (cachedUsername && timeSinceLastFetch < this.#profileFetchMinInterval) {
        console.log('Using cached profile data to avoid rate limiting');
        return { 
          user: { 
            name: cachedUsername,
            email: localStorage.getItem('email'),
            userTypeId: localStorage.getItem('userTypeId'),
            userTypeName: localStorage.getItem('userTypeName'),
            role: localStorage.getItem('userRole'),
            status: localStorage.getItem('userStatus')
          } 
        };
      }
      
      // Update last fetch time
      this.#lastProfileFetch = now;
      
      // Make the actual request with retry logic for 429 errors
      return await this.request('/auth/me', 'GET', null, {}, 0, true);
    } catch (error) {
      // Still return a valid response structure even on error
      const username = localStorage.getItem('username') || 'User';
      if (error.message.includes('Too many requests')) {
        console.warn('Rate limited when fetching profile, using cached data');
        return { 
          user: { 
            name: username,
            email: localStorage.getItem('email'),
            userTypeId: localStorage.getItem('userTypeId'),
            userTypeName: localStorage.getItem('userTypeName'),
            role: localStorage.getItem('userRole'),
            status: localStorage.getItem('userStatus')
          } 
        };
      }
      throw new Error(error.message || 'Failed to fetch profile.');
    }
  }

  // Track last profile update time to prevent rate limiting
  #lastProfileUpdate = 0;
  #profileUpdateMinInterval = 2000; // 2 seconds minimum between requests
  
  async updateProfile(profileData) {
    // Check if we've updated profile recently
    const now = Date.now();
    const timeSinceLastUpdate = now - this.#lastProfileUpdate;
    
    if (timeSinceLastUpdate < this.#profileUpdateMinInterval) {
      console.warn('Throttling profile update to avoid rate limiting');
      await new Promise(resolve => setTimeout(resolve, this.#profileUpdateMinInterval - timeSinceLastUpdate));
    }
    
    // Update last update time
    this.#lastProfileUpdate = Date.now();
    
    const cleanedData = {};
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleanedData[key] = value;
      }
    });

    try {
      const response = await this.request('/auth/me', 'PUT', cleanedData, {}, 0, true);
      if (response.user) {
        this.setAuthData({ token: this.getToken(), user: response.user });
      }
      return response;
    } catch (error) {
      if (error.message.includes('Too many requests')) {
        console.warn('Rate limited when updating profile, will retry later');
        // Return a partial success response to avoid breaking the UI
        return { 
          success: false, 
          message: 'Profile update throttled. Please try again in a moment.',
          user: this.getUserData()
        };
      }
      throw new Error(error.message || 'Failed to update profile.');
    }
  }

  // ============= USER TYPE MANAGEMENT =============
  async getUserTypes() {
    try {
      return await this.request('/user-types', 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user types.');
    }
  }

  async getUserType(id) {
    if (!id) {
      throw new Error('User type ID is required');
    }
    try {
      return await this.request(`/user-types/${id}`, 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user type.');
    }
  }

  async createUserType(userTypeData) {
    if (!userTypeData?.name) {
      throw new Error('User type name is required');
    }
    try {
      return await this.request('/user-types', 'POST', {
        ...userTypeData,
        name: userTypeData.name.trim(),
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to create user type.');
    }
  }

  async updateUserType(id, userTypeData) {
    if (!id || !userTypeData?.name) {
      throw new Error('User type ID and name are required');
    }
    try {
      return await this.request(`/user-types/${id}`, 'PUT', {
        ...userTypeData,
        name: userTypeData.name.trim(),
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to update user type.');
    }
  }

  async deleteUserType(id) {
    if (!id) {
      throw new Error('User type ID is required');
    }
    try {
      return await this.request(`/user-types/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete user type.');
    }
  }

  // ============= PRODUCT MANAGEMENT =============
  async getProducts(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        categoryId: params.categoryId,
        subcategoryId: params.subcategoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        search: params.search,
        userType: params.userType,
      };
      return await this.request('/products', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch products.');
    }
  }

  async getProduct(id, params = {}) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    try {
      const queryParams = { userType: params.userType };
      return await this.request(`/products/${id}`, 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch product details.');
    }
  }

  async createProduct(productData, files = []) {
    if (!productData?.name || !productData?.generalPrice || !productData?.architectPrice || !productData?.dealerPrice) {
      throw new Error('Product name and prices are required');
    }
    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('images', file);
        });
      }
      return await this.request('/products', 'POST', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to create product.');
    }
  }

  async updateProduct(id, productData, files = []) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('images', file);
        });
      }
      return await this.request(`/products/${id}`, 'PUT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to update product.');
    }
  }

  async deleteProduct(id) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    try {
      return await this.request(`/products/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete product.');
    }
  }

  async addProductRating(productId, ratingData) {
    if (!productId || !ratingData?.rating) {
      throw new Error('Product ID and rating are required');
    }
    try {
      return await this.request(`/products/${productId}/rate`, 'POST', ratingData);
    } catch (error) {
      throw new Error(error.message || 'Failed to add product rating.');
    }
  }

  async getProductRatings(productId, params = {}) {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      return await this.request(`/products/${productId}/ratings`, 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch product ratings.');
    }
  }

  // ============= CATEGORY MANAGEMENT =============
  async getCategories(params = {}) {
    try {
      const queryParams = {
        userTypeId: params.userTypeId,
      };
      return await this.request('/categories', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch categories.');
    }
  }

  async getSubCategories(parentId, params = {}) {
    if (!parentId) {
      throw new Error('Parent category ID is required');
    }
    try {
      const queryParams = {
        userTypeId: params.userTypeId,
      };
      return await this.request(`/categories/${parentId}/subcategories`, 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch subcategories.');
    }
  }

  async createCategory(categoryData) {
    if (!categoryData?.name) {
      throw new Error('Category name is required');
    }
    try {
      return await this.request('/categories', 'POST', categoryData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create category.');
    }
  }

  async updateCategory(id, categoryData) {
    if (!id || !categoryData?.name) {
      throw new Error('Category ID and name are required');
    }
    try {
      return await this.request(`/categories/${id}`, 'PATCH', categoryData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update category.');
    }
  }

  async deleteCategory(id) {
    if (!id) {
      throw new Error('Category ID is required');
    }
    try {
      return await this.request(`/categories/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete category.');
    }
  }

  // ============= CART MANAGEMENT =============
  async getCart() {
    try {
      const response = await this.request('/cart', 'GET');
      if (import.meta.env.MODE === 'development') {
        console.log('📋 [API] Cart fetched successfully:', {
          itemCount: response.count || 0,
          totalAmount: response.cartSummary?.total || 0,
        });
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch cart.');
    }
  }

  async addToCart(productId, quantity = 1, options = {}) {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    try {
      return await this.request('/cart', 'POST', { productId, quantity, ...options });
    } catch (error) {
      throw new Error(error.message || 'Failed to add item to cart.');
    }
  }

  async updateCartItem(itemId, quantity) {
    if (!itemId || !quantity) {
      throw new Error('Cart item ID and quantity are required');
    }
    try {
      return await this.request(`/cart/${itemId}`, 'PUT', { quantity });
    } catch (error) {
      throw new Error(error.message || 'Failed to update cart item.');
    }
  }

  async removeFromCart(itemId) {
    if (!itemId) {
      throw new Error('Cart item ID is required');
    }
    try {
      return await this.request(`/cart/${itemId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to remove item from cart.');
    }
  }

  async clearCart() {
    try {
      return await this.request('/cart', 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to clear cart.');
    }
  }

  // ============= ORDER MANAGEMENT =============
  async createOrder(orderData) {
    if (!orderData?.items || !orderData?.shippingAddressId) {
      throw new Error('Order items and shipping address ID are required');
    }
    try {
      return await this.request('/orders', 'POST', orderData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create order.');
    }
  }

  async getOrders(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status,
        paymentStatus: params.paymentStatus,
        startDate: params.startDate,
        endDate: params.endDate,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      };
      return await this.request('/orders', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders.');
    }
  }

  async getOrderById(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}`, 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch order.');
    }
  }

  async updateOrder(orderId, updateData) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}`, 'PUT', updateData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update order.');
    }
  }

  async cancelOrder(orderId, reason) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}/cancel`, 'PUT', { reason });
    } catch (error) {
      throw new Error(error.message || 'Failed to cancel order.');
    }
  }

  async deleteOrder(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete order.');
    }
  }

  // ============= SHIPPING ADDRESS MANAGEMENT =============
  async getShippingAddresses() {
    try {
      return await this.request('/shipping-address', 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch shipping addresses.');
    }
  }

  async createShippingAddress(addressData) {
    if (!addressData?.name || !addressData?.address || !addressData?.city || !addressData?.state || !addressData?.country || !addressData?.pincode) {
      throw new Error('All address fields are required');
    }
    try {
      return await this.request('/shipping-address', 'POST', addressData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create shipping address.');
    }
  }

  async updateShippingAddress(addressId, addressData) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/shipping-address/${addressId}`, 'PUT', addressData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update shipping address.');
    }
  }

  async deleteShippingAddress(addressId) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/shipping-address/${addressId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete shipping address.');
    }
  }

  // ============= USER ROLE MANAGEMENT =============
  async getUsersByRole(params = {}) {
    try {
      const queryParams = {
        role: params.role,
        status: params.status,
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
      };
      return await this.request('/roles/users', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users by role.');
    }
  }

  async updateUserRole(userId, roleData) {
    if (!userId || !roleData?.role) {
      throw new Error('User ID and role are required');
    }
    try {
      return await this.request(`/roles/users/${userId}/role`, 'PUT', {
        role: roleData.role,
        status: roleData.status,
        userTypeId: roleData.userTypeId,
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to update user role.');
    }
  }

  async updateUserStatus(userId, statusData) {
    if (!userId || !statusData?.status) {
      throw new Error('User ID and status are required');
    }
    try {
      return await this.request(`/roles/users/${userId}/status`, 'PUT', statusData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update user status.');
    }
  }

  async getRoleStats() {
    try {
      return await this.request('/roles/stats', 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch role statistics.');
    }
  }

  // ============= USER MANAGEMENT =============
  async getUsers(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
        role: params.role,
        status: params.status,
        userTypeName: params.userTypeName,
      };
      return await this.request('/users', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users.');
    }
  }

  async getUserById(id) {
    if (!id) {
      throw new Error('User ID is required');
    }
    try {
      return await this.request(`/users/${id}`, 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user.');
    }
  }

  async updateUser(id, userData) {
    if (!id) {
      throw new Error('User ID is required');
    }
    try {
      const cleanedData = {};
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleanedData[key] = value;
        }
      });
      return await this.request(`/users/${id}`, 'PUT', cleanedData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update user.');
    }
  }

  async deleteUser(id) {
    if (!id) {
      throw new Error('User ID is required');
    }
    try {
      return await this.request(`/users/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete user.');
    }
  }

  async createUser(userData) {
    if (!userData?.name || !userData?.email || !userData?.password || !userData?.role) {
      throw new Error('Name, email, password, and role are required');
    }
    try {
      const cleanedData = {
        ...userData,
        email: userData.email.toLowerCase().trim(),
      };
      return await this.request('/users', 'POST', cleanedData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create user.');
    }
  }

  // ============= ADMIN MANAGEMENT =============
  async getPendingUsers(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
      };
      return await this.request('/admin/users/pending', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch pending users.');
    }
  }

  async getAllUsersAdmin(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
      };
      return await this.request('/admin/users', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users.');
    }
  }

  async approveUser(userId, statusData) {
    if (!userId || !statusData?.status) {
      throw new Error('User ID and status are required');
    }
    try {
      return await this.request(`/admin/users/${userId}/approve`, 'PUT', statusData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update user status.');
    }
  }

  async getUserStats() {
    try {
      return await this.request('/admin/stats', 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user statistics.');
    }
  }

  // ============= ENQUIRY MANAGEMENT =============
  async getEnquiries(params = {}) {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status,
        priority: params.priority,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      };
      return await this.request('/enquiries', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch enquiries.');
    }
  }

  async getEnquiryById(id) {
    if (!id) {
      throw new Error('Enquiry ID is required');
    }
    try {
      return await this.request(`/enquiries/${id}`, 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch enquiry.');
    }
  }

  async createEnquiry(enquiryData) {
    if (!enquiryData?.subject || !enquiryData?.message) {
      throw new Error('Subject and message are required');
    }
    try {
      return await this.request('/enquiries', 'POST', enquiryData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create enquiry.');
    }
  }

  async updateEnquiry(id, enquiryData) {
    if (!id) {
      throw new Error('Enquiry ID is required');
    }
    try {
      return await this.request(`/enquiries/${id}`, 'PUT', enquiryData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update enquiry.');
    }
  }

  async deleteEnquiry(id) {
    if (!id) {
      throw new Error('Enquiry ID is required');
    }
    try {
      return await this.request(`/enquiries/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete enquiry.');
    }
  }

  async respondToEnquiry(id, responseData) {
    if (!id || !responseData?.response) {
      throw new Error('Enquiry ID and response are required');
    }
    try {
      return await this.request(`/enquiries/${id}/respond`, 'POST', responseData);
    } catch (error) {
      throw new Error(error.message || 'Failed to respond to enquiry.');
    }
  }

  // ============= ADDRESS MANAGEMENT (Legacy support) =============
  async getAddresses() {
    try {
      return await this.request('/addresses', 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch addresses.');
    }
  }

  async createAddress(addressData) {
    if (!addressData?.name || !addressData?.address || !addressData?.city || !addressData?.state || !addressData?.country || !addressData?.pincode) {
      throw new Error('All address fields are required');
    }
    try {
      return await this.request('/addresses', 'POST', addressData);
    } catch (error) {
      throw new Error(error.message || 'Failed to create address.');
    }
  }

  async updateAddress(addressId, addressData) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/addresses/${addressId}`, 'PUT', addressData);
    } catch (error) {
      throw new Error(error.message || 'Failed to update address.');
    }
  }

  async deleteAddress(addressId) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/addresses/${addressId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.message || 'Failed to delete address.');
    }
  }

  // ============= PROFILE MANAGEMENT =============
  async getProfileData() {
    try {
      return await this.request('/auth/me', 'GET');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile.');
    }
  }

  async updateProfileData(profileData) {
    try {
      const cleanedData = {};
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleanedData[key] = value;
        }
      });
      const response = await this.request('/auth/me', 'PUT', cleanedData);
      if (response.user) {
        this.setAuthData({ token: this.getToken(), user: response.user });
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile.');
    }
  }

  // ============= UTILITY METHODS =============
  isAuthenticated() {
    return !!this.getToken();
  }

  getUserRole() {
    return localStorage.getItem('userRole') || 'General';
  }

  getUserTypeName() {
    return localStorage.getItem('userTypeName') || 'General';
  }

  getUserTypeId() {
    return localStorage.getItem('userTypeId') || null;
  }

  getUserStatus() {
    return localStorage.getItem('userStatus') || 'Approved';
  }

  hasRole(roles) {
    if (typeof roles === 'string') {
      roles = [roles];
    }
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  }

  isAdmin() {
    return this.hasRole(['Admin', 'Manager']);
  }

  // ============= FILE UPLOAD HELPERS =============
  async uploadFile(endpoint, file, additionalData = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });

      return await this.request(endpoint, 'POST', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to upload file.');
    }
  }

  async uploadMultipleFiles(endpoint, files, additionalData = {}) {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });

      return await this.request(endpoint, 'POST', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to upload files.');
    }
  }
  // Add these methods inside the API class in your API file
async getAllSeo() {
  try {
    return await this.request('/api/seo', 'GET');
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch SEO data.');
  }
}

async getAllPageNames() {
  try {
    return await this.request('/api/seo/pagenames', 'GET');
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch page names.');
  }
}

async updateSeo(id, seoData) {
  if (!id || !seoData?.pageName || !seoData?.title) {
    throw new Error('SEO ID, pageName, and title are required');
  }
  try {
    return await this.request(`/api/seo/${id}`, 'PUT', seoData);
  } catch (error) {
    throw new Error(error.message || 'Failed to update SEO data.');
  }
}
}

// Create and export a singleton instance
const api = new API();
export default api;