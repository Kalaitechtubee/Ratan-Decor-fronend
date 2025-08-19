import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart,
  Eye,
  ShoppingBag,
  Star,
  Phone,
  MessageCircle,
  ArrowRight,
  Package,
  Search,
  Grid3X3,
  List,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUserType } from '../context/useUserType'; // Fixed import path
import useScrollToTop from '../hooks/useScrollToTop';

const ProductPage = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { userType, updateUserType, refreshTrigger } = useUserType(); // Add refreshTrigger
  
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    tags: false
  });

  // Filter options - will be populated from API
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    priceRange: { min: 0, max: 1000000 },
    ratings: [
      { value: 4, count: 0 },
      { value: 3, count: 0 },
      { value: 2, count: 0 },
      { value: 1, count: 0 }
    ],
    tags: []
  });

  const [activeFilters, setActiveFilters] = useState({
    categories: '',
    priceRange: { min: 0, max: 1000000 },
    rating: 0,
    tags: [],
    sortBy: 'featured',
    viewMode: 'grid'
  });

  // Brand extraction from products
  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState(new Set());

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Only fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products only when filters change or component mounts
  useEffect(() => {
    if (userType) { // Only fetch if userType is available
      fetchProducts();
    }
  }, [currentPage, activeFilters, debouncedSearch, selectedBrands, userType, refreshTrigger]); // Add refreshTrigger to dependencies

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.getCategories();
      console.log('Categories response:', response);
      
      if (response && response.categories) {
        const categoriesWithCounts = response.categories.map(cat => ({
          id: cat.id || cat._id,
          name: cat.name,
          count: cat.productCount || 0
        }));
        setCategories([{ id: '', name: 'All Categories', count: 0 }, ...categoriesWithCounts]);
      } else if (Array.isArray(response)) {
        const categoriesWithCounts = response.map(cat => ({
          id: cat.id || cat._id,
          name: cat.name,
          count: cat.productCount || 0
        }));
        setCategories([{ id: '', name: 'All Categories', count: 0 }, ...categoriesWithCounts]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        page: currentPage,
        limit: 12,
        userType: userType, // Ensure userType is included
        ...(activeFilters.categories && { category: activeFilters.categories }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedBrands.size > 0 && { brands: Array.from(selectedBrands) }),
        ...(activeFilters.sortBy !== 'featured' && { sortBy: activeFilters.sortBy }),
        ...(activeFilters.priceRange.min > 0 && { minPrice: activeFilters.priceRange.min }),
        ...(activeFilters.priceRange.max < 1000000 && { maxPrice: activeFilters.priceRange.max }),
        ...(activeFilters.rating > 0 && { minRating: activeFilters.rating }),
        ...(activeFilters.tags.length > 0 && { tags: activeFilters.tags.join(',') })
      };

      console.log('Fetching products with filters:', filters);

      let response;
      if (debouncedSearch) {
        response = await api.searchProducts(debouncedSearch, filters);
      } else {
        response = await api.getProducts(filters);
      }

      console.log('Products API response:', response);

      if (response) {
        const productList = response.products || response.data || response;
        const processedProducts = Array.isArray(productList) ? productList.map(product => ({
          id: product.id || product._id,
          name: product.name || product.title,
          description: product.description || 'No description available',
          price: Number(product.price || 0),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
          images: product.images || [product.image || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'],
          category: product.category || 'Uncategorized',
          subcategory: product.subcategory,
          rating: Number(product.rating || 4.0),
          reviewCount: Number(product.reviewCount || 0),
          isNew: Boolean(product.isNew),
          isFeatured: Boolean(product.isFeatured),
          tags: product.tags || [],
          brand: product.brand || product.manufacturer,
          manufacturer: product.manufacturer
        })) : [];

        setProducts(processedProducts);
        
        // Set pagination info
        if (response.totalPages) {
          setTotalPages(response.totalPages);
        }
        if (response.total || response.totalProducts) {
          setTotalProducts(response.total || response.totalProducts);
        }
        
        // Extract unique brands from products
        const brands = [...new Set(processedProducts
          .map(p => p.brand || p.manufacturer)
          .filter(Boolean)
        )];
        setAvailableBrands(brands);

        // Update filter options based on products
        updateFilterOptions(processedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilterOptions = (productList) => {
    // Extract tags
    const allTags = productList.reduce((acc, product) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          const existingTag = acc.find(t => t.name === tag);
          if (existingTag) {
            existingTag.count++;
          } else {
            acc.push({ name: tag, count: 1 });
          }
        });
      }
      return acc;
    }, []);

    // Calculate price range
    const prices = productList.map(p => p.price).filter(p => p > 0);
    const minPrice = Math.min(...prices) || 0;
    const maxPrice = Math.max(...prices) || 1000000;

    // Calculate rating counts (& Up)
    const ratingCounts = {
      4: productList.filter(p => p.rating >= 4).length,
      3: productList.filter(p => p.rating >= 3).length,
      2: productList.filter(p => p.rating >= 2).length,
      1: productList.filter(p => p.rating >= 1).length
    };

    setFilterOptions(prev => ({
      ...prev,
      tags: allTags,
      priceRange: { min: minPrice, max: maxPrice },
      ratings: prev.ratings.map(r => ({ ...r, count: ratingCounts[r.value] }))
    }));
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      // You might want to show a success message here
    } catch (err) {
      console.error('Error adding to cart:', err);
      // You might want to show an error message here
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleQuickContact = (productId, productName, type) => {
    if (type === 'call') {
      window.location.href = 'tel:+919876543210';
    } else if (type === 'whatsapp') {
      const message = `Hi! I'm interested in ${productName}. Can you provide more details?`;
      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleQuickView = (productId) => {
    navigate(`/ProductDetails/${productId}`);
  };

  const handleCategoryChange = (categoryId) => {
    setActiveFilters({
      ...activeFilters,
      categories: categoryId
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleRatingChange = (rating) => {
    setActiveFilters({
      ...activeFilters,
      rating: activeFilters.rating === rating ? 0 : rating
    });
    setCurrentPage(1);
  };

  const handleTagChange = (tagName, checked) => {
    const newTags = checked
      ? [...activeFilters.tags, tagName]
      : activeFilters.tags.filter(tag => tag !== tagName);

    setActiveFilters({
      ...activeFilters,
      tags: newTags
    });
    setCurrentPage(1);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      categories: '',
      priceRange: { min: filterOptions.priceRange.min, max: filterOptions.priceRange.max },
      rating: 0,
      tags: [],
      sortBy: 'featured',
      viewMode: 'grid'
    });
    setSelectedBrands(new Set());
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.categories) count++;
    if (activeFilters.priceRange.min !== filterOptions.priceRange.min || 
        activeFilters.priceRange.max !== filterOptions.priceRange.max) count++;
    if (activeFilters.rating > 0) count++;
    if (activeFilters.tags.length > 0) count++;
    if (selectedBrands.size > 0) count++;
    return count;
  };

  // Enhanced Product Card Component
  const EnhancedProductCard = ({ 
    product, 
    onQuickContact, 
    onAddToWishlist, 
    onQuickView, 
    isWishlisted = false,
    viewMode = 'grid'
  }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    const discountPercentage = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const handleImageNavigation = (direction) => {
      if (direction === 'next') {
        setCurrentImageIndex((prev) => 
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      } else {
        setCurrentImageIndex((prev) => 
          prev === 0 ? product.images.length - 1 : prev - 1
        );
      }
    };

    if (viewMode === 'list') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex overflow-hidden bg-white rounded-xl border border-gray-100 shadow-md transition-all duration-300 hover:shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative flex-shrink-0 w-64">
            
            <div className="aspect-[4/3] relative">
              <img
                src={product.images[0] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              
              <div className="flex absolute top-3 left-3 flex-col space-y-1">
                {product.isNew && (
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-md">
                    NEW
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md">
                    FEATURED
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 justify-between p-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviewCount})</span>
                </div>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/ProductDetails/${product.id}`)}>
                {product.name}
              </h3>

              <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAddToWishlist?.(product.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isWishlisted 
                      ? 'text-white bg-red-500' 
                      : 'text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="flex items-center px-4 py-2 space-x-1 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex overflow-hidden flex-col mt-10 h-full bg-white rounded-xl border border-gray-100 shadow-md transition-all duration-300 group hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden relative bg-gray-100">
          <div className="aspect-[4/3] relative">
            <img
              src={product.images[currentImageIndex] || product.images[0] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400';
              }}
            />
            
            {product.images.length > 1 && (
              <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleImageNavigation('prev');
                  }}
                  className="flex justify-center items-center w-8 h-8 rounded-full shadow-md transition-colors bg-white/80 hover:bg-white"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleImageNavigation('next');
                  }}
                  className="flex justify-center items-center w-8 h-8 rounded-full shadow-md transition-colors bg-white/80 hover:bg-white"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex absolute top-3 left-3 flex-col space-y-1">
            {product.isNew && (
              <span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-md">
                NEW
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md">
                FEATURED
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md">
                -{discountPercentage}%
              </span>
            )}
          </div>

          <div className={`absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToWishlist?.(product.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                isWishlisted 
                  ? 'text-white bg-red-500' 
                  : 'text-gray-700 bg-white/90 hover:bg-white hover:text-red-500'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView?.(product.id);
              }}
              className="flex justify-center items-center w-8 h-8 text-gray-700 rounded-full shadow-md transition-colors bg-white/90 hover:bg-white hover:text-blue-500"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onQuickContact?.(product.id, product.name, 'call');
                }}
                className="flex flex-1 justify-center items-center px-3 py-2 space-x-1 text-sm font-medium text-white bg-green-500 rounded-lg transition-colors hover:bg-green-600"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onQuickContact?.(product.id, product.name, 'whatsapp');
                }}
                className="flex flex-1 justify-center items-center px-3 py-2 space-x-1 text-sm font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-grow p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">{product.rating}</span>
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/ProductDetails/${product.id}`)}
            className="text-left"
          >
            <h3 className="mb-2 font-semibold text-gray-900 transition-colors line-clamp-2 hover:text-blue-600">
              {product.name}
            </h3>
          </button>

          <p className="flex-grow mb-3 text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{product.tags.length - 2}</span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            <button
              onClick={() => handleAddToCart(product.id)}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Product Grid Component
  const ProductGrid = ({
    products = [],
    isLoading = false,
    onQuickContact,
    onAddToWishlist,
    onQuickView,
    wishlistedItems = [],
    viewMode = 'grid'
  }) => {
    if (isLoading) {
      return (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="overflow-hidden bg-white rounded-xl shadow-md animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="w-16 h-4 bg-gray-200 rounded" />
                  <div className="w-12 h-4 bg-gray-200 rounded" />
                </div>
                <div className="w-3/4 h-5 bg-gray-200 rounded" />
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="w-2/3 h-4 bg-gray-200 rounded" />
                <div className="flex justify-between items-center pt-2">
                  <div className="w-20 h-5 bg-gray-200 rounded" />
                  <div className="w-16 h-8 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="col-span-full">
          <div className="py-12 text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-24 h-24 bg-gray-100 rounded-full">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Products Found</h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                clearAllFilters();
                fetchProducts();
              }}
              className="px-6 py-2 font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
            >
              Clear Filters & Refresh
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {products.map((product) => (
          <EnhancedProductCard
            key={product.id}
            product={product}
            onQuickContact={onQuickContact}
            onAddToWishlist={onAddToWishlist}
            onQuickView={onQuickView}
            isWishlisted={wishlistedItems.includes(product.id)}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="p-6 bg-white rounded-xl shadow-md lg:w-64">
            <h2 className="mb-4 text-2xl font-bold">Filters</h2>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="flex items-center mb-3 text-lg font-semibold">
                <ChevronDown className="mr-2 w-4 h-4" />
                Categories
              </h3>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category.id}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.categories === category.id}
                        onChange={(e) => handleCategoryChange(category.id)}
                        className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({category.count})</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="flex items-center mb-3 text-lg font-semibold">
                <ChevronDown className="mr-2 w-4 h-4" />
                Price Range
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Min: ₹{filterOptions.priceRange.min.toLocaleString()}</span>
                <span className="text-sm text-gray-700">Max: ₹{filterOptions.priceRange.max.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000000}
                value={activeFilters.priceRange.min}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, priceRange: { ...prev.priceRange, min: Number(e.target.value) } }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={0}
                max={1000000}
                value={activeFilters.priceRange.max}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, priceRange: { ...prev.priceRange, max: Number(e.target.value) } }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Ratings */}
            <div className="mb-6">
              <h3 className="flex items-center mb-3 text-lg font-semibold">
                <ChevronDown className="mr-2 w-4 h-4" />
                Customer Ratings
              </h3>
              <ul className="space-y-2">
                {filterOptions.ratings.map(rating => (
                  <li key={rating.value}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.rating === rating.value}
                        onChange={(e) => handleRatingChange(rating.value)}
                        className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {rating.value} Stars ({rating.count})
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <h3 className="flex items-center mb-3 text-lg font-semibold">
                <ChevronDown className="mr-2 w-4 h-4" />
                Tags
              </h3>
              <ul className="space-y-2">
                {filterOptions.tags.map(tag => (
                  <li key={tag.name}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.tags.includes(tag.name)}
                        onChange={(e) => handleTagChange(tag.name, e.target.checked)}
                        className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag.name} ({tag.count})</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h3 className="flex items-center mb-3 text-lg font-semibold">
                <ChevronDown className="mr-2 w-4 h-4" />
                Brands
              </h3>
              <ul className="space-y-2">
                {availableBrands.map(brand => (
                  <li key={brand}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.has(brand)}
                        onChange={(e) => {
                          const newSelectedBrands = new Set(selectedBrands);
                          if (newSelectedBrands.has(brand)) {
                            newSelectedBrands.delete(brand);
                          } else {
                            newSelectedBrands.add(brand);
                          }
                          setSelectedBrands(newSelectedBrands);
                          setCurrentPage(1);
                        }}
                        className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h3 className="flex items-center mb-3 text-lg font-semibold">
                <ChevronDown className="mr-2 w-4 h-4" />
                Sort By
              </h3>
              <select
                value={activeFilters.sortBy}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="mb-6">
              <h3 className="flex items-center mb-3 text-lg font-semibold">
                <ChevronDown className="mr-2 w-4 h-4" />
                View Mode
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    activeFilters.viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    activeFilters.viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clear All Filters */}
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 w-full font-medium text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
            >
              Clear All Filters
            </button>
          </aside>

          {/* Main Content Area */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {activeFilters.categories || activeFilters.searchQuery || activeFilters.rating > 0 || activeFilters.tags.length > 0 || selectedBrands.size > 0 || activeFilters.sortBy !== 'featured' || activeFilters.priceRange.min !== filterOptions.priceRange.min || activeFilters.priceRange.max !== filterOptions.priceRange.max ? 'Filtered Products' : 'All Products'}
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 bg-gray-200 rounded-lg lg:hidden hover:bg-gray-300"
                  title="Show Filters"
                >
                  <Filter className="w-6 h-6 text-gray-700" />
                </button>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 w-48 rounded-lg border border-gray-300 sm:w-64 lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {loading ? (
              <ProductGrid isLoading={loading} onQuickContact={handleQuickContact} onAddToWishlist={toggleFavorite} onQuickView={handleQuickView} wishlistedItems={Array.from(favorites)} viewMode={activeFilters.viewMode} />
            ) : error ? (
              <div className="col-span-full py-12 text-center text-gray-600">
                {error}
              </div>
            ) : (
              <ProductGrid products={products} onQuickContact={handleQuickContact} onAddToWishlist={toggleFavorite} onQuickView={handleQuickView} wishlistedItems={Array.from(favorites)} viewMode={activeFilters.viewMode} />
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="mx-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;