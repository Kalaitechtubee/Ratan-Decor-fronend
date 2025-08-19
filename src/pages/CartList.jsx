import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../services/api';
import Checkout from './Checkout';
import OrderSuccess from './OrderSuccess';
import { OrderProvider } from '../context/OrderContext';

const CartList = () => {
  const { 
    cart, 
    cartLoading, 
    cartError, 
    fetchCart, 
    cartInitialized, 
    removeFromCart, 
    updateCartItem,
    getCartTotal 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Only fetch cart if not already initialized
    if (!cartInitialized) {
      fetchCart();
    }
    
    setLoading(false);
  }, [isAuthenticated, navigate, fetchCart, cartInitialized]);

  const handleQuantityChange = async (cartItemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    console.log('Checkout button clicked');
    console.log('Cart items:', cart);
    console.log('Cart length:', cart?.length);
    
    if (cart && cart.length > 0) {
      console.log('Navigating to checkout...');
      // Use window.location.href as a more reliable navigation method
      window.location.href = '/checkout';
    } else {
      console.log('Cart is empty, showing alert');
      alert('Your cart is empty');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price || 0);
  };

  const formatGST = (gstRate) => {
    const numGST = parseFloat(gstRate) || 0;
    return numGST > 0 ? `${numGST}%` : 'Not Applicable';
  };

  // Default placeholder image that works
  const getProductImage = (product) => {
    if (product?.imageUrl) return product.imageUrl;
    if (product?.image) return product.image;
    // Use a working placeholder service
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2NUM2Mi43NjE0IDY1IDY1IDY3LjIzODYgNjUgNzBDNjUgNzIuNzYxNCA2Mi43NjE0IDc1IDYwIDc1QzU3LjIzODYgNzUgNTUgNzIuNzYxNCA1NSA3MEM1NSA2Ny4yMzg2IDU3LjIzODYgNjUgNjAgNjVaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik02MCA4NUM2Mi43NjE0IDg1IDY1IDg3LjIzODYgNjUgOTBDNjUgOTIuNzYxNCA2Mi43NjE0IDk1IDYwIDk1QzU3LjIzODYgOTUgNTUgOTIuNzYxNCA1NSA5MEM1NSA4Ny4yMzg2IDU3LjIzODYgODUgNjAgODVaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
  };

  const renderRating = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<StarIcon key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  // Loading state
  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff4747] mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="py-20 text-center">
            <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
              <p className="font-medium">Error loading cart</p>
              <p className="text-sm">{cartError}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="py-20 text-center">
            <ShoppingCartIcon className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-700">Please Login</h2>
            <p className="mb-6 text-gray-600">You need to be logged in to view your cart</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#ff4747] text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="py-20 text-center">
            <ShoppingCartIcon className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-700">Your Cart is Empty</h2>
            <p className="mb-6 text-gray-600">Add some products to your cart to get started</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-[#ff4747] text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate totals
  const cartTotal = getCartTotal();
  const gstTotal = cart.reduce((total, item) => {
    const price = parseFloat(item.itemCalculations?.unitPrice || item.Product?.price) || 0;
    const qty = parseInt(item.quantity) || 0;
    const gstRate = parseFloat(item.Product?.gst || 0);
    return total + (price * qty * gstRate / 100);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center p-2 text-gray-600 bg-white rounded-xl shadow-sm transition-colors hover:bg-gray-50"
          >
            <ArrowLeftIcon className="mr-2 w-5 h-5" />
            Back
          </button>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => {
                const productPrice = item.Product?.price || item.itemCalculations?.unitPrice || 0;
                const gstRate = item.Product?.gst || 0;
                const gstAmount = (productPrice * item.quantity * gstRate) / 100;
                const productGST = `${gstRate}%`;

                return (
                  <div key={item.id} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <img
                        src={getProductImage(item.Product)}
                        alt={item.Product?.name || 'Product'}
                        className="object-cover w-24 h-24 rounded-lg"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2NUM2Mi43NjE0IDY1IDY1IDY3LjIzODYgNjUgNzBDNjUgNzIuNzYxNCA2Mi43NjE0IDc1IDYwIDc1QzU3LjIzODYgNzUgNTUgNzIuNzYxNCA1NSA3MEM1NSA2Ny4yMzg2IDU3LjIzODYgNjUgNjAgNjVaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik02MCA4NUM2Mi43NjE0IDg1IDY1IDg3LjIzODYgNjUgOTBDNjUgOTIuNzYxNCA2Mi43NjE0IDk1IDYwIDk1QzU3LjIzODYgOTUgNTUgOTIuNzYxNCA1NSA5MEM1NSA4Ny4yMzg2IDU3LjIzODYgODUgNjAgODVaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                        }}
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.Product?.name || 'Product Name'}
                          </h3>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-gray-400 transition-colors hover:text-red-500"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="mb-2 text-sm text-gray-600">
                          {item.Product?.description || 'Product description'}
                        </p>

                        {/* GST Display */}
                        <p className="mb-3 text-sm text-gray-600">
                          GST: {productGST} {gstAmount > 0 ? `(${formatPrice(gstAmount)})` : ''}
                        </p>

                        <div className="flex justify-between items-center">
                          {/* Quantity Controls */}
                          <div className="flex gap-3 items-center">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center rounded-lg border border-gray-300">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                disabled={item.quantity <= 1 || cartLoading}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 border-x border-gray-300 font-medium min-w-[60px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                disabled={cartLoading}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-semibold text-[#ff4747]">
                              {formatPrice(productPrice)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Total: {formatPrice(item.itemCalculations?.totalAmount || productPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
              
              <div className="mb-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium">{formatPrice(gstTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-[#ff4747]">{formatPrice(cartTotal + gstTotal)}</span>
                  </div>
                </div>
              </div>

              {cart.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    className="px-6 py-3 w-full font-semibold text-white rounded-lg transition-all bg-[#ff4747] hover:bg-red-700"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}

              <p className="mt-3 text-xs text-center text-gray-500">
                Secure checkout powered by SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartList;
