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
  LayoutDashboard, Settings, Image, FileText, Heart, Users, Mail, BookOpen,
  LogOut, Menu, X, Save, Download
} from 'lucide-react';

// Import admin sections from separate files
import { ContentSection } from '../components/admin/ContentSection';
import { GallerySection } from '../components/admin/GallerySection';
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
        </div>
      </main>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
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

// Settings Section
const SettingsSection = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState({
    bank_details: {}, trust_details: {}, contact_info: {}, upi_details: {},
    smtp_config: {}, razorpay_config: {}, impact_stats: {}
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">UPI ID</label>
              <Input value={settings.upi_details?.upi_id || ''} onChange={(e) => updateNestedField('upi_details', 'upi_id', e.target.value)} placeholder="name@bank" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'QR Code URL' : 'QR કોડ URL'}</label>
              <Input value={settings.upi_details?.qr_code_url || ''} onChange={(e) => updateNestedField('upi_details', 'qr_code_url', e.target.value)} placeholder="https://..." className="input-field" />
            </div>
            {settings.upi_details?.qr_code_url && (
              <div className="md:col-span-2">
                <p className="text-sm text-[#6B7280] mb-2">{language === 'en' ? 'QR Preview' : 'QR પૂર્વાવલોકન'}</p>
                <img src={settings.upi_details.qr_code_url} alt="UPI QR" className="w-32 h-32 border rounded-lg" />
              </div>
            )}
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

  const export80G = () => window.open(`${API}/donations/export-80g`, '_blank');

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
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Amount' : 'રકમ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">{language === 'en' ? 'Status' : 'સ્થિતિ'}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B7280]">80G</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-[#6B7280]">{language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}</td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-[#6B7280]">{language === 'en' ? 'No donations yet' : 'હજી સુધી કોઈ દાન નથી'}</td></tr>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${donation.status === 'paid' ? 'bg-green-100 text-green-700' : donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {donation.needs_80g ? <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{language === 'en' ? 'Requested' : 'વિનંતી'}</span> : '-'}
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
