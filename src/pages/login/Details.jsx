// import { useState, useEffect, useContext } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiGlobe, FiNavigation, FiCheck, FiHash } from 'react-icons/fi';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { UserTypeContext } from '../../context/UserTypeContext';
// import API from '../../services/api';

// const Details = () => {
//   const { login } = useAuth();
//   const { updateUserType } = useContext(UserTypeContext);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     company: '',
//     address: '',
//     gstNumber: '',
//     role: 'customer',
//     country: '',
//     state: '',
//     city: '',
//     pincode: '',
//     village: '',
//     district: '',
//     userType: 'residential',
//   });
//   const [villageOptions, setVillageOptions] = useState([]);
//   const [cityOptions, setCityOptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const registrationData = localStorage.getItem('registrationData');
//     if (registrationData) {
//       const data = JSON.parse(registrationData);
//       setFormData((prev) => ({
//         ...prev,
//         name: data.name || '',
//         email: data.email || '',
//         userType: data.userType || 'residential',
//       }));
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (error && name === 'pincode') setError('');
//   };

//   const fetchPincodeData = async (pincode) => {
//     if (pincode.length === 6) {
//       setLoading(true);
//       setError('');
//       try {
//         const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
//         const data = await response.json();
//         if (data[0].Status === 'Success') {
//           const postOffices = data[0].PostOffice;
//           setVillageOptions(postOffices.map((po) => po.Name));
//           setCityOptions([...new Set(postOffices.map((po) => po.Block))]);
//           setFormData((prev) => ({
//             ...prev,
//             district: postOffices[0].District,
//             state: postOffices[0].State,
//             country: postOffices[0].Country,
//           }));
//         } else {
//           setError('Invalid Pincode');
//           setVillageOptions([]);
//           setCityOptions([]);
//           setFormData((prev) => ({ ...prev, village: '', city: '', district: '', state: '', country: '' }));
//         }
//       } catch (err) {
//         setError('Error fetching pincode data');
//         setVillageOptions([]);
//         setCityOptions([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   useEffect(() => {
//     if (formData.pincode) fetchPincodeData(formData.pincode);
//   }, [formData.pincode]);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name) newErrors.name = 'Full Name is required';
//     if (!formData.email) newErrors.email = 'Email is required';
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
//     if (!formData.phone) newErrors.phone = 'Phone Number is required';
//     else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone Number must be 10 digits';
//     if (!formData.address) newErrors.address = 'Address is required';
//     if (!formData.pincode) newErrors.pincode = 'Pincode is required';
//     else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
//     if (!formData.country) newErrors.country = 'Country is required';
//     if (!formData.state) newErrors.state = 'State is required';
//     if (!formData.city) newErrors.city = 'City is required';
//     if (!formData.userType) newErrors.userType = 'User Type is required';
//     setError(Object.values(newErrors)[0] || '');
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const userId = localStorage.getItem('userId');
//       const normalizedUserType = formData.userType.toLowerCase();
//       if (!token || !userId) {
//         const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
//         const response = await API.register({
//           name: formData.name,
//           email: formData.email,
//           password: registrationData.password || 'defaultPassword',
//           username: formData.name,
//           userType: API.mapUserType(normalizedUserType),
//           phone: formData.phone,
//           company: formData.company,
//           address: formData.address,
//           gstNumber: formData.gstNumber,
//           role: formData.role,
//           country: formData.country,
//           state: formData.state,
//           city: formData.city,
//           pincode: formData.pincode,
//         });
//         localStorage.setItem('token', response.token);
//         localStorage.setItem('userId', response.user.id);
//         localStorage.setItem('email', response.user.email);
//         localStorage.setItem('username', response.user.username);
//         localStorage.setItem('userType', normalizedUserType);
//         localStorage.removeItem('registrationData');
//         login({
//           userId: response.user.id,
//           email: response.user.email,
//           username: response.user.username,
//         });
//         updateUserType(normalizedUserType);
//       } else {
//         await API.updateProfile(userId, {
//           username: formData.name,
//           userType: API.mapUserType(normalizedUserType),
//           phone: formData.phone,
//           company: formData.company,
//           address: formData.address,
//           gstNumber: formData.gstNumber,
//           country: formData.country,
//           state: formData.state,
//           city: formData.city,
//           pincode: formData.pincode,
//         });
//         await API.setUserType(userId, normalizedUserType);
//         localStorage.setItem('username', formData.name);
//         localStorage.setItem('userType', normalizedUserType);
//         login({
//           userId,
//           email: formData.email,
//           username: formData.name,
//         });
//         updateUserType(normalizedUserType);
//       }
//       setShowSuccessPopup(true);
//       setTimeout(() => navigate('/profile'), 1500);
//     } catch (err) {
//       setError(err.message || 'Failed to submit details. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
//   const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
//   const buttonVariants = { hover: { scale: 1.02 }, tap: { scale: 0.98 } };
//   const popupVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

