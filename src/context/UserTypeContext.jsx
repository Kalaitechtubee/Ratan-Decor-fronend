import { createContext, useState, useMemo, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const mapUserType = (userType) => {
  if (!userType) return 'Residential';
  const key = userType.toString().toLowerCase().replace(/\s+/g, ' ').trim();
  const typeMap = {
    residential: 'Residential',
    commercial: 'Commercial',
    'modular kitchen': 'Modular Kitchen',
    'modular-kitchen': 'Modular Kitchen',
    'modular+kitchen': 'Modular Kitchen',
    modular: 'Modular Kitchen',
    modularkitchen: 'Modular Kitchen',
    others: 'Others',
  };
  return typeMap[key] || 'Residential';
};

export const UserTypeContext = createContext({
  userType: 'Residential',
  updateUserType: () => {},
  getUserTypeDisplayName: () => 'Residential',
  isUserTypePopupOpen: false,
  openUserTypePopup: () => {},
  closeUserTypePopup: () => {},
  refreshTrigger: 0,
});

export const UserTypeProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [userType, setUserType] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userType');
      return mapUserType(stored) || 'Residential';
    }
    return 'Residential';
  });
  const [isUserTypePopupOpen, setIsUserTypePopupOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('userTypeConfirmed');
    }
    return true;
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserType = async (retries = 2) => {
    if (!isAuthenticated || !user?.userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.request('/userType/my-type', 'GET', null, { retry: retries });
      const fetchedType = response.userType;
      if (fetchedType) {
        const mappedType = mapUserType(fetchedType);
        setUserType(mappedType);
        localStorage.setItem('userType', mappedType);
        localStorage.setItem('userTypeConfirmed', 'true');
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to fetch user type:', err);
      const stored = localStorage.getItem('userType');
      if (stored) {
        setUserType(mapUserType(stored));
      } else if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
        await fetchUserType(retries - 1);
      } else {
        setError('Network error. Using default user type.');
        setUserType('Residential');
        localStorage.setItem('userType', 'Residential');
        localStorage.setItem('userTypeConfirmed', 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserType();
  }, [isAuthenticated, user]);

  const updateUserType = async (newUserType) => {
    const mappedType = mapUserType(newUserType);
    setUserType(mappedType);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', mappedType);
      localStorage.setItem('userTypeConfirmed', 'true');
    }
    if (isAuthenticated && user?.userId) {
      setLoading(true);
      try {
        await api.setUserType(user.userId, mappedType);
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        console.error('Failed to update user type on server:', err);
        setError('Failed to sync user type with server. Saved locally.');
        setRefreshTrigger((prev) => prev + 1); // Trigger refresh despite error
      } finally {
        setLoading(false);
      }
    }
  };

  const getUserTypeDisplayName = (type = userType) => {
    const displayNames = {
      Residential: 'Residential',
      Commercial: 'Commercial',
      'Modular Kitchen': 'Modular Kitchen',
      Others: 'Others',
    };
    return displayNames[type] || 'Residential';
  };

  const openUserTypePopup = () => setIsUserTypePopupOpen(true);
  const closeUserTypePopup = () => {
    setIsUserTypePopupOpen(false);
    localStorage.setItem('userTypeConfirmed', 'true');
  };

  const value = useMemo(() => ({
    userType,
    updateUserType,
    getUserTypeDisplayName,
    isUserTypePopupOpen,
    openUserTypePopup,
    closeUserTypePopup,
    refreshTrigger,
    loading,
    error,
  }), [userType, isUserTypePopupOpen, refreshTrigger, loading, error]);

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
};