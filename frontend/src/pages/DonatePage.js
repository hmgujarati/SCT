import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Heart, Check, Shield, Users, Stethoscope, Utensils, Home } from 'lucide-react';

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
            setSuccess(true);
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
      <div className={`pt-24 min-h-screen bg-[#F7F1E6] ${language === 'gu' ? 'font-gujarati' : ''}`}>
        <div className="container-custom py-20">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F2937] mb-4">{ui.thank_you}</h1>
            <p className="text-[#6B7280] mb-8">{ui.donation_success}</p>
            <p className="text-2xl font-bold text-[#8B1E1E] mb-8">₹{formData.amount.toLocaleString()}</p>
            {formData.needs80g && (
              <p className="text-sm text-[#6B7280] mb-8">
                {language === 'en' 
                  ? 'Your 80G receipt will be sent to your email shortly.'
                  : 'તમારી 80G રસીદ ટૂંક સમયમાં તમારા ઈમેઈલ પર મોકલવામાં આવશે.'}
              </p>
            )}
            <a href="/" className="btn-primary inline-block">
              {language === 'en' ? 'Back to Home' : 'મુખ્ય પૃષ્ઠ પર પાછા'}
            </a>
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
                  className="w-full py-6 text-lg rounded-xl bg-[#C9A24A] hover:bg-[#A58230] text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
