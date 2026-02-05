import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowRight, Heart, Home, Droplets, Stethoscope, Utensils, HeartHandshake, Shield, ShieldCheck, FileCheck, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const { language, t, ui } = useLanguage();
  const [content, setContent] = useState({});
  const [settings, setSettings] = useState(null);
  const [stories, setStories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, settingsRes, storiesRes, postsRes] = await Promise.all([
        axios.get(`${API}/content/home`),
        axios.get(`${API}/settings`),
        axios.get(`${API}/stories`),
        axios.get(`${API}/blog?limit=3`)
      ]);
      setContent(contentRes.data);
      setSettings(settingsRes.data);
      setStories(storiesRes.data.slice(0, 3));
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const programs = [
    {
      icon: Home,
      title: { en: 'Shelter & Housing', gu: 'આશ્રય અને રહેઠાણ' },
      description: { 
        en: 'Safe, clean, and comfortable living spaces providing permanent homes for individuals with intellectual disabilities who have nowhere else to go.', 
        gu: 'બૌદ્ધિક વિકલાંગતા ધરાવતી વ્યક્તિઓ માટે સુરક્ષિત, સ્વચ્છ અને આરામદાયક રહેવાની જગ્યાઓ જેમની પાસે બીજે ક્યાંય જવાનું નથી.' 
      },
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Droplets,
      title: { en: 'Hygiene & Daily Care', gu: 'સ્વચ્છતા અને દૈનિક સંભાળ' },
      description: { 
        en: 'Assistance with bathing, grooming, dressing, and personal hygiene — ensuring every resident maintains their dignity and cleanliness.', 
        gu: 'સ્નાન, ગ્રૂમિંગ, કપડાં પહેરવા અને વ્યક્તિગત સ્વચ્છતામાં સહાય — દરેક નિવાસી તેમનું ગૌરવ અને સ્વચ્છતા જાળવે તેની ખાતરી કરવી.' 
      },
      color: 'bg-cyan-50 text-cyan-600'
    },
    {
      icon: Stethoscope,
      title: { en: 'Medical Care', gu: 'તબીબી સંભાળ' },
      description: { 
        en: 'Regular health checkups, medication management, psychiatric consultations, and emergency medical care available round the clock.', 
        gu: 'નિયમિત આરોગ્ય તપાસ, દવા વ્યવસ્થાપન, માનસિક પરામર્શ અને ચોવીસ કલાક ઉપલબ્ધ કટોકટી તબીબી સંભાળ.' 
      },
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Utensils,
      title: { en: 'Nutrition', gu: 'પોષણ' },
      description: { 
        en: 'Three nutritious meals daily plus snacks, prepared fresh with attention to individual dietary needs and medical requirements.', 
        gu: 'દરરોજ ત્રણ પૌષ્ટિક ભોજન વત્તા નાસ્તો, વ્યક્તિગત આહારની જરૂરિયાતો અને તબીબી આવશ્યકતાઓ પર ધ્યાન આપીને તાજા તૈયાર કરવામાં આવે છે.' 
      },
      color: 'bg-orange-50 text-orange-600'
    },
    {
      icon: HeartHandshake,
      title: { en: 'Emotional Support', gu: 'ભાવનાત્મક સહાય' },
      description: { 
        en: 'Compassionate caregivers provide companionship, emotional comfort, and a loving environment where every resident feels valued.', 
        gu: 'કરુણાશીલ સંભાળ રાખનારાઓ સાથીપણું, ભાવનાત્મક આરામ અને પ્રેમાળ વાતાવરણ પ્રદાન કરે છે જ્યાં દરેક નિવાસી મૂલ્યવાન અનુભવે.' 
      },
      color: 'bg-pink-50 text-pink-600'
    },
    {
      icon: Shield,
      title: { en: 'Safety & Security', gu: 'સલામતી અને સુરક્ષા' },
      description: { 
        en: '24/7 supervision and care ensuring residents are safe, protected, and never alone in times of need.', 
        gu: 'ચોવીસ કલાક દેખરેખ અને સંભાળ ખાતરી કરે છે કે નિવાસીઓ સુરક્ષિત, સંરક્ષિત છે અને જરૂરિયાતના સમયે ક્યારેય એકલા નથી.' 
      },
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const impactStats = settings?.impact_stats || {
    families_helped: 150,
    education_drives: 12,
    medical_camps: 365,
    years_of_service: 10
  };

  return (
    <div className={`${language === 'gu' ? 'font-gujarati' : ''}`}>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-[#F7F1E6] overflow-hidden" data-testid="hero-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-50"></div>
        
        {/* Content */}
        <div className="container-custom relative z-10 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-6">
                {language === 'en' ? '🙏 Manav Mandir' : '🙏 માનવ મંદિર'}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] leading-tight mb-6">
                {t(content.hero_title) || (language === 'en' ? 'A Home of Dignity and Care' : 'ગૌરવ અને સંભાળનું ઘર')}
              </h1>
              <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed mb-8 max-w-xl">
                {t(content.hero_subtitle) || (language === 'en' 
                  ? 'Providing lifelong compassionate care, shelter, and support to individuals with intellectual disabilities. Every person deserves to live with dignity.'
                  : 'બૌદ્ધિક વિકલાંગતા ધરાવતી વ્યક્તિઓને આજીવન કરુણામય સંભાળ, આશ્રય અને સહાય પૂરી પાડવી. દરેક વ્યક્તિ ગૌરવ સાથે જીવવાને લાયક છે.')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/donate" data-testid="hero-donate-btn">
                  <Button className="btn-gold text-lg px-8 py-4">
                    <Heart className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Support Our Residents' : 'અમારા નિવાસીઓને સહાય કરો'}
                  </Button>
                </Link>
                <Link to="/about" data-testid="hero-learn-more-btn">
                  <Button variant="outline" className="btn-outline text-lg px-8 py-4">
                    {ui.learn_more}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1659451336016-00d62d32f677?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                  alt="Children in education program"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#8B1E1E]/30 to-transparent"></div>
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#8B1E1E]/10 rounded-full flex items-center justify-center">
                    <Heart className="w-7 h-7 text-[#8B1E1E]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#8B1E1E]">{impactStats.families_helped?.toLocaleString()}+</p>
                    <p className="text-sm text-[#6B7280]">{ui.families_helped}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="py-16 bg-[#8B1E1E]" data-testid="impact-section">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: impactStats.families_helped, label: ui.families_helped, suffix: '+' },
              { value: impactStats.education_drives, label: ui.education_drives, suffix: '+' },
              { value: impactStats.medical_camps, label: ui.medical_camps, suffix: '+' },
              { value: impactStats.years_of_service, label: ui.years_of_service, suffix: '' }
            ].map((stat, index) => (
              <div key={index} className="text-center" data-testid={`impact-stat-${index}`}>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value?.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-[#F7F1E6]/80 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section bg-white" data-testid="programs-section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-4">
              {language === 'en' ? 'Our Work' : 'અમારું કાર્ય'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              {t(content.programs_title) || (language === 'en' ? 'Our Programs' : 'અમારા કાર્યક્રમો')}
            </h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              {language === 'en' 
                ? 'We provide comprehensive residential care for individuals with intellectual disabilities, ensuring every aspect of their well-being is addressed.'
                : 'અમે બૌદ્ધિક વિકલાંગતા ધરાવતી વ્યક્તિઓ માટે વ્યાપક રહેણાંક સંભાળ પૂરી પાડીએ છીએ, તેમની સુખાકારીના દરેક પાસાને સંબોધિત કરવામાં આવે તેની ખાતરી કરીએ છીએ.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <div
                key={index}
                className="card group hover:-translate-y-2 transition-all duration-300"
                data-testid={`program-card-${index}`}
              >
                <div className={`w-14 h-14 ${program.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <program.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-3">{t(program.title)}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{t(program.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      {stories.length > 0 && (
        <section className="section bg-[#F7F1E6]" data-testid="stories-section">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-white text-[#8B1E1E] rounded-full text-sm font-medium mb-4">
                {language === 'en' ? 'Lives Changed' : 'બદલાયેલા જીવન'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
                {language === 'en' ? 'Success Stories' : 'સફળતાની વાર્તાઓ'}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {stories.map((story, index) => (
                <div key={story.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" data-testid={`story-card-${index}`}>
                  <div className="relative h-48">
                    <img src={story.image_url} alt={t(story.title)} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className="absolute bottom-4 left-4 px-3 py-1 bg-[#C9A24A] text-white text-xs font-medium rounded-full capitalize">
                      {story.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-2">{t(story.title)}</h3>
                    <p className="text-[#6B7280] text-sm mb-4 line-clamp-3">{t(story.problem)}</p>
                    <Link to="/stories" className="inline-flex items-center text-[#8B1E1E] font-medium text-sm hover:gap-2 transition-all">
                      {ui.read_more} <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/stories" data-testid="view-all-stories-btn">
                <Button className="btn-outline">
                  {language === 'en' ? 'View All Stories' : 'બધી વાર્તાઓ જુઓ'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Transparency Section */}
      <section className="section bg-white" data-testid="transparency-section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-4">
                {language === 'en' ? 'Trust & Accountability' : 'વિશ્વાસ અને જવાબદારી'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">
                {t(content.transparency_title) || (language === 'en' ? 'Transparency & Trust' : 'પારદર્શકતા અને વિશ્વાસ')}
              </h2>
              <p className="text-[#6B7280] leading-relaxed mb-8">
                {t(content.transparency_text) || (language === 'en' 
                  ? 'Every rupee you donate is accounted for. We maintain complete transparency in our operations and publish annual reports detailing how your contributions are utilized. Our books are audited by certified accountants and we are registered under 80G, 12A, and CSR Act.'
                  : 'તમે દાન કરેલ દરેક રૂપિયો હિસાબમાં લેવામાં આવે છે. અમે અમારી કામગીરીમાં સંપૂર્ણ પારદર્શિતા જાળવીએ છીએ અને તમારા યોગદાનનો કેવી રીતે ઉપયોગ થાય છે તેની વિગતો આપતા વાર્ષિક અહેવાલો પ્રકાશિત કરીએ છીએ.')}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: language === 'en' ? '80G Certified' : '80G પ્રમાણિત' },
                  { icon: FileCheck, label: language === 'en' ? '12A Registered' : '12A નોંધાયેલ' },
                  { icon: ShieldCheck, label: language === 'en' ? 'CSR Compliant' : 'CSR અનુપાલન' },
                  { icon: FileCheck, label: language === 'en' ? 'Audited Accounts' : 'ઓડિટ થયેલ હિસાબો' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-[#F7F1E6] rounded-lg">
                    <item.icon className="w-5 h-5 text-[#8B1E1E]" />
                    <span className="text-sm font-medium text-[#1F2937]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/7904406/pexels-photo-7904406.jpeg"
                alt="Medical camp"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {posts.length > 0 && (
        <section className="section bg-[#F7F1E6]" data-testid="blog-section">
          <div className="container-custom">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-white text-[#8B1E1E] rounded-full text-sm font-medium mb-4">
                {language === 'en' ? 'Latest Updates' : 'તાજા સમાચાર'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
                {language === 'en' ? 'From Our Blog' : 'અમારા બ્લોગમાંથી'}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card group" data-testid={`blog-card-${index}`}>
                  <div className="relative overflow-hidden">
                    <img src={post.cover_image} alt={t(post.title)} className="blog-card-image group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-[#F7F1E6] text-[#8B1E1E] text-xs font-medium rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-2 group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                      {t(post.title)}
                    </h3>
                    <p className="text-[#6B7280] text-sm line-clamp-2">{t(post.excerpt)}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/blog" data-testid="view-all-posts-btn">
                <Button className="btn-outline">
                  {language === 'en' ? 'View All Posts' : 'બધી પોસ્ટ જુઓ'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-[#8B1E1E] relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t(content.cta_title) || (language === 'en' ? 'Join Our Mission Today' : 'આજે અમારા મિશનમાં જોડાઓ')}
          </h2>
          <p className="text-[#F7F1E6]/80 text-lg max-w-2xl mx-auto mb-10">
            {t(content.cta_text) || (language === 'en' 
              ? 'Your monthly donation ensures sustained support for families in need. Together, we can build a more compassionate society.'
              : 'તમારું માસિક દાન જરૂરિયાતમંદ પરિવારોને સતત સહાયની ખાતરી આપે છે. સાથે મળીને, આપણે વધુ કરુણામય સમાજ બનાવી શકીએ છીએ.')}
          </p>
          <Link to="/donate" data-testid="cta-donate-btn">
            <Button className="bg-[#C9A24A] hover:bg-[#B8923B] text-white text-lg px-10 py-5 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <Heart className="w-5 h-5 mr-2" />
              {ui.donate_now}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
