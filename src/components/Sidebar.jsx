import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaShoppingCart, FaSignOutAlt, FaHome, FaInfoCircle, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate('/login');
  };

  const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '4rem' },
  };

  const menuItems = [
    { icon: FaHome, label: 'Home', path: '/home' },
    { icon: FaUser, label: 'Profile', path: '/profile' },
    { icon: FaShoppingCart, label: 'Cart', path: '/cart' },
    { icon: FaInfoCircle, label: 'About', path: '/about' },
  ];

  return (
    <motion.div
      className="bg-white h-full fixed top-0 left-0 border-r border-gray-200 shadow-xl flex flex-col z-30"
      variants={sidebarVariants}
      animate={isOpen ? 'open' : 'closed'}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <motion.h2
          className="text-xl font-bold text-[#ff4747]"
          animate={{ opacity: isOpen ? 1 : 0 }}
        >
          Menu
        </motion.h2>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-3 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-[#ff4747]/10 hover:text-[#ff4747] rounded-lg transition-all duration-200"
          >
            <item.icon className="text-xl" />
            <motion.span
              animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
              className="whitespace-nowrap overflow-hidden text-sm font-medium"
            >
              {item.label}
            </motion.span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-[#ff4747]/10 hover:text-[#ff4747] rounded-lg transition-all duration-200"
        >
          <FaSignOutAlt className="text-xl" />
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            className="whitespace-nowrap overflow-hidden text-sm font-medium"
          >
            Logout
          </motion.span>
        </button>
       
      </div>
    </motion.div>
  );
};

export default Sidebar;