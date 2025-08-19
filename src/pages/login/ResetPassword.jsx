// src/pages/login/ResetPassword.js (New Component)
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import API from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token'); // Assume token is passed in URL query

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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
      await API.resetPassword(resetToken, formData.newPassword);
      setSuccess(true);
    } catch (err) {
      setErrors({ 
        general: err.message || 'Failed to reset password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4"
            >
              <FaCheckCircle className="h-8 w-8 text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset.
            </p>
            <Link
              to="/login"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaArrowLeft />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4"
          >
            <FaLock className="h-8 w-8 text-[#ff4747]" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter a new password for your account.
          </p>
        </div>

        <motion.form 
          className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl"
          onSubmit={handleSubmit}
        >
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {errors.general}
            </motion.div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200 ${
                    errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.newPassword}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Resetting Password...
              </div>
            ) : (
              <>
                <FaLock className="mr-2" />
                Reset Password
              </>
            )}
          </motion.button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#ff4747] hover:text-red-700 transition-colors duration-200"
            >
              <FaArrowLeft />
              Back to Login
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