//   return (
//     <div className="flex justify-center items-center p-10 min-h-screen bg-gray-50 font-roboto">
//       <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-10 w-full max-w-4xl bg-white rounded-2xl shadow-md">
//         <motion.div variants={itemVariants} className="mb-8 text-center">
//           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }} className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
//             <FiUser className="w-8 h-8 text-[#ff4747]" />
//           </motion.div>
//           <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Your Profile</h1>
//           <p className="text-gray-600">Please provide additional details to complete your registration</p>
//         </motion.div>
//         {error && (
//           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
//             {error}
//           </motion.div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <motion.div variants={itemVariants} className="space-y-4">
//             <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
//               <FiUser className="w-5 h-5 mr-2 text-[#ff4747]" /> Personal Information
//             </h2>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div>
//                 <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Full Name *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiUser className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email ID *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiMail className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">Phone Number *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiPhone className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-700">Company</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiHome className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="text" id="company" name="company" value={formData.company} onChange={handleInputChange} placeholder="Enter your company name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="gstNumber" className="block mb-2 text-sm font-medium text-gray-700">GST Number</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiHash className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="text" id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="Enter GST number" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="userType" className="block mb-2 text-sm font-medium text-gray-700">User Type *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiUser className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <select id="userType" name="userType" value={formData.userType} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required>
//                     <option value="">Select User Type</option>
//                     <option value="residential">Residential</option>
//                     <option value="commercial">Commercial</option>
//                     <option value="modular-kitchen">Modular Kitchen</option>
//                     <option value="others">Others</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//           <motion.div variants={itemVariants} className="space-y-4">
//             <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
//               <FiMapPin className="w-5 h-5 mr-2 text-[#ff4747]" /> Address Information
//             </h2>
//             <div>
//               <div className="relative">
//                 <div className="flex absolute top-3 left-3 items-center pointer-events-none">
//                   <FiHome className="w-5 h-5 text-gray-400" />
//                 </div>
//                 <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter your address" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" rows="3" required></textarea>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div>
//                 <label htmlFor="pincode" className="block mb-2 text-sm font-medium text-gray-700">Pincode *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiNavigation className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Enter 6-digit pincode" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" maxLength="6" required />
//                 </div>
//                 {loading && <p className="mt-1 text-sm text-gray-500">Loading...</p>}
//                 {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
//               </div>
//               <div>
//                 <label htmlFor="village" className="block mb-2 text-sm font-medium text-gray-700">Village</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiHome className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <select id="village" name="village" value={formData.village} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" disabled={!villageOptions.length}>
//                     <option value="">Select Village</option>
//                     {villageOptions.map((village, index) => (
//                       <option key={index} value={village}>{village}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-700">City *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiGlobe className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <select id="city" name="city" value={formData.city} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" disabled={!cityOptions.length} required>
//                     <option value="">Select City</option>
//                     {cityOptions.map((city, index) => (
//                       <option key={index} value={city}>{city}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="district" className="block mb-2 text-sm font-medium text-gray-700">District</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiMapPin className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="text" id="district" name="district" value={formData.district} readOnly className="py-3 pr-4 pl-10 w-full bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200" />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="state" className="block mb-2 text-sm font-medium text-gray-700">State *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiGlobe className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="text" id="state" name="state" value={formData.state} readOnly className="py-3 pr-4 pl-10 w-full bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200" />
//                 </div>
//               </div>
//               <div>
//                 <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-700">Country *</label>
//                 <div className="relative">
//                   <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
//                     <FiGlobe className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input type="text" id="country" name="country" value={formData.country} readOnly className="py-3 pr-4 pl-10 w-full bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200" />
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//           <motion.button type="submit" variants={buttonVariants} whileHover="hover" whileTap="tap" disabled={loading} className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] shadow-md hover:shadow-lg'}`}>
//             {loading ? <div className="flex justify-center items-center"><FaSpinner className="mr-2 animate-spin" />Submitting...</div> : 'Complete Registration'}
//           </motion.button>
//         </form>
//         <AnimatePresence>
//           {showSuccessPopup && (
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
//               <motion.div variants={popupVariants} initial="hidden" animate="visible" exit="hidden" className="p-12 w-full max-w-lg bg-white rounded-xl shadow-md">
//                 <div className="space-y-6 text-center">
//                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="flex justify-center items-center mx-auto w-16 h-16 bg-red-100 rounded-full">
//                     <FiCheck className="w-8 h-8 text-[#ff4747]" />
//                   </motion.div>
//                   <div>
//                     <h2 className="mb-2 text-2xl font-bold text-gray-900">Profile Completed!</h2>
//                     <p className="mb-6 text-gray-600">Redirecting to your profile...</p>
//                   </div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//   </div>
//   );
// };

