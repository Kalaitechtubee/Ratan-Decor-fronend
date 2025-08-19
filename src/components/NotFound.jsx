import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-lg w-full"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="w-12 h-12 text-[#ff4747]" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-[#ff4747] rounded-full flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">!</span>
              </motion.div>
            </div>
          </div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-6xl font-bold text-gray-800 mb-4"
          >
            404
          </motion.h1>
          
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-semibold text-gray-700 mb-4"
          >
            Page Not Found
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 mb-8 leading-relaxed"
          >
            Oops! The page you're looking for doesn't exist. It might have been moved, 
            deleted, or you entered the wrong URL.
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="space-y-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/home"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaHome className="w-5 h-5" />
              Go to Home
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex justify-center space-x-4 text-sm"
          >
            <Link
              to="/about"
              className="text-[#ff4747] hover:text-red-700 transition-colors duration-200"
            >
              About Us
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/contact"
              className="text-[#ff4747] hover:text-red-700 transition-colors duration-200"
            >
              Contact
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/Product"
              className="text-[#ff4747] hover:text-red-700 transition-colors duration-200"
            >
              Products
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 text-xs text-gray-500"
        >
          <p>Error Code: 404 | Page Not Found</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;