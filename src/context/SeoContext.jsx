// context/SeoContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Adjust the import path as needed

const SeoContext = createContext();

export function SeoProvider({ children }) {
  const [seoData, setSeoData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeoData() {
      try {
        const data = await api.getAllSeo();
        const seoMap = data.reduce((acc, item) => {
          acc[item.pageName] = item;
          return acc;
        }, {});
        setSeoData(seoMap);
      } catch (error) {
        console.error('Failed to fetch SEO data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeoData();
  }, []);

  return (
    <SeoContext.Provider value={{ seoData, loading }}>
      {children}
    </SeoContext.Provider>
  );
}

export const useSeo = () => useContext(SeoContext);