// export default Details;
// src/pages/login/Details.js
import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiGlobe, FiNavigation, FiCheck, FiHash } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserTypeContext } from '../../context/UserTypeContext';
import API from '../../services/api';

const Details = () => {
  const { login } = useAuth();
  const { updateUserType } = useContext(UserTypeContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    gstNumber: '',
    role: 'customer',
    country: '',
    state: '',
    city: '',
    pincode: '',
    village: '',
    district: '',
    userType: 'residential',
  });
  const [villageOptions, setVillageOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const registrationData = localStorage.getItem('registrationData');
    if (registrationData) {
      const data = JSON.parse(registrationData);
      setFormData((prev) => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
        userType: data.userType || 'residential',
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error && name === 'pincode') setError('');
  };

  const fetchPincodeData = async (pincode) => {
    if (pincode.length === 6) {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data[0].Status === 'Success') {
          const postOffices = data[0].PostOffice;
          setVillageOptions(postOffices.map((po) => po.Name));
          setCityOptions([...new Set(postOffices.map((po) => po.Block))]);
          setFormData((prev) => ({
            ...prev,
            district: postOffices[0].District,
            state: postOffices[0].State,
            country: postOffices[0].Country,
          }));
        } else {
          setError('Invalid Pincode');
          setVillageOptions([]);
          setCityOptions([]);
          setFormData((prev) => ({ ...prev, village: '', city: '', district: '', state: '', country: '' }));
        }
      } catch (err) {
        setError('Error fetching pincode data');
        setVillageOptions([]);
        setCityOptions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (formData.pincode) fetchPincodeData(formData.pincode);
  }, [formData.pincode]);


  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone Number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone Number must be 10 digits';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.userType) newErrors.userType = 'User Type is required';
    setError(Object.values(newErrors)[0] || '');
    return Object.keys(newErrors).length === 0;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Form Submitted:', formData);
    
