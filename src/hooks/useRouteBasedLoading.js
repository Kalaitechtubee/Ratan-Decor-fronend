import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useRouteBasedLoading = () => {
  const location = useLocation();
  const [loadedRoutes, setLoadedRoutes] = useState(new Set());

  const markRouteAsLoaded = (route) => {
    setLoadedRoutes(prev => new Set([...prev, route]));
  };

  const isRouteLoaded = (route) => {
    return loadedRoutes.has(route);
  };

  const shouldLoadData = (route) => {
    return location.pathname === route && !isRouteLoaded(route);
  };

  return {
    markRouteAsLoaded,
    isRouteLoaded,
    shouldLoadData,
    currentRoute: location.pathname
  };
};
