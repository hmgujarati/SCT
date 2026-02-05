import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePageVisibility } from '../contexts/PageVisibilityContext';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from './ui/button';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_81b02de3-3cd6-4707-8173-e23f16017522/artifacts/zjn72wsr_Shivdhara%20Charitable.png';

const Header = () => {
  const { language, toggleLanguage, ui } = useLanguage();
  const { user, logout } = useAuth();
  const { isPageVisible } = usePageVisibility();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allNavItems = [
    { path: '/', label: ui.home, pageKey: 'home' },
    { path: '/about', label: ui.about, pageKey: 'about' },
    { path: '/gallery', label: ui.gallery, pageKey: 'gallery' },
    { path: '/stories', label: ui.stories, pageKey: 'stories' },
    { path: '/blog', label: ui.blog, pageKey: 'blog' },
    { path: '/contact', label: ui.contact, pageKey: 'contact' },
  ];
  
  // Filter nav items based on visibility
  const navItems = allNavItems.filter(item => isPageVisible(item.pageKey));

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/en' || location.pathname === '/gu';
    return location.pathname.includes(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
            <img
              src={LOGO_URL}
              alt="Shivdhara Charitable"
              className="h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <h1 className={`text-lg font-bold leading-tight transition-colors duration-300 ${isScrolled ? 'text-[#8B1E1E]' : 'text-[#8B1E1E]'}`}>
                {language === 'en' ? 'Shivdhara' : 'શિવધારા'}
              </h1>
              <p className={`text-xs transition-colors duration-300 ${isScrolled ? 'text-[#6B7280]' : 'text-[#6B7280]'} ${language === 'gu' ? 'font-gujarati' : ''}`}>
                {language === 'en' ? 'Charitable Trust' : 'ચેરીટેબલ ટ્રસ્ટ'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                className={`relative font-medium text-sm transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-[#8B1E1E]'
                    : `${isScrolled ? 'text-[#1F2937]' : 'text-[#1F2937]'} hover:text-[#8B1E1E]`
                } ${language === 'gu' ? 'font-gujarati' : ''}`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#8B1E1E] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              data-testid="language-switcher"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isScrolled
                  ? 'bg-[#F7F1E6] text-[#8B1E1E] hover:bg-[#EFE5D5]'
                  : 'bg-white/90 text-[#8B1E1E] hover:bg-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'ગુજરાતી' : 'EN'}</span>
            </button>

            {/* Donate Button */}
            {isPageVisible('donate') && (
              <Link to="/donate" data-testid="header-donate-btn">
                <Button className="hidden sm:flex btn-gold text-sm px-6 py-2">
                  {ui.donate_now}
                </Button>
              </Link>
            )}

            {/* Admin Link */}
            {user && (
              <Link
                to="/admin"
                data-testid="admin-link"
                className={`hidden md:block text-sm font-medium ${isScrolled ? 'text-[#6B7280]' : 'text-[#6B7280]'} hover:text-[#8B1E1E] transition-colors`}
              >
                {ui.admin}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
              className="lg:hidden p-2 rounded-lg hover:bg-[#F7F1E6] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#8B1E1E]" />
              ) : (
                <Menu className="w-6 h-6 text-[#8B1E1E]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-stone-100 animate-slide-up">
            <nav className="container-custom py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.path.replace('/', '') || 'home'}`}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#F7F1E6] text-[#8B1E1E]'
                      : 'text-[#1F2937] hover:bg-[#F7F1E6]'
                  } ${language === 'gu' ? 'font-gujarati' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/donate"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="mobile-donate-btn"
                className="mt-2"
              >
                <Button className="w-full btn-gold py-3">
                  {ui.donate_now}
                </Button>
              </Link>
              {user && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid="mobile-admin-link"
                  className="px-4 py-3 rounded-lg font-medium text-[#6B7280] hover:bg-[#F7F1E6]"
                >
                  {ui.admin}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