//     // Simulate form submission
//     setTimeout(() => {
//       setShowSuccessPopup(true);
//       // Set welcome flag for home page
//       localStorage.setItem('showWelcomeHome', 'true');
//       setTimeout(() => {
//         navigate('/popup');
//       }, 2000);
//     }, 1000);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');

    try {
      // Get user ID from either location state or localStorage
      const userId = location.state?.userId || localStorage.getItem('tempUserId');
      if (!userId) {
        throw new Error('User ID not found. Please register again.');
      }

      // Try to submit details to API
      try {
        await API.updateUserDetails(userId, formData);
        console.log('User details submitted successfully via API');
      } catch (apiError) {
        console.warn('API call failed, storing details locally:', apiError);
        // Store details locally as fallback
        localStorage.setItem('userDetails', JSON.stringify({
          userId,
          ...formData,
          submittedAt: new Date().toISOString()
        }));
        console.log('User details stored locally as fallback');
      }

      // Clear temporary user ID
      localStorage.removeItem('tempUserId');
      
      // Show success message
      setShowSuccessPopup(true);
      
      // After a brief delay, navigate to login page
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration completed successfully! Please log in to continue.',
            email: formData.email 
          } 
        });
      }, 2000);
      
    } catch (err) {
      console.error('Details submission error:', err);
      setError(err.message || 'Failed to submit details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const buttonVariants = { hover: { scale: 1.02 }, tap: { scale: 0.98 } };
  const popupVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

  return (
    <div className="flex justify-center items-center p-10 min-h-screen bg-gray-50 font-roboto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-10 w-full max-w-4xl bg-white rounded-2xl shadow-md">
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }} className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
            <FiUser className="w-8 h-8 text-[#ff4747]" />
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600">Please provide additional details to complete your registration</p>
        </motion.div>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {error}
          </motion.div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <FiUser className="w-5 h-5 mr-2 text-[#ff4747]" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Full Name *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiUser className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email ID *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiMail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">Phone Number *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required />
                </div>
              </div>
              <div>
                <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-700">Company</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiHome className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" id="company" name="company" value={formData.company} onChange={handleInputChange} placeholder="Enter your company name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" />
                </div>
              </div>
              <div>
                <label htmlFor="gstNumber" className="block mb-2 text-sm font-medium text-gray-700">GST Number</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiHash className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="Enter GST number" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" />
                </div>
              </div>
              <div>
                <label htmlFor="userType" className="block mb-2 text-sm font-medium text-gray-700">User Type *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiUser className="w-5 h-5 text-gray-400" />
                  </div>
                  <select id="userType" name="userType" value={formData.userType} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" required>
                    <option value="">Select User Type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="modular-kitchen">Modular Kitchen</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
              <FiMapPin className="w-5 h-5 mr-2 text-[#ff4747]" /> Address Information
            </h2>
            <div>
              <div className="relative">
                <div className="flex absolute top-3 left-3 items-center pointer-events-none">
                  <FiHome className="w-5 h-5 text-gray-400" />
                </div>
                <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter your address" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" rows="3" required></textarea>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="pincode" className="block mb-2 text-sm font-medium text-gray-700">Pincode *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiNavigation className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Enter 6-digit pincode" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" maxLength="6" required />
                </div>
                {loading && <p className="mt-1 text-sm text-gray-500">Loading...</p>}
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>
              <div>
                <label htmlFor="village" className="block mb-2 text-sm font-medium text-gray-700">Village</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiHome className="w-5 h-5 text-gray-400" />
                  </div>
                  <select id="village" name="village" value={formData.village} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" disabled={!villageOptions.length}>
                    <option value="">Select Village</option>
                    {villageOptions.map((village, index) => (
                      <option key={index} value={village}>{village}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-700">City *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiGlobe className="w-5 h-5 text-gray-400" />
                  </div>
                  <select id="city" name="city" value={formData.city} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4747] focus:border-transparent transition-all duration-200" disabled={!cityOptions.length} required>
                    <option value="">Select City</option>
                    {cityOptions.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="district" className="block mb-2 text-sm font-medium text-gray-700">District</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiMapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" id="district" name="district" value={formData.district} readOnly className="py-3 pr-4 pl-10 w-full bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200" />
                </div>
              </div>
              <div>
                <label htmlFor="state" className="block mb-2 text-sm font-medium text-gray-700">State *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiGlobe className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" id="state" name="state" value={formData.state} readOnly className="py-3 pr-4 pl-10 w-full bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200" />
                </div>
              </div>
              <div>
                <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-700">Country *</label>
                <div className="relative">
                  <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <FiGlobe className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" id="country" name="country" value={formData.country} readOnly className="py-3 pr-4 pl-10 w-full bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200" />
                </div>
              </div>
            </div>
          </motion.div>
          <motion.button type="submit" variants={buttonVariants} whileHover="hover" whileTap="tap" disabled={loading} className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff4747] to-[#ff6b6b] hover:from-[#ff3838] hover:to-[#ff5757] shadow-md hover:shadow-lg'}`}>
            {loading ? <div className="flex justify-center items-center"><FaSpinner className="mr-2 animate-spin" />Submitting...</div> : 'Complete Registration'}
          </motion.button>
        </form>
        <AnimatePresence>
          {showSuccessPopup && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
              <motion.div variants={popupVariants} initial="hidden" animate="visible" exit="hidden" className="p-12 w-full max-w-lg bg-white rounded-xl shadow-md">
                <div className="space-y-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="flex justify-center items-center mx-auto w-16 h-16 bg-red-100 rounded-full">
                    <FiCheck className="w-8 h-8 text-[#ff4747]" />
                  </motion.div>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Profile Completed!</h2>
                    <p className="mb-6 text-gray-600">Redirecting to your profile...</p>
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

export default Details;
