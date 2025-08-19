import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  Mail, 
  Phone, 
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrder();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const result = await getOrderById(orderId);
        if (result.success) {
          setOrder(result.order);
        } else {
          navigate('/orders');
        }
      } catch (error) {
        console.error('Failed to load order:', error);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, getOrderById, navigate]);

  const handleDownloadInvoice = () => {
    // Implement invoice download
    console.log('Downloading invoice for order:', orderId);
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order #${orderId}`,
        text: `Check out my order from Ratan Decor!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your order. We'll start processing it right away.</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Download className="w-4 h-4 mr-1" />
                Invoice
              </button>
              <button
                onClick={handleShareOrder}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-semibold text-gray-900">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-semibold text-primary text-lg">₹{order.total?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Order Placed</p>
                <p className="text-sm text-gray-500">We've received your order</p>
              </div>
            </div>
            
            <div className="flex-1 h-px bg-gray-200"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-400">Processing</p>
                <p className="text-sm text-gray-400">Preparing your order</p>
              </div>
            </div>
            
            <div className="flex-1 h-px bg-gray-200"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-400">Shipped</p>
                <p className="text-sm text-gray-400">On its way to you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{order.deliveryAddress.data.name}</p>
              <p className="text-gray-600">{order.deliveryAddress.data.phone}</p>
              <p className="text-gray-600">{order.deliveryAddress.data.address}</p>
              <p className="text-gray-600">
                {order.deliveryAddress.data.city}, {order.deliveryAddress.data.state} {order.deliveryAddress.data.pincode}
              </p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.OrderItems?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <img
                  src={item.Product?.imageUrl || 'https://via.placeholder.com/60'}
                  alt={item.Product?.name}
                  className="w-15 h-15 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.Product?.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <p className="text-sm text-gray-500">Price: ₹{item.price?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{item.total?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Order Confirmation Email</p>
                <p className="text-sm text-blue-700">We've sent a confirmation email with order details.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Processing Time</p>
                <p className="text-sm text-blue-700">Your order will be processed within 1-2 business days.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Customer Support</p>
                <p className="text-sm text-blue-700">Need help? Contact us at +91-XXXXXXXXXX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 flex items-center justify-center px-6 py-3 text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all"
          >
            View All Orders
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center px-6 py-3 text-white bg-primary rounded-lg font-semibold hover:bg-primary/90 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderSuccess;
