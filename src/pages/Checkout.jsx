
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building, 
  MapPin, 
  Truck, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useUserType } from '../context/useUserType';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartLoading, getCartTotal } = useCart(); // Fixed: use correct property names
  const { createOrder, availableAddresses = {}, loading: orderLoading } = useOrder();
  const { user } = useAuth();
  const { userType } = useUserType();

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('Gateway');
  const [paymentProof, setPaymentProof] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressType, setAddressType] = useState('default');
  const [shippingAddressId, setShippingAddressId] = useState(null);
  const [notes, setNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Address management
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    addressType: 'Home'
  });

  // Calculate cart summary
  const cartTotal = getCartTotal();
  const gstTotal = cart.reduce((total, item) => {
    const price = parseFloat(item.itemCalculations?.unitPrice || item.Product?.price) || 0;
    const qty = parseInt(item.quantity) || 0;
    const gstRate = parseFloat(item.Product?.gst || 0);
    return total + (price * qty * gstRate / 100);
  }, 0);
  const subtotal = cartTotal;
  const totalAmount = cartTotal + gstTotal;
  const platformFee = subtotal * 0.02;
  const finalTotal = totalAmount + platformFee;

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Set default address
    if (availableAddresses?.defaultAddress) {
      setSelectedAddress(availableAddresses.defaultAddress);
      setAddressType('default');
    } else if (availableAddresses?.shippingAddresses?.length > 0) {
      const defaultShipping = availableAddresses.shippingAddresses.find(addr => addr.isDefault);
      if (defaultShipping) {
        setSelectedAddress({
          type: 'shipping',
          data: defaultShipping
        });
        setAddressType('shipping');
        setShippingAddressId(defaultShipping.id);
      }
    }
  }, [cart, availableAddresses, navigate]);

  const handleAddressSelect = (address, type, id = null) => {
    setSelectedAddress({
      type,
      data: address
    });
    setAddressType(type);
    setShippingAddressId(id);
  };

  const handleAddAddress = async () => {
    try {
      setIsProcessing(true);
      const response = await api.createShippingAddress(newAddress);
      if (response.success) {
        // Reload addresses
        window.location.reload(); // Simple reload for now
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      const orderData = {
        paymentMethod: normalizePaymentMethod(paymentMethod),
        paymentProof: paymentProof,
        addressType: addressType,
        shippingAddressId: shippingAddressId,
        notes: notes,
        expectedDeliveryDate: expectedDeliveryDate,
        items: cart.map(item => ({
          productId: item.Product?.id || item.productId,
          quantity: item.quantity,
          unitPrice: item.itemCalculations?.unitPrice || item.Product?.price
        }))
      };

      const result = await createOrder(orderData);
      
      if (result.success) {
        navigate(`/order-success/${result.order.id}`);
      } else {
        setError(result.message || 'Failed to create order');
      }
    } catch (error) {
      setError(error.message || 'Failed to create order');
    } finally {
      setIsProcessing(false);
    }
  };

  const normalizePaymentMethod = (method) => {
    const m = (method || '').toString().toLowerCase();
    if (m === 'gateway') return 'Gateway';
    if (['upi', 'gpay', 'googlepay', 'phonepe', 'paytm', 'bhim', 'qr'].includes(m)) return 'UPI';
    if (['bank', 'banktransfer', 'bank_transfer', 'neft', 'imps', 'rtgs'].includes(m)) return 'BankTransfer';
    return method;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price || 0);
  };

  // Loading state
  if (cartLoading || orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff4747] mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart redirect
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="px-4 py-8 mx-auto max-w-4xl">
          <div className="py-20 text-center">
            <AlertCircle className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-700">Your Cart is Empty</h2>
            <p className="mb-6 text-gray-600">Add some products to your cart to proceed with checkout</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-[#ff4747] text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center p-2 text-gray-600 bg-white rounded-xl shadow-sm transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Cart
          </button>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg border border-red-400">
            <div className="flex items-center">
              <AlertCircle className="mr-2 w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery Address */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <MapPin className="mr-2 w-5 h-5 text-[#ff4747]" />
                <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
              </div>

              {/* Default Address */}
              {availableAddresses?.defaultAddress && (
                <div className="mb-4">
                  <label className="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="address"
                      checked={addressType === 'default'}
                      onChange={() => handleAddressSelect(availableAddresses.defaultAddress, 'default')}
                      className="mr-3 text-[#ff4747]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">Default Address</h3>
                        <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded">Default</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {availableAddresses.defaultAddress.name} - {availableAddresses.defaultAddress.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {availableAddresses.defaultAddress.address}, {availableAddresses.defaultAddress.city}, {availableAddresses.defaultAddress.state} {availableAddresses.defaultAddress.pincode}
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Shipping Addresses */}
              {availableAddresses?.shippingAddresses?.map((address) => (
                <div key={address.id} className="mb-4">
                  <label className="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="address"
                      checked={addressType === 'shipping' && shippingAddressId === address.id}
                      onChange={() => handleAddressSelect(address, 'shipping', address.id)}
                      className="mr-3 text-[#ff4747]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900">{address.name}</h3>
                        <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded">{address.addressType}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {address.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.address}, {address.city}, {address.state} {address.pincode}
                      </p>
                    </div>
                  </label>
                </div>
              ))}

              {/* Add New Address Button */}
              <button
                onClick={() => setShowAddressForm(true)}
                className="flex items-center p-3 w-full text-[#ff4747] border-2 border-dashed border-[#ff4747] rounded-lg hover:bg-red-50 transition-colors"
              >
                <Plus className="mr-2 w-5 h-5" />
                Add New Address
              </button>
            </div>

            {/* Payment Method */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <CreditCard className="mr-2 w-5 h-5 text-[#ff4747]" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="Gateway"
                    checked={paymentMethod === 'Gateway'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 text-[#ff4747]"
                  />
                  <div className="flex items-center">
                    <CreditCard className="mr-2 w-5 h-5 text-gray-600" />
                    <span className="font-medium">Online Payment Gateway</span>
                  </div>
                </label>

                <label className="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 text-[#ff4747]"
                  />
                  <div className="flex items-center">
                    <Smartphone className="mr-2 w-5 h-5 text-gray-600" />
                    <span className="font-medium">UPI Payment</span>
                  </div>
                </label>

                <label className="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="BankTransfer"
                    checked={paymentMethod === 'BankTransfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 text-[#ff4747]"
                  />
                  <div className="flex items-center">
                    <Building className="mr-2 w-5 h-5 text-gray-600" />
                    <span className="font-medium">Bank Transfer</span>
                  </div>
                </label>
              </div>

              {/* Payment Proof Upload */}
              {paymentMethod !== 'Gateway' && (
                <div className="p-4 mt-4 bg-gray-50 rounded-lg">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload Payment Proof
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentProof(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff4747] file:text-white hover:file:bg-red-700"
                  />
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Additional Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747]"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Expected Delivery Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff4747] focus:border-[#ff4747]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="mb-4 space-y-3">
                  {cart && cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.Product?.imageUrl || item.Product?.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2NUM2Mi43NjE0IDY1IDY1IDY3LjIzODYgNjUgNzBDNjUgNzIuNzYxNCA2Mi43NjE0IDc1IDYwIDc1QzU3LjIzODYgNzUgNTUgNzIuNzYxNCA1NSA3MEM1NSA2Ny4yMzg2IDU3LjIzODYgNjUgNjAgNjVaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik02MCA4NUM2Mi43NjE0IDg1IDY1IDg3LjIzODYgNjUgOTBDNjUgOTIuNzYxNCA2Mi43NjE0IDk1IDYwIDk1QzU3LjIzODYgOTUgNTUgOTIuNzYxNCA1NSA5MEM1NSA4Ny4yMzg2IDU3LjIzODYgODUgNjAgODVaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo='}
                        alt={item.Product?.name || 'Product'}
                        className="object-cover w-12 h-12 rounded-lg"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2NUM2Mi43NjE0IDY1IDY1IDY3LjIzODYgNjUgNzBDNjUgNzIuNzYxNCA2Mi43NjE0IDc1IDYwIDc1QzU3LjIzODYgNzUgNTUgNzIuNzYxNCA1NSA3MEM1NSA2Ny4yMzg2IDU3LjIzODYgNjUgNjAgNjVaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik02MCA4NUM2Mi43NjE0IDg1IDY1IDg3LjIzODYgNjUgOTBDNjUgOTIuNzYxNCA2Mi43NjE0IDk1IDYwIDk1QzU3LjIzODYgOTUgNTUgOTIuNzYxNCA1NSA5MEM1NSA4Ny4yMzg2IDU3LjIzODYgODUgNjAgODVaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.Product?.name || 'Product Name'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.itemCalculations?.totalAmount || (item.Product?.price * item.quantity))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 space-y-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST</span>
                    <span className="text-gray-900">{formatPrice(gstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (2%)</span>
                    <span className="text-gray-900">{formatPrice(platformFee)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-lg text-[#ff4747]">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Type Info */}
                <div className="p-3 mt-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <Shield className="mr-2 w-4 h-4" />
                    <span>User Type: {userType?.displayName || 'Residential'}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedAddress}
                  className="px-6 py-3 mt-6 w-full font-semibold text-white rounded-lg transition-all bg-[#ff4747] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex justify-center items-center">
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Processing Order...
                    </div>
                  ) : (
                    `Place Order - ${formatPrice(finalTotal)}`
                  )}
                </button>

                {/* Security Notice */}
                <div className="p-3 mt-4 bg-green-50 rounded-lg">
                  <div className="flex items-start text-sm text-green-800">
                    <Shield className="w-4 h-4 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Secure Checkout</p>
                      <p className="mt-1 text-xs">Your payment information is encrypted and secure.</p>
                    </div>
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

export default Checkout;
