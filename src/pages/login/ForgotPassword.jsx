import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaSpinner, FaCheckCircle, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import API from '../../services/api';

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState('email'); // email, verify, reset
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = (step) => {
    const newErrors = {};

    if (step === 'email') {
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (step === 'verify') {
      if (!verificationCode.trim()) {
        newErrors.verificationCode = 'Verification code is required';
      } else if (verificationCode.length !== 6) {
        newErrors.verificationCode = 'Verification code must be 6 digits';
      }
    } else if (step === 'reset') {
      if (!newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (!validatePassword(newPassword)) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm('email')) return;

    setLoading(true);
    setErrors({});

    try {
      await API.forgotPassword(email.trim().toLowerCase());
      setEmailSent(true);
      setCurrentStep('verify');
    } catch (err) {
      setErrors({ 
        general: err.message || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm('verify')) return;

    setLoading(true);
    setErrors({});

    try {
      // Verify the code (you'll need to implement this API endpoint)
      await API.verifyResetCode(email, verificationCode);
      setVerificationSent(true);
      setCurrentStep('reset');
    } catch (err) {
      setErrors({ 
        general: err.message || 'Invalid verification code. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!validateForm('reset')) return;

    setLoading(true);
    setErrors({});

    try {
      // Reset password with verification code
      await API.resetPasswordWithCode(email, verificationCode, newPassword);
      setCurrentStep('success');
    } catch (err) {
      setErrors({ 
        general: err.message || 'Failed to reset password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setLoading(true);
    try {
      await API.forgotPassword(email.trim().toLowerCase());
      setVerificationSent(true);
    } catch (err) {
      setErrors({ 
        general: 'Failed to resend verification code. Please try again.' 
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

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  // Success state
  if (currentStep === 'success') {
    return (
      <div className="flex justify-center items-center px-4 py-12 min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 w-full max-w-md"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full"
            >
              <FaCheckCircle className="w-8 h-8 text-green-500" />
            </motion.div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Password Reset Successfully!</h2>
            <p className="mb-6 text-gray-600">
              Your password has been updated. You can now log in with your new password.
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
    <div className="flex justify-center items-center px-4 py-12 min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full"
          >
            <FaShieldAlt className="h-8 w-8 text-[#ff4747]" />
          </motion.div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            {currentStep === 'email' && 'Forgot Password'}
            {currentStep === 'verify' && 'Verify Email'}
            {currentStep === 'reset' && 'Reset Password'}
          </h2>
          <p className="text-gray-600">
            {currentStep === 'email' && 'Enter your email to receive a verification code'}
            {currentStep === 'verify' && `We've sent a 6-digit code to ${email}`}
            {currentStep === 'reset' && 'Enter your new password'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center space-x-2">
          {['email', 'verify', 'reset'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-[#ff4747] text-white' 
                  : index < ['email', 'verify', 'reset'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {index < ['email', 'verify', 'reset'].indexOf(currentStep) ? (
                  <FaCheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div className={`w-12 h-1 mx-2 ${
                  index < ['email', 'verify', 'reset'].indexOf(currentStep) 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Email Input */}
            {currentStep === 'email' && (
              <motion.form onSubmit={handleEmailSubmit} className="space-y-6">
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
                  >
                    {errors.general}
                  </motion.div>
                )}
                
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                      <FaEnvelope className="w-5 h-5 text-gray-400" />
                    </div>
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      whileBlur="blur"
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-transparent ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <FaSpinner className="mr-2 animate-spin" />Sending...
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: Verification Code */}
            {currentStep === 'verify' && (
              <motion.form onSubmit={handleVerificationSubmit} className="space-y-6">
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
                  >
                    {errors.general}
                  </motion.div>
                )}
                
                <div>
                  <label htmlFor="verificationCode" className="block mb-2 text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <motion.input
                    variants={inputVariants}
                    whileFocus="focus"
                    whileBlur="blur"
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-transparent text-center text-2xl font-mono tracking-widest ${
                      errors.verificationCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.verificationCode && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-red-600">
                      {errors.verificationCode}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <FaSpinner className="mr-2 animate-spin" />Verifying...
                      </div>
                    ) : (
                      'Verify Code'
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={resendVerificationCode}
                    disabled={loading}
                    className="w-full py-2 px-4 text-sm text-[#ff4747] hover:text-red-700 transition-colors duration-200"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Password Reset */}
            {currentStep === 'reset' && (
              <motion.form onSubmit={handlePasswordReset} className="space-y-6">
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
                  >
                    {errors.general}
                  </motion.div>
                )}
                
                <div>
                  <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                      <FaLock className="w-5 h-5 text-gray-400" />
                    </div>
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      whileBlur="blur"
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-transparent ${
                        errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex absolute inset-y-0 right-0 items-center pr-3"
                    >
                      {showPassword ? <FaEyeSlash className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <FaEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-red-600">
                      {errors.newPassword}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                      <FaLock className="w-5 h-5 text-gray-400" />
                    </div>
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      whileBlur="blur"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="flex absolute inset-y-0 right-0 items-center pr-3"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <FaEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <FaSpinner className="mr-2 animate-spin" />Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-[#ff4747] hover:text-red-700 transition-colors duration-200"
          >
            <FaArrowLeft />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
