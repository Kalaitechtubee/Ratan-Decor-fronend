import axios from 'axios';

// Normalize any provided API base to ensure it ends with /api
function normalizeApiBaseUrl(raw) {
  const defaultPath = '/api';
  if (!raw) return defaultPath;
  const value = raw.trim();
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const url = new URL(value);
      if (!url.pathname.endsWith('/api')) {
        url.pathname = url.pathname.replace(/\/$/, '') + '/api';
      }
      return url.toString().replace(/\/$/, '');
    } catch {
      return defaultPath;
    }
  }
  const rel = value.startsWith('/') ? value : `/${value}`;
  return rel.endsWith('/api') ? rel : rel.replace(/\/$/, '') + '/api';
}

let API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || 'https://ratan-decor.loca.lt');
let FULL_API_URL = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
let AUTH_ENDPOINT = `${API_BASE_URL}/auth`;

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
    this._redirectingToLogin = false; // Prevent repeated redirects
    this.protectedPrefixes = [
      '/auth/profile',
      '/cart',
      '/orders',
      '/addresses',
      '/shipping-address',
      '/roles',
      '/users',
      '/admin',
      '/categories'
    ];
    this.setupInterceptors();
  }

  // Allow runtime switching between localhost and loca.lt without rebuild
  setBaseUrl(newBaseUrl) {
    API_BASE_URL = normalizeApiBaseUrl(newBaseUrl);
    FULL_API_URL = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
    AUTH_ENDPOINT = `${API_BASE_URL}/auth`;
    this.instance.defaults.baseURL = API_BASE_URL;
    this.AUTH_ENDPOINT = AUTH_ENDPOINT;
    this.FULL_API_URL = FULL_API_URL;
    this.invalidateCache();
  }

  setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (import.meta.env.MODE === 'development' && import.meta.env.VITE_API_DEBUG === 'true') {
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
        if (import.meta.env.MODE === 'development' && import.meta.env.VITE_API_DEBUG === 'true') {
          console.log(`✅ [API] Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
      },
      async (error) => {
        if (error.response) {
          const { status, data } = error.response;
          if (import.meta.env.MODE === 'development' && import.meta.env.VITE_API_DEBUG === 'true') {
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
    const mappedUserType = this.mapUserType(
      data.user.userTypeName || data.user.userType || 'General'
    );
    localStorage.setItem('userType', mappedUserType);
    if (data.user.userTypeId !== undefined && data.user.userTypeId !== null) {
      localStorage.setItem('userTypeId', String(data.user.userTypeId));
    }
    if (data.user.userTypeName) {
      localStorage.setItem('userTypeName', data.user.userTypeName);
    }
    localStorage.setItem('userRole', this.mapUserRole(data.user.role || 'General'));
    localStorage.setItem('userStatus', data.user.status || 'Approved');
    this.invalidateCache(); // Invalidate cache on auth data change
  }

  clearAuthData() {
    if (typeof window === 'undefined') return;
    const keysToRemove = ['token', 'userId', 'email', 'username', 'userType', 'userTypeId', 'userTypeName', 'userRole', 'userStatus'];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    this.invalidateCache(); // Invalidate cache on logout
  }

  async handleUnauthorized() {
    // Prevent multiple redirects or reload loops
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/login') {
        return false;
      }
      const now = Date.now();
      const lastRedirectTs = Number(sessionStorage.getItem('lastLoginRedirectTs') || '0');
      if (this._redirectingToLogin || (now - lastRedirectTs) < 4000) {
        return false;
      }
      this._redirectingToLogin = true;
      sessionStorage.setItem('lastLoginRedirectTs', String(now));
    }

    this.clearAuthData();
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== '/login') {
        localStorage.setItem('intendedPath', window.location.pathname);
      }
      try {
        window.location.replace('/login');
      } finally {
        // Reset flag shortly after to allow future redirects if needed
        setTimeout(() => { this._redirectingToLogin = false; }, 5000);
      }
    }
    // Placeholder for token refresh (not implemented in backend)
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const response = await this.request('/auth/refresh', 'POST', { refreshToken });
        this.setAuthData(response);
        return true; // Indicate refresh success
      } catch {
        return false; // Refresh failed
      }
    }
    return false;
  }

  async handleUserTypeError() {
    const userData = this.getUserData();
    if (userData?.id && userData.role === 'Admin') {
      // For admins, set a default userType temporarily
      localStorage.setItem('userType', 'General');
      this.invalidateCache();
      return;
    }
    // For non-admins, redirect to contact admin page or login
    if (typeof window !== 'undefined') {
      window.location.href = '/contact-admin';
    }
  }

  mapUserRole(role) {
    const roleMap = {
      general: 'General',
      customer: 'General',
      architect: 'Architect',
      dealer: 'Dealer',
      admin: 'Admin',
      manager: 'Manager',
      sales: 'Sales',
      support: 'Support',
    };
    return roleMap[role?.toLowerCase()] || 'General';
  }

  mapUserType(userType) {
    const typeMap = {
      residential: 'Residential',
      commercial: 'Commercial',
      'modular kitchen': 'Modular Kitchen',
      modularkitchen: 'Modular Kitchen',
      others: 'Others',
      general: 'General',
    };
    if (userType === null || userType === undefined) return 'General';
    const normalized = String(userType).toLowerCase().replace(/\s+/g, '');
    // Special-case to support keys that contain space when not stripped first
    if (normalized === 'modularkitchen') return 'Modular Kitchen';
    return typeMap[normalized] || 'General';
  }

  invalidateCache() {
    this.cache.clear(); // Clear all cache on auth-related changes
  }

  async request(endpoint, method = 'GET', data = null, options = {}, retryCount = 0, handleRateLimiting = false) {
    try {
      // Soft fallback for a non-existent convenience endpoint
      if (endpoint === '/userType/my-type') {
        const userTypeName = localStorage.getItem('userTypeName') || localStorage.getItem('userType') || 'General';
        return { success: true, userType: this.mapUserType(userTypeName) };
      }

      // Avoid protected calls when unauthenticated
      const token = this.getToken();
      const isProtected = this.protectedPrefixes.some((p) => endpoint === p || endpoint.startsWith(p + '/'));
      if (!token && isProtected) {
        if (endpoint === '/auth/profile') {
          const cached = this.getUserData();
          if (cached) return { user: cached };
        }
        if (endpoint.startsWith('/orders')) {
          return { stats: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0, totalValue: 0, thisMonthValue: 0, averageOrderValue: 0 }, recentOrders: [] };
        }
        throw new Error('Not authenticated');
      }

      const cacheKey = `${method.toUpperCase()}:${endpoint}${data ? JSON.stringify(data) : ''}${JSON.stringify(options.params || {})}`;      const cached = this.cache.get(cacheKey);

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
        if (config.method === 'get') {
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          });
        }
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
      // Determine origin (absolute takes precedence)
      let origin;
      if (API_BASE_URL.startsWith('http')) {
        const u = new URL(API_BASE_URL);
        origin = `${u.protocol}//${u.host}`;
      } else {
        origin = window.location.origin;
      }

      // Try multiple approaches to check server availability

      // 1. First try with fetch API to the root health endpoint (no headers to avoid preflight)
      try {
        const response = await fetch(`${origin}/health`, { method: 'GET' });
        
        if (response.ok) {
          console.log('Server health check successful with fetch API');
          return true;
        }
      } catch (fetchError) {
        console.log('Fetch health check failed:', fetchError.message);
        // Continue to next approach
      }
      
      // 2. Try with fetch API to the base URL (no headers to avoid preflight)
      try {
        const response = await fetch(API_BASE_URL, { method: 'GET' });
        
        if (response.ok || response.status === 404) {
          // Even a 404 means the server is running
          console.log('Server base URL check successful with fetch API');
          return true;
        }
      } catch (fetchError) {
        console.log('Fetch base URL check failed:', fetchError.message);
        // Continue to next approach
      }
      
      // 3. Try with fetch API using the full URL (with origin, no headers)
      try {
        const response = await fetch(FULL_API_URL, { method: 'GET' });
        
        if (response.ok || response.status === 404) {
          // Even a 404 means the server is running
          console.log('Server full URL check successful with fetch API');
          return true;
        }
      } catch (fetchError) {
        console.log('Fetch full URL check failed:', fetchError.message);
        // Continue to next approach
      }
      
      // 4. Fallback to axios against root health
      try {
        await axios.get(`${origin}/health`, { timeout: 5000, withCredentials: true });
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
    
    // Check server availability before attempting login
    const isServerAvailable = await this.checkServerAvailability();
    if (!isServerAvailable) {
      throw new Error('Backend server is not available. Please try again later or contact support.');
    }
    
    try {
      let data;
      let loginSuccessful = false;
      let loginError = null;
      
      // Try multiple approaches to login
      
      // 1. First try with fetch API to the login endpoint
      try {
        console.log('Attempting login with fetch API');
        const response = await fetch(`${this.AUTH_ENDPOINT}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        data = await this.handleResponse(response);
        loginSuccessful = true;
        console.log('Login successful with fetch API');
      } catch (fetchError) {
        console.log('Fetch login attempt failed:', fetchError.message);
        loginError = fetchError;
        // Continue to next approach
      }
      
      // 2. If first fetch attempt failed, try with full URL
      if (!loginSuccessful) {
        try {
          console.log('Attempting login with fetch API using full URL');
          const fullLoginUrl = `${FULL_API_URL}/auth/login`;
          const response = await fetch(fullLoginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          data = await this.handleResponse(response);
          loginSuccessful = true;
          console.log('Login successful with fetch API using full URL');
        } catch (fetchFullUrlError) {
          console.log('Fetch login with full URL attempt failed:', fetchFullUrlError.message);
          // Continue to next approach
        }
      }
      
      // 3. If fetch attempts failed, try with axios
      if (!loginSuccessful) {
        try {
          console.log('Attempting login with axios');
          const response = await this.instance.post('/auth/login', { email, password });
          data = response.data;
          loginSuccessful = true;
          console.log('Login successful with axios');
        } catch (axiosError) {
          console.log('Axios login attempt failed:', axiosError.message);
          // If all methods failed, throw the original error
          if (loginError) {
            throw loginError;
          }
          throw axiosError;
        }
      }
      
      // Process successful login
      if (loginSuccessful && data) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Set auth data in local storage
        this.setAuthData(data);
        
        return {
          success: true,
          token: data.token,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || data.user.username,
            role: this.mapUserRole(data.user.role),
            userType: this.mapUserType(data.user.userType || data.user.userTypeId),
            status: data.user.status,
          },
          message: data.message || 'Login successful',
        };
      } else {
        throw new Error('Login failed with all available methods');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      if (error.message && error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection and ensure the backend server is running.');
      } else if (error.message && error.message.includes('CORS')) {
        throw new Error('Cross-origin request blocked. This is likely a configuration issue with the API server.');
      } else if (error.message && error.message.includes('timeout')) {
        throw new Error('Request timed out. The server might be experiencing high load or connectivity issues.');
      } else if (error.response && error.response.status === 401) {
        throw new Error('Invalid credentials. Please check your email and password.');
      } else if (error.response && error.response.status === 403) {
        throw new Error('Your account is not authorized to log in. Please contact support.');
      } else {
        throw new Error(error.message || 'Invalid credentials. Please try again.');
      }
    }
  }

  async register(userData) {
    const validRoles = ['General', 'customer', 'Architect', 'Dealer', 'Admin', 'Manager', 'Sales', 'Support'];
    this.validateInput(userData, ['name', 'email', 'password'], {
      validateEmail: true,
      validRoles
    });
  
    const response = await fetch(`${this.AUTH_ENDPOINT}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await this.handleResponse(response);
    return {
      success: true,
      userId: data.userId,
      message: data.message,
      requiresApproval: data.requiresApproval,
      status: data.status
    };
  }
  
  async logout() {
    try {
      const response = await fetch(`${this.AUTH_ENDPOINT}/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      await this.handleResponse(response);
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
    const response = await fetch(`${this.AUTH_ENDPOINT}/status/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    return {
      success: true,
      user: data.user,
    };
  }
  
  async resendApproval(email) {
    this.validateInput({ email }, ['email'], { validateEmail: true });
    const response = await fetch(`${this.AUTH_ENDPOINT}/resend-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ email }),
    });
    const data = await this.handleResponse(response);
    return {
      success: true,
      message: data.message,
      status: data.status,
    };
  }
  
  async forgotPassword(email) {
    this.validateInput({ email }, ['email'], { validateEmail: true });
    const response = await fetch(`${this.AUTH_ENDPOINT}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const data = await this.handleResponse(response);
    return {
      success: true,
      message: data.message,
      otpSent: data.otpSent,
    };
  }
  
  async verifyOTP({ email, otp }) {
    this.validateInput({ email, otp }, ['email', 'otp'], { validateEmail: true });
    const response = await fetch(`${this.AUTH_ENDPOINT}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    const data = await this.handleResponse(response);
    return {
      success: true,
      message: data.message,
      resetToken: data.resetToken,
    };
  }
  
  async resetPassword({ resetToken, newPassword }) {
    this.validateInput({ resetToken, newPassword }, ['resetToken', 'newPassword']);
    const response = await fetch(`${this.AUTH_ENDPOINT}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetToken, newPassword }),
    });
    const data = await this.handleResponse(response);
    return {
      success: true,
      message: data.message,
    };
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
            userType: localStorage.getItem('userType')
          } 
        };
      }
      
      // Update last fetch time
      this.#lastProfileFetch = now;
      
      // Make the actual request with retry logic for 429 errors
      return await this.request('/auth/profile', 'GET', null, {}, 0, true);
    } catch (error) {
      // Still return a valid response structure even on error
      const username = localStorage.getItem('username') || 'User';
      if (error.message.includes('Too many requests')) {
        console.warn('Rate limited when fetching profile, using cached data');
        return { 
          user: { 
            name: username,
            email: localStorage.getItem('email'),
            userType: localStorage.getItem('userType')
          } 
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch profile.');
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
        if (key === 'role') {
          cleanedData[key] = this.mapUserRole(value);
        } else if (key === 'userType') {
          cleanedData[key] = this.mapUserType(value);
        } else {
          cleanedData[key] = value;
        }
      }
    });
    try {
      const response = await this.request('/auth/profile', 'PUT', cleanedData, {}, 0, true);
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
      throw new Error(error.response?.data?.message || 'Failed to update profile.');
    }
  }

  // ============= USER TYPE MANAGEMENT =============
  async getUserTypes() {
    try {
      return await this.request('/user-types', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user types.');
    }
  }

  async getUserType(id) {
    if (!id) {
      throw new Error('User type ID is required');
    }
    try {
      return await this.request(`/user-types/${id}`, 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user type.');
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
      throw new Error(error.response?.data?.message || 'Failed to create user type.');
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
      throw new Error(error.response?.data?.message || 'Failed to update user type.');
    }
  }

  async deleteUserType(id) {
    if (!id) {
      throw new Error('User type ID is required');
    }
    try {
      return await this.request(`/user-types/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user type.');
    }
  }

  // ============= PRODUCT MANAGEMENT =============
  async getProducts(params = {}) {
    try {
      const rawUserType = params.userType || localStorage.getItem('userType') || 'General';
      const mappedUserType = this.mapUserType(rawUserType);
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        categoryId: params.categoryId,
        subcategoryId: params.subcategoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        search: params.search,
        userType: mappedUserType,
      };
      return await this.request('/products', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products.');
    }
  }

  async getProduct(id, params = {}) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    try {
      const rawUserType = params.userType || localStorage.getItem('userType') || 'General';
      const mappedUserType = this.mapUserType(rawUserType);
      const queryParams = { userType: mappedUserType };
      return await this.request(`/products/${id}`, 'GET', queryParams);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product details.');
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
      throw new Error(error.response?.data?.message || 'Failed to create product.');
    }
  }

  async updateProduct(id, productData, files = []) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    try {
      const formData = new FormData();
      Object.entries(productData || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('images', file);
        });
      }
      return await this.request(`/products/${id}`, 'PUT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product.');
    }
  }

  async deleteProduct(id) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    try {
      return await this.request(`/products/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete product.');
    }
  }

  async addProductRating(productId, ratingData) {
    if (!productId || !ratingData?.rating) {
      throw new Error('Product ID and rating are required');
    }
    try {
      return await this.request(`/products/${productId}/rate`, 'POST', ratingData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add product rating.');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch product ratings.');
    }
  }

  // ============= CATEGORY MANAGEMENT =============
  async getCategories(params = {}) {
    try {
      const queryParams = {
        userTypeId: params.userTypeId || localStorage.getItem('userTypeId'),
      };
      return await this.request('/categories', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories.');
    }
  }

  async getSubCategories(parentId, params = {}) {
    if (!parentId) {
      throw new Error('Parent category ID is required');
    }
    try {
      const queryParams = {
        userTypeId: params.userTypeId || localStorage.getItem('userTypeId'),
      };
      return await this.request(`/categories/${parentId}/subcategories`, 'GET', queryParams);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories.');
    }
  }

  async createCategory(categoryData) {
    if (!categoryData?.name || !categoryData?.userTypeId) {
      throw new Error('Category name and user type ID are required');
    }
    try {
      return await this.request('/categories', 'POST', categoryData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create category.');
    }
  }

  async updateCategory(id, categoryData) {
    if (!id || !categoryData?.name) {
      throw new Error('Category ID and name are required');
    }
    try {
      return await this.request(`/categories/${id}`, 'PATCH', categoryData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update category.');
    }
  }

  async deleteCategory(id) {
    if (!id) {
      throw new Error('Category ID is required');
    }
    try {
      return await this.request(`/categories/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete category.');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch cart.');
    }
  }

  async addToCart(productId, quantity = 1, options = {}) {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    try {
      return await this.request('/cart', 'POST', { productId, quantity, ...options });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add item to cart.');
    }
  }

  async updateCartItem(itemId, quantity) {
    if (!itemId || !quantity) {
      throw new Error('Cart item ID and quantity are required');
    }
    try {
      return await this.request(`/cart/${itemId}`, 'PUT', { quantity });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update cart item.');
    }
  }

  async removeFromCart(itemId) {
    if (!itemId) {
      throw new Error('Cart item ID is required');
    }
    try {
      return await this.request(`/cart/${itemId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart.');
    }
  }

  async clearCart() {
    try {
      return await this.request('/cart', 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart.');
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
      throw new Error(error.response?.data?.message || 'Failed to create order.');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch orders.');
    }
  }

  async getOrderById(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}`, 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order.');
    }
  }

  async updateOrder(orderId, updateData) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}`, 'PUT', updateData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update order.');
    }
  }

  async cancelOrder(orderId, reason) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}/cancel`, 'PUT', { reason });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order.');
    }
  }

  async deleteOrder(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    try {
      return await this.request(`/orders/${orderId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete order.');
    }
  }

  // ============= SHIPPING ADDRESS MANAGEMENT =============
  async getShippingAddresses() {
    try {
      return await this.request('/shipping-address', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch shipping addresses.');
    }
  }

  async createShippingAddress(addressData) {
    if (!addressData?.name || !addressData?.address || !addressData?.city || !addressData?.state || !addressData?.country || !addressData?.pincode) {
      throw new Error('All address fields are required');
    }
    try {
      return await this.request('/shipping-address', 'POST', addressData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create shipping address.');
    }
  }

  async updateShippingAddress(addressId, addressData) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/shipping-address/${addressId}`, 'PUT', addressData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update shipping address.');
    }
  }

  async deleteShippingAddress(addressId) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/shipping-address/${addressId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete shipping address.');
    }
  }

  async setDefaultShippingAddress(addressId) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/shipping-address/${addressId}/default`, 'PATCH');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to set default shipping address.');
    }
  }

  // ============= USER ROLE MANAGEMENT =============
  async getUsersByRole(params = {}) {
    try {
      const queryParams = {
        role: this.mapUserRole(params.role),
        status: params.status,
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
      };
      return await this.request('/roles/users', 'GET', queryParams);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users by role.');
    }
  }

  async updateUserRole(userId, roleData) {
    if (!userId || !roleData?.role) {
      throw new Error('User ID and role are required');
    }
    try {
      return await this.request(`/roles/users/${userId}/role`, 'PUT', {
        role: this.mapUserRole(roleData.role),
        status: roleData.status,
        userTypeId: roleData.userTypeId,
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role.');
    }
  }

  async updateUserStatus(userId, statusData) {
    if (!userId || !statusData?.status) {
      throw new Error('User ID and status are required');
    }
    try {
      return await this.request(`/roles/users/${userId}/status`, 'PUT', statusData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status.');
    }
  }

  async getRoleStats() {
    try {
      return await this.request('/roles/stats', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch role statistics.');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch users.');
    }
  }

  async getUserById(id) {
    if (!id) {
      throw new Error('User ID is required');
    }
    try {
      return await this.request(`/users/${id}`, 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user.');
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
          if (key === 'role') {
            cleanedData[key] = this.mapUserRole(value);
          } else if (key === 'userType') {
            cleanedData[key] = this.mapUserType(value);
          } else {
            cleanedData[key] = value;
          }
        }
      });
      return await this.request(`/users/${id}`, 'PUT', cleanedData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user.');
    }
  }

  async deleteUser(id) {
    if (!id) {
      throw new Error('User ID is required');
    }
    try {
      return await this.request(`/users/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user.');
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
        role: this.mapUserRole(userData.role),
        userTypeId: userData.userTypeId,
      };
      return await this.request('/users', 'POST', cleanedData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user.');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch pending users.');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch users.');
    }
  }

  async approveUser(userId, statusData) {
    if (!userId || !statusData?.status) {
      throw new Error('User ID and status are required');
    }
    try {
      return await this.request(`/admin/users/${userId}/approve`, 'PUT', statusData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status.');
    }
  }

  async getUserStats() {
    try {
      return await this.request('/admin/stats', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics.');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch enquiries.');
    }
  }

  async getEnquiryById(id) {
    if (!id) {
      throw new Error('Enquiry ID is required');
    }
    try {
      return await this.request(`/enquiries/${id}`, 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch enquiry.');
    }
  }

  async createEnquiry(enquiryData) {
    if (!enquiryData?.subject || !enquiryData?.message) {
      throw new Error('Subject and message are required');
    }
    try {
      return await this.request('/enquiries', 'POST', enquiryData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create enquiry.');
    }
  }

  async updateEnquiry(id, enquiryData) {
    if (!id) {
      throw new Error('Enquiry ID is required');
    }
    try {
      return await this.request(`/enquiries/${id}`, 'PUT', enquiryData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update enquiry.');
    }
  }

  async deleteEnquiry(id) {
    if (!id) {
      throw new Error('Enquiry ID is required');
    }
    try {
      return await this.request(`/enquiries/${id}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete enquiry.');
    }
  }

  async respondToEnquiry(id, responseData) {
    if (!id || !responseData?.response) {
      throw new Error('Enquiry ID and response are required');
    }
    try {
      return await this.request(`/enquiries/${id}/respond`, 'POST', responseData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to respond to enquiry.');
    }
  }

  // ============= ADDRESS MANAGEMENT (Legacy support) =============
  async getAddresses() {
    try {
      return await this.request('/addresses', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch addresses.');
    }
  }

  async createAddress(addressData) {
    if (!addressData?.name || !addressData?.address || !addressData?.city || !addressData?.state || !addressData?.country || !addressData?.pincode) {
      throw new Error('All address fields are required');
    }
    try {
      return await this.request('/addresses', 'POST', addressData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create address.');
    }
  }

  async updateAddress(addressId, addressData) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/addresses/${addressId}`, 'PUT', addressData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update address.');
    }
  }

  async deleteAddress(addressId) {
    if (!addressId) {
      throw new Error('Address ID is required');
    }
    try {
      return await this.request(`/addresses/${addressId}`, 'DELETE');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete address.');
    }
  }

  // ============= PROFILE MANAGEMENT =============
  async getProfileData() {
    try {
      return await this.request('/auth/profile', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile.');
    }
  }

  async updateProfileData(profileData) {
    try {
      const cleanedData = {};
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'role') {
            cleanedData[key] = this.mapUserRole(value);
          } else if (key === 'userType') {
            cleanedData[key] = this.mapUserType(value);
          } else {
            cleanedData[key] = value;
          }
        }
      });
      const response = await this.request('/auth/profile', 'PUT', cleanedData);
      if (response.user) {
        this.setAuthData({ token: this.getToken(), user: response.user });
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile.');
    }
  }

  // Additional helpers
  async getCartCount() {
    try {
      return await this.request('/cart/count', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cart count.');
    }
  }

  async getOrderStats() {
    try {
      return await this.request('/orders/stats', 'GET');
    } catch (error) {
      return { stats: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0, totalValue: 0, thisMonthValue: 0, averageOrderValue: 0 }, recentOrders: [] };
    }
  }

  async getAvailableOrderAddresses() {
    try {
      return await this.request('/orders/addresses', 'GET');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available addresses.');
    }
  }

  // ============= UTILITY METHODS =============
  isAuthenticated() {
    return !!this.getToken();
  }

  getUserRole() {
    return localStorage.getItem('userRole') || 'General';
  }

  getUserType() {
    return localStorage.getItem('userType') || 'General';
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
      throw new Error(error.response?.data?.message || 'Failed to upload file.');
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
      throw new Error(error.response?.data?.message || 'Failed to upload files.');
    }
  }
}

// Create and export a singleton instance
const api = new API();
export default api;