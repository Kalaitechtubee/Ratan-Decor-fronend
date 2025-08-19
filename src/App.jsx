

import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import useScrollToTop from './hooks/useScrollToTop';
import { UserTypeProvider, UserTypeContext } from './context/UserTypeContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginForm from './pages/login/LoginForm';
import Register from './pages/login/Register';
import Details from './pages/login/Details';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import CartList from './pages/CartList';
import Profile from './ProfilePage/Profile';
import About from './pages/static pages/About';
import Contact from './pages/static pages/Contact';
import Privacy from './pages/static pages/Privacy';
import Terms from './pages/static pages/Terms';
import ProductPage from './pages/ProductPage';
import CookiesPolicy from './pages/static pages/CookiesPolicy';
import Returns from './pages/static pages/Returns and refunds policy';
import Disclaimer from './pages/static pages/Disclaimer';
import FAQ from './pages/static pages/FAQ';
import NotFound from './components/NotFound';
import Popup from './pages/Popup';
import UserTypePopup from './components/UserTypePopup';
import Checkout from './pages/Checkout'; // Corrected import
import OrderSuccess from './pages/OrderSuccess';
import { OrderProvider } from './context/OrderContext';

function App() {
  useScrollToTop();
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff4747] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Application...</p>
        </div>
      </div>
    );
  }

  const storedType = localStorage.getItem('userType');
  let initialRedirect = '/';

  if (isAuthenticated) {
    initialRedirect = '/home';
  } else {
    initialRedirect = '/home';
  }

  // Remove the Bootstrapper component since we're handling popup in UserTypeContext
  // const Bootstrapper = () => {
  //   const { openUserTypePopup } = useContext(UserTypeContext);
  //   useEffect(() => {
  //     const confirmed = localStorage.getItem('userTypeConfirmed') === 'true';
  //     if (isAuthenticated && !confirmed) {
  //       openUserTypePopup();
  //     }
  //   }, [isAuthenticated, openUserTypePopup]);
  //   return null;
  // };

  return (
    <UserTypeProvider>
      <CartProvider>
        <OrderProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Remove Bootstrapper component */}
            <UserTypePopup />
            <Routes>
              <Route path="/" element={<Navigate to={initialRedirect} replace />} />
              <Route path="/popup" element={<Popup />} />
              {/* Authentication routes */}
              <Route
                path="/register"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo={isAuthenticated ? '/home' : undefined}>
                    <Register />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo={isAuthenticated ? '/home' : undefined}>
                    <LoginForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo={isAuthenticated ? '/home' : undefined}>
                    <ForgotPassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo={isAuthenticated ? '/home' : undefined}>
                    <ResetPassword />
                  </ProtectedRoute>
                }
              />
              {/* Protected routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute requireAuth={true} redirectTo={!isAuthenticated ? '/register' : undefined}>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/details"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Details />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireAuth={true} redirectTo={!isAuthenticated ? '/register' : undefined}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute requireAuth={true} redirectTo={!isAuthenticated ? '/register' : undefined}>
                    <CartList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute requireAuth={true} redirectTo={!isAuthenticated ? '/login' : undefined}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success/:orderId"
                element={
                  <ProtectedRoute requireAuth={true} redirectTo={!isAuthenticated ? '/login' : undefined}>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              {/* Public routes */}
              <Route path="/products" element={<ProductPage />} />
              <Route path="/ProductDetails/:id" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/CookiesPolicy" element={<CookiesPolicy />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              
              <Route path="/faq" element={<FAQ />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </OrderProvider>
      </CartProvider>
    </UserTypeProvider>
  );
}

export default App;