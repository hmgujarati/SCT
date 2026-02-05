import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
      setAlbums(response.data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: { en: 'All', gu: 'બધા' } },
    { value: 'education', label: { en: 'Education', gu: 'શિક્ષણ' } },
    { value: 'health', label: { en: 'Health', gu: 'આરોગ્ય' } },
    { value: 'relief', label: { en: 'Relief', gu: 'રાહત' } },
    { value: 'community', label: { en: 'Community', gu: 'સમુદાય' } }
  ];

  const filteredAlbums = filter === 'all' ? albums : albums.filter(a => a.category === filter);

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

  return (
    <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
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
              {filteredAlbums.map((album) => (
                <div key={album.id} className="space-y-6" data-testid={`album-${album.id}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1F2937]">{t(album.title)}</h2>
                      <span className="text-sm text-[#C9A24A] capitalize">{album.category}</span>
                    </div>
                    <span className="text-sm text-[#6B7280]">
                      {album.images?.length || 0} {language === 'en' ? 'photos' : 'ફોટા'}
                    </span>
                  </div>
                  
                  <div className="gallery-grid">
                    {album.images?.map((image, index) => (
                      <div
                        key={image.id}
                        className="gallery-item"
                        onClick={() => openLightbox(album, index)}
                        data-testid={`gallery-image-${album.id}-${index}`}
                      >
                        <img src={image.url} alt={t(image.caption)} loading="lazy" />
                        <div className="gallery-overlay">
                          <p className="text-white text-sm">{t(image.caption)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" data-testid="lightbox">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:text-[#C9A24A] transition-colors"
            data-testid="lightbox-close"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={() => navigateLightbox('prev')}
            className="absolute left-4 p-2 text-white hover:text-[#C9A24A] transition-colors"
            data-testid="lightbox-prev"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          
          <button
            onClick={() => navigateLightbox('next')}
            className="absolute right-4 p-2 text-white hover:text-[#C9A24A] transition-colors"
            data-testid="lightbox-next"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          
          <div className="max-w-5xl max-h-[80vh] px-16">
            <img
              src={lightboxImage.url}
              alt={t(lightboxImage.caption)}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
            />
            <p className="text-white text-center mt-4">{t(lightboxImage.caption)}</p>
            <p className="text-[#6B7280] text-center text-sm mt-2">
              {lightboxIndex + 1} / {selectedAlbum?.images?.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
