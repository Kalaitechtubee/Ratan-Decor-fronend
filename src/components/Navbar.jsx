import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaSignOutAlt, FaChevronDown, FaClock, FaSearch, FaTags, FaFilter, FaTimesCircle } from 'react-icons/fa';
import { FiHome, FiCoffee, FiGrid, FiTrendingUp, FiBox } from 'react-icons/fi';
import { MdCategory, MdHistory } from 'react-icons/md';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/ratan-decor.png';
import { UserTypeContext } from '../context/UserTypeContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Navbar = () => {
  const { userType, updateUserType, getUserTypeDisplayName, openUserTypePopup, isUserTypePopupOpen } = useContext(UserTypeContext);
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isUserTypeDropdownOpen, setIsUserTypeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Mock trending searches
  const mockTrendingSearches = [
    'Modern Sofa', 'Kitchen Cabinet', 'Office Chair', 'Dining Table', 
    'Bedroom Set', 'Living Room Decor', 'Modular Kitchen', 'Home Office'
  ];

  useEffect(() => {
    const fetchUsername = async () => {
      // First set a default username from localStorage or user object to avoid UI flicker
      let displayName = user?.username || localStorage.getItem('username') || 'User';
      if (!displayName || displayName === 'User') {
        displayName = user?.email ? user.email.split('@')[0] : 'User';
      }
      setUsername(displayName);
      
      // Only fetch profile if we have a user ID and haven't loaded it yet
      if (user?.userId && !profileLoaded) {
        try {
          // Use the enhanced getProfile method with rate limiting protection
          const response = await API.getProfile();
          if (response && response.user) {
            const fetchedUsername = response.user?.name || displayName;
            setUsername(fetchedUsername);
            localStorage.setItem('username', fetchedUsername);
            setProfileLoaded(true);
          }
        } catch (error) {
          console.error('Failed to fetch username:', error.message);
          // Username is already set above, so no need to set it again
        }
      }
    };

    // Only fetch essential data on mount - no cart fetching here
    fetchUsername();

    const savedRecentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(savedRecentSearches);
    setTrendingSearches(mockTrendingSearches);
  }, [user, userType]);

  // Lazy load cart only when user clicks on cart icon or navigates to cart page
  const fetchCart = async () => {
    if (cartLoaded || !user?.userId) return;
    
    try {
      const response = await API.getCart();
      setCartItems(response.items || []);
      setCartLoaded(true);
    } catch (error) {
      console.error('Failed to fetch cart:', error.message);
      setCartItems([]);
    }
  };

  // Lazy load categories only when needed (when user opens category dropdown)
  const fetchCategories = async () => {
    if (categories.length > 0) return; // Already loaded
    
    try {
      const response = await API.getCategories();
      const fetchedCategories = response.categories || [];
      setCategories(fetchedCategories);

      // Fetch category counts in background
      const counts = {};
      Promise.all(
        fetchedCategories.map(async (category) => {
          try {
            const productResponse = await API.getProducts({
              userType: getUserTypeDisplayName(userType) || 'residential',
              categoryId: category.id
            });
            counts[category.id] = productResponse.total || 0;
          } catch (error) {
            console.error(`Failed to fetch product count for category ${category.id}:`, error.message);
            counts[category.id] = 0;
          }
        })
      ).then(() => setCategoryCounts(counts));
    } catch (error) {
      console.error('Failed to fetch categories:', error.message);
      setCategories([]);
      setCategoryCounts({});
    }
  };

  // Lazy load products only when needed (when user opens search)
  const fetchProducts = async () => {
    if (products.length > 0) return; // Already loaded
    
    try {
      const response = await API.getProducts({
        limit: 100,
        userType: getUserTypeDisplayName(userType) || 'residential'
      });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error.message);
      setProducts([]);
    }
  };

  // Trigger category loading when category dropdown is opened
  const handleCategoryDropdownToggle = () => {
    if (categories.length === 0) {
      fetchCategories();
    }
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  // Trigger product loading when search is focused
  const handleSearchFocus = () => {
    if (products.length === 0) {
      fetchProducts();
    }
  };

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        try {
          const response = await API.getSubCategories(selectedCategory);
          const fetchedSubcategories = response.subcategories || [];
          setSubcategories((prev) => ({
            ...prev,
            [selectedCategory]: fetchedSubcategories
          }));

          const counts = {};
          await Promise.all(
            fetchedSubcategories.map(async (subcategory) => {
              try {
                const productResponse = await API.getProducts({
                  userType: getUserTypeDisplayName(userType) || 'residential',
                  categoryId: selectedCategory,
                  subcategoryId: subcategory.id
                });
                counts[subcategory.id] = productResponse.total || 0;
              } catch (error) {
                console.error(`Failed to fetch product count for subcategory ${subcategory.id}:`, error.message);
                counts[subcategory.id] = 0;
              }
            })
          );
          setSubcategoryCounts((prev) => ({
            ...prev,
            [selectedCategory]: counts
          }));
        } catch (error) {
          console.error('Failed to fetch subcategories:', error.message);
          setSubcategories((prev) => ({ ...prev, [selectedCategory]: [] }));
          setSubcategoryCounts((prev) => ({ ...prev, [selectedCategory]: {} }));
        }
      }
    };
    fetchSubcategories();
  }, [selectedCategory, userType]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsUserTypeDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsSearchDropdownOpen(false);
  }, [location.pathname]);

  const generateSearchSuggestions = useCallback((query) => {
    setSearchError('');
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    setIsSearching(true);
    const queryLower = query.toLowerCase();
    const suggestions = [];

    try {
      const productMatches = products
        .filter(product => product.name?.toLowerCase().includes(queryLower))
        .slice(0, 5)
        .map(product => ({
          type: 'product',
          value: product.name,
          id: product.id,
          icon: FiBox,
          description: product.description?.slice(0, 50) + '...' || '',
          price: product.price
        }));

      const categoryMatches = categories
        .filter(category => category.name?.toLowerCase().includes(queryLower))
        .slice(0, 3)
        .map(category => ({
          type: 'category',
          value: category.name,
          id: category.id,
          icon: MdCategory,
          description: `Browse ${category.name} products`
        }));

      const subcategoryMatches = [];
      Object.values(subcategories).flat()
        .filter(subcategory => subcategory.name?.toLowerCase().includes(queryLower))
        .slice(0, 3)
        .forEach(subcategory => {
          subcategoryMatches.push({
            type: 'subcategory',
            value: subcategory.name,
            id: subcategory.id,
            parentId: subcategory.parentId,
            icon: FaTags,
            description: `Shop in ${subcategory.name}`
          });
        });

      suggestions.push(...productMatches, ...categoryMatches, ...subcategoryMatches);
      setSearchSuggestions(suggestions.slice(0, 8));
    } catch (error) {
      console.error('Error generating search suggestions:', error.message);
      setSearchError('Failed to load suggestions. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [products, categories, subcategories]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      generateSearchSuggestions(searchQuery);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, generateSearchSuggestions]);

  const saveRecentSearch = (query) => {
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const handleSearch = async (query = searchQuery, suggestionData = null) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError('');
    saveRecentSearch(query);

    try {
      if (suggestionData?.type === 'category') {
        navigate('/products', { state: { categoryId: suggestionData.id } });
      } else if (suggestionData?.type === 'subcategory') {
        navigate('/products', { state: { categoryId: suggestionData.parentId, subcategoryId: suggestionData.id } });
      } else if (suggestionData?.type === 'product') {
        navigate(`/product/${suggestionData.id}`);
      } else {
        const response = await API.searchProducts(query, { userType: getUserTypeDisplayName(userType) || 'residential' });
        navigate('/products', { state: { searchResults: response.products, searchQuery: query } });
      }
      setSearchQuery('');
      setIsSearchDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Search failed:', error.message);
      setSearchError(error.message || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setSearchError('');
    searchInputRef.current?.focus();
  };

  const ensureUserTypeSelected = () => {
    const stored = localStorage.getItem('userType');
    if (!stored) {
      openUserTypePopup();
      return false;
    }
    return true;
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const toggleUserTypeDropdown = () => setIsUserTypeDropdownOpen(!isUserTypeDropdownOpen);
  const toggleCategoryDropdown = () => setIsCategoryDropdownOpen(!isCategoryDropdownOpen);

  const handleLogout = () => {
    localStorage.clear();
    logout();
    setUsername('');
    setIsProfileDropdownOpen(false);
    setIsUserTypeDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setCartItems([]);
    navigate('/login');
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('/profile');
  };

  const handleUserTypeChange = async (newType) => {
    updateUserType(newType);
    setIsUserTypeDropdownOpen(false);
    if (user?.userId) {
      try {
        await API.setUserType(user.userId, newType);
      } catch (error) {
        console.error('Failed to update user type:', error.message);
      }
    }
  };

  const handleCategorySelect = (categoryId) => {
    if (!ensureUserTypeSelected()) return;
    setSelectedCategory(categoryId);
    setIsCategoryDropdownOpen(true);
    navigate('/products', { state: { categoryId } });
  };

  const handleSubcategorySelect = (categoryId, subcategoryId) => {
    if (!ensureUserTypeSelected()) return;
    navigate('/products', { state: { categoryId, subcategoryId } });
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/products', label: 'Shop', icon: FaShoppingCart },
    { path: '/cart', label: 'Cart', icon: FaShoppingCart },
  ];

  const userTypeOptions = [
    { value: 'residential', label: 'Residential', icon: FiHome, description: 'Home decoration & furniture' },
    { value: 'commercial', label: 'Commercial', icon: FiHome, description: 'Office & business spaces' },
    { value: 'modular-kitchen', label: 'Modular Kitchen', icon: FiCoffee, description: 'Kitchen design & cabinets' },
    { value: 'others', label: 'Others', icon: FiGrid, description: 'Specialized requirements' },
  ];

  const formatTime = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
    return date.toLocaleString('en-IN', options);
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleString('en-IN', options);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  };

  const searchDropdownVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  const suggestionItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleCartClick = () => {
    if (!cartLoaded) {
      fetchCart();
    }
    navigate('/cart');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 ${isUserTypePopupOpen ? 'z-10' : 'z-50'} transition-all duration-300 ${
      scrolled ? 'bg-white border-b border-gray-100 shadow-lg' : 'bg-white'
    }`}>
      <div className="container px-4 py-3 mx-auto md:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Ratan Decor Logo" className="h-10 md:h-8" />
          </Link>

          {/* Desktop Search & Navigation */}
          <div className="hidden flex-1 items-center mx-8 space-x-6 max-w-4xl lg:flex">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      setIsSearchDropdownOpen(true);
                      handleSearchFocus(); // Add this line to trigger product loading
                    }}
                    placeholder="Search products, categories, brands..."
                    className="py-3 pr-12 pl-12 w-full text-sm bg-gray-50 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    aria-label="Search products, categories, or brands"
                  />
                  <FaSearch className="absolute left-4 top-1/2 text-gray-400 transform -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <FaTimesCircle />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <FaFilter className="animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </form>

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchDropdownOpen && (
                  <motion.div
                    variants={searchDropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden absolute right-0 left-0 top-full z-50 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg"
                    role="listbox"
                  >
                    {searchError && (
                      <div className="p-4 text-sm text-red-600 bg-red-50">{searchError}</div>
                    )}
                    {searchQuery.trim() && searchSuggestions.length > 0 && (
                      <div className="p-4">
                        <div className="flex gap-2 items-center mb-3">
                          <FaSearch className="text-primary" />
                          <span className="text-sm font-semibold text-gray-700">Search Suggestions</span>
                        </div>
                        {searchSuggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            variants={suggestionItemVariants}
                            onClick={() => handleSearch(suggestion.value, suggestion)}
                            className="flex gap-3 items-center p-3 w-full rounded-lg transition-all duration-200 hover:bg-gray-50"
                            role="option"
                            aria-selected={false}
                          >
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <suggestion.icon className="text-primary" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-900">{suggestion.value}</div>
                              {suggestion.description && (
                                <div className="mt-1 text-xs text-gray-500">{suggestion.description}</div>
                              )}
                              {suggestion.price && (
                                <div className="mt-1 text-sm font-semibold text-primary">₹{suggestion.price}</div>
                              )}
                            </div>
                            <div className="px-2 py-1 text-xs text-gray-400 capitalize bg-gray-100 rounded-full">
                              {suggestion.type}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                    {searchQuery.trim() && !isSearching && searchSuggestions.length === 0 && !searchError && (
                      <div className="p-4 text-sm text-gray-500">No results found for "{searchQuery}"</div>
                    )}
                    {!searchQuery.trim() && (
                      <div className="p-4 space-y-4">
                        {recentSearches.length > 0 && (
                          <div>
                            <div className="flex gap-2 items-center mb-3">
                              <MdHistory className="text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {recentSearches.map((search, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSearch(search)}
                                  className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full transition-all duration-200 hover:bg-primary hover:text-white"
                                  aria-label={`Repeat search for ${search}`}
                                >
                                  {search}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex gap-2 items-center mb-3">
                            <FiTrendingUp className="text-orange-500" />
                            <span className="text-sm font-semibold text-gray-700">Trending Now</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {trendingSearches.slice(0, 6).map((trend, index) => (
                              <button
                                key={index}
                                onClick={() => handleSearch(trend)}
                                className="flex gap-2 items-center p-2 text-left rounded-lg transition-all duration-200 hover:bg-gray-50"
                                aria-label={`Search for trending item ${trend}`}
                              >
                                <FiTrendingUp className="text-sm text-orange-500" />
                                <span className="text-sm text-gray-700">{trend}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={toggleCategoryDropdown}
                className="flex gap-2 items-center px-4 py-2 text-gray-700 rounded-lg transition-all duration-200 hover:text-primary hover:bg-gray-50"
                aria-expanded={isCategoryDropdownOpen}
                aria-label="Toggle categories dropdown"
              >
                <MdCategory className="text-lg" />
                <span className="text-sm font-medium">Categories</span>
                <FaChevronDown className={`text-xs transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden absolute left-0 z-50 mt-2 w-72 bg-white rounded-xl border border-gray-100 shadow-lg"
                    role="menu"
                  >
                    <div className="p-4">
                      <div className="flex gap-2 items-center mb-4">
                        <MdCategory className="text-primary" />
                        <span className="text-sm font-semibold text-gray-700">Product Categories</span>
                      </div>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <div key={category.id} className="mb-2">
                            <button
                              onClick={() => handleCategorySelect(category.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                                selectedCategory === category.id 
                                  ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                              role="menuitem"
                            >
                              <span className="font-medium">{category.name}</span>
                              <div className="flex gap-2 items-center">
                                <span className="text-xs text-gray-500">
                                  {categoryCounts[category.id] || 0}
                                </span>
                                <FaChevronDown className={`text-xs transition-transform duration-200 ${
                                  selectedCategory === category.id ? 'rotate-180' : ''
                                }`} />
                              </div>
                            </button>
                            
                            <AnimatePresence>
                              {selectedCategory === category.id && subcategories[category.id]?.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-2 ml-6 space-y-1"
                                >
                                  {subcategories[category.id].map((subcategory) => (
                                    <button
                                      key={subcategory.id}
                                      onClick={() => handleSubcategorySelect(category.id, subcategory.id)}
                                      className="px-3 py-2 w-full text-sm text-left text-gray-600 rounded-lg transition-all duration-200 hover:text-primary hover:bg-primary/5"
                                      role="menuitem"
                                    >
                                      {subcategory.name}
                                      <span className="ml-2 text-xs text-gray-500">
                                        ({subcategoryCounts[category.id]?.[subcategory.id] || 0})
                                      </span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No categories available</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Items */}
            {navItems.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={(e) => {
                    if (!ensureUserTypeSelected()) {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path 
                      ? 'text-primary bg-primary/10 font-medium' 
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <item.icon className="text-lg" />
                  <span className="text-sm">{item.label}</span>
                  {item.label === 'Cart' && cartItems.length > 0 && (
                    <span className="px-2 py-1 text-xs text-white rounded-full bg-primary">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Right Side - User Controls */}
          <div className="flex items-center space-x-3">
            {/* User Type - Open Popup (Desktop) */}
            <div className="hidden md:block">
              <button
                onClick={openUserTypePopup}
                className="flex gap-2 items-center px-4 py-2 text-white bg-gradient-to-r to-red-500 rounded-lg transition-all duration-200 from-primary"
                aria-label="Select project type"
              >
                <span className="text-sm font-medium">{getUserTypeDisplayName(userType) || 'Select Type'}</span>
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="flex gap-2 items-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                aria-expanded={isProfileDropdownOpen}
                aria-label="Toggle profile dropdown"
              >
                <div className="flex justify-center items-center w-9 h-9 text-white bg-gradient-to-r to-red-500 rounded-full from-primary">
                  <FaUser className="text-sm" />
                </div>
                {user && (
                  <span className="hidden text-sm font-medium text-gray-700 md:block">{username}</span>
                )}
                <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden absolute right-0 z-50 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg"
                    role="menu"
                  >
                    <div className="p-2">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex gap-3 items-center">
                              <div className="flex justify-center items-center w-10 h-10 text-white bg-gradient-to-r to-red-500 rounded-full from-primary">
                                <FaUser />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{username}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleProfileClick}
                            className="flex gap-3 items-center px-4 py-3 w-full text-sm text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-primary"
                            role="menuitem"
                          >
                            <FaUser className="text-primary" />
                            View Profile
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="flex gap-3 items-center px-4 py-3 w-full text-sm text-gray-700 rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                            role="menuitem"
                          >
                            <FaSignOutAlt className="text-red-500" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/login"
                          className="flex gap-3 items-center px-4 py-3 text-sm text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-primary"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          role="menuitem"
                        >
                          <FaUser className="text-primary" />
                          Sign In
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Icon */}
            <button
              onClick={handleCartClick}
              className="relative p-2 text-gray-600 transition-colors hover:text-primary"
              aria-label="Shopping cart"
            >
              <FaShoppingCart className="text-xl" />
              {cartItems.length > 0 && (
                <span className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMobileMenu}
              className="p-3 rounded-lg transition-colors duration-200 lg:hidden hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaTimes className="text-xl text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBars className="text-xl text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white border-t border-gray-100 shadow-lg lg:hidden"
          >
            <div className="px-4 py-6">
              {/* Time and Date */}
              <div className="flex justify-between items-center p-3 mb-6 bg-gray-50 rounded-lg">
                <div className="flex gap-2 items-center text-sm text-gray-600">
                  <FaClock className="text-primary" />
                  {formatTime(currentTime)} IST
                </div>
                <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
              </div>

              {/* Mobile Search */}
              <div className="mb-6">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, categories..."
                    className="py-3 pr-4 pl-12 w-full text-sm bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    aria-label="Search products or categories"
                  />
                  <FaSearch className="absolute left-4 top-1/2 text-gray-400 transform -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <FaTimesCircle />
                    </button>
                  )}
                </form>
                
                {searchError && (
                  <div className="p-3 mt-2 text-sm text-red-600 bg-red-50 rounded-lg">{searchError}</div>
                )}
                {searchQuery.trim() && searchSuggestions.length > 0 && (
                  <div className="overflow-hidden mt-2 bg-white rounded-lg border border-gray-100 shadow-lg">
                    {searchSuggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion.value, suggestion)}
                        className="flex gap-3 items-center p-3 w-full border-b border-gray-50 transition-colors duration-200 hover:bg-gray-50 last:border-b-0"
                        role="option"
                        aria-selected={false}
                      >
                        <suggestion.icon className="text-primary" />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">{suggestion.value}</div>
                          <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && !isSearching && searchSuggestions.length === 0 && !searchError && (
                  <div className="p-3 mt-2 text-sm text-gray-500 bg-white rounded-lg border border-gray-100 shadow-lg">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Categories Section */}
              <div className="mb-6">
                <div className="flex gap-2 items-center mb-3">
                  <MdCategory className="text-primary" />
                  <span className="text-sm font-semibold text-gray-700">Categories</span>
                </div>
                <div className="space-y-2">
                  {categories.length > 0 ? (
                    categories.slice(0, 5).map((category) => (
                      <div key={category.id}>
                        <button
                          onClick={() => handleCategorySelect(category.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-200 ${
                            selectedCategory === category.id 
                              ? 'bg-gradient-to-r from-primary to-red-500 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          role="menuitem"
                        >
                          <span className="font-medium">{category.name}</span>
                          <div className="flex gap-2 items-center">
                            <span className="text-xs">
                              {categoryCounts[category.id] || 0}
                            </span>
                            <FaChevronDown className={`text-xs transition-transform duration-200 ${
                              selectedCategory === category.id ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {selectedCategory === category.id && subcategories[category.id]?.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2 ml-4 space-y-1"
                            >
                              {subcategories[category.id].slice(0, 4).map((subcategory) => (
                                <button
                                  key={subcategory.id}
                                  onClick={() => handleSubcategorySelect(category.id, subcategory.id)}
                                  className="px-3 py-2 w-full text-sm text-left text-gray-600 rounded-lg transition-all duration-200 hover:text-primary hover:bg-gray-50"
                                  role="menuitem"
                                >
                                  {subcategory.name}
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({subcategoryCounts[category.id]?.[subcategory.id] || 0})
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No categories available</div>
                  )}
                </div>
              </div>

              {/* Project Type Section */}
              <div className="mb-6">
                <div className="flex gap-2 items-center mb-3">
                  <FiGrid className="text-primary" />
                  <span className="text-sm font-semibold text-gray-700">Project Type</span>
                </div>
                <button
                  onClick={() => {
                    openUserTypePopup();
                    toggleMobileMenu();
                  }}
                  className="flex gap-2 justify-center items-center p-3 w-full text-sm text-white bg-gradient-to-r to-red-500 rounded-lg from-primary"
                  aria-label="Change project type"
                >
                  Change Project Type ({getUserTypeDisplayName(userType) || 'Select'})
                </button>
              </div>

              {/* Navigation Items */}
              <div className="mb-6 space-y-2">
                {navItems.map((item) => (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path 
                          ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={toggleMobileMenu}
                      role="menuitem"
                    >
                      <item.icon className="text-lg" />
                      <span className="font-medium">{item.label}</span>
                      {item.label === 'Cart' && cartItems.length > 0 && (
                        <span className="px-2 py-1 ml-auto text-xs text-white rounded-full bg-primary">
                          {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      )}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Profile Section */}
              <div className="pt-4 space-y-2 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="flex gap-3 items-center p-3 mb-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-center items-center w-10 h-10 text-white bg-gradient-to-r to-red-500 rounded-full from-primary">
                        <FaUser />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        toggleMobileMenu();
                        navigate('/profile');
                      }}
                      className="flex gap-3 items-center px-4 py-3 w-full text-sm text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50"
                      role="menuitem"
                    >
                      <FaUser className="text-primary" />
                      View Profile
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex gap-3 items-center px-4 py-3 w-full text-sm text-gray-700 rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                      role="menuitem"
                    >
                      <FaSignOutAlt className="text-red-500" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex gap-3 items-center px-4 py-3 text-sm text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-primary"
                    onClick={toggleMobileMenu}
                    role="menuitem"
                  >
                    <FaUser className="text-primary" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {(isUserTypeDropdownOpen || isProfileDropdownOpen || isMobileMenuOpen || isCategoryDropdownOpen || isSearchDropdownOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => {
              setIsUserTypeDropdownOpen(false);
              setIsProfileDropdownOpen(false);
              setIsMobileMenuOpen(false);
              setIsCategoryDropdownOpen(false);
              setIsSearchDropdownOpen(false);
            }} 
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
