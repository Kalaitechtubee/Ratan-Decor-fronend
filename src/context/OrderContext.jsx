import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [availableAddresses, setAvailableAddresses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load order statistics
  const loadOrderStats = async () => {
    try {
      setLoading(true);
      const response = await api.getOrderStats();
      if (response.success) {
        setOrderStats(response.stats);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load available addresses
  const loadAvailableAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.getAvailableAddresses();
      if (response.success) {
        setAvailableAddresses(response.addresses);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.createOrder(orderData);
      
      if (response.success) {
        // Reload orders and stats
        await loadOrders();
        await loadOrderStats();
        return { success: true, order: response.order, redirectToPayment: response.redirectToPayment };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Load orders
  const loadOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getOrders(params);
      
      if (response.success) {
        setOrders(response.orders);
        return { success: true, orders: response.orders, summary: response.orderSummary };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get single order
  const getOrderById = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getOrderById(orderId);
      
      if (response.success) {
        return { success: true, order: response.order };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId, reason) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.cancelOrder(orderId, reason);
      
      if (response.success) {
        // Reload orders and stats
        await loadOrders();
        await loadOrderStats();
        return { success: true, message: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update order
  const updateOrder = async (orderId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.updateOrder(orderId, updateData);
      
      if (response.success) {
        // Reload orders
        await loadOrders();
        return { success: true, message: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadOrderStats();
    loadAvailableAddresses();
  }, []);

  const value = {
    orders,
    orderStats,
    availableAddresses,
    loading,
    error,
    createOrder,
    loadOrders,
    getOrderById,
    cancelOrder,
    updateOrder,
    loadOrderStats,
    loadAvailableAddresses
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
