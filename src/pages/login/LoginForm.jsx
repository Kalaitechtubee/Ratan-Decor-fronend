import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { UserTypeContext } from '../../context/UserTypeContext';
import API from '../../services/api';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { updateUserType } = useContext(UserTypeContext);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      // First check if the server is available
      try {
        const isServerAvailable = await API.checkServerAvailability();
        if (!isServerAvailable) {
          throw new Error('Backend server is not available. Please ensure the server is running or try again later.');
        }
      } catch (serverCheckError) {
        console.error('Server availability check failed:', serverCheckError);
        // Provide more specific error messages based on the error type
        if (serverCheckError.message.includes('CORS')) {
          throw new Error('Cross-origin request blocked. This is likely a configuration issue with the API server. Please check the CORS settings or contact support.');
        } else if (serverCheckError.message.includes('timeout')) {
          throw new Error('Server connection timed out. The server might be overloaded or unreachable.');
        } else if (serverCheckError.message.includes('Network')) {
          throw new Error('Network error. This might be a CORS issue or the backend server is not running. Please check your connection settings and ensure the backend server is running.');
        } else {
          throw new Error('Unable to connect to the server. Please try again later or contact support.');
        }
      }

      const response = await API.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      
      // Check if login was successful
      if (!response.success) {
        throw new Error(response.message || 'Login failed. Please try again.');
      }

      // No need to set these values as they're already set in API.setAuthData
      // Just verify they exist
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server. Missing authentication data.');
      }

      const loginSuccess = login({
        userId: response.user.id,
        email: response.user.email,
        username: response.user.name || response.user.username,
        userType: response.user.userType
      }, response.token);

      if (!loginSuccess) {
        throw new Error('Failed to initialize user session');
      }

      // Update user type in context
      if (response.user && response.user.userType) {
        updateUserType(response.user.userType.toLowerCase());
      }
      
      setShowSuccess(true);
      
      setTimeout(() => {
        const intendedPath = localStorage.getItem('intendedPath') || '/home';
        localStorage.removeItem('intendedPath');
        navigate(intendedPath, { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = err.message || 'Login failed. Please check your credentials and try again.';
      
      // Provide more user-friendly error messages for common issues
      if (errorMessage.includes('Network Error') || errorMessage.includes('network error')) {
        errorMessage = 'Network error. Please check your internet connection and ensure the backend server is running.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Request timed out. The server might be experiencing high load or connectivity issues.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.fromRegister) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    }
  }, [location.state]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const containerVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } 
  };

  return (
    <div className="flex justify-center items-center px-4 py-12 min-h-screen bg-gray-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 w-full max-w-md"
      >
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-primary rounded-2xl shadow-lg">
            <FaUser className="w-10 h-10 text-white" />
          </div>
          <h2 className="mb-2 text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-lg text-gray-600">Sign in to your account</p>
        </div>

        {/* Form Section */}
        <motion.form 
          className="p-8 space-y-6 rounded-3xl border shadow-xl bg-white" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* General Error Message */}
          <AnimatePresence>
            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }} 
                className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200"
              >
                {errors.general}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheck className="w-5 h-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p>{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none">
                  <FaUser className="w-5 h-5 text-gray-400" />
                </div>
                <motion.input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  placeholder="Enter your email" 
                />
              </div>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none">
                  <FaLock className="w-5 h-5 text-gray-400" />
                </div>
                <motion.input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="current-password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  placeholder="Enter your password" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="flex absolute inset-y-0 right-0 items-center pr-4"
                >
                  {showPassword ? 
                    <FaEyeSlash className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : 
                    <FaEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>
          </div>

          <div className="flex justify-end items-center">
            <Link 
              to="/forgot-password" 
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={loading} 
            className={`w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary shadow-lg hover:bg-primary/90'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <FaSpinner className="mr-3 animate-spin" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>
        </motion.form>

        {/* Success Popup */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }} 
                className="p-12 w-full max-w-lg bg-white rounded-xl shadow-md"
              >
                <div className="space-y-6 text-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} 
                    className="flex justify-center items-center mx-auto w-16 h-16 bg-primary rounded-2xl"
                  >
                    <FaCheck className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Login Successful!</h2>
                    <p className="mb-6 text-gray-600">Redirecting you to your destination...</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginForm;