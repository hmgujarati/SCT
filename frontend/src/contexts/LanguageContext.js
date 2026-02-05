import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check URL for language
    const path = window.location.pathname;
    if (path.startsWith('/gu')) return 'gu';
    if (path.startsWith('/en')) return 'en';
    // Check localStorage
    const saved = localStorage.getItem('shivdhara_language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('shivdhara_language', language);
    // Update document lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'gu' : 'en';
    setLanguage(newLang);
    
    // Update URL if using language-prefixed routes
    const currentPath = window.location.pathname;
    let newPath = currentPath;
    
    if (currentPath.startsWith('/en')) {
      newPath = currentPath.replace('/en', '/gu');
    } else if (currentPath.startsWith('/gu')) {
      newPath = currentPath.replace('/gu', '/en');
    } else {
      // Add language prefix
      newPath = `/${newLang}${currentPath === '/' ? '' : currentPath}`;
    }
    
    window.history.replaceState(null, '', newPath);
  };

  const t = (content) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };

  // Common UI translations
  const ui = {
    donate_now: language === 'en' ? 'Donate Now' : 'હવે દાન કરો',
    learn_more: language === 'en' ? 'Learn More' : 'વધુ જાણો',
    read_more: language === 'en' ? 'Read More' : 'વધુ વાંચો',
    submit: language === 'en' ? 'Submit' : 'સબમિટ કરો',
    send_message: language === 'en' ? 'Send Message' : 'સંદેશ મોકલો',
    name: language === 'en' ? 'Name' : 'નામ',
    email: language === 'en' ? 'Email' : 'ઈમેઈલ',
    phone: language === 'en' ? 'Phone' : 'ફોન',
    message: language === 'en' ? 'Message' : 'સંદેશ',
    subject: language === 'en' ? 'Subject' : 'વિષય',
    address: language === 'en' ? 'Address' : 'સરનામું',
    home: language === 'en' ? 'Home' : 'મુખ્ય પૃષ્ઠ',
    about: language === 'en' ? 'About Us' : 'અમારા વિશે',
    gallery: language === 'en' ? 'Gallery' : 'ગેલેરી',
    stories: language === 'en' ? 'Success Stories' : 'સફળતાની વાર્તાઓ',
    blog: language === 'en' ? 'Blog' : 'બ્લોગ',
    donate: language === 'en' ? 'Donate' : 'દાન કરો',
    contact: language === 'en' ? 'Contact Us' : 'સંપર્ક કરો',
    admin: language === 'en' ? 'Admin' : 'એડમિન',
    login: language === 'en' ? 'Login' : 'લૉગિન',
    logout: language === 'en' ? 'Logout' : 'લૉગઆઉટ',
    loading: language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...',
    error: language === 'en' ? 'Something went wrong' : 'કંઈક ખોટું થયું',
    success: language === 'en' ? 'Success!' : 'સફળતા!',
    // Impact stats labels
    families_helped: language === 'en' ? 'Families Helped' : 'મદદ પામેલ પરિવારો',
    education_drives: language === 'en' ? 'Education Drives' : 'શિક્ષણ અભિયાનો',
    medical_camps: language === 'en' ? 'Medical Camps' : 'મેડિકલ કેમ્પ',
    years_of_service: language === 'en' ? 'Years of Service' : 'સેવાના વર્ષો',
    // Programs
    education: language === 'en' ? 'Education' : 'શિક્ષણ',
    healthcare: language === 'en' ? 'Healthcare' : 'આરોગ્ય સેવા',
    relief: language === 'en' ? 'Relief Services' : 'રાહત સેવાઓ',
    community: language === 'en' ? 'Community Development' : 'સમુદાય વિકાસ',
    // Donation
    custom_amount: language === 'en' ? 'Custom Amount' : 'કસ્ટમ રકમ',
    your_donation: language === 'en' ? 'Your Donation' : 'તમારું દાન',
    payment_details: language === 'en' ? 'Payment Details' : 'ચુકવણી વિગતો',
    need_80g: language === 'en' ? 'I need 80G tax exemption receipt' : 'મને 80G કર મુક્તિ રસીદ જોઈએ છે',
    pan_number: language === 'en' ? 'PAN Number' : 'પાન નંબર',
    city: language === 'en' ? 'City' : 'શહેર',
    state: language === 'en' ? 'State' : 'રાજ્ય',
    country: language === 'en' ? 'Country' : 'દેશ',
    zip_code: language === 'en' ? 'ZIP Code' : 'પિન કોડ',
    proceed_to_pay: language === 'en' ? 'Proceed to Pay' : 'ચુકવણી કરો',
    thank_you: language === 'en' ? 'Thank You!' : 'આભાર!',
    donation_success: language === 'en' ? 'Your donation has been received successfully.' : 'તમારું દાન સફળતાપૂર્વક પ્રાપ્ત થયું છે.',
    // Footer
    quick_links: language === 'en' ? 'Quick Links' : 'ઝડપી લિંક્સ',
    contact_info: language === 'en' ? 'Contact Info' : 'સંપર્ક માહિતી',
    bank_details: language === 'en' ? 'Bank Details' : 'બેંક વિગતો',
    trust_details: language === 'en' ? 'Trust Registration' : 'ટ્રસ્ટ નોંધણી',
    follow_us: language === 'en' ? 'Follow Us' : 'અમને અનુસરો',
    // Volunteer
    volunteer: language === 'en' ? 'I want to volunteer' : 'હું સ્વયંસેવક બનવા માંગુ છું',
    whatsapp_us: language === 'en' ? 'WhatsApp Us' : 'અમને WhatsApp કરો'
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, ui }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
