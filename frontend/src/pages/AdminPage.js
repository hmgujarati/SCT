import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  LayoutDashboard, Settings, Image, FileText, Heart, Users, Mail, BookOpen,
  LogOut, Menu, X, Save, Download, Upload, Lock, Eye, EyeOff, AlertTriangle
} from 'lucide-react';

// Import admin sections from separate files
import { ContentSection } from '../components/admin/ContentSection';
import GallerySection from '../components/admin/GallerySection';
import { StoriesSection } from '../components/admin/StoriesSection';
import { BlogSection } from '../components/admin/BlogSection';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_81b02de3-3cd6-4707-8173-e23f16017522/artifacts/zjn72wsr_Shivdhara%20Charitable.png';

const AdminPage = () => {
  const { language, ui } = useLanguage();
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'admin') {
      setActiveSection(path);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: language === 'en' ? 'Dashboard' : 'ડેશબોર્ડ' },
    { id: 'settings', icon: Settings, label: language === 'en' ? 'Site Settings' : 'સાઈટ સેટિંગ્સ' },
    { id: 'donations', icon: Heart, label: language === 'en' ? 'Donations' : 'દાન' },
    { id: 'gallery', icon: Image, label: language === 'en' ? 'Gallery' : 'ગેલેરી' },
    { id: 'stories', icon: Users, label: language === 'en' ? 'Success Stories' : 'સફળતાની વાર્તાઓ' },
    { id: 'blog', icon: BookOpen, label: language === 'en' ? 'Blog' : 'બ્લોગ' },
    { id: 'content', icon: FileText, label: language === 'en' ? 'Page Content' : 'પૃષ્ઠ સામગ્રી' },
    { id: 'contacts', icon: Mail, label: language === 'en' ? 'Contact Messages' : 'સંપર્ક સંદેશા' },
    { id: 'account', icon: Lock, label: language === 'en' ? 'Account Settings' : 'એકાઉન્ટ સેટિંગ્સ' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-[#F7F1E6] ${language === 'gu' ? 'font-gujarati' : ''}`}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1F2937] text-white p-4 z-40 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="mobile-menu-btn">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <img src={LOGO_URL} alt="Logo" className="h-10" />
        <button onClick={handleLogout} className="text-stone-300 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#1F2937] text-white z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img src={LOGO_URL} alt="Logo" className="h-12" />
            <span className="text-lg font-semibold">Shivdhara Charitable</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                data-testid={`nav-${item.id}`}
                className={`admin-nav-item w-full text-left ${activeSection === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-stone-300">{language === 'en' ? 'Logged in as' : 'લોગિન'}</p>
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-[#C9A24A]">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors" data-testid="logout-btn">
              <LogOut className="w-5 h-5" />
              {ui.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1F2937]">
              {navItems.find(n => n.id === activeSection)?.label}
            </h1>
          </div>

          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'settings' && <SettingsSection />}
          {activeSection === 'donations' && <DonationsSection />}
          {activeSection === 'gallery' && <GallerySection />}
          {activeSection === 'stories' && <StoriesSection />}
          {activeSection === 'blog' && <BlogSection />}
          {activeSection === 'content' && <ContentSection />}
          {activeSection === 'contacts' && <ContactsSection />}
          {activeSection === 'account' && <AccountSettingsSection />}
        </div>
      </main>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

// Account Settings Section - Change Admin Credentials
const AccountSettingsSection = () => {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
    newName: ''
  });

  useEffect(() => {
    // Get admin count
    const fetchAdminCount = async () => {
      try {
        const response = await axios.get(`${API}/auth/admin-count`);
        setAdminCount(response.data.count);
      } catch (error) {
        console.error('Error fetching admin count:', error);
      }
    };
    fetchAdminCount();
    
    // Pre-fill current email and name
    if (user) {
      setCredentials(prev => ({
        ...prev,
        newEmail: user.email || '',
        newName: user.name || ''
      }));
    }
  }, [user]);

  const handleUpdateCredentials = async () => {
    if (!credentials.currentPassword) {
      toast.error(language === 'en' ? 'Please enter your current password' : 'કૃપા કરીને વર્તમાન પાસવર્ડ દાખલ કરો');
      return;
    }

    if (credentials.newPassword && credentials.newPassword !== credentials.confirmPassword) {
      toast.error(language === 'en' ? 'New passwords do not match' : 'નવા પાસવર્ડ મેળ ખાતા નથી');
      return;
    }

    if (credentials.newPassword && credentials.newPassword.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો હોવો જોઈએ');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API}/auth/update-credentials`, {
        current_password: credentials.currentPassword,
        new_email: credentials.newEmail !== user?.email ? credentials.newEmail : null,
        new_password: credentials.newPassword || null,
        new_name: credentials.newName !== user?.name ? credentials.newName : null
      });

      // Update token in localStorage
      localStorage.setItem('shivdhara_token', response.data.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

      toast.success(language === 'en' ? 'Credentials updated successfully!' : 'ક્રેડેન્શિયલ્સ સફળતાપૂર્વક અપડેટ થયા!');
      
      // Clear password fields
      setCredentials(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // If email changed, user needs to re-login
      if (credentials.newEmail !== user?.email) {
        toast.info(language === 'en' ? 'Please login with your new email' : 'કૃપા કરીને નવા ઈમેઈલ સાથે લોગિન કરો');
        logout();
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || (language === 'en' ? 'Update failed' : 'અપડેટ નિષ્ફળ'));
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupAdmins = async () => {
    if (!window.confirm(language === 'en' 
      ? 'This will remove all other admin accounts. Only your account will remain. Continue?' 
      : 'આ અન્ય તમામ એડમિન એકાઉન્ટ્સ દૂર કરશે. માત્ર તમારું એકાઉન્ટ રહેશે. ચાલુ રાખો?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`${API}/auth/cleanup-admins`);
      toast.success(response.data.message);
      setAdminCount(1);
    } catch (error) {
      toast.error(error.response?.data?.detail || (language === 'en' ? 'Cleanup failed' : 'ક્લીનઅપ નિષ્ફળ'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="account-settings-section">
      {/* Current Admin Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
          {language === 'en' ? 'Current Admin Account' : 'વર્તમાન એડમિન એકાઉન્ટ'}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#6B7280]">{language === 'en' ? 'Email' : 'ઈમેઈલ'}</p>
            <p className="font-medium text-[#1F2937]">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{language === 'en' ? 'Name' : 'નામ'}</p>
            <p className="font-medium text-[#1F2937]">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Update Credentials Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-4">
          {language === 'en' ? 'Update Credentials' : 'ક્રેડેન્શિયલ્સ અપડેટ કરો'}
        </h3>
        
        <div className="space-y-4">
          {/* Current Password - Required */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
              {language === 'en' ? 'Current Password *' : 'વર્તમાન પાસવર્ડ *'}
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={credentials.currentPassword}
                onChange={(e) => setCredentials({ ...credentials, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="pr-10 input-field"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              {language === 'en' ? 'Required to make any changes' : 'કોઈપણ ફેરફાર માટે જરૂરી'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* New Name */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {language === 'en' ? 'Name' : 'નામ'}
              </label>
              <Input
                type="text"
                value={credentials.newName}
                onChange={(e) => setCredentials({ ...credentials, newName: e.target.value })}
                placeholder="Admin Name"
                className="input-field"
              />
            </div>

            {/* New Email */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {language === 'en' ? 'Email' : 'ઈમેઈલ'}
              </label>
              <Input
                type="email"
                value={credentials.newEmail}
                onChange={(e) => setCredentials({ ...credentials, newEmail: e.target.value })}
                placeholder="admin@example.com"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {language === 'en' ? 'New Password' : 'નવો પાસવર્ડ'}
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={credentials.newPassword}
                  onChange={(e) => setCredentials({ ...credentials, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10 input-field"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">
                {language === 'en' ? 'Leave blank to keep current password' : 'વર્તમાન પાસવર્ડ રાખવા માટે ખાલી છોડો'}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {language === 'en' ? 'Confirm New Password' : 'નવો પાસવર્ડ કન્ફર્મ કરો'}
              </label>
              <Input
                type="password"
                value={credentials.confirmPassword}
                onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="input-field"
              />
            </div>
          </div>

          <Button
            onClick={handleUpdateCredentials}
            disabled={loading || !credentials.currentPassword}
            className="w-full md:w-auto bg-[#8B1E1E] hover:bg-[#701616] text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {language === 'en' ? 'Updating...' : 'અપડેટ થઈ રહ્યું છે...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {language === 'en' ? 'Update Credentials' : 'ક્રેડેન્શિયલ્સ અપડેટ કરો'}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Cleanup Other Admins */}
      {adminCount > 1 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {language === 'en' ? 'Multiple Admin Accounts Detected' : 'બહુવિધ એડમિન એકાઉન્ટ્સ મળ્યા'}
              </h3>
              <p className="text-sm text-red-700 mb-4">
                {language === 'en' 
                  ? `There are ${adminCount} admin accounts. Click below to remove all other accounts and keep only yours.`
                  : `${adminCount} એડમિન એકાઉન્ટ્સ છે. અન્ય તમામ એકાઉન્ટ્સ દૂર કરવા અને માત્ર તમારું રાખવા માટે નીચે ક્લિક કરો.`}
              </p>
              <Button
                onClick={handleCleanupAdmins}
                disabled={loading}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                {language === 'en' ? 'Remove Other Admin Accounts' : 'અન્ય એડમિન એકાઉન્ટ્સ દૂર કરો'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {adminCount === 1 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {language === 'en' ? 'You are the only admin. No other accounts exist.' : 'તમે એકમાત્ર એડમિન છો. અન્ય કોઈ એકાઉન્ટ અસ્તિત્વમાં નથી.'}
          </p>
        </div>
      )}
    </div>
  );
};

// Dashboard Section
const DashboardSection = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState({ totalDonations: 0, totalAmount: 0, totalContacts: 0, totalStories: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [donations, contacts, stories] = await Promise.all([
          axios.get(`${API}/donations`).catch(() => ({ data: [] })),
          axios.get(`${API}/contact`).catch(() => ({ data: [] })),
          axios.get(`${API}/stories`).catch(() => ({ data: [] }))
        ]);
        const paidDonations = donations.data.filter(d => d.status === 'paid');
        setStats({
          totalDonations: paidDonations.length,
          totalAmount: paidDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
          totalContacts: contacts.data.filter(c => !c.is_read).length,
          totalStories: stories.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="dashboard-section">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{language === 'en' ? 'Total Donations' : 'કુલ દાન'}</p>
            <p className="text-2xl font-bold text-[#1F2937]">{stats.totalDonations}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#8B1E1E]/10 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-[#8B1E1E]">₹</span>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{language === 'en' ? 'Amount Raised' : 'એકત્રિત રકમ'}</p>
            <p className="text-2xl font-bold text-[#1F2937]">₹{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{language === 'en' ? 'Unread Messages' : 'ન વાંચેલા સંદેશા'}</p>
            <p className="text-2xl font-bold text-[#1F2937]">{stats.totalContacts}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{language === 'en' ? 'Success Stories' : 'સફળતાની વાર્તાઓ'}</p>
            <p className="text-2xl font-bold text-[#1F2937]">{stats.totalStories}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Branding Section Component - For Logo and Site Images
const BrandingSection = ({ settings, setSettings, language }) => {
  const [uploading, setUploading] = useState({});
  const fileInputRefs = {
    logo: React.useRef(null),
    logo_dark: React.useRef(null),
    favicon: React.useRef(null),
    hero_image: React.useRef(null),
    hero_image_2: React.useRef(null),
    about_image: React.useRef(null),
    cta_image: React.useRef(null),
    donate_image: React.useRef(null)
  };

  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const handleUpload = async (field, file) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Get token from localStorage for upload requests
      const token = localStorage.getItem('shivdhara_token');
      
      const response = await axios.post(`${API}/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const imageUrl = response.data.url;
      setSettings(prev => ({
        ...prev,
        site_images: {
          ...prev.site_images,
          [field]: imageUrl
        }
      }));
      toast.success(language === 'en' ? 'Image uploaded!' : 'ફોટો અપલોડ થયો!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'en' ? 'Upload failed' : 'અપલોડ નિષ્ફળ');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const clearImage = (field) => {
    setSettings(prev => ({
      ...prev,
      site_images: {
        ...prev.site_images,
        [field]: ''
      }
    }));
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const ImageUploadCard = ({ field, label, description, aspectRatio = 'aspect-video' }) => {
    const currentImage = settings.site_images?.[field];
    return (
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-[#1F2937]">{label}</h4>
            <p className="text-xs text-[#6B7280]">{description}</p>
          </div>
          {currentImage && (
            <button onClick={() => clearImage(field)} className="text-red-500 hover:text-red-700 text-xs">
              {language === 'en' ? 'Remove' : 'દૂર કરો'}
            </button>
          )}
        </div>
        
        <div className={`${aspectRatio} bg-stone-100 rounded-lg overflow-hidden mb-3 relative`}>
          {currentImage ? (
            <img src={getImageUrl(currentImage)} alt={label} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <Image className="w-8 h-8" />
            </div>
          )}
          {uploading[field] && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#8B1E1E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRefs[field]}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(field, e.target.files[0])}
        />
        <Button
          onClick={() => fileInputRefs[field].current?.click()}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={uploading[field]}
        >
          <Upload className="w-4 h-4 mr-2" />
          {currentImage ? (language === 'en' ? 'Change' : 'બદલો') : (language === 'en' ? 'Upload' : 'અપલોડ')}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">{language === 'en' ? 'Logo & Favicon' : 'લોગો અને ફેવીકોન'}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <ImageUploadCard 
            field="logo" 
            label={language === 'en' ? 'Main Logo' : 'મુખ્ય લોગો'} 
            description={language === 'en' ? 'Used in header and footer' : 'હેડર અને ફૂટરમાં વપરાય છે'}
            aspectRatio="aspect-[3/1]"
          />
          <ImageUploadCard 
            field="logo_dark" 
            label={language === 'en' ? 'Logo (Dark Background)' : 'લોગો (ડાર્ક બેકગ્રાઉન્ડ)'} 
            description={language === 'en' ? 'Optional - for dark sections' : 'વૈકલ્પિક - ડાર્ક વિભાગો માટે'}
            aspectRatio="aspect-[3/1]"
          />
          <ImageUploadCard 
            field="favicon" 
            label={language === 'en' ? 'Favicon' : 'ફેવીકોન'} 
            description={language === 'en' ? 'Browser tab icon (square image recommended)' : 'બ્રાઉઝર ટેબ આઇકોન (ચોરસ ઈમેજ ભલામણ)'}
            aspectRatio="aspect-square"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-lg mb-4">{language === 'en' ? 'Page Images' : 'પેજ ફોટા'}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ImageUploadCard 
            field="hero_image" 
            label={language === 'en' ? 'Hero Image 1' : 'હીરો ઈમેજ 1'} 
            description={language === 'en' ? 'Main homepage banner' : 'મુખ્ય હોમપેજ બેનર'}
          />
          <ImageUploadCard 
            field="hero_image_2" 
            label={language === 'en' ? 'Hero Image 2' : 'હીરો ઈમેજ 2'} 
            description={language === 'en' ? 'Secondary banner image' : 'ગૌણ બેનર ઈમેજ'}
          />
          <ImageUploadCard 
            field="about_image" 
            label={language === 'en' ? 'About Page Image' : 'અમારા વિશે પેજ ઈમેજ'} 
            description={language === 'en' ? 'Featured on about page' : 'અમારા વિશે પેજ પર'}
          />
          <ImageUploadCard 
            field="cta_image" 
            label={language === 'en' ? 'CTA Section Image' : 'CTA વિભાગ ઈમેજ'} 
            description={language === 'en' ? 'Call to action background' : 'કોલ ટુ એક્શન બેકગ્રાઉન્ડ'}
          />
          <ImageUploadCard 
            field="donate_image" 
            label={language === 'en' ? 'Donate Page Image' : 'દાન પેજ ઈમેજ'} 
            description={language === 'en' ? 'Featured on donate page' : 'દાન પેજ પર'}
          />
        </div>
      </div>
    </div>
  );
};

// UPI Settings Section Component - For UPI ID and QR Code upload
const UPISettingsSection = ({ settings, setSettings, language }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const handleUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Get token from localStorage for upload requests
      const token = localStorage.getItem('shivdhara_token');
      
      const response = await axios.post(`${API}/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const imageUrl = response.data.url;
      setSettings(prev => ({
        ...prev,
        upi_details: {
          ...prev.upi_details,
          qr_code_url: imageUrl
        }
      }));
      toast.success(language === 'en' ? 'QR Code uploaded!' : 'QR કોડ અપલોડ થયો!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'en' ? 'Upload failed' : 'અપલોડ નિષ્ફળ');
    } finally {
      setUploading(false);
    }
  };

  const clearQRCode = () => {
    setSettings(prev => ({
      ...prev,
      upi_details: {
        ...prev.upi_details,
        qr_code_url: ''
      }
    }));
  };

  const updateUPIField = (field, value) => {
    setSettings(prev => ({
      ...prev,
      upi_details: {
        ...prev.upi_details,
        [field]: value
      }
    }));
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const currentQR = settings.upi_details?.qr_code_url;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* UPI ID Input */}
        <div>
          <label className="block text-sm font-medium mb-2">UPI ID</label>
          <Input 
            value={settings.upi_details?.upi_id || ''} 
            onChange={(e) => updateUPIField('upi_id', e.target.value)} 
            placeholder="yourname@upi" 
            className="input-field" 
          />
          <p className="text-xs text-[#6B7280] mt-1">
            {language === 'en' ? 'e.g., yourname@okicici, yourname@paytm' : 'દા.ત., yourname@okicici, yourname@paytm'}
          </p>
        </div>

        {/* QR Code Upload */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">{language === 'en' ? 'UPI QR Code' : 'UPI QR કોડ'}</label>
            {currentQR && (
              <button onClick={clearQRCode} className="text-red-500 hover:text-red-700 text-xs">
                {language === 'en' ? 'Remove' : 'દૂર કરો'}
              </button>
            )}
          </div>
          
          <div className="border-2 border-dashed border-stone-200 rounded-lg p-4 text-center relative">
            {currentQR ? (
              <div className="flex flex-col items-center">
                <img 
                  src={getImageUrl(currentQR)} 
                  alt="UPI QR Code" 
                  className="w-32 h-32 object-contain rounded-lg border"
                />
                <p className="text-xs text-[#6B7280] mt-2">{language === 'en' ? 'QR Code uploaded' : 'QR કોડ અપલોડ થયો'}</p>
              </div>
            ) : (
              <div className="py-4">
                <Image className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="text-sm text-stone-500">{language === 'en' ? 'No QR code uploaded' : 'કોઈ QR કોડ અપલોડ થયો નથી'}</p>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="w-6 h-6 border-2 border-[#8B1E1E] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="w-full mt-3"
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {currentQR ? (language === 'en' ? 'Change QR Code' : 'QR કોડ બદલો') : (language === 'en' ? 'Upload QR Code' : 'QR કોડ અપલોડ કરો')}
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      {(settings.upi_details?.upi_id || currentQR) && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-sm mb-3">{language === 'en' ? 'Preview (as shown in footer)' : 'પૂર્વાવલોકન (ફૂટરમાં બતાવ્યા મુજબ)'}</h4>
          <div className="bg-[#1F2937] rounded-lg p-4 inline-block">
            {currentQR && (
              <div className="bg-white rounded-lg p-2 mb-2">
                <img src={getImageUrl(currentQR)} alt="UPI QR" className="w-24 h-24 object-contain" />
              </div>
            )}
            {settings.upi_details?.upi_id && (
              <div className="text-center">
                <p className="text-xs text-stone-400 mb-1">UPI ID:</p>
                <p className="text-sm text-stone-200 font-mono bg-white/10 px-3 py-1 rounded">{settings.upi_details.upi_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Section
const SettingsSection = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState({
    bank_details: {}, trust_details: {}, contact_info: {}, upi_details: {},
    smtp_config: {}, razorpay_config: {}, impact_stats: {}, social_links: {}, site_images: {}, footer_text: {}
  });
  const [pageVisibility, setPageVisibility] = useState({
    home: true, about: true, gallery: true, stories: true, blog: true, donate: true, contact: true
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, visibilityRes] = await Promise.all([
          axios.get(`${API}/settings/admin`),
          axios.get(`${API}/pages/visibility`)
        ]);
        setSettings(settingsRes.data);
        setPageVisibility(visibilityRes.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success(language === 'en' ? 'Settings saved!' : 'સેટિંગ્સ સાચવ્યા!');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save settings' : 'સેટિંગ્સ સાચવવામાં નિષ્ફળ');
    } finally {
      setLoading(false);
    }
  };

  const togglePageVisibility = async (pageKey) => {
    const newValue = !pageVisibility[pageKey];
    try {
      await axios.put(`${API}/pages/visibility`, { page_key: pageKey, is_visible: newValue });
      setPageVisibility({ ...pageVisibility, [pageKey]: newValue });
      toast.success(language === 'en' ? `${pageKey} page ${newValue ? 'enabled' : 'disabled'}` : `${pageKey} પેજ ${newValue ? 'સક્ષમ' : 'અક્ષમ'}`);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to update' : 'અપડેટ નિષ્ફળ');
    }
  };

  const updateNestedField = (section, field, value) => {
    setSettings({ ...settings, [section]: { ...settings[section], [field]: value }});
  };

  const tabs = [
    { id: 'pages', label: language === 'en' ? 'Page Visibility' : 'પેજ દૃશ્યતા' },
    { id: 'footer', label: language === 'en' ? 'Footer Text' : 'ફૂટર ટેક્સ્ટ' },
    { id: 'contact', label: language === 'en' ? 'Contact Info' : 'સંપર્ક માહિતી' },
    { id: 'bank', label: language === 'en' ? 'Bank Details' : 'બેંક વિગતો' },
    { id: 'trust', label: language === 'en' ? 'Trust Details' : 'ટ્રસ્ટ વિગતો' },
    { id: 'upi', label: 'UPI' },
    { id: 'branding', label: language === 'en' ? 'Logo & Images' : 'લોગો અને ફોટા' },
    { id: 'social', label: language === 'en' ? 'Social Links' : 'સોશિયલ લિંક્સ' },
    { id: 'smtp', label: language === 'en' ? 'Email (SMTP)' : 'ઈમેઈલ (SMTP)' },
    { id: 'razorpay', label: 'Razorpay' },
    { id: 'impact', label: language === 'en' ? 'Impact Stats' : 'પ્રભાવ આંકડા' }
  ];

  return (
    <div data-testid="settings-section">
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[#8B1E1E] text-white' : 'bg-white text-[#6B7280] hover:bg-stone-100'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        {activeTab === 'pages' && (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280] mb-4">
              {language === 'en' ? 'Enable or disable pages on your website. Disabled pages will not be accessible to visitors.' : 'તમારી વેબસાઇટ પરના પૃષ્ઠો સક્ષમ અથવા અક્ષમ કરો. અક્ષમ પૃષ્ઠો મુલાકાતીઓ માટે ઉપલબ્ધ રહેશે નહીં.'}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'home', label: { en: 'Home Page', gu: 'હોમ પેજ' }, desc: { en: 'Main landing page', gu: 'મુખ્ય લેન્ડિંગ પેજ' } },
                { key: 'about', label: { en: 'About Us', gu: 'અમારા વિશે' }, desc: { en: 'Organization info', gu: 'સંસ્થાની માહિતી' } },
                { key: 'gallery', label: { en: 'Gallery', gu: 'ગેલેરી' }, desc: { en: 'Photo albums', gu: 'ફોટો આલ્બમ' } },
                { key: 'stories', label: { en: 'Success Stories', gu: 'સફળતાની વાર્તાઓ' }, desc: { en: 'Beneficiary stories', gu: 'લાભાર્થી વાર્તાઓ' } },
                { key: 'blog', label: { en: 'Blog', gu: 'બ્લોગ' }, desc: { en: 'News & updates', gu: 'સમાચાર અને અપડેટ્સ' } },
                { key: 'donate', label: { en: 'Donate', gu: 'દાન' }, desc: { en: 'Donation page', gu: 'દાન પેજ' } },
                { key: 'contact', label: { en: 'Contact Us', gu: 'સંપર્ક કરો' }, desc: { en: 'Contact form', gu: 'સંપર્ક ફોર્મ' } }
              ].map((page) => (
                <div key={page.key} className={`p-4 rounded-lg border-2 transition-colors ${pageVisibility[page.key] ? 'border-green-200 bg-green-50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1F2937]">{page.label[language]}</span>
                    <button
                      onClick={() => togglePageVisibility(page.key)}
                      data-testid={`toggle-${page.key}`}
                      className={`relative w-12 h-6 rounded-full transition-colors ${pageVisibility[page.key] ? 'bg-green-500' : 'bg-stone-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${pageVisibility[page.key] ? 'left-7' : 'left-1'}`}></span>
                    </button>
                  </div>
                  <p className="text-xs text-[#6B7280]">{page.desc[language]}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${pageVisibility[page.key] ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'}`}>
                    {pageVisibility[page.key] ? (language === 'en' ? 'Visible' : 'દૃશ્યમાન') : (language === 'en' ? 'Hidden' : 'છુપાયેલ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280] mb-4">
              {language === 'en' ? 'Edit the description text shown in the footer section of the website.' : 'વેબસાઇટના ફૂટર વિભાગમાં દર્શાવેલ વર્ણન ટેક્સ્ટ સંપાદિત કરો.'}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Footer Text (English)' : 'ફૂટર ટેક્સ્ટ (English)'}</label>
                <Textarea 
                  value={settings.footer_text?.en || ''} 
                  onChange={(e) => updateNestedField('footer_text', 'en', e.target.value)} 
                  placeholder="Serving humanity with compassion..."
                  rows={4}
                  className="input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Footer Text (Gujarati)' : 'ફૂટર ટેક્સ્ટ (ગુજરાતી)'}</label>
                <Textarea 
                  value={settings.footer_text?.gu || ''} 
                  onChange={(e) => updateNestedField('footer_text', 'gu', e.target.value)} 
                  placeholder="કરુણા સાથે માનવતાની સેવા..."
                  rows={4}
                  className="input-field font-gujarati" 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Address (English)' : 'સરનામું (English)'}</label>
                <Textarea value={settings.contact_info?.address_en || ''} onChange={(e) => updateNestedField('contact_info', 'address_en', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Address (Gujarati)' : 'સરનામું (ગુજરાતી)'}</label>
                <Textarea value={settings.contact_info?.address_gu || ''} onChange={(e) => updateNestedField('contact_info', 'address_gu', e.target.value)} className="input-field font-gujarati" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Phone' : 'ફોન'}</label>
                <Input value={settings.contact_info?.phone || ''} onChange={(e) => updateNestedField('contact_info', 'phone', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Email' : 'ઈમેઈલ'}</label>
                <Input value={settings.contact_info?.email || ''} onChange={(e) => updateNestedField('contact_info', 'email', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp</label>
                <Input value={settings.contact_info?.whatsapp || ''} onChange={(e) => updateNestedField('contact_info', 'whatsapp', e.target.value)} placeholder="+91..." className="input-field" />
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Google Maps Embed URL' : 'Google Maps એમ્બેડ URL'}</label>
              <Input 
                value={settings.contact_info?.maps_embed || ''} 
                onChange={(e) => updateNestedField('contact_info', 'maps_embed', e.target.value)} 
                placeholder="https://www.google.com/maps/embed?pb=..." 
                className="input-field" 
              />
              <p className="text-xs text-[#6B7280] mt-1">
                {language === 'en' 
                  ? 'Paste the embed URL from Google Maps. Leave empty to hide the map section on contact page.' 
                  : 'Google Maps માંથી embed URL પેસ્ટ કરો. સંપર્ક પેજ પર map સેક્શન છુપાવવા માટે ખાલી છોડો.'}
              </p>
              {settings.contact_info?.maps_embed && (
                <div className="mt-3 rounded-lg overflow-hidden border">
                  <iframe
                    src={settings.contact_info.maps_embed}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map Preview"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'account_holder_name', label: language === 'en' ? 'Account Holder Name' : 'ખાતાધારકનું નામ' },
              { key: 'account_number', label: language === 'en' ? 'Account Number' : 'ખાતા નંબર' },
              { key: 'bank_name', label: language === 'en' ? 'Bank Name' : 'બેંકનું નામ' },
              { key: 'branch_name', label: language === 'en' ? 'Branch Name' : 'શાખાનું નામ' },
              { key: 'ifsc_code', label: 'IFSC Code' },
              { key: 'micr_code', label: 'MICR Code' }
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                <Input value={settings.bank_details?.[field.key] || ''} onChange={(e) => updateNestedField('bank_details', field.key, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trust' && (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'registration_no', label: language === 'en' ? 'Registration No' : 'નોંધણી નંબર' },
              { key: 'pan', label: 'PAN' },
              { key: 'reg_80g', label: '80G Registration' },
              { key: 'reg_12a', label: '12A Registration' },
              { key: 'csr_no', label: 'CSR Number' },
              { key: 'darpan_id', label: 'Darpan ID' }
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                <Input value={settings.trust_details?.[field.key] || ''} onChange={(e) => updateNestedField('trust_details', field.key, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'upi' && (
          <UPISettingsSection settings={settings} setSettings={setSettings} language={language} />
        )}

        {activeTab === 'branding' && (
          <BrandingSection settings={settings} setSettings={setSettings} language={language} />
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280] mb-4">
              {language === 'en' ? 'Add your social media links. Leave empty to hide the icon.' : 'તમારી સોશિયલ મીડિયા લિંક્સ ઉમેરો. આઇકન છુપાવવા માટે ખાલી છોડો.'}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <Input value={settings.social_links?.facebook || ''} onChange={(e) => updateNestedField('social_links', 'facebook', e.target.value)} placeholder="https://facebook.com/yourpage" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <Input value={settings.social_links?.instagram || ''} onChange={(e) => updateNestedField('social_links', 'instagram', e.target.value)} placeholder="https://instagram.com/yourpage" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter / X</label>
                <Input value={settings.social_links?.twitter || ''} onChange={(e) => updateNestedField('social_links', 'twitter', e.target.value)} placeholder="https://twitter.com/yourpage" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">YouTube</label>
                <Input value={settings.social_links?.youtube || ''} onChange={(e) => updateNestedField('social_links', 'youtube', e.target.value)} placeholder="https://youtube.com/yourchannel" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <Input value={settings.social_links?.linkedin || ''} onChange={(e) => updateNestedField('social_links', 'linkedin', e.target.value)} placeholder="https://linkedin.com/company/yourcompany" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp ({language === 'en' ? 'with country code' : 'દેશ કોડ સાથે'})</label>
                <Input value={settings.social_links?.whatsapp || ''} onChange={(e) => updateNestedField('social_links', 'whatsapp', e.target.value)} placeholder="+919876543210" className="input-field" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'smtp' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Host</label>
              <Input value={settings.smtp_config?.host || ''} onChange={(e) => updateNestedField('smtp_config', 'host', e.target.value)} placeholder="smtp.hostinger.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Port</label>
              <Input type="number" value={settings.smtp_config?.port || 587} onChange={(e) => updateNestedField('smtp_config', 'port', parseInt(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Username' : 'યુઝરનેમ'}</label>
              <Input value={settings.smtp_config?.username || ''} onChange={(e) => updateNestedField('smtp_config', 'username', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Password' : 'પાસવર્ડ'}</label>
              <Input type="password" value={settings.smtp_config?.password || ''} onChange={(e) => updateNestedField('smtp_config', 'password', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'From Email' : 'ફ્રોમ ઈમેઈલ'}</label>
              <Input value={settings.smtp_config?.from_email || ''} onChange={(e) => updateNestedField('smtp_config', 'from_email', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'From Name' : 'ફ્રોમ નામ'}</label>
              <Input value={settings.smtp_config?.from_name || ''} onChange={(e) => updateNestedField('smtp_config', 'from_name', e.target.value)} placeholder="Shivdhara Charitable" className="input-field" />
            </div>
          </div>
        )}

        {activeTab === 'razorpay' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {language === 'en' ? '⚠️ Currently using test mode. Add live keys to accept real payments.' : '⚠️ હાલમાં ટેસ્ટ મોડ વાપરી રહ્યા છીએ. વાસ્તવિક ચુકવણી સ્વીકારવા માટે live keys ઉમેરો.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key ID</label>
                <Input value={settings.razorpay_config?.key_id || ''} onChange={(e) => updateNestedField('razorpay_config', 'key_id', e.target.value)} placeholder="rzp_live_..." className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Key Secret</label>
                <Input type="password" value={settings.razorpay_config?.key_secret || ''} onChange={(e) => updateNestedField('razorpay_config', 'key_secret', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Webhook Secret</label>
                <Input type="password" value={settings.razorpay_config?.webhook_secret || ''} onChange={(e) => updateNestedField('razorpay_config', 'webhook_secret', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'families_helped', label: language === 'en' ? 'Families Helped' : 'મદદ પામેલ પરિવારો' },
              { key: 'education_drives', label: language === 'en' ? 'Education Drives' : 'શિક્ષણ અભિયાનો' },
              { key: 'medical_camps', label: language === 'en' ? 'Medical Camps' : 'મેડિકલ કેમ્પ' },
              { key: 'years_of_service', label: language === 'en' ? 'Years of Service' : 'સેવાના વર્ષો' }
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                <Input type="number" value={settings.impact_stats?.[field.key] || 0} onChange={(e) => updateNestedField('impact_stats', field.key, parseInt(e.target.value) || 0)} className="input-field" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <Button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}
              </span>
            ) : (
              <><Save className="w-4 h-4 mr-2" />{language === 'en' ? 'Save Settings' : 'સેટિંગ્સ સાચવો'}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Donations Section
const DonationsSection = () => {
  const { language } = useLanguage();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get(`${API}/donations`);
        setDonations(response.data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const export80G = async () => {
    try {
      const token = localStorage.getItem('shivdhara_token');
      const response = await axios.get(`${API}/donations/export-80g`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '80g_requests.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(language === 'en' ? '80G data exported!' : '80G ડેટા નિકાસ થયો!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(language === 'en' ? 'Export failed' : 'નિકાસ નિષ્ફળ');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN');
  };

  return (
    <div data-testid="donations-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">{donations.filter(d => d.status === 'paid').length} {language === 'en' ? 'successful donations' : 'સફળ દાન'}</p>
        <Button onClick={export80G} className="btn-secondary">
          <Download className="w-4 h-4 mr-2" />{language === 'en' ? 'Export 80G Data' : '80G ડેટા નિકાસ કરો'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Date' : 'તારીખ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Donor' : 'દાતા'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Phone' : 'ફોન'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Amount' : 'રકમ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Status' : 'સ્થિતિ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">80G</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-[#6B7280]">{language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}</td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-[#6B7280]">{language === 'en' ? 'No donations yet' : 'હજી સુધી કોઈ દાન નથી'}</td></tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm">{formatDate(donation.paid_at || donation.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2937]">{donation.donor_info?.name || '-'}</p>
                      <p className="text-xs text-[#6B7280]">{donation.donor_info?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1F2937]">{donation.donor_info?.phone || '-'}</td>
                    <td className="px-4 py-3 font-medium text-[#8B1E1E]">₹{donation.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${donation.status === 'paid' ? 'bg-green-100 text-green-700' : donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {donation.needs_80g ? <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{language === 'en' ? 'Requested' : 'વિનંતી'}</span> : '-'}
                    </td>
                  </tr>
                ))
              )}}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Contacts Section
const ContactsSection = () => {
  const { language } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${API}/contact`);
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/contact/${id}/read`);
      setContacts(contacts.map(c => c.id === id ? { ...c, is_read: true } : c));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div data-testid="contacts-section">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#6B7280]">{language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}</div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-[#6B7280]">{language === 'en' ? 'No messages yet' : 'હજી સુધી કોઈ સંદેશા નથી'}</div>
        ) : (
          <div className="divide-y">
            {contacts.map((contact) => (
              <div key={contact.id} className={`p-4 ${!contact.is_read ? 'bg-blue-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#1F2937]">{contact.name}</p>
                    <p className="text-sm text-[#6B7280]">{contact.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {contact.is_volunteer && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{language === 'en' ? 'Volunteer' : 'સ્વયંસેવક'}</span>}
                    {!contact.is_read && <button onClick={() => markAsRead(contact.id)} className="text-xs text-blue-600 hover:underline">{language === 'en' ? 'Mark read' : 'વાંચેલ તરીકે ચિહ્નિત કરો'}</button>}
                  </div>
                </div>
                {contact.subject && <p className="font-medium text-sm mt-2">{contact.subject}</p>}
                <p className="text-sm text-[#6B7280] mt-1">{contact.message}</p>
                <p className="text-xs text-[#9CA3AF] mt-2">{new Date(contact.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
