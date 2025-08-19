import { useState, useEffect, useContext, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Eye, 
  ShoppingBag, 
  Star, 
  Phone, 
  MessageCircle, 
  ArrowRight 
} from 'lucide-react';
import useScrollToTop from '../hooks/useScrollToTop';
import { UserTypeContext } from '../context/UserTypeContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';

const AllProduct = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { userType, updateUserType, refreshTrigger } = useContext(UserTypeContext);
  const { addToCart, cartLoading, cartError } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProducts({ userType, page: 1, limit: 20 });
      if (!response.products || !Array.isArray(response.products)) {
        throw new Error('Invalid response format: No products array found');
      }
      console.log(`🚀 Fetched ${response.products.length} products for user type: ${userType}`);
      setProducts(response.products);
    } catch (err) {
      console.error('Fetch Products Error:', err);
      setError(err.message || 'Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userType]);

  useEffect(() => {
    if (!userType) {
      console.warn('No userType set, defaulting to Residential');
      const defaultType = 'Residential';
      localStorage.setItem('userType', defaultType);
      updateUserType(defaultType);
      return;
    }
    console.log(`🔄 User type changed to: ${userType}, fetching products... (refresh: ${refreshTrigger})`);
    fetchProducts();
  }, [userType, updateUserType, fetchProducts, refreshTrigger]);

  const handleRetry = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToWishlist = (productId) => {
    setWishlistedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleQuickContact = (productId, productName, type) => {
    if (type === 'call') {
      window.open('tel:+919876543210');
    } else if (type === 'whatsapp') {
      const message = encodeURIComponent(`Hi! I'm interested in ${productName}`);
      window.open(`https://wa.me/919876543210?text=${message}`);
    }
  };

  const handleQuickView = (productId) => {
    navigate(`/ProductDetails/${productId}`);
  };

  useEffect(() => {
    if (!userType) {
      const storedUserType = localStorage.getItem('userType');
      if (storedUserType) {
        updateUserType(storedUserType);
      } else {
        const defaultType = 'Residential';
        localStorage.setItem('userType', defaultType);
        updateUserType(defaultType);
      }
    }
  }, [userType, updateUserType]);

  const ProductSkeleton = () => (
    <motion.div
      className="overflow-hidden p-4 h-full bg-white rounded-xl border border-gray-100 animate-pulse shadow-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      </div>
      <div className="p-3">
        <div className="mb-2 w-3/4 h-4 bg-gray-200 rounded" />
        <div className="mb-1 w-full h-3 bg-gray-200 rounded" />
        <div className="mb-2 w-2/3 h-3 bg-gray-200 rounded" />
        <div className="mb-2 w-1/2 h-5 bg-gray-200 rounded" />
        <div className="w-full h-8 bg-gray-200 rounded-lg" />
      </div>
    </motion.div>
  );

  const EnhancedProductCard = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    const productId = product._id || product.id;
    const isWishlisted = wishlistedItems.has(productId);
    
    const enhancedProduct = {
      ...product,
      images: product.imageUrl ? [product.imageUrl] : [],
      category: product.category || { name: 'General' }, // Ensure category is an object
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 23,
      originalPrice: product.originalPrice || null,
      isNew: product.isNew || false,
      isFeatured: product.isFeatured || false,
      tags: product.tags || []
    };

    const discountPercentage = enhancedProduct.originalPrice 
      ? Math.round(((enhancedProduct.originalPrice - enhancedProduct.price) / enhancedProduct.originalPrice) * 100)
      : 0;

    const handleImageNavigation = (direction) => {
      if (enhancedProduct.images.length <= 1) return;
      setCurrentImageIndex(prev => 
        direction === 'next'
          ? prev === enhancedProduct.images.length - 1 ? 0 : prev + 1
          : prev === 0 ? enhancedProduct.images.length - 1 : prev - 1
      );
    };

    return (
      <motion.div
        className="flex overflow-hidden flex-col h-full bg-white rounded-xl border border-gray-100 transition-all duration-300 shadow-card group hover:shadow-card-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="overflow-hidden relative bg-gray-100">
          <div className="aspect-[4/3] relative">
            {enhancedProduct.images.length > 0 ? (
              <img
                src={enhancedProduct.images[currentImageIndex] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={enhancedProduct.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => { e.target.src = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full bg-gray-50">
                <span className="text-sm text-gray-500">No Image Available</span>
              </div>
            )}
            
            {enhancedProduct.images.length > 1 && (
              <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <button
                  onClick={(e) => { e.preventDefault(); handleImageNavigation('prev'); }}
                  className="flex justify-center items-center w-8 h-8 rounded-full shadow-md transition-colors bg-white/80 hover:bg-white"
                >
                  <ArrowRight className="w-4 h-4 text-gray-700 rotate-180" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); handleImageNavigation('next'); }}
                  className="flex justify-center items-center w-8 h-8 rounded-full shadow-md transition-colors bg-white/80 hover:bg-white"
                >
                  <ArrowRight className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            )}

            {enhancedProduct.images.length > 1 && (
              <div className="flex absolute bottom-2 left-1/2 space-x-1 -translate-x-1/2">
                {enhancedProduct.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.preventDefault(); setCurrentImageIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex absolute top-3 left-3 flex-col space-y-1">
            {enhancedProduct.isNew && (
              <span className="px-2 py-1 text-xs font-semibold text-white rounded-md bg-primary">
                NEW
              </span>
            )}
            {enhancedProduct.isFeatured && (
              <span className="px-2 py-1 text-xs font-semibold text-white rounded-md bg-primary/80">
                FEATURED
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-white rounded-md bg-primary">
                -{discountPercentage}%
              </span>
            )}
          </div>

          <div className={`absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            <button
              onClick={(e) => { e.preventDefault(); handleAddToWishlist(productId); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                isWishlisted ? 'text-white bg-primary' : 'text-gray-700 bg-white/90 hover:bg-primary hover:text-white'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); handleQuickView(productId); }}
              className="flex justify-center items-center w-8 h-8 text-gray-700 rounded-full shadow-md transition-colors bg-white/90 hover:bg-primary hover:text-white"
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
                onClick={(e) => { e.preventDefault(); handleQuickContact(productId, enhancedProduct.name, 'call'); }}
                className="flex flex-1 justify-center items-center px-3 py-2 space-x-1 text-sm font-medium text-white rounded-lg transition-colors bg-primary hover:bg-primary/90"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); handleQuickContact(productId, enhancedProduct.name, 'whatsapp'); }}
                className="flex flex-1 justify-center items-center px-3 py-2 space-x-1 text-sm font-medium text-white rounded-lg transition-colors bg-primary/90 hover:bg-primary"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-grow p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="px-2 py-1 text-xs font-medium rounded-md text-primary bg-primary/10">
              {enhancedProduct.category.name || 'General'} {/* Fix: Use category.name */}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">{enhancedProduct.rating}</span>
              <span className="text-xs text-gray-500">({enhancedProduct.reviewCount})</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/ProductDetails/${productId}`)}
            className="text-left"
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors line-clamp-2 hover:text-primary">
              {enhancedProduct.name || 'Unnamed Product'}
            </h3>
          </button>

          <p className="flex-grow mb-3 text-sm text-gray-600 line-clamp-2">
            {enhancedProduct.description || 'No description available'}
          </p>

          {enhancedProduct.tags && enhancedProduct.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {enhancedProduct.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {enhancedProduct.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{enhancedProduct.tags.length - 2}</span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{enhancedProduct.price?.toLocaleString() || 'N/A'}
              </span>
              {enhancedProduct.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{enhancedProduct.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={() => addToCart(product)}
              className="flex items-center space-x-1 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              disabled={cartLoading}
            >
              {cartLoading ? (
                <div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Explore Our Products</h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-500">
            Discover our premium selection of products designed for your needs
          </p>
        </div>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation
          pagination={{ clickable: true }}
          loop={false} // Disable loop for skeleton to avoid warning
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: Math.min(4, 4) }, // Limit to 4
          }}
          className="pb-12"
        >
          {[...Array(4)].map((_, index) => (
            <SwiperSlide key={index}>
              <ProductSkeleton />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  }

  if (error || cartError) {
    return (
      <section className="px-4 py-16 mx-auto max-w-7xl text-center sm:px-6 lg:px-8">
        <div className="inline-block p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="mb-4 text-base text-gray-700">{error || cartError}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 bg-primary hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="px-4 py-16 mx-auto max-w-7xl text-center sm:px-6 lg:px-8">
        <div className="inline-block p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="mb-4 text-base text-gray-700">
            No products available for {userType || 'your selected type'}.
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 bg-primary hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Explore Our Products</h2>
        <p className="mx-auto max-w-2xl text-sm text-gray-500">
          Discover our premium selection of products designed for your needs
        </p>
      </div>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop={products.length >= 4} // Enable loop only if enough slides
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: Math.min(products.length, 3) }, // Dynamic slidesPerView
          1280: { slidesPerView: Math.min(products.length, 4) }, // Dynamic slidesPerView
        }}
        className="pb-12"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id || product.id}>
            <EnhancedProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default AllProduct;