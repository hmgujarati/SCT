import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Target, Eye, Heart, Shield, Users, Award, HandHeart, Clock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AboutPage = () => {
  const { language, t, ui } = useLanguage();
  const [content, setContent] = useState({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content/about`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const values = [
    {
      icon: Heart,
      title: { en: 'Compassion', gu: 'કરુણા' },
      description: { en: 'Every resident is treated with unconditional love, kindness, and empathy — as a valued member of our family.', gu: 'દરેક નિવાસી સાથે બિનશરતી પ્રેમ, દયા અને સહાનુભૂતિ સાથે વર્તન કરવામાં આવે છે — અમારા પરિવારના મૂલ્યવાન સભ્ય તરીકે.' }
    },
    {
      icon: Shield,
      title: { en: 'Dignity', gu: 'ગૌરવ' },
      description: { en: 'We uphold the inherent dignity of every individual, regardless of their abilities or disabilities.', gu: 'અમે દરેક વ્યક્તિના સહજ ગૌરવને જાળવી રાખીએ છીએ, તેમની ક્ષમતાઓ અથવા અક્ષમતાઓને ધ્યાનમાં લીધા વિના.' }
    },
    {
      icon: Clock,
      title: { en: 'Commitment', gu: 'પ્રતિબદ્ધતા' },
      description: { en: 'Lifelong care means we are here for our residents for as long as they need us — no one is ever abandoned.', gu: 'આજીવન સંભાળનો અર્થ છે કે અમે અમારા નિવાસીઓ માટે જ્યાં સુધી તેમને જરૂર હોય ત્યાં સુધી અહીં છીએ — કોઈને ક્યારેય ત્યજી દેવામાં આવતું નથી.' }
    },
    {
      icon: HandHeart,
      title: { en: 'Excellence in Care', gu: 'સંભાળમાં શ્રેષ્ઠતા' },
      description: { en: 'Professional, trained caregivers provide the highest standard of care with attention to individual needs.', gu: 'વ્યાવસાયિક, પ્રશિક્ષિત સંભાળ રાખનારાઓ વ્યક્તિગત જરૂરિયાતો પર ધ્યાન આપીને સંભાળનું ઉચ્ચતમ ધોરણ પ્રદાન કરે છે.' }
    }
  ];

  return (
    <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
      {/* Hero Section */}
      <section className="py-20 bg-[#F7F1E6]" data-testid="about-hero">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-6">
              {language === 'en' ? 'About Us' : 'અમારા વિશે'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
              {t(content.title) || (language === 'en' ? 'About Shivdhara Charitable' : 'શિવધારા ચેરીટેબલ વિશે')}
            </h1>
            <p className="text-lg text-[#6B7280] leading-relaxed">
              {t(content.intro) || (language === 'en' 
                ? 'Shivdhara Charitable was established with a sacred mission to serve humanity through selfless action. Inspired by the eternal flow of Lord Shiva\'s grace, we believe that true worship lies in serving those in need.'
                : 'શિવધારા ચેરીટેબલની સ્થાપના નિઃસ્વાર્થ સેવા દ્વારા માનવતાની સેવા કરવાના પવિત્ર મિશન સાથે કરવામાં આવી હતી. ભગવાન શિવની કૃપાના શાશ્વત પ્રવાહથી પ્રેરિત, અમે માનીએ છીએ કે સાચી પૂજા જરૂરિયાતમંદોની સેવામાં છે.')}
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section bg-white" data-testid="vision-mission">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Vision */}
            <div className="card-elevated border-l-4 border-[#8B1E1E]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#8B1E1E]/10 rounded-xl flex items-center justify-center">
                  <Eye className="w-7 h-7 text-[#8B1E1E]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  {t(content.vision_title) || (language === 'en' ? 'Our Vision' : 'અમારું વિઝન')}
                </h2>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                {t(content.vision) || (language === 'en' 
                  ? 'To create a society where every individual has access to quality education, healthcare, and basic necessities, regardless of their economic background. We envision a world where compassion drives action and service to humanity becomes a way of life.'
                  : 'એક એવો સમાજ બનાવવો જ્યાં દરેક વ્યક્તિને તેમની આર્થિક પૃષ્ઠભૂમિને ધ્યાનમાં લીધા વિના ગુણવત્તાયુક્ત શિક્ષણ, આરોગ્ય સેવા અને મૂળભૂત જરૂરિયાતો મળી રહે. અમે એક એવી દુનિયાની કલ્પના કરીએ છીએ જ્યાં કરુણા ક્રિયાને પ્રેરિત કરે અને માનવતાની સેવા જીવનનો માર્ગ બને.')}
              </p>
            </div>

            {/* Mission */}
            <div className="card-elevated border-l-4 border-[#C9A24A]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#C9A24A]/10 rounded-xl flex items-center justify-center">
                  <Target className="w-7 h-7 text-[#C9A24A]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  {t(content.mission_title) || (language === 'en' ? 'Our Mission' : 'અમારું મિશન')}
                </h2>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                {t(content.mission) || (language === 'en' 
                  ? 'To provide educational support to underprivileged children, organize free medical camps in rural areas, distribute food and essentials during emergencies, and empower communities through sustainable development initiatives. We are committed to transparent operations and accountable stewardship of every donation.'
                  : 'વંચિત બાળકોને શૈક્ષણિક સહાય પૂરી પાડવી, ગ્રામીણ વિસ્તારોમાં મફત તબીબી શિબિરોનું આયોજન કરવું, કટોકટી દરમિયાન ખોરાક અને આવશ્યક ચીજો વિતરણ કરવી, અને ટકાઉ વિકાસ પહેલ દ્વારા સમુદાયોને સશક્ત બનાવવા.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section bg-[#F7F1E6]" data-testid="values-section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white text-[#8B1E1E] rounded-full text-sm font-medium mb-4">
              {language === 'en' ? 'What We Stand For' : 'અમે શેના માટે ઊભા છીએ'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937]">
              {t(content.values_title) || (language === 'en' ? 'Our Values' : 'અમારા મૂલ્યો')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-300" data-testid={`value-card-${index}`}>
                <div className="w-16 h-16 bg-[#8B1E1E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-[#8B1E1E]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-3">{t(value.title)}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{t(value.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Leadership (optional placeholder) */}
      <section className="section bg-white" data-testid="credibility-section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F1E6] rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-6 text-center">
                {language === 'en' ? 'Registered & Compliant' : 'નોંધાયેલ અને અનુપાલન'}
              </h2>
              <p className="text-[#6B7280] text-center mb-8">
                {language === 'en' 
                  ? 'Shivdhara Charitable is duly registered under the applicable laws and maintains full compliance with all regulatory requirements.'
                  : 'શિવધારા ચેરીટેબલ લાગુ કાયદાઓ હેઠળ યોગ્ય રીતે નોંધાયેલ છે અને તમામ નિયમનકારી આવશ્યકતાઓ સાથે સંપૂર્ણ અનુપાલન જાળવે છે.'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: '80G', desc: language === 'en' ? 'Tax Exemption' : 'કર મુક્તિ' },
                  { label: '12A', desc: language === 'en' ? 'Registration' : 'નોંધણી' },
                  { label: 'CSR', desc: language === 'en' ? 'Compliant' : 'અનુપાલન' },
                  { label: 'FCRA', desc: language === 'en' ? 'Registered' : 'નોંધાયેલ' },
                  { label: 'Darpan', desc: language === 'en' ? 'NGO ID' : 'NGO આઈડી' },
                  { label: 'PAN', desc: language === 'en' ? 'Verified' : 'ચકાસેલ' }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-[#8B1E1E]">{item.label}</p>
                    <p className="text-xs text-[#6B7280]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
