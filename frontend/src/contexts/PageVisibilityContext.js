import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PageVisibilityContext = createContext();

export const usePageVisibility = () => {
  const context = useContext(PageVisibilityContext);
  if (!context) {
    throw new Error('usePageVisibility must be used within a PageVisibilityProvider');
  }
  return context;
};

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PageVisibilityProvider = ({ children }) => {
  const [visibility, setVisibility] = useState({
    home: true,
    about: true,
    gallery: true,
    stories: true,
    blog: true,
    donate: true,
    contact: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const response = await axios.get(`${API}/pages/visibility`);
        setVisibility(response.data);
      } catch (error) {
        console.error('Error fetching page visibility:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisibility();
  }, []);

  const isPageVisible = (pageKey) => {
    return visibility[pageKey] !== false;
  };

  const refreshVisibility = async () => {
    try {
      const response = await axios.get(`${API}/pages/visibility`);
      setVisibility(response.data);
    } catch (error) {
      console.error('Error refreshing visibility:', error);
    }
  };

  return (
    <PageVisibilityContext.Provider value={{ visibility, isPageVisible, loading, refreshVisibility }}>
      {children}
    </PageVisibilityContext.Provider>
  );
};

export default PageVisibilityContext;
