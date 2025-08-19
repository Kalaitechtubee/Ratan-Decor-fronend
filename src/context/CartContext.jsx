import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartInitialized, setCartInitialized] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(totalCount);
  }, [cart]);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      clearCart();
      return;
    }

    // Don't fetch if already initialized
    if (cartInitialized) {
      return;
    }

    try {
      setCartLoading(true);
      setCartError(null);
      const response = await api.getCart();

      // Normalize cart items to ensure Product object includes required fields
      const cartItems = (response.cartItems || response.items || (Array.isArray(response) ? response : [])).map(item => ({
        ...item,
        Product: {
          ...item.Product,
          averageRating: item.Product?.averageRating || 0,
          gst: item.Product?.gst || 0,
          image: item.Product?.imageUrl || item.Product?.image,
        },
      }));

      setCart(cartItems);
      setCartInitialized(true);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartError(error?.response?.data?.message || 'Failed to load cart');
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return false;
    }

    try {
      setCartLoading(true);
      setCartError(null);

      const productId = product.id || product._id;
      if (!productId) throw new Error('Product ID is missing');

      const response = await api.addToCart(productId, quantity);
      if (response?.message || response?.success) {
        await fetchCart();
        alert(`${product.name} added to cart!`);
        return true;
      }
      throw new Error('Failed to add item to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      setCartError(error?.message || 'Failed to add to cart');
      alert(error?.message || 'Failed to add to cart. Please try again.');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated) return false;
    if (quantity <= 0) return await removeFromCart(cartItemId);

    try {
      setCartLoading(true);
      setCartError(null);
      await api.updateCartItem(cartItemId, quantity);

      setCart((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
      );
      return true;
    } catch (error) {
      console.error('Update cart item error:', error);
      setCartError(error?.message || 'Failed to update cart item');
      alert(error?.message || 'Failed to update cart item');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) return false;
    try {
      setCartLoading(true);
      setCartError(null);
      await api.deleteCartItem(cartItemId);
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      return true;
    } catch (error) {
      console.error('Remove cart item error:', error);
      setCartError(error?.message || 'Failed to remove cart item');
      alert(error?.message || 'Failed to remove cart item');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCartCount(0);
    setCartError(null);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.itemCalculations?.unitPrice || item.Product?.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      return total + price * qty;
    }, 0);
  };

  // Initialize cart only when explicitly called or when user becomes authenticated
  // useEffect(() => {
  //   if (isAuthenticated && !cartInitialized) {
  //     fetchCart();
  //   }
  // }, [isAuthenticated]);

  const value = {
    cart,
    cartLoading,
    cartError,
    cartCount,
    fetchCart, // Expose this so components can trigger cart loading when needed
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    cartInitialized, // Expose this to check if cart is loaded
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};