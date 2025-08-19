import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserTypeContext } from '../context/UserTypeContext';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const UserTypePopup = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { userType, updateUserType, isUserTypePopupOpen, closeUserTypePopup, loading, error } = useContext(UserTypeContext);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isUserTypePopupOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isUserTypePopupOpen]);

  const handleSelectUserType = async (type) => {
    if (!isAuthenticated) {
      localStorage.setItem('pendingUserType', type);
      const mappedType = API.mapUserType(type);
      updateUserType(mappedType);
      closeUserTypePopup();
      navigate('/register');
      return;
    }

    const userId = user?.userId || user?.id || localStorage.getItem('userId');
    if (!userId) {
      setLocalError('User ID is missing. Please log in again.');
      console.error('Missing user ID:', { user, localStorage_userId: localStorage.getItem('userId') });
      return;
    }

    setLocalError('');
    updateUserType(type); // Update locally first
    try {
      await api.setUserType(userId, type); // Sync with server
      closeUserTypePopup();
      navigate('/home');
    } catch (err) {
      console.error('Failed to set user type:', err);
      setLocalError(err.message || 'Failed to sync with server. Saved locally.');
      closeUserTypePopup();
      navigate('/home'); // Proceed offline
    }
  };

  const handleSkip = () => {
    const defaultType = 'Residential';
    updateUserType(defaultType);
    localStorage.setItem('userType', defaultType);
    localStorage.setItem('userTypeConfirmed', 'true');
    closeUserTypePopup();
    navigate('/home');
  };

  const userTypes = [
    { name: 'residential', displayName: 'Residential', icon: '🏠', description: 'Transform your home with premium decor', bg: 'bg-red-50 hover:bg-red-100 border-red-200' },
    { name: 'commercial', displayName: 'Commercial', icon: '🏢', description: 'Elevate your business spaces', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { name: 'modular-kitchen', displayName: 'Modular Kitchen', icon: '🍽️', description: 'Modern and functional kitchen designs', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
    { name: 'others', displayName: 'Others', icon: '🛠️', description: 'Custom solutions for unique projects', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
  ];

  if (!isUserTypePopupOpen) return null;

  return (
    <AnimatePresence>
      {isUserTypePopupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex justify-center items-center bg-black bg-opacity-60"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative p-6 mx-4 w-full max-w-2xl bg-white rounded-2xl shadow-xl sm:p-8"
          >
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-gray-500 transition-colors hover:text-gray-700"
              aria-label="Close popup"
              disabled={loading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <div className="mb-6 text-center">
              <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Welcome to Ratan Decor!</h2>
              <p className="text-base text-gray-600 sm:text-lg">Choose your project type to personalize your experience</p>
              {!isAuthenticated && (
                <p className="mt-2 text-sm text-blue-600">You'll be redirected to register after selection</p>
              )}
            </div>

            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex gap-2 items-start">
                  <span>⚠️</span>
                  <div>
                    <p>{error || localError}</p>
                    {(error || localError).includes('Network error') && (
                      <button
                        onClick={handleSkip}
                        className="mt-1 text-xs text-blue-600 underline hover:text-blue-800"
                      >
                        Continue offline
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {userTypes.map((type) => (
                <motion.button
                  key={type.name}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  onClick={() => handleSelectUserType(type.name)}
                  disabled={loading}
                  className={`${type.bg} p-4 rounded-lg border-2 hover:border-opacity-80 transition-all duration-200 cursor-pointer text-left flex items-start space-x-4 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-3xl sm:text-4xl">{type.icon}</span>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 sm:text-xl">{type.displayName}</h3>
                    <p className="text-sm text-gray-600 sm:text-base">{type.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="text-sm text-gray-500 underline transition-colors hover:text-gray-700 disabled:opacity-50"
                aria-label="Skip user type selection"
              >
                Skip for now
              </button>
              {isAuthenticated && (
                <p className="mt-2 text-xs text-gray-400">You can change this later in your profile settings</p>
              )}
            </div>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex absolute inset-0 justify-center items-center bg-white bg-opacity-90 rounded-2xl"
              >
                <div className="flex gap-3 items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4747]"></div>
                  <span className="text-gray-600">Setting your preference...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserTypePopup;