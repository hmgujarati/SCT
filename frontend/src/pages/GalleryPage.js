import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Play, Instagram } from 'lucide-react';
import SEO from '../components/SEO';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const GalleryPage = () => {
  const { language, t, ui } = useLanguage();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      // Filter only active albums
      setAlbums(response.data.filter(album => album.is_active));
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: { en: 'All', gu: 'બધા' } },
    { value: 'shelter', label: { en: 'Shelter & Care', gu: 'આશ્રય અને સંભાળ' } },
    { value: 'education', label: { en: 'Education', gu: 'શિક્ષણ' } },
    { value: 'health', label: { en: 'Health', gu: 'આરોગ્ય' } },
    { value: 'relief', label: { en: 'Relief', gu: 'રાહત' } },
    { value: 'nutrition', label: { en: 'Nutrition', gu: 'પોષણ' } },
    { value: 'rehabilitation', label: { en: 'Rehabilitation', gu: 'પુનર્વસન' } },
    { value: 'therapy', label: { en: 'Therapy', gu: 'થેરાપી' } },
    { value: 'community', label: { en: 'Community', gu: 'સમુદાય' } },
    { value: 'events', label: { en: 'Events', gu: 'ઇવેન્ટ્સ' } },
    { value: 'celebrations', label: { en: 'Celebrations', gu: 'ઉજવણી' } }
  ];

  const filteredAlbums = filter === 'all' ? albums : albums.filter(a => a.category === filter);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const openLightbox = (album, index) => {
    setSelectedAlbum(album);
    setLightboxIndex(index);
    setLightboxImage(album.images[index]);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setSelectedAlbum(null);
  };

  const navigateLightbox = (direction) => {
    if (!selectedAlbum) return;
    const newIndex = direction === 'next' 
      ? (lightboxIndex + 1) % selectedAlbum.images.length
      : (lightboxIndex - 1 + selectedAlbum.images.length) % selectedAlbum.images.length;
    setLightboxIndex(newIndex);
    setLightboxImage(selectedAlbum.images[newIndex]);
  };

  const getYouTubeEmbedUrl = (url) => {
    // Convert YouTube URL to embed URL
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getInstagramEmbedUrl = (url) => {
    // Extract Instagram post ID and create embed URL
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
    return match ? `https://www.instagram.com/p/${match[1]}/embed` : url;
  };

  const getMediaCount = (album) => {
    const images = album.images?.length || 0;
    const videos = album.videos?.length || 0;
    const embeds = album.embeds?.length || 0;
    return { images, videos, embeds, total: images + videos + embeds };
  };

  return (
    <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
      <SEO 
        title={language === 'en' ? 'Gallery' : 'ગેલેરી'}
        description={language === 'en' 
          ? 'View photos and videos of Shivdhara Charitable\'s work in disability care, education, health, and community service.'
          : 'વિકલાંગ સંભાળ, શિક્ષણ, આરોગ્ય અને સમુદાય સેવામાં શિવધારા ચેરીટેબલના કાર્યના ફોટા અને વિડિયો જુઓ.'}
        keywords="NGO gallery, disability care photos, charity work India, community service images"
        url="/gallery"
        language={language}
      />

      {/* Hero */}
      <section className="py-20 bg-[#F7F1E6]" data-testid="gallery-hero">
        <div className="container-custom text-center">
          <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-6">
            {language === 'en' ? 'Our Gallery' : 'અમારી ગેલેરી'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
            {language === 'en' ? 'Moments of Impact' : 'પ્રભાવના ક્ષણો'}
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Glimpses of our work across education, healthcare, and community service programs.'
              : 'શિક્ષણ, આરોગ્ય સેવા અને સમુદાય સેવા કાર્યક્રમોમાં અમારા કાર્યની ઝલક.'}
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-white border-b" data-testid="gallery-filter">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                data-testid={`filter-${cat.value}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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

      {/* Albums Grid */}
      <section className="section bg-white" data-testid="gallery-grid">
        <div className="container-custom">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-[#6B7280]">{ui.loading}</p>
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-[#E5E7EB] mx-auto mb-4" />
              <p className="text-[#6B7280]">
                {language === 'en' ? 'No albums found in this category.' : 'આ શ્રેણીમાં કોઈ આલ્બમ મળ્યો નથી.'}
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredAlbums.map((album) => {
                const counts = getMediaCount(album);
                return (
                  <div key={album.id} className="space-y-6" data-testid={`album-${album.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1F2937]">{t(album.title)}</h2>
                        <span className="text-sm text-[#C9A24A] capitalize">{album.category?.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                        {counts.images > 0 && <span>{counts.images} {language === 'en' ? 'photos' : 'ફોટા'}</span>}
                        {counts.videos > 0 && <span>{counts.videos} {language === 'en' ? 'videos' : 'વિડિયો'}</span>}
                      </div>
                    </div>

                    {/* Images Grid */}
                    {album.images?.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {album.images.map((image, idx) => (
                          <div 
                            key={image.id || idx}
                            className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                            onClick={() => openLightbox(album, idx)}
                          >
                            <img 
                              src={getImageUrl(image.url)}
                              alt={t(image.caption) || ''}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/400?text=Image'}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ImageIcon className="w-6 h-6 text-[#1F2937]" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Videos Section */}
                    {album.videos?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                          <Play className="w-5 h-5 text-[#8B1E1E]" />
                          {language === 'en' ? 'Videos' : 'વિડિયો'}
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {album.videos.map((video, idx) => (
                            <div key={video.id || idx} className="aspect-video rounded-xl overflow-hidden bg-black">
                              {video.type === 'upload' ? (
                                <video 
                                  src={getImageUrl(video.url)}
                                  controls
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <iframe
                                  src={getYouTubeEmbedUrl(video.url)}
                                  title={t(video.caption) || 'Video'}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instagram Embeds Section */}
                    {album.embeds?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                          <Instagram className="w-5 h-5 text-pink-600" />
                          {language === 'en' ? 'Instagram' : 'Instagram'}
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {album.embeds.map((embed, idx) => (
                            <div key={embed.id || idx} className="rounded-xl overflow-hidden bg-white border shadow-sm">
                              <iframe
                                src={getInstagramEmbedUrl(embed.url)}
                                title="Instagram Post"
                                className="w-full"
                                style={{ minHeight: '450px', border: 'none' }}
                                scrolling="no"
                                allowTransparency
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>
          
          {selectedAlbum?.images?.length > 1 && (
            <>
              <button 
                className="absolute left-4 text-white/80 hover:text-white p-2"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button 
                className="absolute right-4 text-white/80 hover:text-white p-2"
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}
          
          <div className="max-w-5xl max-h-[85vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getImageUrl(lightboxImage.url)}
              alt={t(lightboxImage.caption) || ''}
              className="max-w-full max-h-[75vh] object-contain mx-auto"
            />
            {(lightboxImage.caption?.en || lightboxImage.caption?.gu) && (
              <p className="text-white/80 text-center mt-4 text-lg">
                {t(lightboxImage.caption)}
              </p>
            )}
            <p className="text-white/50 text-center mt-2 text-sm">
              {lightboxIndex + 1} / {selectedAlbum?.images?.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
