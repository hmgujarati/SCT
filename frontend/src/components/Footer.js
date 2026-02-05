import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { usePageVisibility } from '../contexts/PageVisibilityContext';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  const { language, ui } = useLanguage();
  const { settings, getLogo, getSocialLinks, hasSocialLink, getImageUrl } = useSiteSettings();
  const { isPageVisible } = usePageVisibility();
  const socialLinks = getSocialLinks();

  const allQuickLinks = [
    { path: '/', label: ui.home, pageKey: 'home' },
    { path: '/about', label: ui.about, pageKey: 'about' },
    { path: '/gallery', label: ui.gallery, pageKey: 'gallery' },
    { path: '/stories', label: ui.stories, pageKey: 'stories' },
    { path: '/blog', label: ui.blog, pageKey: 'blog' },
    { path: '/donate', label: ui.donate, pageKey: 'donate' },
    { path: '/contact', label: ui.contact, pageKey: 'contact' },
  ];

  // Filter links based on page visibility
  const quickLinks = allQuickLinks.filter(link => isPageVisible(link.pageKey));

  const SocialIcon = ({ platform, icon: Icon }) => {
    if (!hasSocialLink(platform)) return null;
    return (
      <a 
        href={socialLinks[platform]} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#8B1E1E] transition-colors" 
        data-testid={`social-${platform}`}
      >
        <Icon className="w-5 h-5" />
      </a>
    );
  };

  return (
    <footer className="bg-[#1F2937] text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6" data-testid="footer-logo">
              <img src={getLogo()} alt="Shivdhara Charitable" className="h-16 w-auto" />
            </Link>
            <p className={`text-stone-400 text-sm leading-relaxed mb-4 ${language === 'gu' ? 'font-gujarati' : ''}`}>
              {language === 'en' 
                ? 'Serving humanity with compassion through education, healthcare, and community support since 2012.'
                : '2012 થી શિક્ષણ, આરોગ્ય સેવા અને સમુદાય સહાય દ્વારા કરુણા સાથે માનવતાની સેવા કરી રહ્યા છીએ.'}
            </p>
            {/* Social Links - Only show if at least one link exists */}
            {(hasSocialLink('facebook') || hasSocialLink('instagram') || hasSocialLink('twitter') || hasSocialLink('youtube') || hasSocialLink('linkedin')) && (
              <div className="flex items-center gap-3">
                <SocialIcon platform="facebook" icon={Facebook} />
                <SocialIcon platform="instagram" icon={Instagram} />
                <SocialIcon platform="twitter" icon={Twitter} />
                <SocialIcon platform="youtube" icon={Youtube} />
                <SocialIcon platform="linkedin" icon={Linkedin} />
              </div>
            )}
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
              {socialLinks?.whatsapp && (
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#C9A24A] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <a href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors text-sm">
                    WhatsApp
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
                <img src={getImageUrl(settings.upi_details.qr_code_url) || settings.upi_details.qr_code_url} alt="UPI QR Code" className="w-24 h-24" />
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
            © {new Date().getFullYear()} {language === 'en' ? 'Shivdhara Charitable. All rights reserved.' : 'શિવધારા ચેરીટેબલ. સર્વ હક્કો અમારી પાસે રાખેલ છે.'}
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
