

import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaSave, 
  FaSpinner, 
  FaInfoCircle, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaIdCard,
  FaUserTag,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingBag,
  FaEdit,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { FiHome, FiCoffee, FiGrid, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { UserTypeContext } from '../context/UserTypeContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import useUserTypes from '../hooks/useUserTypes';

const Profile = () => {
  const { userType, updateUserType, getUserTypeDisplayName } = useContext(UserTypeContext);
  const { user, logout } = useAuth();
  const { userTypes, loading: loadingTypes, error: userTypesError, assignToUser } = useUserTypes();
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    company: '',
    role: '',
    status: '',
    userType: '',
    orders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [editableFields, setEditableFields] = useState({
    name: false,
    mobile: false,
    address: false,
    city: false,
    state: false,
    country: false,
    pincode: false,
    company: false,
    role: false
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Only fetch if not already loaded
      if (profileLoaded) {
        setIsLoading(false);
        return;
      }

      try {
        // Set initial values from localStorage to prevent UI flicker
        const cachedName = localStorage.getItem('username');
        const cachedEmail = localStorage.getItem('email') || user.email;
        const cachedUserType = localStorage.getItem('userType') || userType;
        
        if (cachedName) {
          setProfile(prev => ({
            ...prev,
            name: cachedName,
            email: cachedEmail,
            userType: cachedUserType
          }));
        }
        
        // Use the enhanced getProfile method with rate limiting protection
        const response = await API.getProfile();
        if (!response || !response.user) {
          // If we got a response but no user data, keep using cached data
          setIsLoading(false);
          return;
        }
        
        const userData = response.user;
        const fetchedUserType = userData.userType ? userData.userType.toLowerCase() : userType;
        
        setProfile({
          name: userData.name || '',
          email: userData.email || user.email || '',
          mobile: userData.mobile || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          pincode: userData.pincode || '',
          company: userData.company || '',
          role: userData.role || '',
          status: userData.status || '',
          userType: fetchedUserType,
          orders: userData.orders || 0
        });
        
        updateUserType(fetchedUserType);
        // Pre-select admin assignment dropdown based on current user's type
        const match = Array.isArray(userTypes) ? userTypes.find(t => (t.name || '').toLowerCase() === fetchedUserType) : null;
        setSelectedTypeId(match?.id ? String(match.id) : '');
        setProfileLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to load profile. Please try again.');
        setIsLoading(false);
        if (error.response?.status === 401 || error.message.includes('Session expired') || error.message.includes('Invalid token')) {
          logout();
          localStorage.clear();
          navigate('/login');
        }
      }
    };
    
    fetchProfile();
  }, [user, navigate, userType, updateUserType, logout, userTypes, profileLoaded]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleUserTypeChange = async (newType) => {
    setProfile((prev) => ({ ...prev, userType: newType }));
    updateUserType(newType);
    if (user) {
      try {
        await API.setUserType(user.userId, newType);
        setSuccess('User type updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to update user type.');
      }
    }
  };

  const handleAssignUserType = async () => {
    setError('');
    setSuccess('');
    if (!selectedTypeId) {
      setError('Please select a user type');
      return;
    }
    try {
      await assignToUser(user.userId, selectedTypeId);
      setSuccess('User type assigned successfully');
      // Reflect locally by syncing name from list
      const assigned = userTypes.find(t => String(t.id) === String(selectedTypeId));
      if (assigned?.name) {
        const normalized = assigned.name.toLowerCase();
        setProfile((prev) => ({ ...prev, userType: normalized }));
        updateUserType(normalized);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(typeof e?.message === 'string' ? e.message : 'Failed to assign user type');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const updateData = {
        name: profile.name,
        mobile: profile.mobile,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        pincode: profile.pincode,
        company: profile.company,
        role: profile.role
      };

      // Save to localStorage immediately to ensure UI consistency
      localStorage.setItem('username', profile.name);
      localStorage.setItem('userType', profile.userType);
      localStorage.setItem('role', profile.role);
      
      const response = await API.updateProfile(updateData);
      
      // Handle partial success response from rate limiting
      if (response.success === false && response.message?.includes('throttled')) {
        setSuccess('Profile data saved locally. Server update will be retried automatically.');
      } else {
        setSuccess(response.message || 'Profile updated successfully');
      }
      
      setEditableFields({
        name: false,
        mobile: false,
        address: false,
        city: false,
        state: false,
        country: false,
        pincode: false,
        company: false,
        role: false
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // Still save to localStorage even if server update fails
      localStorage.setItem('username', profile.name);
      
      if (error.message?.includes('Too many requests')) {
        setError('Profile update rate limited. Your changes are saved locally and will sync later.');
      } else {
        setError(error.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleEditField = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'architect': return 'bg-indigo-100 text-indigo-800';
      case 'dealer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const userTypeOptions = [
    { value: 'residential', label: 'Residential', icon: FiHome, description: 'Home decoration & furniture' },
    { value: 'commercial', label: 'Commercial', icon: FiBriefcase, description: 'Office & business spaces' },
    { value: 'modular-kitchen', label: 'Modular Kitchen', icon: FiCoffee, description: 'Kitchen design & cabinets' },
    { value: 'others', label: 'Others', icon: FiGrid, description: 'Specialized requirements' }
  ];

  const roleOptions = [
    { value: '', label: 'Select Role' },
    { value: 'customer', label: 'Customer' },
    { value: 'architect', label: 'Architect' },
    { value: 'dealer', label: 'Dealer' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'personal', label: 'Personal Info', icon: FaIdCard },
    { id: 'orders', label: 'Orders', icon: FaShoppingBag }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-roboto">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <FaSpinner className="text-5xl text-[#ff4747] animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-roboto relative">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar - Fixed on Desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Toggle */}
        <button 
          className="lg:hidden fixed top-20 left-4 z-40 p-3 bg-white rounded-full shadow-lg border border-gray-100"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <AnimatePresence mode="wait">
            {mobileSidebarOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaTimes className="text-xl text-[#ff4747]" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaBars className="text-xl text-[#ff4747]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed top-0 left-0 z-40 w-64 h-screen"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 mt-16 lg:ml-64 max-w-[1920px]"
        >
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
            <div className="bg-gradient-to-r from-[#ff4747] to-[#ff4747]/70 h-36"></div>
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 -mt-16">
                <div className="flex items-end gap-4">
                  <div className="w-28 h-28 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <FaUser className="text-5xl text-[#ff4747]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{profile.name || 'User Profile'}</h1>
                    <p className="text-gray-600 text-base">{profile.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(profile.role)}`}>
                    <FaIdCard className="mr-2" />
                    {profile.role || 'General'}
                  </span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(profile.status)}`}>
                    {getStatusIcon(profile.status)}
                    <span className="ml-2">{profile.status || 'Unknown'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-800 rounded-lg shadow-sm flex items-start gap-3"
              >
                <FaInfoCircle className="text-red-600 text-xl mt-0.5" />
                <div>{error}</div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 text-green-800 rounded-lg shadow-sm flex items-start gap-3"
              >
                <FaCheckCircle className="text-green-600 text-xl mt-0.5" />
                <div>{success}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
            <div className="border-b border-gray-100">
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-[#ff4747] border-b-2 border-[#ff4747]'
                        : 'text-gray-600 hover:text-[#ff4747] hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="text-lg" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <form onSubmit={handleUpdateProfile} className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{profile.orders}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[#ff4747]/10 text-[#ff4747]">
                            <FaShoppingBag className="text-xl" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Account Status</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1 capitalize">{profile.status || 'Unknown'}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-green-50 text-green-600">
                            {getStatusIcon(profile.status)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Project Type</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1 capitalize">{getUserTypeDisplayName(profile.userType) || 'Not set'}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[#ff4747]/10 text-[#ff4747]">
                            <FaUserTag className="text-xl" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <button 
                          type="button" 
                          className="p-4 border border-gray-100 rounded-lg hover:border-[#ff4747] hover:bg-[#ff4747]/5 transition-all duration-200 text-center"
                          onClick={() => setActiveTab('orders')}
                        >
                          <div className="flex flex-col items-center">
                            <FaShoppingBag className="text-2xl text-[#ff4747] mb-2" />
                            <span className="text-sm font-medium">View Orders</span>
                          </div>
                        </button>
                        <button 
                          type="button" 
                          className="p-4 border border-gray-100 rounded-lg hover:border-[#ff4747] hover:bg-[#ff4747]/5 transition-all duration-200 text-center"
                          onClick={() => setActiveTab('personal')}
                        >
                          <div className="flex flex-col items-center">
                            <FaUser className="text-2xl text-[#ff4747] mb-2" />
                            <span className="text-sm font-medium">Edit Profile</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'personal' && (
                  <motion.div
                    key="personal"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <div className="relative flex items-center">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleInputChange}
                            disabled={!editableFields.name}
                            className={`pl-10 pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.name ? 'bg-gray-100' : ''}`}
                            placeholder="Enter your full name"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => toggleEditField('name')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={profile.email}
                            className="pl-10 w-full p-3 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                            disabled
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <div className="relative flex items-center">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="mobile"
                            value={profile.mobile}
                            onChange={handleInputChange}
                            disabled={!editableFields.mobile}
                            className={`pl-10 pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.mobile ? 'bg-gray-100' : ''}`}
                            placeholder="Enter your mobile number"
                          />
                          <button
                            type="button"
                            onClick={() => toggleEditField('mobile')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <div className="relative flex items-center">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaBuilding className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="company"
                            value={profile.company}
                            onChange={handleInputChange}
                            disabled={!editableFields.company}
                            className={`pl-10 pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.company ? 'bg-gray-100' : ''}`}
                            placeholder="Enter your company name"
                          />
                          <button
                            type="button"
                            onClick={() => toggleEditField('company')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <div className="relative flex items-center">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUserTag className="text-gray-400" />
                          </div>
                          <select
                            name="role"
                            value={profile.role}
                            onChange={handleInputChange}
                            disabled={!editableFields.role}
                            className={`pl-10 pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 appearance-none ${!editableFields.role ? 'bg-gray-100' : ''}`}
                          >
                            {roleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => toggleEditField('role')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <div className="relative flex items-start">
                        <div className="absolute top-3 left-3">
                          <FaMapMarkerAlt className="text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          value={profile.address}
                          onChange={handleInputChange}
                          disabled={!editableFields.address}
                          rows={3}
                          className={`pl-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.address ? 'bg-gray-100' : ''}`}
                          placeholder="Enter your full address"
                        />
                        <button
                          type="button"
                          onClick={() => toggleEditField('address')}
                          className="absolute right-3 top-3 text-[#ff4747] hover:text-[#ff4747]/80"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            name="city"
                            value={profile.city}
                            onChange={handleInputChange}
                            disabled={!editableFields.city}
                            className={`pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.city ? 'bg-gray-100' : ''}`}
                            placeholder="Enter your city"
                          />
                          <button
                            type="button"
                            onClick={() => toggleEditField('city')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            name="state"
                            value={profile.state}
                            onChange={handleInputChange}
                            disabled={!editableFields.state}
                            className={`pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.state ? 'bg-gray-100' : ''}`}
                            placeholder="Enter your state"
                          />
                          <button
                            type="button"
                            onClick={() => toggleEditField('state')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            name="country"
                            value={profile.country}
                            onChange={handleInputChange}
                            disabled={!editableFields.country}
                            className={`pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.country ? 'bg-gray-100' : ''}`}
                            placeholder="Enter your country"
                          />
                          <button
                            type="button"
                            onClick={() => toggleEditField('country')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            name="pincode"
                            value={profile.pincode}
                            onChange={handleInputChange}
                            disabled={!editableFields.pincode}
                            className={`pr-10 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200 ${!editableFields.pincode ? 'bg-gray-100' : ''}`}
                            placeholder="Enter your PIN code"
                          />
                          <button
                            type="button"
                            onClick={() => toggleEditField('pincode')}
                            className="absolute right-3 text-[#ff4747] hover:text-[#ff4747]/80"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userTypeOptions.map((type) => (
                          <motion.button
                            key={type.value}
                            type="button"
                            onClick={() => handleUserTypeChange(type.value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                              profile.userType === type.value
                                ? 'border-[#ff4747] bg-[#ff4747]/5 shadow-sm'
                                : 'border-gray-200 hover:border-[#ff4747]/50 hover:bg-[#ff4747]/5'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${
                                profile.userType === type.value ? 'bg-[#ff4747] text-white' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <type.icon className="text-xl" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{type.label}</h4>
                                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {(profile.role?.toLowerCase?.() === 'admin' || profile.role?.toLowerCase?.() === 'manager') && (
                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign User Type (Admin/Manager)</h3>
                        {userTypesError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {userTypesError}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <select
                            value={selectedTypeId}
                            onChange={(e) => setSelectedTypeId(e.target.value)}
                            disabled={loadingTypes}
                            className="w-full sm:w-auto flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747] transition-all duration-200"
                          >
                            <option value="">Select a user type</option>
                            {Array.isArray(userTypes) && userTypes.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAssignUserType}
                            disabled={loadingTypes || !selectedTypeId}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${loadingTypes || !selectedTypeId ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#ff4747] text-white hover:bg-[#ff4747]/90'}`}
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-6"
                  >
                    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <FaShoppingBag className="text-[#ff4747]" />
                        Your Orders ({profile.orders})
                      </h3>
                      <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <FaShoppingBag className="text-4xl text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-700">No orders yet</h4>
                        <p className="text-gray-500 mt-2">Your order history will appear here</p>
                        <button
                          type="button"
                          className="mt-4 px-6 py-2 bg-[#ff4747] text-white rounded-lg hover:bg-[#ff4747]/90 transition-all duration-200 font-medium"
                          onClick={() => navigate('/products')}
                        >
                          Start Shopping
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'personal' && (
                <div className="flex justify-end pt-6 mt-8">
                  <motion.button
                    type="submit"
                    disabled={isUpdating}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isUpdating
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#ff4747] text-white hover:bg-[#ff4747]/90 shadow-lg'
                    }`}
                  >
                    {isUpdating ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
        </div>
  );
};

export default Profile;