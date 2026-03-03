import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Image, Plus, Trash2, Edit, X, Save, Upload, Loader2, Video, Instagram, Link as LinkIcon } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const GalleryForm = ({ album, onSave, onCancel, language }) => {
  // Initialize form data from album prop
  const getInitialData = () => ({
    title: album?.title || { en: '', gu: '' },
    category: album?.category || 'shelter',
    images: album?.images || [],
    videos: album?.videos || [],
    embeds: album?.embeds || [],
    is_active: album?.is_active ?? true
  });

  const [formData, setFormData] = useState(getInitialData);
  const [newImageCaption, setNewImageCaption] = useState({ en: '', gu: '' });
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoCaption, setNewVideoCaption] = useState({ en: '', gu: '' });
  const [newEmbedUrl, setNewEmbedUrl] = useState('');
  const [newEmbedType, setNewEmbedType] = useState('instagram');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Reset form when album changes
  useEffect(() => {
    setFormData(getInitialData());
  }, [album?.id]);

  const categories = [
    { id: 'shelter', label: language === 'en' ? 'Shelter & Care' : 'આશ્રય અને સંભાળ' },
    { id: 'education', label: language === 'en' ? 'Education' : 'શિક્ષણ' },
    { id: 'health', label: language === 'en' ? 'Health & Medical' : 'આરોગ્ય અને તબીબી' },
    { id: 'relief', label: language === 'en' ? 'Relief Work' : 'રાહત કાર્ય' },
    { id: 'nutrition', label: language === 'en' ? 'Nutrition' : 'પોષણ' },
    { id: 'rehabilitation', label: language === 'en' ? 'Rehabilitation' : 'પુનર્વસન' },
    { id: 'therapy', label: language === 'en' ? 'Therapy' : 'થેરાપી' },
    { id: 'community', label: language === 'en' ? 'Community' : 'સમુદાય' },
    { id: 'facility', label: language === 'en' ? 'Facility' : 'સુવિધા' },
    { id: 'events', label: language === 'en' ? 'Events' : 'ઇવેન્ટ્સ' },
    { id: 'activities', label: language === 'en' ? 'Activities' : 'પ્રવૃત્તિઓ' },
    { id: 'celebrations', label: language === 'en' ? 'Celebrations' : 'ઉજવણી' }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach(file => formDataUpload.append('files', file));
      
      const token = localStorage.getItem('shivdhara_token');
      
      const response = await axios.post(`${API}/upload/multiple`, formDataUpload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const newImages = response.data.uploaded.map((img, idx) => ({
        id: Date.now().toString() + idx,
        url: img.url,
        caption: { ...newImageCaption },
        order: formData.images.length + idx
      }));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      setNewImageCaption({ en: '', gu: '' });
      toast.success(language === 'en' ? `${files.length} image(s) uploaded!` : `${files.length} ફોટો અપલોડ થયા!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'en' ? 'Upload failed' : 'અપલોડ નિષ્ફળ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(language === 'en' ? 'Video file too large (max 50MB)' : 'વિડિયો ફાઇલ ખૂબ મોટી છે (મહત્તમ 50MB)');
        return;
      }
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach(file => formDataUpload.append('files', file));
      
      const token = localStorage.getItem('shivdhara_token');
      
      const response = await axios.post(`${API}/upload/multiple`, formDataUpload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const newVideos = response.data.uploaded.map((vid, idx) => ({
        id: Date.now().toString() + idx,
        url: vid.url,
        caption: { ...newVideoCaption },
        type: 'upload'
      }));
      
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...newVideos]
      }));
      setNewVideoCaption({ en: '', gu: '' });
      toast.success(language === 'en' ? `${files.length} video(s) uploaded!` : `${files.length} વિડિયો અપલોડ થયા!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'en' ? 'Upload failed' : 'અપલોડ નિષ્ફળ');
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const addVideoUrl = () => {
    if (!newVideoUrl.trim()) {
      toast.error(language === 'en' ? 'Enter a video URL' : 'વિડિયો URL દાખલ કરો');
      return;
    }

    const newVideo = {
      id: Date.now().toString(),
      url: newVideoUrl,
      caption: { ...newVideoCaption },
      type: 'url'
    };

    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo]
    }));
    setNewVideoUrl('');
    setNewVideoCaption({ en: '', gu: '' });
    toast.success(language === 'en' ? 'Video added!' : 'વિડિયો ઉમેર્યો!');
  };

  const addEmbed = () => {
    if (!newEmbedUrl.trim()) {
      toast.error(language === 'en' ? 'Enter an embed URL' : 'એમ્બેડ URL દાખલ કરો');
      return;
    }

    // Validate Instagram URL
    if (newEmbedType === 'instagram' && !newEmbedUrl.includes('instagram.com')) {
      toast.error(language === 'en' ? 'Enter a valid Instagram URL' : 'માન્ય Instagram URL દાખલ કરો');
      return;
    }

    const newEmbed = {
      id: Date.now().toString(),
      url: newEmbedUrl,
      type: newEmbedType
    };

    setFormData(prev => ({
      ...prev,
      embeds: [...prev.embeds, newEmbed]
    }));
    setNewEmbedUrl('');
    toast.success(language === 'en' ? 'Embed added!' : 'એમ્બેડ ઉમેર્યો!');
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img.id !== imageId) }));
  };

  const removeVideo = (videoId) => {
    setFormData(prev => ({ ...prev, videos: prev.videos.filter(vid => vid.id !== videoId) }));
  };

  const removeEmbed = (embedId) => {
    setFormData(prev => ({ ...prev, embeds: prev.embeds.filter(emb => emb.id !== embedId) }));
  };

  const handleSubmit = async () => {
    if (!formData.title.en) {
      toast.error(language === 'en' ? 'Title is required' : 'શીર્ષક જરૂરી છે');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const getInstagramEmbedId = (url) => {
    // Extract Instagram post/reel ID from URL
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-[#1F2937]">
          {album ? (language === 'en' ? 'Edit Album' : 'આલ્બમ સંપાદન') : (language === 'en' ? 'New Album' : 'નવું આલ્બમ')}
        </h3>
        <Button onClick={onCancel} variant="ghost" size="sm"><X className="w-4 h-4" /></Button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{language === 'en' ? 'Title (English)' : 'શીર્ષક (English)'}</label>
            <Input value={formData.title.en} onChange={(e) => setFormData(prev => ({ ...prev, title: { ...prev.title, en: e.target.value } }))} placeholder="Album Title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{language === 'en' ? 'Title (Gujarati)' : 'શીર્ષક (ગુજરાતી)'}</label>
            <Input value={formData.title.gu} onChange={(e) => setFormData(prev => ({ ...prev, title: { ...prev.title, gu: e.target.value } }))} placeholder="આલ્બમ શીર્ષક" className="font-gujarati" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{language === 'en' ? 'Category' : 'શ્રેણી'}</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_active} 
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[#8B1E1E] focus:ring-[#8B1E1E]"
              />
              <span className="text-sm">{language === 'en' ? 'Active (visible on website)' : 'સક્રિય (વેબસાઇટ પર દેખાય)'}</span>
            </label>
          </div>
        </div>

        {/* Tabs for Images, Videos, Embeds */}
        <div className="border-b border-stone-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('images')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'images' ? 'border-[#8B1E1E] text-[#8B1E1E]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              <Image className="w-4 h-4 inline mr-1" />
              {language === 'en' ? 'Images' : 'ફોટા'} ({formData.images.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'videos' ? 'border-[#8B1E1E] text-[#8B1E1E]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              <Video className="w-4 h-4 inline mr-1" />
              {language === 'en' ? 'Videos' : 'વિડિયો'} ({formData.videos.length})
            </button>
            <button
              onClick={() => setActiveTab('embeds')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'embeds' ? 'border-[#8B1E1E] text-[#8B1E1E]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              <Instagram className="w-4 h-4 inline mr-1" />
              {language === 'en' ? 'Instagram' : 'Instagram'} ({formData.embeds.length})
            </button>
          </div>
        </div>

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{language === 'en' ? 'Caption (English)' : 'કેપ્શન (English)'}</label>
                <Input value={newImageCaption.en} onChange={(e) => setNewImageCaption(prev => ({ ...prev, en: e.target.value }))} placeholder="Optional caption" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{language === 'en' ? 'Caption (Gujarati)' : 'કેપ્શન (ગુજરાતી)'}</label>
                <Input value={newImageCaption.gu} onChange={(e) => setNewImageCaption(prev => ({ ...prev, gu: e.target.value }))} placeholder="વૈકલ્પિક કેપ્શન" className="font-gujarati" />
              </div>
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={uploading} className="w-full border-dashed border-2 py-8">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                {uploading ? (language === 'en' ? 'Uploading...' : 'અપલોડ થઈ રહ્યું છે...') : (language === 'en' ? 'Upload Images' : 'ફોટા અપલોડ કરો')}
              </Button>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {formData.images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={getImageUrl(img.url)} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">{language === 'en' ? 'Upload Video' : 'વિડિયો અપલોડ કરો'}</p>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              <Button onClick={() => videoInputRef.current?.click()} variant="outline" disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {language === 'en' ? 'Upload Video (max 50MB)' : 'વિડિયો અપલોડ કરો (મહત્તમ 50MB)'}
              </Button>
            </div>

            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">{language === 'en' ? 'Or Add Video URL (YouTube, etc.)' : 'અથવા વિડિયો URL ઉમેરો'}</p>
              <div className="flex gap-2">
                <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="flex-1" />
                <Button onClick={addVideoUrl} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {formData.videos.length > 0 && (
              <div className="space-y-3">
                {formData.videos.map((vid) => (
                  <div key={vid.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <Video className="w-5 h-5 text-[#8B1E1E]" />
                    <span className="flex-1 text-sm truncate">{vid.url}</span>
                    <span className="text-xs text-[#6B7280] px-2 py-1 bg-white rounded">{vid.type}</span>
                    <button onClick={() => removeVideo(vid.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Embeds Tab (Instagram) */}
        {activeTab === 'embeds' && (
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">{language === 'en' ? 'Add Instagram Post/Reel' : 'Instagram પોસ્ટ/રીલ ઉમેરો'}</p>
              <div className="space-y-3">
                <Input 
                  value={newEmbedUrl} 
                  onChange={(e) => setNewEmbedUrl(e.target.value)} 
                  placeholder="https://www.instagram.com/p/... or https://www.instagram.com/reel/..." 
                />
                <div className="flex gap-2">
                  <select 
                    value={newEmbedType}
                    onChange={(e) => setNewEmbedType(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="instagram">Instagram Post</option>
                    <option value="instagram_reel">Instagram Reel</option>
                  </select>
                  <Button onClick={addEmbed} className="btn-primary">
                    <Plus className="w-4 h-4 mr-1" /> {language === 'en' ? 'Add' : 'ઉમેરો'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">
                {language === 'en' 
                  ? 'Copy the URL from Instagram post or reel and paste it here.'
                  : 'Instagram પોસ્ટ અથવા રીલમાંથી URL કૉપી કરો અને અહીં પેસ્ટ કરો.'}
              </p>
            </div>

            {formData.embeds.length > 0 && (
              <div className="space-y-3">
                {formData.embeds.map((emb) => (
                  <div key={emb.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <span className="flex-1 text-sm truncate">{emb.url}</span>
                    <span className="text-xs text-[#6B7280] px-2 py-1 bg-white rounded">{emb.type}</span>
                    <button onClick={() => removeEmbed(emb.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onCancel} variant="outline">{language === 'en' ? 'Cancel' : 'રદ કરો'}</Button>
          <Button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {album ? (language === 'en' ? 'Update Album' : 'આલ્બમ અપડેટ') : (language === 'en' ? 'Create Album' : 'આલ્બમ બનાવો')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const GallerySection = () => {
  const { language } = useLanguage();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'en' ? 'Delete this album?' : 'આ આલ્બમ કાઢી નાખવું?')) return;
    try {
      await axios.delete(`${API}/gallery/${id}`);
      toast.success(language === 'en' ? 'Album deleted!' : 'આલ્બમ કાઢી નાખ્યું!');
      fetchAlbums();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to delete' : 'કાઢી નાખવામાં નિષ્ફળ');
    }
  };

  const handleSave = async (albumData) => {
    try {
      if (editingAlbum) {
        await axios.put(`${API}/gallery/${editingAlbum.id}`, albumData);
        toast.success(language === 'en' ? 'Album updated!' : 'આલ્બમ અપડેટ થયું!');
      } else {
        await axios.post(`${API}/gallery`, albumData);
        toast.success(language === 'en' ? 'Album created!' : 'આલ્બમ બનાવ્યું!');
      }
      fetchAlbums();
      setEditingAlbum(null);
      setShowForm(false);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAlbum(null);
  };

  const handleAdd = () => {
    setEditingAlbum(null);
    setShowForm(true);
  };

  const getImageUrl = (album) => {
    const img = album.images?.[0];
    if (!img?.url) return null;
    if (img.url.startsWith('http')) return img.url;
    return `${BASE_URL}${img.url}`;
  };

  const getMediaCount = (album) => {
    const images = album.images?.length || 0;
    const videos = album.videos?.length || 0;
    const embeds = album.embeds?.length || 0;
    return { images, videos, embeds, total: images + videos + embeds };
  };

  return (
    <div data-testid="gallery-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">{albums.length} {language === 'en' ? 'albums' : 'આલ્બમ'}</p>
        <Button onClick={handleAdd} className="btn-primary" data-testid="add-album-btn">
          <Plus className="w-4 h-4 mr-2" />{language === 'en' ? 'Add Album' : 'આલ્બમ ઉમેરો'}
        </Button>
      </div>

      {/* Use key to force re-render when editingAlbum changes */}
      {showForm && (
        <GalleryForm 
          key={editingAlbum?.id || 'new'} 
          album={editingAlbum} 
          onSave={handleSave} 
          onCancel={handleCancel} 
          language={language} 
        />
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center"><div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : albums.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Image className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No albums yet' : 'હજી સુધી કોઈ આલ્બમ નથી'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const counts = getMediaCount(album);
            return (
              <div key={album.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="aspect-video bg-stone-100 relative">
                  {getImageUrl(album) ? (
                    <img src={getImageUrl(album)} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Image className="w-12 h-12 text-stone-300" /></div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${album.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                    {album.is_active ? (language === 'en' ? 'Active' : 'સક્રિય') : (language === 'en' ? 'Hidden' : 'છુપાયેલ')}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1F2937]">{album.title?.[language] || album.title?.en}</h3>
                  <p className="text-sm text-[#6B7280] capitalize">{album.category}</p>
                  <div className="flex gap-3 text-xs text-[#9CA3AF] mt-1">
                    {counts.images > 0 && <span>{counts.images} {language === 'en' ? 'images' : 'ફોટા'}</span>}
                    {counts.videos > 0 && <span>{counts.videos} {language === 'en' ? 'videos' : 'વિડિયો'}</span>}
                    {counts.embeds > 0 && <span>{counts.embeds} {language === 'en' ? 'embeds' : 'એમ્બેડ્સ'}</span>}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleEdit(album)} variant="outline" size="sm" className="flex-1" data-testid={`edit-album-${album.id}`}>
                      <Edit className="w-4 h-4 mr-1" /> {language === 'en' ? 'Edit' : 'સંપાદન'}
                    </Button>
                    <Button onClick={() => handleDelete(album.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-album-${album.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GallerySection;
