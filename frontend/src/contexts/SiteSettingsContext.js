import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Default values when settings not loaded
const DEFAULT_LOGO = 'https://customer-assets.emergentagent.com/job_81b02de3-3cd6-4707-8173-e23f16017522/artifacts/zjn72wsr_Shivdhara%20Charitable.png';
const DEFAULT_HERO = 'https://images.unsplash.com/photo-1659451336016-00d62d32f677?crop=entropy&cs=srgb&fm=jpg&q=85&w=800';
const DEFAULT_CTA = 'https://images.pexels.com/photos/7904406/pexels-photo-7904406.jpeg';
const DEFAULT_FAVICON = '/favicon.ico';

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get full URL for uploaded images
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Update favicon dynamically when settings change
  useEffect(() => {
    if (settings?.site_images?.favicon) {
      const faviconUrl = getImageUrl(settings.site_images.favicon);
      updateFavicon(faviconUrl);
    }
  }, [settings?.site_images?.favicon]);

  // Function to update favicon in document head
  const updateFavicon = (url) => {
    if (!url) return;
    
    // Update or create favicon link
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;

    // Also update apple-touch-icon if exists
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLink) {
      appleLink.href = url;
    }
  };

  // Get logo with fallback
  const getLogo = () => {
    const logo = settings?.site_images?.logo;
    return logo ? getImageUrl(logo) : DEFAULT_LOGO;
  };

  const getLogoDark = () => {
    const logo = settings?.site_images?.logo_dark || settings?.site_images?.logo;
    return logo ? getImageUrl(logo) : DEFAULT_LOGO;
  };

  // Get site images with fallbacks
  const getHeroImage = () => {
    const img = settings?.site_images?.hero_image;
    return img ? getImageUrl(img) : DEFAULT_HERO;
  };

  const getHeroImage2 = () => {
    const img = settings?.site_images?.hero_image_2;
    return img ? getImageUrl(img) : null;
  };

  const getAboutImage = () => {
    const img = settings?.site_images?.about_image;
    return img ? getImageUrl(img) : null;
  };

  const getCtaImage = () => {
    const img = settings?.site_images?.cta_image;
    return img ? getImageUrl(img) : DEFAULT_CTA;
  };

  const getDonateImage = () => {
    const img = settings?.site_images?.donate_image;
    return img ? getImageUrl(img) : null;
  };

  // Social links
  const getSocialLinks = () => {
    return settings?.social_links || {};
  };

  const hasSocialLink = (platform) => {
    return !!settings?.social_links?.[platform];
  };

  // Refresh settings (called after admin updates)
  const refreshSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  return (
    <SiteSettingsContext.Provider value={{
      settings,
      loading,
      getLogo,
      getLogoDark,
      getHeroImage,
      getHeroImage2,
      getAboutImage,
      getCtaImage,
      getDonateImage,
      getSocialLinks,
      hasSocialLink,
      getImageUrl,
      refreshSettings
    }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsContext;
