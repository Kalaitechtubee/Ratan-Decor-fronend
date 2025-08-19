import { useState, useCallback } from 'react';

export const useLazyLoad = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (loaded && data) return data; // Already loaded
    
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLoaded(true);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loaded, data, ...dependencies]);

  return {
    data,
    loading,
    error,
    loaded,
    load
  };
};
