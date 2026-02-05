import React, { useEffect } from "react";
import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "sonner";

// Contexts
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PageVisibilityProvider, usePageVisibility } from "./contexts/PageVisibilityContext";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import StoriesPage from "./pages/StoriesPage";
import BlogPage from "./pages/BlogPage";
import DonatePage from "./pages/DonatePage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Layout wrapper for public pages
const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
};

// Seed data on first load
const useSeedData = () => {
  useEffect(() => {
    const seedData = async () => {
      try {
        await axios.post(`${API}/seed`);
        console.log('Initial data seeded');
      } catch (error) {
        // Already seeded or error - ignore
      }
    };
    seedData();
  }, []);
};

function AppRoutes() {
  useSeedData();
  
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/en" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/gu" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/en/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/gu/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path="/en/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path="/gu/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path="/stories" element={<PublicLayout><StoriesPage /></PublicLayout>} />
        <Route path="/en/stories" element={<PublicLayout><StoriesPage /></PublicLayout>} />
        <Route path="/gu/stories" element={<PublicLayout><StoriesPage /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/en/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/en/blog/:slug" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/gu/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/gu/blog/:slug" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/donate" element={<PublicLayout><DonatePage /></PublicLayout>} />
        <Route path="/en/donate" element={<PublicLayout><DonatePage /></PublicLayout>} />
        <Route path="/gu/donate" element={<PublicLayout><DonatePage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/en/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/gu/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <AppRoutes />
            <Toaster 
              position="top-right" 
              richColors 
              closeButton
              toastOptions={{
                style: {
                  fontFamily: 'Inter, sans-serif'
                }
              }}
            />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
