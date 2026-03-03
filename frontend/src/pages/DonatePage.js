import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Heart, Check, Shield, Users, Stethoscope, Utensils, Home, FileText } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const DonatePage = () => {
  const { language, t, ui } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: 1001,
    customAmount: '',
    name: '',
    email: '',
    phone: '',
    needs80g: false,
    // 80G Form fields
    fullName: '',
    panNumber: '',
    address: '',
    country: 'India',
    state: '',
    city: '',
    zipCode: ''
  });

  const donationAmounts = [501, 1001, 2501, 5001, 11001];

  useEffect(() => {
    fetchData();
    loadRazorpayScript().then(setRazorpayLoaded);
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, contentRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/content/donate`)
      ]);
      setSettings(settingsRes.data);
      setContent(contentRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAmountSelect = (amount) => {
    setFormData({ ...formData, amount, customAmount: '' });
  };

  const handleCustomAmount = (value) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, customAmount: value, amount: numValue });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handle80gChange = (checked) => {
    setFormData({ ...formData, needs80g: checked });
  };

  const validateStep1 = () => {
    if (formData.amount < 1) {
      toast.error(language === 'en' ? 'Please enter a valid amount' : 'કૃપા કરીને માન્ય રકમ દાખલ કરો');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'કૃપા કરીને બધા જરૂરી ફીલ્ડ ભરો');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(language === 'en' ? 'Please enter a valid email' : 'કૃપા કરીને માન્ય ઈમેઈલ દાખલ કરો');
      return false;
    }
    if (formData.needs80g) {
      if (!formData.fullName || !formData.panNumber || !formData.address || !formData.state || !formData.city || !formData.zipCode) {
        toast.error(language === 'en' ? 'Please fill all 80G form fields' : 'કૃપા કરીને બધા 80G ફોર્મ ફીલ્ડ ભરો');
        return false;
      }
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
        toast.error(language === 'en' ? 'Please enter a valid PAN number' : 'કૃપા કરીને માન્ય PAN નંબર દાખલ કરો');
        return false;
      }
    }
    return true;
  };

  const proceedToPayment = async () => {
    if (!validateStep1() || !validateStep2()) return;

    if (!razorpayLoaded) {
      toast.error(language === 'en' ? 'Payment system is loading. Please try again.' : 'પેમેન્ટ સિસ્ટમ લોડ થઈ રહી છે. કૃપા કરીને ફરી પ્રયાસ કરો.');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await axios.post(`${API}/donations/create-order`, {
        amount: formData.amount,
        donor_info: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        needs_80g: formData.needs80g,
        form_80g: formData.needs80g ? {
          full_name: formData.fullName || formData.name,
          email: formData.email,
          phone: formData.phone,
          pan_number: formData.panNumber.toUpperCase(),
          address: formData.address,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          zip_code: formData.zipCode
        } : null
      });

      const { order_id, amount } = orderResponse.data;

      // Initialize Razorpay
      const razorpayKeyId = settings?.razorpay_key_id || 'rzp_test_placeholder';
      
      const options = {
        key: razorpayKeyId,
        amount: amount,
        currency: 'INR',
        name: language === 'en' ? 'Shivdhara Charitable' : 'શિવધારા ચેરીટેબલ',
        description: language === 'en' ? 'Donation' : 'દાન',
        order_id: order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API}/donations/verify`, null, {
              params: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            });
            setPaymentId(response.razorpay_payment_id);
            setSuccess(true);
            // Scroll to top after successful donation
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success(language === 'en' ? 'Thank you for your donation!' : 'તમારા દાન માટે આભાર!');
          } catch (error) {
            toast.error(language === 'en' ? 'Payment verification failed' : 'ચુકવણી ચકાસણી નિષ્ફળ');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#8B1E1E'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(language === 'en' ? 'Failed to initiate payment' : 'ચુકવણી શરૂ કરવામાં નિષ્ફળ');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className={`pt-24 min-h-screen bg-gradient-to-b from-[#F7F1E6] to-white ${language === 'gu' ? 'font-gujarati' : ''}`}>
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#8B1E1E] via-[#C9A24A] to-[#8B1E1E]"></div>
              
              {/* Animated checkmark */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce-slow">
                  <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto bg-green-400/30 rounded-full animate-ping"></div>
              </div>

              {/* Thank you message */}
              <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-3">
                {ui.thank_you}
              </h1>
              <p className="text-lg text-[#6B7280] mb-8">
                {ui.donation_success}
              </p>

              {/* Donation amount card */}
              <div className="bg-gradient-to-r from-[#8B1E1E] to-[#701616] rounded-2xl p-6 mb-8 text-white">
                <p className="text-sm opacity-80 mb-1">
                  {language === 'en' ? 'Your Contribution' : 'તમારું યોગદાન'}
                </p>
                <p className="text-4xl md:text-5xl font-bold">
                  ₹{formData.amount.toLocaleString()}
                </p>
              </div>

              {/* Donor info */}
              <div className="bg-stone-50 rounded-xl p-4 mb-8 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#6B7280]">{language === 'en' ? 'Name' : 'નામ'}</p>
                    <p className="font-medium text-[#1F2937]">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">{language === 'en' ? 'Email' : 'ઈમેઈલ'}</p>
                    <p className="font-medium text-[#1F2937]">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">{language === 'en' ? 'Phone' : 'ફોન'}</p>
                    <p className="font-medium text-[#1F2937]">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">{language === 'en' ? 'Payment ID' : 'પેમેન્ટ ID'}</p>
                    <p className="font-medium text-[#1F2937] text-xs">{paymentId || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 80G Notice */}
              {formData.needs80g && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">
                        {language === 'en' ? '80G Tax Receipt' : '80G ટેક્સ રસીદ'}
                      </p>
                      <p className="text-sm text-blue-600">
                        {language === 'en' 
                          ? 'Your 80G tax exemption receipt will be sent to your email within 24 hours.'
                          : 'તમારી 80G ટેક્સ મુક્તિ રસીદ 24 કલાકની અંદર તમારા ઈમેઈલ પર મોકલવામાં આવશે.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Impact message */}
              <div className="border-t border-stone-200 pt-6 mb-8">
                <p className="text-[#6B7280] text-sm">
                  <Heart className="w-4 h-4 inline text-[#8B1E1E] mr-1" />
                  {language === 'en' 
                    ? 'Your generosity helps provide shelter, care, and dignity to those in need.'
                    : 'તમારી ઉદારતા જરૂરિયાતમંદોને આશ્રય, સંભાળ અને ગૌરવ પ્રદાન કરવામાં મદદ કરે છે.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/" 
                  className="inline-flex items-center justify-center gap-2 bg-[#8B1E1E] hover:bg-[#701616] text-white px-8 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg"
                >
                  {language === 'en' ? 'Back to Home' : 'મુખ્ય પૃષ્ઠ પર પાછા'}
                </a>
                <button 
                  onClick={() => {
                    setSuccess(false);
                    setFormData({ ...formData, amount: 1001, customAmount: '' });
                  }}
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#8B1E1E] text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-white px-8 py-3 rounded-full font-medium transition-all duration-300"
                >
                  <Heart className="w-4 h-4" />
                  {language === 'en' ? 'Donate Again' : 'ફરીથી દાન કરો'}
                </button>
              </div>
            </div>

            {/* Share section */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#6B7280] mb-4">
                {language === 'en' ? 'Share your support and inspire others' : 'તમારો સપોર્ટ શેર કરો અને અન્યને પ્રેરિત કરો'}
              </p>
              <div className="flex justify-center gap-4">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(language === 'en' ? 'I just donated to Shivdhara Charitable to support people with disabilities. You can help too!' : 'મેં શિવધારા ચેરિટેબલને દાન આપ્યું. તમે પણ મદદ કરી શકો છો!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(language === 'en' ? 'I just donated to @ShivdharaCharity to support people with disabilities. Join me in making a difference!' : 'મેં શિવધારા ચેરિટેબલને દાન આપ્યું!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
      {/* Hero */}
      <section className="py-16 bg-[#F7F1E6]" data-testid="donate-hero">
        <div className="container-custom text-center">
          <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4 inline mr-1" />
            {language === 'en' ? 'Make a Difference' : 'ફરક લાવો'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
            {t(content.title) || (language === 'en' ? 'Support a Life of Dignity' : 'ગૌરવના જીવનને સપોર્ટ કરો')}
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            {t(content.subtitle) || (language === 'en' 
              ? 'Your donation provides shelter, care, nutrition, and medical support to individuals with intellectual disabilities who have no one else to care for them.'
              : 'તમારું દાન બૌદ્ધિક વિકલાંગતા ધરાવતી વ્યક્તિઓને આશ્રય, સંભાળ, પોષણ અને તબીબી સપોર્ટ પૂરું પાડે છે જેમની સંભાળ રાખવા માટે બીજું કોઈ નથી.')}
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="section bg-white" data-testid="donate-form">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Impact Info */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { icon: Utensils, text: language === 'en' ? '₹501 = Nutritious meals for 1 week' : '₹501 = 1 અઠવાડિયા માટે પૌષ્ટિક ભોજન' },
                { icon: Stethoscope, text: language === 'en' ? '₹1001 = Medical supplies & checkup' : '₹1001 = તબીબી પુરવઠો અને તપાસ' },
                { icon: Users, text: language === 'en' ? '₹2501 = Full month care for 1 resident' : '₹2501 = 1 નિવાસી માટે સંપૂર્ણ મહિનાની સંભાળ' }
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-[#F7F1E6] rounded-xl">
                  <item.icon className="w-8 h-8 text-[#8B1E1E] mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280]">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              {/* Step 1: Amount Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">
                  {language === 'en' ? '1. Select Amount' : '1. રકમ પસંદ કરો'}
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {donationAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      data-testid={`amount-${amount}`}
                      className={`donation-amount ${formData.amount === amount && !formData.customAmount ? 'selected' : ''}`}
                    >
                      ₹{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">₹</span>
                  <Input
                    type="number"
                    placeholder={language === 'en' ? 'Enter custom amount' : 'કસ્ટમ રકમ દાખલ કરો'}
                    value={formData.customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    className="pl-8 input-field"
                    data-testid="custom-amount"
                  />
                </div>
              </div>

              {/* Step 2: Donor Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">
                  {language === 'en' ? '2. Your Information' : '2. તમારી માહિતી'}
                </h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.name} *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      data-testid="donor-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.phone} *</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      data-testid="donor-phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.email} *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    data-testid="donor-email"
                  />
                </div>
              </div>

              {/* 80G Checkbox */}
              <div className="mb-8 p-4 bg-[#F7F1E6] rounded-xl">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="needs80g"
                    checked={formData.needs80g}
                    onCheckedChange={handle80gChange}
                    data-testid="needs-80g"
                  />
                  <label htmlFor="needs80g" className="text-sm text-[#1F2937] cursor-pointer">
                    <span className="font-medium">{ui.need_80g}</span>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {language === 'en' 
                        ? 'Get tax benefits under Section 80G of Income Tax Act'
                        : 'આવકવેરા કાયદાની કલમ 80G હેઠળ કર લાભો મેળવો'}
                    </p>
                  </label>
                </div>
              </div>

              {/* 80G Form Fields */}
              {formData.needs80g && (
                <div className="mb-8 p-6 border-2 border-dashed border-[#C9A24A] rounded-xl" data-testid="80g-form">
                  <h3 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#C9A24A]" />
                    {language === 'en' ? '80G Tax Exemption Details' : '80G કર મુક્તિ વિગતો'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">
                        {language === 'en' ? 'Full Name (as per PAN)' : 'પૂરું નામ (PAN પ્રમાણે)'} *
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="80g-fullname"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.pan_number} *</label>
                      <Input
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        placeholder="ABCDE1234F"
                        className="input-field uppercase"
                        data-testid="80g-pan"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.address} *</label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="80g-address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.city} *</label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="80g-city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.state} *</label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="80g-state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.country}</label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="80g-country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">{ui.zip_code} *</label>
                      <Input
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="input-field"
                        data-testid="80g-zip"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary & Pay Button */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg text-[#6B7280]">{ui.your_donation}:</span>
                  <span className="text-3xl font-bold text-[#8B1E1E]">₹{formData.amount.toLocaleString()}</span>
                </div>
                <Button
                  onClick={proceedToPayment}
                  disabled={loading}
                  data-testid="proceed-to-pay"
                  className="w-full py-6 text-lg rounded-xl bg-[#C9A24A] hover:bg-[#8B6914] text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {ui.loading}
                    </span>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      {ui.proceed_to_pay}
                    </>
                  )}
                </Button>
                <p className="text-xs text-[#6B7280] text-center mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4" />
                  {language === 'en' ? 'Secured by Razorpay. Your data is safe.' : 'Razorpay દ્વારા સુરક્ષિત. તમારો ડેટા સુરક્ષિત છે.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonatePage;
