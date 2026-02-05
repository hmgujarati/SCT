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
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";

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

// Protected page wrapper - redirects if page is disabled
const ProtectedPage = ({ pageKey, children }) => {
  const { isPageVisible, loading } = usePageVisibility();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F1E6]">
        <div className="w-12 h-12 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isPageVisible(pageKey)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
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
        <Route path="/" element={<ProtectedPage pageKey="home"><PublicLayout><HomePage /></PublicLayout></ProtectedPage>} />
        <Route path="/en" element={<ProtectedPage pageKey="home"><PublicLayout><HomePage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu" element={<ProtectedPage pageKey="home"><PublicLayout><HomePage /></PublicLayout></ProtectedPage>} />
        <Route path="/about" element={<ProtectedPage pageKey="about"><PublicLayout><AboutPage /></PublicLayout></ProtectedPage>} />
        <Route path="/en/about" element={<ProtectedPage pageKey="about"><PublicLayout><AboutPage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu/about" element={<ProtectedPage pageKey="about"><PublicLayout><AboutPage /></PublicLayout></ProtectedPage>} />
        <Route path="/gallery" element={<ProtectedPage pageKey="gallery"><PublicLayout><GalleryPage /></PublicLayout></ProtectedPage>} />
        <Route path="/en/gallery" element={<ProtectedPage pageKey="gallery"><PublicLayout><GalleryPage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu/gallery" element={<ProtectedPage pageKey="gallery"><PublicLayout><GalleryPage /></PublicLayout></ProtectedPage>} />
        <Route path="/stories" element={<ProtectedPage pageKey="stories"><PublicLayout><StoriesPage /></PublicLayout></ProtectedPage>} />
        <Route path="/en/stories" element={<ProtectedPage pageKey="stories"><PublicLayout><StoriesPage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu/stories" element={<ProtectedPage pageKey="stories"><PublicLayout><StoriesPage /></PublicLayout></ProtectedPage>} />
        <Route path="/blog" element={<ProtectedPage pageKey="blog"><PublicLayout><BlogPage /></PublicLayout></ProtectedPage>} />
        <Route path="/blog/:slug" element={<ProtectedPage pageKey="blog"><PublicLayout><BlogPage /></PublicLayout></ProtectedPage>} />
        <Route path="/en/blog" element={<ProtectedPage pageKey="blog"><PublicLayout><BlogPage /></PublicLayout></ProtectedPage>} />
        <Route path="/en/blog/:slug" element={<ProtectedPage pageKey="blog"><PublicLayout><BlogPage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu/blog" element={<ProtectedPage pageKey="blog"><PublicLayout><BlogPage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu/blog/:slug" element={<ProtectedPage pageKey="blog"><PublicLayout><BlogPage /></PublicLayout></ProtectedPage>} />
        <Route path="/donate" element={<ProtectedPage pageKey="donate"><PublicLayout><DonatePage /></PublicLayout></ProtectedPage>} />
        <Route path="/en/donate" element={<ProtectedPage pageKey="donate"><PublicLayout><DonatePage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu/donate" element={<ProtectedPage pageKey="donate"><PublicLayout><DonatePage /></PublicLayout></ProtectedPage>} />
        <Route path="/contact" element={<ProtectedPage pageKey="contact"><PublicLayout><ContactPage /></PublicLayout></ProtectedPage>} />
        <Route path="/en/contact" element={<ProtectedPage pageKey="contact"><PublicLayout><ContactPage /></PublicLayout></ProtectedPage>} />
        <Route path="/gu/contact" element={<ProtectedPage pageKey="contact"><PublicLayout><ContactPage /></PublicLayout></ProtectedPage>} />
        
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
            <SiteSettingsProvider>
              <PageVisibilityProvider>
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
              </PageVisibilityProvider>
            </SiteSettingsProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
