import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactPage = () => {
  const { language, t, ui } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    isVolunteer: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, contentRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/content/contact`)
      ]);
      setSettings(settingsRes.data);
      setContent(contentRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVolunteerChange = (checked) => {
    setFormData({ ...formData, isVolunteer: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'કૃપા કરીને બધા જરૂરી ફીલ્ડ ભરો');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/contact`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        is_volunteer: formData.isVolunteer
      });
      setSubmitted(true);
      toast.success(language === 'en' ? 'Message sent successfully!' : 'સંદેશ સફળતાપૂર્વક મોકલાયો!');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to send message' : 'સંદેશ મોકલવામાં નિષ્ફળ');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = settings?.contact_info || {};

  return (
    <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
      {/* Hero */}
      <section className="py-20 bg-[#F7F1E6]" data-testid="contact-hero">
        <div className="container-custom text-center">
          <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-6">
            {language === 'en' ? 'Contact Us' : 'સંપર્ક કરો'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
            {t(content.title) || (language === 'en' ? 'Get in Touch' : 'સંપર્કમાં રહો')}
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            {t(content.subtitle) || (language === 'en' 
              ? 'Have questions or want to volunteer? We\'d love to hear from you.'
              : 'પ્રશ્નો છે અથવા સ્વયંસેવક બનવા માંગો છો? અમને તમારા તરફથી સાંભળવું ગમશે.')}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section bg-white" data-testid="contact-content">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-[#F7F1E6] rounded-2xl p-8 sticky top-28">
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">
                  {language === 'en' ? 'Contact Information' : 'સંપર્ક માહિતી'}
                </h2>
                
                <div className="space-y-6">
                  {(contactInfo.address_en || contactInfo.address_gu) && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#8B1E1E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#8B1E1E]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1F2937] mb-1">{ui.address}</h3>
                        <p className="text-sm text-[#6B7280]">
                          {language === 'en' ? contactInfo.address_en : (contactInfo.address_gu || contactInfo.address_en)}
                        </p>
                      </div>
                    </div>
                  )}

                  {contactInfo.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#8B1E1E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-[#8B1E1E]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1F2937] mb-1">{ui.phone}</h3>
                        <a href={`tel:${contactInfo.phone}`} className="text-sm text-[#6B7280] hover:text-[#8B1E1E]">
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactInfo.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#8B1E1E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-[#8B1E1E]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1F2937] mb-1">{ui.email}</h3>
                        <a href={`mailto:${contactInfo.email}`} className="text-sm text-[#6B7280] hover:text-[#8B1E1E]">
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#8B1E1E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#8B1E1E]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1F2937] mb-1">
                        {language === 'en' ? 'Office Hours' : 'ઓફિસ સમય'}
                      </h3>
                      <p className="text-sm text-[#6B7280]">
                        {language === 'en' ? 'Mon - Sat: 10 AM - 6 PM' : 'સોમ - શનિ: સવારે 10 - સાંજે 6'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Button */}
                {contactInfo.whatsapp && (
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-medium hover:bg-[#128C7E] transition-colors"
                    data-testid="whatsapp-btn"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {ui.whatsapp_us}
                  </a>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="text-center py-16" data-testid="contact-success">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-4">
                    {language === 'en' ? 'Message Sent!' : 'સંદેશ મોકલાયો!'}
                  </h2>
                  <p className="text-[#6B7280] mb-6">
                    {language === 'en' 
                      ? 'Thank you for reaching out. We\'ll get back to you soon.'
                      : 'સંપર્ક કરવા બદલ આભાર. અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું.'}
                  </p>
                  <Button onClick={() => setSubmitted(false)} className="btn-outline">
                    {language === 'en' ? 'Send Another Message' : 'બીજો સંદેશ મોકલો'}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.name} *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="contact-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.email} *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="contact-email"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.phone}</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="contact-phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.subject}</label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="contact-subject"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.message} *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="input-field resize-none"
                      data-testid="contact-message"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-[#F7F1E6] rounded-xl">
                    <Checkbox
                      id="volunteer"
                      checked={formData.isVolunteer}
                      onCheckedChange={handleVolunteerChange}
                      data-testid="volunteer-checkbox"
                    />
                    <label htmlFor="volunteer" className="text-sm text-[#1F2937] cursor-pointer">
                      {ui.volunteer}
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full md:w-auto"
                    data-testid="submit-contact"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {ui.loading}
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {ui.send_message}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Only shows if maps_embed URL is configured */}
      {contactInfo.maps_embed && (
        <section className="h-[400px]" data-testid="map-section">
          <iframe
            src={contactInfo.maps_embed}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={language === 'en' ? 'Our Location' : 'અમારું સ્થાન'}
          ></iframe>
        </section>
      )}
    </div>
  );
};

export default ContactPage;
