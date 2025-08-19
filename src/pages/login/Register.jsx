import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
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
      const response = await API.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        username: formData.name.trim(),
      });

      if (response.userId) {
        localStorage.setItem('registrationData', JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
        }));

        localStorage.setItem('tempUserId', response.userId);

        navigate('/details', { 
          state: { 
            fromRegister: true,
            userId: response.userId 
          } 
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({
        general: err.message === 'User with this email already exists'
          ? 'This email is already registered. Please use a different email or log in.'
          : err.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4 py-12 min-h-screen bg-gray-50">
      <div className="space-y-8 w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-primary rounded-2xl shadow-lg">
            <FaUserPlus className="w-10 h-10 text-white" />
          </div>
          <h2 className="mb-2 text-4xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="text-lg text-gray-600">
            Join us to start your journey
          </p>
        </div>

        <motion.form 
          className="p-8 space-y-6 rounded-3xl border shadow-xl bg-white" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {errors.general && (
            <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
              {errors.general}
            </div>
          )}

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none">
                  <FaUser className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  autoComplete="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  placeholder="Enter your full name" 
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none">
                  <FaEnvelope className="w-5 h-5 text-gray-400" />
                </div>
                <input 
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.email}
                </p>
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
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`} 
                  placeholder="Create a strong password" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="flex absolute inset-y-0 right-0 items-center pr-4"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>
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
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </motion.button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-primary hover:text-primary/80"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Register;
