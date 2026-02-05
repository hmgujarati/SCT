import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Heart } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_81b02de3-3cd6-4707-8173-e23f16017522/artifacts/zjn72wsr_Shivdhara%20Charitable.png';

const Footer = () => {
  const { language, t, ui } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const quickLinks = [
    { path: '/', label: ui.home },
    { path: '/about', label: ui.about },
    { path: '/gallery', label: ui.gallery },
    { path: '/stories', label: ui.stories },
    { path: '/blog', label: ui.blog },
    { path: '/donate', label: ui.donate },
    { path: '/contact', label: ui.contact },
  ];

  return (
    <footer className="bg-[#1F2937] text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6" data-testid="footer-logo">
              <img src={LOGO_URL} alt="Shivdhara Charitable" className="h-16 w-auto" />
            </Link>
            <p className={`text-stone-400 text-sm leading-relaxed mb-4 ${language === 'gu' ? 'font-gujarati' : ''}`}>
              {language === 'en' 
                ? 'Serving humanity with compassion through education, healthcare, and community support since 2012.'
                : '2012 થી શિક્ષણ, આરોગ્ય સેવા અને સમુદાય સહાય દ્વારા કરુણા સાથે માનવતાની સેવા કરી રહ્યા છીએ.'}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8B1E1E] transition-colors" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8B1E1E] transition-colors" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8B1E1E] transition-colors" data-testid="social-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8B1E1E] transition-colors" data-testid="social-youtube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-lg font-semibold mb-6 text-[#C9A24A] ${language === 'gu' ? 'font-gujarati' : ''}`}>
              {ui.quick_links}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-stone-400 hover:text-white transition-colors text-sm ${language === 'gu' ? 'font-gujarati' : ''}`}
                    data-testid={`footer-link-${link.path.replace('/', '') || 'home'}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={`text-lg font-semibold mb-6 text-[#C9A24A] ${language === 'gu' ? 'font-gujarati' : ''}`}>
              {ui.contact_info}
            </h4>
            <ul className="space-y-4">
              {settings?.contact_info?.address_en && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C9A24A] flex-shrink-0 mt-0.5" />
                  <span className={`text-stone-400 text-sm ${language === 'gu' ? 'font-gujarati' : ''}`}>
                    {language === 'en' ? settings.contact_info.address_en : (settings.contact_info.address_gu || settings.contact_info.address_en)}
                  </span>
                </li>
              )}
              {settings?.contact_info?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C9A24A] flex-shrink-0" />
                  <a href={`tel:${settings.contact_info.phone}`} className="text-stone-400 hover:text-white transition-colors text-sm">
                    {settings.contact_info.phone}
                  </a>
                </li>
              )}
              {settings?.contact_info?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#C9A24A] flex-shrink-0" />
                  <a href={`mailto:${settings.contact_info.email}`} className="text-stone-400 hover:text-white transition-colors text-sm">
                    {settings.contact_info.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Bank Details & Trust Info */}
          <div>
            <h4 className={`text-lg font-semibold mb-6 text-[#C9A24A] ${language === 'gu' ? 'font-gujarati' : ''}`}>
              {ui.bank_details}
            </h4>
            {settings?.bank_details?.bank_name && (
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <ul className="space-y-2 text-sm">
                  <li className="text-stone-400">
                    <span className="text-stone-500">{language === 'en' ? 'Bank:' : 'બેંક:'}</span> {settings.bank_details.bank_name}
                  </li>
                  <li className="text-stone-400">
                    <span className="text-stone-500">{language === 'en' ? 'A/C:' : 'ખાતા નં:'}</span> {settings.bank_details.account_number}
                  </li>
                  <li className="text-stone-400">
                    <span className="text-stone-500">{language === 'en' ? 'IFSC:' : 'IFSC:'}</span> {settings.bank_details.ifsc_code}
                  </li>
                  <li className="text-stone-400">
                    <span className="text-stone-500">{language === 'en' ? 'Branch:' : 'શાખા:'}</span> {settings.bank_details.branch_name}
                  </li>
                </ul>
              </div>
            )}
            
            {/* UPI QR Code */}
            {settings?.upi_details?.qr_code_url && (
              <div className="bg-white rounded-lg p-3 inline-block mb-4">
                <img src={settings.upi_details.qr_code_url} alt="UPI QR Code" className="w-24 h-24" />
                {settings.upi_details.upi_id && (
                  <p className="text-xs text-[#1F2937] text-center mt-1 font-mono">{settings.upi_details.upi_id}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trust Registration Details */}
        {settings?.trust_details && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h4 className={`text-sm font-semibold mb-4 text-[#C9A24A] ${language === 'gu' ? 'font-gujarati' : ''}`}>
              {ui.trust_details}
            </h4>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-stone-400">
              {settings.trust_details.registration_no && (
                <span><strong>Regd No:</strong> {settings.trust_details.registration_no}</span>
              )}
              {settings.trust_details.pan && (
                <span><strong>PAN:</strong> {settings.trust_details.pan}</span>
              )}
              {settings.trust_details.reg_80g && (
                <span><strong>80G:</strong> {settings.trust_details.reg_80g}</span>
              )}
              {settings.trust_details.reg_12a && (
                <span><strong>12A:</strong> {settings.trust_details.reg_12a}</span>
              )}
              {settings.trust_details.csr_no && (
                <span><strong>CSR:</strong> {settings.trust_details.csr_no}</span>
              )}
              {settings.trust_details.darpan_id && (
                <span><strong>Darpan ID:</strong> {settings.trust_details.darpan_id}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-stone-500 text-sm ${language === 'gu' ? 'font-gujarati' : ''}`}>
            © {new Date().getFullYear()} {language === 'en' ? 'Shivdhara Charitable Trust. All rights reserved.' : 'શિવધારા ચેરીટેબલ ટ્રસ્ટ. સર્વ હક્કો અમારી પાસે રાખેલ છે.'}
          </p>
          <p className="flex items-center gap-1 text-stone-500 text-sm">
            {language === 'en' ? 'Made with' : 'બનાવેલ'} <Heart className="w-4 h-4 text-[#8B1E1E] fill-[#8B1E1E]" /> {language === 'en' ? 'for humanity' : 'માનવતા માટે'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
