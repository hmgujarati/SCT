import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_81b02de3-3cd6-4707-8173-e23f16017522/artifacts/zjn72wsr_Shivdhara%20Charitable.png';

const LoginPage = () => {
  const { language, ui } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error(language === 'en' ? 'Please fill all fields' : 'કૃપા કરીને બધા ફીલ્ડ ભરો');
      return;
    }

    if (!isLogin && !formData.name) {
      toast.error(language === 'en' ? 'Please enter your name' : 'કૃપા કરીને તમારું નામ દાખલ કરો');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success(language === 'en' ? 'Login successful!' : 'લોગિન સફળ!');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success(language === 'en' ? 'Registration successful!' : 'નોંધણી સફળ!');
      }
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || (language === 'en' ? 'Authentication failed' : 'પ્રમાણીકરણ નિષ્ફળ'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F7F1E6] flex items-center justify-center p-4 ${language === 'gu' ? 'font-gujarati' : ''}`}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8" data-testid="login-form">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Shivdhara Charitable" className="h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1F2937]">
              {isLogin 
                ? (language === 'en' ? 'Admin Login' : 'એડમિન લોગિન')
                : (language === 'en' ? 'Create Account' : 'એકાઉન્ટ બનાવો')}
            </h1>
            <p className="text-sm text-[#6B7280] mt-2">
              {language === 'en' ? 'Shivdhara Charitable' : 'શિવધારા ચેરીટેબલ'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  {ui.name}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={language === 'en' ? 'Enter your name' : 'તમારું નામ દાખલ કરો'}
                    className="pl-10 input-field"
                    data-testid="register-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                {ui.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={language === 'en' ? 'Enter your email' : 'તમારો ઈમેઈલ દાખલ કરો'}
                  className="pl-10 input-field"
                  data-testid="login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                {language === 'en' ? 'Password' : 'પાસવર્ડ'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={language === 'en' ? 'Enter your password' : 'તમારો પાસવર્ડ દાખલ કરો'}
                  className="pl-10 pr-10 input-field"
                  data-testid="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
              data-testid="login-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {ui.loading}
                </span>
              ) : (
                isLogin ? ui.login : (language === 'en' ? 'Register' : 'નોંધણી કરો')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#8B1E1E] hover:underline"
              data-testid="toggle-auth-mode"
            >
              {isLogin 
                ? (language === 'en' ? "Don't have an account? Register" : "એકાઉન્ટ નથી? નોંધણી કરો")
                : (language === 'en' ? 'Already have an account? Login' : 'પહેલેથી એકાઉન્ટ છે? લોગિન કરો')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#6B7280] hover:text-[#1F2937]">
              ← {language === 'en' ? 'Back to website' : 'વેબસાઈટ પર પાછા'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
