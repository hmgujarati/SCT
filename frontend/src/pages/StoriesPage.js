import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Quote, MapPin, ArrowRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StoriesPage = () => {
  const { language, t, ui } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API}/stories`);
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: { en: 'All Stories', gu: 'બધી વાર્તાઓ' } },
    { value: 'education', label: { en: 'Education', gu: 'શિક્ષણ' } },
    { value: 'health', label: { en: 'Health', gu: 'આરોગ્ય' } },
    { value: 'relief', label: { en: 'Relief', gu: 'રાહત' } }
  ];

  const filteredStories = filter === 'all' ? stories : stories.filter(s => s.category === filter);

  return (
    <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
      {/* Hero */}
      <section className="py-20 bg-[#F7F1E6]" data-testid="stories-hero">
        <div className="container-custom text-center">
          <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-6">
            {language === 'en' ? 'Lives Transformed' : 'બદલાયેલા જીવન'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
            {language === 'en' ? 'Success Stories' : 'સફળતાની વાર્તાઓ'}
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Real stories of hope, transformation, and the power of compassion. Each story represents a life changed through your generosity.'
              : 'આશા, પરિવર્તન અને કરુણાની શક્તિની સાચી વાર્તાઓ. દરેક વાર્તા તમારી ઉદારતા દ્વારા બદલાયેલા જીવનનું પ્રતિનિધિત્વ કરે છે.'}
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-white border-b" data-testid="stories-filter">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                data-testid={`filter-${cat.value}`}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === cat.value
                    ? 'bg-[#8B1E1E] text-white'
                    : 'bg-[#F7F1E6] text-[#1F2937] hover:bg-[#EFE5D5]'
                }`}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="section bg-white" data-testid="stories-list">
        <div className="container-custom">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-[#6B7280]">{ui.loading}</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7280]">
                {language === 'en' ? 'No stories found in this category.' : 'આ શ્રેણીમાં કોઈ વાર્તા મળી નથી.'}
              </p>
            </div>
          ) : (
            <div className="space-y-24">
              {filteredStories.map((story, index) => (
                <article
                  key={story.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
                  data-testid={`story-${story.id}`}
                >
                  {/* Image */}
                  <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src={story.image_url}
                        alt={t(story.title)}
                        className="w-full h-[400px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <span className="absolute bottom-4 left-4 px-4 py-2 bg-[#C9A24A] text-white text-sm font-medium rounded-full capitalize">
                        {story.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                    <h2 className="text-3xl font-bold text-[#1F2937] mb-4">{t(story.title)}</h2>
                    
                    <div className="flex items-center gap-4 mb-6 text-sm text-[#6B7280]">
                      <span className="font-medium text-[#8B1E1E]">{t(story.person_name)}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {t(story.location)}
                      </span>
                    </div>

                    {/* Problem */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-[#8B1E1E] mb-2 uppercase tracking-wide">
                        {language === 'en' ? 'The Challenge' : 'પડકાર'}
                      </h3>
                      <p className="text-[#6B7280] leading-relaxed">{t(story.problem)}</p>
                    </div>

                    {/* Help Provided */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-[#C9A24A] mb-2 uppercase tracking-wide">
                        {language === 'en' ? 'How We Helped' : 'અમે કેવી રીતે મદદ કરી'}
                      </h3>
                      <p className="text-[#6B7280] leading-relaxed">{t(story.help_provided)}</p>
                    </div>

                    {/* Impact */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">
                        {language === 'en' ? 'The Impact' : 'અસર'}
                      </h3>
                      <p className="text-[#6B7280] leading-relaxed">{t(story.impact)}</p>
                    </div>

                    {/* Quote */}
                    {story.quote && (
                      <div className="bg-[#F7F1E6] rounded-xl p-6 relative">
                        <Quote className="absolute top-4 left-4 w-8 h-8 text-[#8B1E1E]/20" />
                        <p className="text-[#1F2937] italic pl-8 leading-relaxed">"{t(story.quote)}"</p>
                        <p className="text-[#8B1E1E] font-medium mt-3 pl-8">— {t(story.person_name)}</p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#8B1E1E]" data-testid="stories-cta">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === 'en' ? 'Be Part of the Next Story' : 'આગલી વાર્તાનો ભાગ બનો'}
          </h2>
          <p className="text-[#F7F1E6]/80 max-w-2xl mx-auto mb-8">
            {language === 'en' 
              ? 'Your donation can help write the next success story. Every contribution makes a difference.'
              : 'તમારું દાન આગલી સફળતાની વાર્તા લખવામાં મદદ કરી શકે છે. દરેક યોગદાન ફરક પાડે છે.'}
          </p>
          <a href="/donate" className="inline-flex items-center btn-gold" data-testid="stories-donate-btn">
            {ui.donate_now}
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;
