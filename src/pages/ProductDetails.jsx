import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw, 
  Star,
  ChevronLeft,
  Share2,
  Minus,
  Plus,
  Eye,
  Award,
  Clock,
  CheckCircle,
  Info,
  Zap,
  Package,
  Phone,
  MessageCircle,
  Loader2
} from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";
import { useUserType } from "../context/useUserType";

const ProductDetails = () => {
  // Add your state and logic here
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [currentUserType, setCurrentUserType] = useState("Residential");
  const [currentUserRole, setCurrentUserRole] = useState("Standard");
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { userType } = useUserType();

  // Add your useEffect and other functions here
  useEffect(() => {
    // Fetch product data
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setOriginalPrice(response.data.price || 0);
        setDisplayPrice(response.data.price || 0);
        setDiscount(response.data.discount || 0);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (action) => {
    if (action === 'increment') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center p-3 text-gray-600 bg-white rounded-xl shadow-sm transition-colors hover:bg-gray-50"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="overflow-hidden relative bg-white rounded-2xl shadow-lg aspect-square group">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop';
                  }}
                />
              ) : (
                <div className="flex justify-center items-center w-full h-full bg-gray-100">
                  <div className="text-center">
                    <Package className="mx-auto mb-4 w-16 h-16 text-gray-400" />
                    <span className="text-lg font-medium text-gray-500">No image available</span>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              <div className="flex absolute top-4 left-4 flex-col space-y-2">
                <div className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full shadow-lg">
                  In Stock
                </div>
                {discount > 0 && (
                  <div className="px-3 py-1 text-xs font-semibold text-white rounded-full shadow-lg bg-primary">
                    {discount}% OFF
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button className="p-3 rounded-xl shadow-lg backdrop-blur-sm transition-all bg-white/90 hover:bg-white hover:scale-105">
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle, title: "Verified", desc: "Authentic Product", color: "green" },
                { icon: Award, title: "Premium", desc: "High Quality", color: "blue" },
                { icon: Clock, title: "Fast", desc: "Quick Delivery", color: "purple" }
              ].map((item, index) => (
                <div key={index} className="p-4 text-center bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md">
                  <div className={`w-10 h-10 mx-auto mb-3 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="inline-flex items-center px-3 py-1 bg-green-50 rounded-full">
                    <div className="mr-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Available</span>
                  </div>
                  {discount > 0 && (
                    <div className="inline-flex items-center px-3 py-1 bg-red-50 rounded-full">
                      <span className="text-sm font-medium text-primary">{discount}% OFF</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105"
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
                      isWishlisted 
                        ? 'bg-red-100 text-primary' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
              
              <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">
                {product.name}
              </h1>
              
              {product.Category && (
                <div className="flex items-center mb-4 space-x-2">
                  <span className="text-sm font-medium tracking-wide text-gray-500 uppercase">Category:</span>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full transition-colors cursor-pointer hover:bg-gray-200">
                    {product.Category.name}
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold text-gray-900 lg:text-4xl">
                      ₹{displayPrice?.toLocaleString()}
                    </span>
                    {discount > 0 && (
                      <span className="text-xl text-gray-400 line-through">
                        ₹{originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {currentUserType !== "Residential" && (
                    <div className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      {currentUserType} Pricing
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="mb-1 text-sm text-gray-500">EMI starts at</div>
                  <div className="text-xl font-bold text-gray-700 lg:text-2xl">
                    ₹{Math.floor(displayPrice / 12)}<span className="text-sm font-normal">/month</span>
                  </div>
                </div>
              </div>
              <div className="p-3 text-xs text-gray-500 rounded-xl bg-white/50">
                💳 No cost EMI available • 🚛 Free delivery above ₹999
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="mr-3 text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex overflow-hidden items-center rounded-xl border border-gray-200">
                    <button
                      onClick={() => handleQuantityChange('decrement')}
                      className="p-3 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-6 py-3 text-lg font-semibold text-gray-900 bg-gray-50">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increment')}
                      className="p-3 transition-colors hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex justify-center items-center space-x-3">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </div>
                </button>
                
                <button className="group relative overflow-hidden bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex justify-center items-center space-x-3">
                    <Zap className="w-5 h-5" />
                    <span>Buy Now</span>
                  </div>
                </button>
              </div>

              {/* Contact Options */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button className="flex justify-center items-center px-4 py-3 space-x-2 text-green-700 bg-green-50 rounded-xl transition-colors hover:bg-green-100">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Call Now</span>
                </button>
                <button className="flex justify-center items-center px-4 py-3 space-x-2 text-blue-700 bg-blue-50 rounded-xl transition-colors hover:bg-blue-100">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Why Choose This Product</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999", color: "blue" },
                  { icon: Shield, title: "2 Year Warranty", desc: "Complete protection", color: "green" },
                  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy", color: "purple" }
                ].map((item, index) => (
                  <div key={index} className="text-center group">
                    <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-2xl flex items-center justify-center group-hover:from-${item.color}-100 group-hover:to-${item.color}-200 transition-all duration-300 transform group-hover:scale-110`}>
                      <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                    </div>
                    <h4 className="mb-2 font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                <div className="mr-3 w-1 h-6 rounded-full bg-primary"></div>
                Product Description
              </h3>
              <div className={`text-gray-600 leading-relaxed ${showFullDescription ? '':'line-clamp-3'}`}>
                {product.description || "This is a premium quality product crafted with attention to detail and designed to meet your specific needs. Perfect for modern homes and offices."}
              </div>
              {product.description && product.description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-3 text-sm font-medium transition-colors text-primary hover:text-primary/80"
                >
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="flex items-center mb-6 text-xl font-bold text-gray-900">
                  <div className="mr-3 w-1 h-6 rounded-full bg-primary"></div>
                  Specifications
                </h4>
                <div className="grid gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100">
                      <span className="flex items-center font-medium text-gray-600 capitalize">
                        <div className="mr-3 w-2 h-2 rounded-full bg-primary"></div>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="flex items-center mb-4">
                <div className="mr-3 w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-lg font-bold text-amber-800">Account Information</span>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-white/60">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-amber-700">User Type:</span>
                    <span className="px-3 py-1 font-bold text-amber-900 bg-amber-100 rounded-full">
                      {currentUserType}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/60">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-amber-700">User Role:</span>
                    <span className="px-3 py-1 font-bold text-amber-900 bg-amber-100 rounded-full">
                      {currentUserRole || "Standard"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetails;