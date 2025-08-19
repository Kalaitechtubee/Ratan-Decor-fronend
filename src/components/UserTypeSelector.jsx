import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHome, FiCoffee, FiGrid } from 'react-icons/fi';
import { UserTypeContext } from '../context/UserTypeContext';

const UserTypeSelector = () => {
  const { userType, updateUserType, getUserTypeDisplayName } = useContext(UserTypeContext);
  const [isOpen, setIsOpen] = useState(false);

  const userTypes = useMemo(() => [
    { value: 'residential', label: 'Residential', icon: FiHome, description: 'Home decoration & furniture' },
    { value: 'commercial', label: 'Commercial', icon: FiHome, description: 'Office & business spaces' },
    { value: 'modular-kitchen', label: 'Modular Kitchen', icon: FiCoffee, description: 'Kitchen design & cabinets' },
    { value: 'others', label: 'Others', icon: FiGrid, description: 'Specialized requirements' },
  ], []);

  const currentType = userTypes.find((type) => type.value === userType?.toLowerCase());
  const CurrentIcon = currentType?.icon || FiHome;

  const handleTypeChange = (newType) => {
    updateUserType(newType);
    setIsOpen(false);
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative">
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-[#ff4747] hover:bg-red-50 transition-all duration-200"
      >
        <CurrentIcon className="w-4 h-4 text-[#ff4747]" />
        <span className="text-sm font-medium text-gray-700">{getUserTypeDisplayName(userType) || 'Select Type'}</span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute left-0 top-full z-50 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg"
          >
            <div className="p-2">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.value}
                    whileHover={{ backgroundColor: '#fef2f2' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeChange(type.value)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      userType?.toLowerCase() === type.value ? 'bg-red-50 border border-[#ff4747]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[#ff4747]" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default UserTypeSelector;