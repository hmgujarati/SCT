import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  LayoutDashboard, 
  Settings, 
  Image, 
  FileText, 
  Heart, 
  Users, 
  Mail, 
  BookOpen,
  LogOut,
  Menu,
  X,
  Save,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  ChevronRight
} from 'lucide-react';

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
    // Parse section from URL
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
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
              {ui.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Section Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1F2937]">
              {navItems.find(n => n.id === activeSection)?.label}
            </h1>
          </div>

          {/* Dynamic Section Content */}
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'settings' && <SettingsSection />}
          {activeSection === 'donations' && <DonationsSection />}
          {activeSection === 'gallery' && <GallerySection />}
          {activeSection === 'stories' && <StoriesSection />}
          {activeSection === 'blog' && <BlogSection />}
          {activeSection === 'content' && <ContentSection />}
          {activeSection === 'contacts' && <ContactsSection />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Dashboard Section
const DashboardSection = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    totalContacts: 0,
    totalStories: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

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

// Settings Section
const SettingsSection = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState({
    bank_details: {},
    trust_details: {},
    contact_info: {},
    upi_details: {},
    smtp_config: {},
    razorpay_config: {},
    impact_stats: {}
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings/admin`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

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

  const updateNestedField = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const tabs = [
    { id: 'contact', label: language === 'en' ? 'Contact Info' : 'સંપર્ક માહિતી' },
    { id: 'bank', label: language === 'en' ? 'Bank Details' : 'બેંક વિગતો' },
    { id: 'trust', label: language === 'en' ? 'Trust Details' : 'ટ્રસ્ટ વિગતો' },
    { id: 'upi', label: language === 'en' ? 'UPI' : 'UPI' },
    { id: 'smtp', label: language === 'en' ? 'Email (SMTP)' : 'ઈમેઈલ (SMTP)' },
    { id: 'razorpay', label: language === 'en' ? 'Razorpay' : 'Razorpay' },
    { id: 'impact', label: language === 'en' ? 'Impact Stats' : 'પ્રભાવ આંકડા' }
  ];

  return (
    <div data-testid="settings-section">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#8B1E1E] text-white'
                : 'bg-white text-[#6B7280] hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Contact Info */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Address (English)' : 'સરનામું (English)'}</label>
                <Textarea
                  value={settings.contact_info?.address_en || ''}
                  onChange={(e) => updateNestedField('contact_info', 'address_en', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Address (Gujarati)' : 'સરનામું (ગુજરાતી)'}</label>
                <Textarea
                  value={settings.contact_info?.address_gu || ''}
                  onChange={(e) => updateNestedField('contact_info', 'address_gu', e.target.value)}
                  className="input-field font-gujarati"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Phone' : 'ફોન'}</label>
                <Input
                  value={settings.contact_info?.phone || ''}
                  onChange={(e) => updateNestedField('contact_info', 'phone', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Email' : 'ઈમેઈલ'}</label>
                <Input
                  value={settings.contact_info?.email || ''}
                  onChange={(e) => updateNestedField('contact_info', 'email', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{language === 'en' ? 'WhatsApp' : 'WhatsApp'}</label>
                <Input
                  value={settings.contact_info?.whatsapp || ''}
                  onChange={(e) => updateNestedField('contact_info', 'whatsapp', e.target.value)}
                  placeholder="+91..."
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bank Details */}
        {activeTab === 'bank' && (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'account_holder_name', label: language === 'en' ? 'Account Holder Name' : 'ખાતાધારકનું નામ' },
              { key: 'account_number', label: language === 'en' ? 'Account Number' : 'ખાતા નંબર' },
              { key: 'bank_name', label: language === 'en' ? 'Bank Name' : 'બેંકનું નામ' },
              { key: 'branch_name', label: language === 'en' ? 'Branch Name' : 'શાખાનું નામ' },
              { key: 'ifsc_code', label: language === 'en' ? 'IFSC Code' : 'IFSC કોડ' },
              { key: 'micr_code', label: language === 'en' ? 'MICR Code' : 'MICR કોડ' }
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                <Input
                  value={settings.bank_details?.[field.key] || ''}
                  onChange={(e) => updateNestedField('bank_details', field.key, e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        )}

        {/* Trust Details */}
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
                <Input
                  value={settings.trust_details?.[field.key] || ''}
                  onChange={(e) => updateNestedField('trust_details', field.key, e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        )}

        {/* UPI */}
        {activeTab === 'upi' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">UPI ID</label>
              <Input
                value={settings.upi_details?.upi_id || ''}
                onChange={(e) => updateNestedField('upi_details', 'upi_id', e.target.value)}
                placeholder="name@bank"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'QR Code URL' : 'QR કોડ URL'}</label>
              <Input
                value={settings.upi_details?.qr_code_url || ''}
                onChange={(e) => updateNestedField('upi_details', 'qr_code_url', e.target.value)}
                placeholder="https://..."
                className="input-field"
              />
            </div>
            {settings.upi_details?.qr_code_url && (
              <div className="md:col-span-2">
                <p className="text-sm text-[#6B7280] mb-2">{language === 'en' ? 'QR Preview' : 'QR પૂર્વાવલોકન'}</p>
                <img src={settings.upi_details.qr_code_url} alt="UPI QR" className="w-32 h-32 border rounded-lg" />
              </div>
            )}
          </div>
        )}

        {/* SMTP */}
        {activeTab === 'smtp' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Host</label>
              <Input
                value={settings.smtp_config?.host || ''}
                onChange={(e) => updateNestedField('smtp_config', 'host', e.target.value)}
                placeholder="smtp.hostinger.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Port</label>
              <Input
                type="number"
                value={settings.smtp_config?.port || 587}
                onChange={(e) => updateNestedField('smtp_config', 'port', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Username' : 'યુઝરનેમ'}</label>
              <Input
                value={settings.smtp_config?.username || ''}
                onChange={(e) => updateNestedField('smtp_config', 'username', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Password' : 'પાસવર્ડ'}</label>
              <Input
                type="password"
                value={settings.smtp_config?.password || ''}
                onChange={(e) => updateNestedField('smtp_config', 'password', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'From Email' : 'ફ્રોમ ઈમેઈલ'}</label>
              <Input
                value={settings.smtp_config?.from_email || ''}
                onChange={(e) => updateNestedField('smtp_config', 'from_email', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'From Name' : 'ફ્રોમ નામ'}</label>
              <Input
                value={settings.smtp_config?.from_name || ''}
                onChange={(e) => updateNestedField('smtp_config', 'from_name', e.target.value)}
                placeholder="Shivdhara Charitable"
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Razorpay */}
        {activeTab === 'razorpay' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {language === 'en' 
                  ? '⚠️ Currently using test mode. Add live keys to accept real payments.'
                  : '⚠️ હાલમાં ટેસ્ટ મોડ વાપરી રહ્યા છીએ. વાસ્તવિક ચુકવણી સ્વીકારવા માટે live keys ઉમેરો.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key ID</label>
                <Input
                  value={settings.razorpay_config?.key_id || ''}
                  onChange={(e) => updateNestedField('razorpay_config', 'key_id', e.target.value)}
                  placeholder="rzp_live_..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Key Secret</label>
                <Input
                  type="password"
                  value={settings.razorpay_config?.key_secret || ''}
                  onChange={(e) => updateNestedField('razorpay_config', 'key_secret', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Webhook Secret</label>
                <Input
                  type="password"
                  value={settings.razorpay_config?.webhook_secret || ''}
                  onChange={(e) => updateNestedField('razorpay_config', 'webhook_secret', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Impact Stats */}
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
                <Input
                  type="number"
                  value={settings.impact_stats?.[field.key] || 0}
                  onChange={(e) => updateNestedField('impact_stats', field.key, parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t">
          <Button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}
              </span>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Save Settings' : 'સેટિંગ્સ સાચવો'}
              </>
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
    fetchDonations();
  }, []);

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

  const export80G = () => {
    window.open(`${API}/donations/export-80g`, '_blank');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN');
  };

  return (
    <div data-testid="donations-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">
          {donations.filter(d => d.status === 'paid').length} {language === 'en' ? 'successful donations' : 'સફળ દાન'}
        </p>
        <Button onClick={export80G} className="btn-secondary">
          <Download className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Export 80G Data' : '80G ડેટા નિકાસ કરો'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Date' : 'તારીખ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Donor' : 'દાતા'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Amount' : 'રકમ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Status' : 'સ્થિતિ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">80G</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-[#6B7280]">
                    {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-[#6B7280]">
                    {language === 'en' ? 'No donations yet' : 'હજી સુધી કોઈ દાન નથી'}
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm">{formatDate(donation.paid_at || donation.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2937]">{donation.donor_info?.name}</p>
                      <p className="text-xs text-[#6B7280]">{donation.donor_info?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#8B1E1E]">₹{donation.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donation.status === 'paid' ? 'bg-green-100 text-green-700' :
                        donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {donation.needs_80g ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {language === 'en' ? 'Requested' : 'વિનંતી'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Content Section - Edit page content in both languages
const ContentSection = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [editingItem, setEditingItem] = useState(null);

  const pages = [
    { id: 'home', label: language === 'en' ? 'Home Page' : 'હોમ પેજ' },
    { id: 'about', label: language === 'en' ? 'About Page' : 'અમારા વિશે' },
    { id: 'donate', label: language === 'en' ? 'Donate Page' : 'દાન પેજ' },
    { id: 'contact', label: language === 'en' ? 'Contact Page' : 'સંપર્ક પેજ' }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageKey, sectionKey, contentData) => {
    setSaving(true);
    try {
      await axios.put(`${API}/content/${pageKey}/${sectionKey}`, contentData);
      toast.success(language === 'en' ? 'Content saved!' : 'સામગ્રી સાચવી!');
      fetchContent();
      setEditingItem(null);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    } finally {
      setSaving(false);
    }
  };

  const pageContent = content.filter(c => c.page_key === activeTab);

  const sectionLabels = {
    hero_title: language === 'en' ? 'Hero Title' : 'હીરો શીર્ષક',
    hero_subtitle: language === 'en' ? 'Hero Subtitle' : 'હીરો ઉપશીર્ષક',
    donate_cta: language === 'en' ? 'Donate CTA' : 'દાન CTA',
    impact_title: language === 'en' ? 'Impact Title' : 'પ્રભાવ શીર્ષક',
    programs_title: language === 'en' ? 'Programs Title' : 'કાર્યક્રમો શીર્ષક',
    transparency_title: language === 'en' ? 'Transparency Title' : 'પારદર્શકતા શીર્ષક',
    transparency_text: language === 'en' ? 'Transparency Text' : 'પારદર્શકતા ટેક્સ્ટ',
    cta_title: language === 'en' ? 'CTA Title' : 'CTA શીર્ષક',
    cta_text: language === 'en' ? 'CTA Text' : 'CTA ટેક્સ્ટ',
    title: language === 'en' ? 'Page Title' : 'પેજ શીર્ષક',
    subtitle: language === 'en' ? 'Subtitle' : 'ઉપશીર્ષક',
    intro: language === 'en' ? 'Introduction' : 'પરિચય',
    vision_title: language === 'en' ? 'Vision Title' : 'વિઝન શીર્ષક',
    vision: language === 'en' ? 'Vision Text' : 'વિઝન ટેક્સ્ટ',
    mission_title: language === 'en' ? 'Mission Title' : 'મિશન શીર્ષક',
    mission: language === 'en' ? 'Mission Text' : 'મિશન ટેક્સ્ટ',
    values_title: language === 'en' ? 'Values Title' : 'મૂલ્યો શીર્ષક',
    impact_text: language === 'en' ? 'Impact Text' : 'પ્રભાવ ટેક્સ્ટ'
  };

  return (
    <div data-testid="content-section">
      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActiveTab(page.id)}
            data-testid={`content-tab-${page.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === page.id
                ? 'bg-[#8B1E1E] text-white'
                : 'bg-white text-[#6B7280] hover:bg-stone-100'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : pageContent.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <FileText className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No content found for this page' : 'આ પેજ માટે કોઈ સામગ્રી મળી નથી'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pageContent.map((item) => (
            <div key={`${item.page_key}-${item.section_key}`} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-[#1F2937]">
                    {sectionLabels[item.section_key] || item.section_key}
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">{item.section_key}</p>
                </div>
                <button
                  onClick={() => setEditingItem(editingItem === item.section_key ? null : item.section_key)}
                  className="text-[#8B1E1E] hover:bg-[#F7F1E6] p-2 rounded-lg transition-colors"
                  data-testid={`edit-${item.section_key}`}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>

              {editingItem === item.section_key ? (
                <ContentEditor
                  item={item}
                  onSave={handleSave}
                  onCancel={() => setEditingItem(null)}
                  saving={saving}
                  language={language}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">English</p>
                    <p className="text-sm text-[#1F2937]">{item.content?.en || '-'}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">ગુજરાતી</p>
                    <p className="text-sm text-[#1F2937] font-gujarati">{item.content?.gu || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Content Editor Component
const ContentEditor = ({ item, onSave, onCancel, saving, language }) => {
  const [formData, setFormData] = useState({
    en: item.content?.en || '',
    gu: item.content?.gu || ''
  });

  const isLongText = item.section_key.includes('text') || item.section_key.includes('intro') || 
                     item.section_key.includes('vision') || item.section_key.includes('mission');

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">English</label>
          {isLongText ? (
            <Textarea
              value={formData.en}
              onChange={(e) => setFormData({ ...formData, en: e.target.value })}
              className="input-field min-h-[120px]"
              data-testid={`content-en-${item.section_key}`}
            />
          ) : (
            <Input
              value={formData.en}
              onChange={(e) => setFormData({ ...formData, en: e.target.value })}
              className="input-field"
              data-testid={`content-en-${item.section_key}`}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">ગુજરાતી</label>
          {isLongText ? (
            <Textarea
              value={formData.gu}
              onChange={(e) => setFormData({ ...formData, gu: e.target.value })}
              className="input-field min-h-[120px] font-gujarati"
              data-testid={`content-gu-${item.section_key}`}
            />
          ) : (
            <Input
              value={formData.gu}
              onChange={(e) => setFormData({ ...formData, gu: e.target.value })}
              className="input-field font-gujarati"
              data-testid={`content-gu-${item.section_key}`}
            />
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave(item.page_key, item.section_key, formData)}
          disabled={saving}
          className="btn-primary"
          data-testid={`save-${item.section_key}`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Save' : 'સાચવો'}
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">
          {language === 'en' ? 'Cancel' : 'રદ કરો'}
        </Button>
      </div>
    </div>
  );
};

// Gallery Section - Full CRUD
const GallerySection = () => {
  const { language } = useLanguage();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await axios.get(`${API}/gallery/all`);
      setAlbums(response.data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'en' ? 'Delete this album?' : 'આ આલ્બમ કાઢી નાખવું?')) return;
    try {
      await axios.delete(`${API}/gallery/${id}`);
      toast.success(language === 'en' ? 'Album deleted!' : 'આલ્બમ કાઢી નાખ્યું!');
      fetchAlbums();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to delete' : 'કાઢી નાખવામાં નિષ્ફળ');
    }
  };

  const handleSave = async (albumData) => {
    try {
      if (editingAlbum) {
        await axios.put(`${API}/gallery/${editingAlbum.id}`, albumData);
        toast.success(language === 'en' ? 'Album updated!' : 'આલ્બમ અપડેટ થયું!');
      } else {
        await axios.post(`${API}/gallery`, albumData);
        toast.success(language === 'en' ? 'Album created!' : 'આલ્બમ બનાવ્યું!');
      }
      fetchAlbums();
      setEditingAlbum(null);
      setShowForm(false);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    }
  };

  return (
    <div data-testid="gallery-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">
          {albums.length} {language === 'en' ? 'albums' : 'આલ્બમ'}
        </p>
        <Button onClick={() => { setShowForm(true); setEditingAlbum(null); }} className="btn-primary" data-testid="add-album-btn">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Album' : 'આલ્બમ ઉમેરો'}
        </Button>
      </div>

      {(showForm || editingAlbum) && (
        <GalleryForm
          album={editingAlbum}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingAlbum(null); }}
          language={language}
        />
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Image className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No albums yet' : 'હજી સુધી કોઈ આલ્બમ નથી'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-stone-100 relative">
                {album.images?.[0]?.url ? (
                  <img src={album.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-stone-300" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${album.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                  {album.is_active ? (language === 'en' ? 'Active' : 'સક્રિય') : (language === 'en' ? 'Hidden' : 'છુપાયેલ')}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#1F2937]">{album.title?.[language] || album.title?.en}</h3>
                <p className="text-sm text-[#6B7280] capitalize">{album.category}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{album.images?.length || 0} {language === 'en' ? 'images' : 'ફોટા'}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setEditingAlbum(album)} variant="outline" size="sm" className="flex-1" data-testid={`edit-album-${album.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> {language === 'en' ? 'Edit' : 'સંપાદન'}
                  </Button>
                  <Button onClick={() => handleDelete(album.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-album-${album.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Gallery Form Component
const GalleryForm = ({ album, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    title: album?.title || { en: '', gu: '' },
    category: album?.category || 'education',
    images: album?.images || [],
    is_active: album?.is_active ?? true
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState({ en: '', gu: '' });
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: 'education', label: language === 'en' ? 'Education' : 'શિક્ષણ' },
    { id: 'health', label: language === 'en' ? 'Health' : 'આરોગ્ય' },
    { id: 'relief', label: language === 'en' ? 'Relief' : 'રાહત' },
    { id: 'community', label: language === 'en' ? 'Community' : 'સમુદાય' }
  ];

  const addImage = () => {
    if (!newImageUrl) return;
    setFormData({
      ...formData,
      images: [...formData.images, { id: Date.now().toString(), url: newImageUrl, caption: newImageCaption, order: formData.images.length }]
    });
    setNewImageUrl('');
    setNewImageCaption({ en: '', gu: '' });
  };

  const removeImage = (imageId) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img.id !== imageId)
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.en) {
      toast.error(language === 'en' ? 'Title is required' : 'શીર્ષક જરૂરી છે');
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6" data-testid="gallery-form">
      <h3 className="font-semibold text-lg mb-4">
        {album ? (language === 'en' ? 'Edit Album' : 'આલ્બમ સંપાદિત કરો') : (language === 'en' ? 'New Album' : 'નવું આલ્બમ')}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (English)' : 'શીર્ષક (English)'}</label>
          <Input
            value={formData.title.en}
            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value }})}
            className="input-field"
            data-testid="album-title-en"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (Gujarati)' : 'શીર્ષક (ગુજરાતી)'}</label>
          <Input
            value={formData.title.gu}
            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, gu: e.target.value }})}
            className="input-field font-gujarati"
            data-testid="album-title-gu"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Category' : 'શ્રેણી'}</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full input-field"
            data-testid="album-category"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4"
            data-testid="album-active"
          />
          <label htmlFor="is_active" className="text-sm">{language === 'en' ? 'Active (visible on website)' : 'સક્રિય (વેબસાઈટ પર દેખાય)'}</label>
        </div>
      </div>

      {/* Images */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-3">{language === 'en' ? 'Images' : 'ફોટા'}</h4>
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {formData.images.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-stone-50 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Image URL' : 'ફોટો URL'}</label>
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://..."
              className="input-field"
              data-testid="new-image-url"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Caption (English)' : 'કેપ્શન (English)'}</label>
              <Input
                value={newImageCaption.en}
                onChange={(e) => setNewImageCaption({ ...newImageCaption, en: e.target.value })}
                className="input-field"
                data-testid="new-image-caption-en"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Caption (Gujarati)' : 'કેપ્શન (ગુજરાતી)'}</label>
              <Input
                value={newImageCaption.gu}
                onChange={(e) => setNewImageCaption({ ...newImageCaption, gu: e.target.value })}
                className="input-field font-gujarati"
                data-testid="new-image-caption-gu"
              />
            </div>
          </div>
          <Button onClick={addImage} variant="outline" size="sm" data-testid="add-image-btn">
            <Plus className="w-4 h-4 mr-1" /> {language === 'en' ? 'Add Image' : 'ફોટો ઉમેરો'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSubmit} disabled={saving} className="btn-primary" data-testid="save-album-btn">
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Save Album' : 'આલ્બમ સાચવો'}
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">
          {language === 'en' ? 'Cancel' : 'રદ કરો'}
        </Button>
      </div>
    </div>
  );
};

// Stories Section - Full CRUD
const StoriesSection = () => {
  const { language } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API}/stories/all`);
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'en' ? 'Delete this story?' : 'આ વાર્તા કાઢી નાખવી?')) return;
    try {
      await axios.delete(`${API}/stories/${id}`);
      toast.success(language === 'en' ? 'Story deleted!' : 'વાર્તા કાઢી નાખી!');
      fetchStories();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to delete' : 'કાઢી નાખવામાં નિષ્ફળ');
    }
  };

  const handleSave = async (storyData) => {
    try {
      if (editingStory) {
        await axios.put(`${API}/stories/${editingStory.id}`, storyData);
        toast.success(language === 'en' ? 'Story updated!' : 'વાર્તા અપડેટ થઈ!');
      } else {
        await axios.post(`${API}/stories`, storyData);
        toast.success(language === 'en' ? 'Story created!' : 'વાર્તા બનાવી!');
      }
      fetchStories();
      setEditingStory(null);
      setShowForm(false);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    }
  };

  return (
    <div data-testid="stories-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">
          {stories.length} {language === 'en' ? 'stories' : 'વાર્તાઓ'}
        </p>
        <Button onClick={() => { setShowForm(true); setEditingStory(null); }} className="btn-primary" data-testid="add-story-btn">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Story' : 'વાર્તા ઉમેરો'}
        </Button>
      </div>

      {(showForm || editingStory) && (
        <StoryForm
          story={editingStory}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingStory(null); }}
          language={language}
        />
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Users className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No stories yet' : 'હજી સુધી કોઈ વાર્તા નથી'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                {story.image_url ? (
                  <img src={story.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-stone-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">{story.title?.[language] || story.title?.en}</h3>
                    <p className="text-sm text-[#6B7280]">{story.person_name?.[language] || story.person_name?.en} • {story.location?.[language] || story.location?.en}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${story.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                    {story.is_active ? (language === 'en' ? 'Active' : 'સક્રિય') : (language === 'en' ? 'Hidden' : 'છુપાયેલ')}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{story.problem?.[language] || story.problem?.en}</p>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => setEditingStory(story)} variant="outline" size="sm" data-testid={`edit-story-${story.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> {language === 'en' ? 'Edit' : 'સંપાદન'}
                  </Button>
                  <Button onClick={() => handleDelete(story.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-story-${story.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Story Form Component
const StoryForm = ({ story, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    title: story?.title || { en: '', gu: '' },
    person_name: story?.person_name || { en: '', gu: '' },
    location: story?.location || { en: '', gu: '' },
    problem: story?.problem || { en: '', gu: '' },
    help_provided: story?.help_provided || { en: '', gu: '' },
    impact: story?.impact || { en: '', gu: '' },
    quote: story?.quote || { en: '', gu: '' },
    image_url: story?.image_url || '',
    category: story?.category || 'education',
    is_active: story?.is_active ?? true,
    order: story?.order || 0
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: 'education', label: language === 'en' ? 'Education' : 'શિક્ષણ' },
    { id: 'health', label: language === 'en' ? 'Health' : 'આરોગ્ય' },
    { id: 'relief', label: language === 'en' ? 'Relief' : 'રાહત' }
  ];

  const handleSubmit = async () => {
    if (!formData.title.en || !formData.person_name.en) {
      toast.error(language === 'en' ? 'Title and name are required' : 'શીર્ષક અને નામ જરૂરી છે');
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const BilingualField = ({ label, field, isTextarea }) => (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium mb-2">{label} (English)</label>
        {isTextarea ? (
          <Textarea
            value={formData[field].en}
            onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], en: e.target.value }})}
            className="input-field min-h-[80px]"
          />
        ) : (
          <Input
            value={formData[field].en}
            onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], en: e.target.value }})}
            className="input-field"
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{label} (ગુજરાતી)</label>
        {isTextarea ? (
          <Textarea
            value={formData[field].gu}
            onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], gu: e.target.value }})}
            className="input-field min-h-[80px] font-gujarati"
          />
        ) : (
          <Input
            value={formData[field].gu}
            onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], gu: e.target.value }})}
            className="input-field font-gujarati"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6" data-testid="story-form">
      <h3 className="font-semibold text-lg mb-4">
        {story ? (language === 'en' ? 'Edit Story' : 'વાર્તા સંપાદિત કરો') : (language === 'en' ? 'New Story' : 'નવી વાર્તા')}
      </h3>
      
      <BilingualField label={language === 'en' ? 'Title' : 'શીર્ષક'} field="title" />
      <BilingualField label={language === 'en' ? 'Person Name' : 'વ્યક્તિનું નામ'} field="person_name" />
      <BilingualField label={language === 'en' ? 'Location' : 'સ્થાન'} field="location" />
      <BilingualField label={language === 'en' ? 'Problem' : 'સમસ્યા'} field="problem" isTextarea />
      <BilingualField label={language === 'en' ? 'Help Provided' : 'પ્રદાન કરેલ મદદ'} field="help_provided" isTextarea />
      <BilingualField label={language === 'en' ? 'Impact' : 'પ્રભાવ'} field="impact" isTextarea />
      <BilingualField label={language === 'en' ? 'Quote' : 'અવતરણ'} field="quote" isTextarea />

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Image URL' : 'ફોટો URL'}</label>
          <Input
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://..."
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Category' : 'શ્રેણી'}</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full input-field"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-7">
          <input
            type="checkbox"
            id="story_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="story_active" className="text-sm">{language === 'en' ? 'Active' : 'સક્રિય'}</label>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSubmit} disabled={saving} className="btn-primary" data-testid="save-story-btn">
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Save Story' : 'વાર્તા સાચવો'}
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">
          {language === 'en' ? 'Cancel' : 'રદ કરો'}
        </Button>
      </div>
    </div>
  );
};

// Blog Section - Full CRUD
const BlogSection = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog/all`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'en' ? 'Delete this post?' : 'આ પોસ્ટ કાઢી નાખવી?')) return;
    try {
      await axios.delete(`${API}/blog/${id}`);
      toast.success(language === 'en' ? 'Post deleted!' : 'પોસ્ટ કાઢી નાખી!');
      fetchPosts();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to delete' : 'કાઢી નાખવામાં નિષ્ફળ');
    }
  };

  const handleSave = async (postData) => {
    try {
      if (editingPost) {
        await axios.put(`${API}/blog/${editingPost.id}`, postData);
        toast.success(language === 'en' ? 'Post updated!' : 'પોસ્ટ અપડેટ થઈ!');
      } else {
        await axios.post(`${API}/blog`, postData);
        toast.success(language === 'en' ? 'Post created!' : 'પોસ્ટ બનાવી!');
      }
      fetchPosts();
      setEditingPost(null);
      setShowForm(false);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    }
  };

  return (
    <div data-testid="blog-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">
          {posts.length} {language === 'en' ? 'posts' : 'પોસ્ટ્સ'}
        </p>
        <Button onClick={() => { setShowForm(true); setEditingPost(null); }} className="btn-primary" data-testid="add-post-btn">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Post' : 'પોસ્ટ ઉમેરો'}
        </Button>
      </div>

      {(showForm || editingPost) && (
        <BlogForm
          post={editingPost}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPost(null); }}
          language={language}
        />
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No posts yet' : 'હજી સુધી કોઈ પોસ્ટ નથી'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
              <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                {post.cover_image ? (
                  <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-stone-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">{post.title?.[language] || post.title?.en}</h3>
                    <p className="text-sm text-[#6B7280]">{post.author} • {post.slug}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.is_published ? (language === 'en' ? 'Published' : 'પ્રકાશિત') : (language === 'en' ? 'Draft' : 'ડ્રાફ્ટ')}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{post.excerpt?.[language] || post.excerpt?.en}</p>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => setEditingPost(post)} variant="outline" size="sm" data-testid={`edit-post-${post.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> {language === 'en' ? 'Edit' : 'સંપાદન'}
                  </Button>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" /> {language === 'en' ? 'View' : 'જુઓ'}
                    </Button>
                  </a>
                  <Button onClick={() => handleDelete(post.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-post-${post.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Blog Form Component
const BlogForm = ({ post, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    title: post?.title || { en: '', gu: '' },
    slug: post?.slug || '',
    excerpt: post?.excerpt || { en: '', gu: '' },
    content: post?.content || { en: '', gu: '' },
    cover_image: post?.cover_image || '',
    author: post?.author || '',
    tags: post?.tags || [],
    is_published: post?.is_published ?? false
  });
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const generateSlug = () => {
    const slug = formData.title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async () => {
    if (!formData.title.en || !formData.slug) {
      toast.error(language === 'en' ? 'Title and slug are required' : 'શીર્ષક અને slug જરૂરી છે');
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6" data-testid="blog-form">
      <h3 className="font-semibold text-lg mb-4">
        {post ? (language === 'en' ? 'Edit Post' : 'પોસ્ટ સંપાદિત કરો') : (language === 'en' ? 'New Post' : 'નવી પોસ્ટ')}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (English)' : 'શીર્ષક (English)'}</label>
          <Input
            value={formData.title.en}
            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value }})}
            className="input-field"
            data-testid="post-title-en"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (Gujarati)' : 'શીર્ષક (ગુજરાતી)'}</label>
          <Input
            value={formData.title.gu}
            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, gu: e.target.value }})}
            className="input-field font-gujarati"
            data-testid="post-title-gu"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <div className="flex gap-2">
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="input-field"
              data-testid="post-slug"
            />
            <Button onClick={generateSlug} type="button" variant="outline" size="sm">
              {language === 'en' ? 'Generate' : 'બનાવો'}
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Author' : 'લેખક'}</label>
          <Input
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="input-field"
            data-testid="post-author"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Cover Image URL' : 'કવર ઈમેજ URL'}</label>
          <Input
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            placeholder="https://..."
            className="input-field"
            data-testid="post-cover"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Excerpt (English)' : 'સારાંશ (English)'}</label>
          <Textarea
            value={formData.excerpt.en}
            onChange={(e) => setFormData({ ...formData, excerpt: { ...formData.excerpt, en: e.target.value }})}
            className="input-field min-h-[80px]"
            data-testid="post-excerpt-en"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Excerpt (Gujarati)' : 'સારાંશ (ગુજરાતી)'}</label>
          <Textarea
            value={formData.excerpt.gu}
            onChange={(e) => setFormData({ ...formData, excerpt: { ...formData.excerpt, gu: e.target.value }})}
            className="input-field min-h-[80px] font-gujarati"
            data-testid="post-excerpt-gu"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Content (English)' : 'સામગ્રી (English)'}</label>
          <Textarea
            value={formData.content.en}
            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, en: e.target.value }})}
            className="input-field min-h-[200px]"
            data-testid="post-content-en"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Content (Gujarati)' : 'સામગ્રી (ગુજરાતી)'}</label>
          <Textarea
            value={formData.content.gu}
            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, gu: e.target.value }})}
            className="input-field min-h-[200px] font-gujarati"
            data-testid="post-content-gu"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Tags' : 'ટેગ્સ'}</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder={language === 'en' ? 'Add tag...' : 'ટેગ ઉમેરો...'}
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button onClick={addTag} type="button" variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-stone-100 rounded-full text-sm flex items-center gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-stone-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-7">
          <input
            type="checkbox"
            id="is_published"
            checked={formData.is_published}
            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            className="w-4 h-4"
            data-testid="post-published"
          />
          <label htmlFor="is_published" className="text-sm">{language === 'en' ? 'Publish immediately' : 'તરત પ્રકાશિત કરો'}</label>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSubmit} disabled={saving} className="btn-primary" data-testid="save-post-btn">
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Save Post' : 'પોસ્ટ સાચવો'}
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">
          {language === 'en' ? 'Cancel' : 'રદ કરો'}
        </Button>
      </div>
    </div>
  );
};

const ContactsSection = () => {
  const { language } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

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
          <div className="p-8 text-center text-[#6B7280]">
            {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-[#6B7280]">
            {language === 'en' ? 'No messages yet' : 'હજી સુધી કોઈ સંદેશા નથી'}
          </div>
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
                    {contact.is_volunteer && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {language === 'en' ? 'Volunteer' : 'સ્વયંસેવક'}
                      </span>
                    )}
                    {!contact.is_read && (
                      <button
                        onClick={() => markAsRead(contact.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {language === 'en' ? 'Mark read' : 'વાંચેલ તરીકે ચિહ્નિત કરો'}
                      </button>
                    )}
                  </div>
                </div>
                {contact.subject && <p className="font-medium text-sm mt-2">{contact.subject}</p>}
                <p className="text-sm text-[#6B7280] mt-1">{contact.message}</p>
                <p className="text-xs text-[#9CA3AF] mt-2">
                  {new Date(contact.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
