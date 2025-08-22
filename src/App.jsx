import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from './context/AuthContext';
import useScrollToTop from './hooks/useScrollToTop';
import { UserTypeProvider } from './context/UserTypeContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SeoProvider, useSeo } from './context/SeoContext';
import { OrderProvider } from './context/OrderContext';

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
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

function AppContent() {
  useScrollToTop();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { seoData, loading: seoLoading } = useSeo();
  const location = useLocation();

  // Determine the current page name based on the route
  const getPageNameFromPath = (pathname) => {
    const pathMap = {
      '/home': 'home',
      '/products': 'products',
      '/ProductDetails/:id': 'productdetails',
      '/cart': 'cart',
      '/checkout': 'checkout',
      '/order-success/:orderId': 'order-success',
      '/about': 'about',
      '/contact': 'contact',
      '/privacy': 'privacy',
      '/terms': 'terms',
      '/CookiesPolicy': 'cookiespolicy',
      '/returns': 'returns',
      '/disclaimer': 'disclaimer',
      '/faq': 'faq',
      '/profile': 'profile',
      '/login': 'home', // Fallback for auth pages
      '/register': 'home',
      '/forgot-password': 'home',
      '/reset-password': 'home',
      '/details': 'home',
    };
    return pathMap[pathname] || 'home'; // Default to 'home' if not found
  };

  const pageName = getPageNameFromPath(location.pathname);
  const seo = seoData[pageName] || seoData['home'] || {
    title: 'Ratan Decor',
    description: 'Welcome to Ratan Decor, your one-stop shop for premium home decor.',
    keywords: 'home, decor, furniture',
  };

  if (authLoading || seoLoading) {
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

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
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
    </>
  );
}

function App() {
  return (
    <SeoProvider>
      <UserTypeProvider>
        <CartProvider>
          <OrderProvider>
            <AppContent />
          </OrderProvider>
        </CartProvider>
      </UserTypeProvider>
    </SeoProvider>
  );
}

export default App;