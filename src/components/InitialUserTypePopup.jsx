import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCoffee, FiGrid, FiTrendingUp, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserTypeContext } from '../context/UserTypeContext';

const InitialUserTypePopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { updateUserType } = React.useContext(UserTypeContext);
  const [selectedType, setSelectedType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already has a user type
    const storedType = localStorage.getItem('userType');
    if (storedType) {
      onClose();
      navigate('/home');
    }
  }, [navigate, onClose]);

  const handleSelectUserType = (type) => {
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      // Update user type in context and localStorage
      updateUserType(selectedType.name);
      
      // If user is authenticated, navigate to home
      if (isAuthenticated) {
        navigate('/home');
      } else {
        // If not authenticated, navigate to register with pre-selected user type
        navigate('/register', { 
          state: { 
            preSelectedUserType: selectedType.name,
            fromInitialPopup: true 
          } 
        });
      }
      onClose();
    } catch (error) {
      console.error('Error setting user type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Store a flag that user skipped the selection
    localStorage.setItem('userTypeSkipped', 'true');
    onClose();
    
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/register');
    }
  };

  const userTypes = [
    { 
      name: 'residential', 
      displayName: 'Residential', 
      icon: FiHome, 
      description: 'Transform your home with premium decor and furniture',
      bg: 'bg-gradient-to-br from-red-50 to-pink-50',
      border: 'border-red-200',
      hover: 'hover:border-red-300 hover:shadow-lg',
      text: 'text-red-800',
      iconColor: 'text-red-600'
    },
    { 
      name: 'commercial', 
      displayName: 'Commercial', 
      icon: FiTrendingUp, 
      description: 'Elevate your business spaces with professional solutions',
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300 hover:shadow-lg',
      text: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    { 
      name: 'modular-kitchen', 
      displayName: 'Modular Kitchen', 
      icon: FiCoffee, 
      description: 'Modern and functional kitchen designs with smart storage',
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-200',
      hover: 'hover:border-amber-300 hover:shadow-lg',
      text: 'text-amber-800',
      iconColor: 'text-amber-600'
    },
    { 
      name: 'others', 
      displayName: 'Others', 
      icon: FiGrid, 
      description: 'Custom solutions for unique projects and special requirements',
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-300 hover:shadow-lg',
      text: 'text-emerald-800',
      iconColor: 'text-emerald-600'
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="relative p-8 pb-6">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-[#ff4747] to-[#ff6b6b] rounded-full"
              >
                <FiHome className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Welcome to Ratan Decor
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose your project type to get personalized recommendations and experience
              </p>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {userTypes.map((type, index) => (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectUserType(type)}
                  className={`${type.bg} ${type.border} ${type.hover} p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
                    selectedType?.name === type.name ? 'ring-4 ring-[#ff4747] ring-opacity-50 shadow-xl' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-white shadow-sm ${type.iconColor}`}>
                      <type.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold ${type.text} mb-2`}>
                        {type.displayName}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  
                  {selectedType?.name === type.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 bg-[#ff4747] rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                disabled={!selectedType || isSubmitting}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  selectedType 
                    ? 'bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Continue...
                  </div>
                ) : (
                  'Continue with Selection'
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="px-8 py-4 rounded-xl font-semibold text-lg text-gray-600 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Skip for Now
              </motion.button>
            </div>

            {/* Info Text */}
            <div className="text-center mt-6 text-gray-500 text-sm">
              <p>You can change your selection anytime from your profile settings</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InitialUserTypePopup;
