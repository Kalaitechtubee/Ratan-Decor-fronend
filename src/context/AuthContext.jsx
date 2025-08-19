import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add token verification caching
  const [tokenVerified, setTokenVerified] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        if (userId && email) {
          const userData = { userId, email, username: username || email.split('@')[0] };
          setUser(userData);
          setIsAuthenticated(true);
        } else if (token && !tokenVerified) {
          // Only verify token if not already verified
          await API.verifyToken(token);
          setTokenVerified(true);
          const userData = { userId, email, username: username || email.split('@')[0] };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (userData, token) => {
    try {
      if (!userData || !userData.userId || !userData.email) {
        throw new Error('Invalid user data provided');
      }

      if (token) localStorage.setItem('token', token);
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('email', userData.email);
      localStorage.setItem('username', userData.username || userData.email.split('@')[0]);
      if (userData.userType) localStorage.setItem('userType', userData.userType.toLowerCase());

      setUser(userData);
      setIsAuthenticated(true); // Immediate state update
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
      clearAuthData();
    }
  };

  const updateUser = (updatedData) => {
    if (user) {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      if (updatedData.username) localStorage.setItem('username', updatedData.username);
      if (updatedData.email) localStorage.setItem('email', updatedData.email);
    }
  };

  const hasRole = (role) => user?.role === role;

  const isTokenExpired = async () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    // Use cached verification result if available
    if (tokenVerified) return false;
    
    try {
      await API.verifyToken(token);
      setTokenVerified(true);
      return false;
    } catch {
      return true;
    }
  };

  const refreshAuth = async () => {
    if (await isTokenExpired()) {
      logout();
      return false;
    }
    return true;
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    refreshAuth,
    clearAuthData,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const withAuth = (Component) => (props) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff4747] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Component {...props} />;
};