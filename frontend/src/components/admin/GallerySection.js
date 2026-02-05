import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Image, Plus, Trash2, Edit, X, Save } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GalleryForm = ({ album, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    title: album?.title || { en: '', gu: '' },
    category: album?.category || 'education',
    images: album?.images || [],
    is_active: album?.is_active ?? true
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState({ en: '', gu: '' });
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: 'education', label: language === 'en' ? 'Education' : 'શિક્ષણ' },
    { id: 'health', label: language === 'en' ? 'Health' : 'આરોગ્ય' },
    { id: 'relief', label: language === 'en' ? 'Relief' : 'રાહત' },
    { id: 'community', label: language === 'en' ? 'Community' : 'સમુદાય' }
  ];

  const addImage = () => {
    if (!newImageUrl) return;
    setFormData({
      ...formData,
      images: [...formData.images, { id: Date.now().toString(), url: newImageUrl, caption: newImageCaption, order: formData.images.length }]
    });
    setNewImageUrl('');
    setNewImageCaption({ en: '', gu: '' });
  };

  const removeImage = (imageId) => {
    setFormData({ ...formData, images: formData.images.filter(img => img.id !== imageId) });
  };

  const handleSubmit = async () => {
    if (!formData.title.en) {
      toast.error(language === 'en' ? 'Title is required' : 'શીર્ષક જરૂરી છે');
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6" data-testid="gallery-form">
      <h3 className="font-semibold text-lg mb-4">
        {album ? (language === 'en' ? 'Edit Album' : 'આલ્બમ સંપાદિત કરો') : (language === 'en' ? 'New Album' : 'નવું આલ્બમ')}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (English)' : 'શીર્ષક (English)'}</label>
          <Input value={formData.title.en} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value }})} className="input-field" data-testid="album-title-en" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (Gujarati)' : 'શીર્ષક (ગુજરાતી)'}</label>
          <Input value={formData.title.gu} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, gu: e.target.value }})} className="input-field font-gujarati" data-testid="album-title-gu" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Category' : 'શ્રેણી'}</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full input-field" data-testid="album-category">
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" data-testid="album-active" />
          <label htmlFor="is_active" className="text-sm">{language === 'en' ? 'Active (visible on website)' : 'સક્રિય (વેબસાઈટ પર દેખાય)'}</label>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-3">{language === 'en' ? 'Images' : 'ફોટા'}</h4>
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {formData.images.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-stone-50 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Image URL' : 'ફોટો URL'}</label>
            <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." className="input-field" data-testid="new-image-url" />
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Caption (English)' : 'કેપ્શન (English)'}</label>
              <Input value={newImageCaption.en} onChange={(e) => setNewImageCaption({ ...newImageCaption, en: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Caption (Gujarati)' : 'કેપ્શન (ગુજરાતી)'}</label>
              <Input value={newImageCaption.gu} onChange={(e) => setNewImageCaption({ ...newImageCaption, gu: e.target.value })} className="input-field font-gujarati" />
            </div>
          </div>
          <Button onClick={addImage} variant="outline" size="sm" data-testid="add-image-btn">
            <Plus className="w-4 h-4 mr-1" /> {language === 'en' ? 'Add Image' : 'ફોટો ઉમેરો'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSubmit} disabled={saving} className="btn-primary" data-testid="save-album-btn">
          {saving ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}</span> : <><Save className="w-4 h-4 mr-2" />{language === 'en' ? 'Save Album' : 'આલ્બમ સાચવો'}</>}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">{language === 'en' ? 'Cancel' : 'રદ કરો'}</Button>
      </div>
    </div>
  );
};

export const GallerySection = () => {
  const { language } = useLanguage();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    try {
      const response = await axios.get(`${API}/gallery/all`);
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

  return (
    <div data-testid="gallery-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">{albums.length} {language === 'en' ? 'albums' : 'આલ્બમ'}</p>
        <Button onClick={() => { setShowForm(true); setEditingAlbum(null); }} className="btn-primary" data-testid="add-album-btn">
          <Plus className="w-4 h-4 mr-2" />{language === 'en' ? 'Add Album' : 'આલ્બમ ઉમેરો'}
        </Button>
      </div>

      {(showForm || editingAlbum) && <GalleryForm album={editingAlbum} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingAlbum(null); }} language={language} />}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center"><div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : albums.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Image className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No albums yet' : 'હજી સુધી કોઈ આલ્બમ નથી'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-stone-100 relative">
                {album.images?.[0]?.url ? <img src={album.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-12 h-12 text-stone-300" /></div>}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${album.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                  {album.is_active ? (language === 'en' ? 'Active' : 'સક્રિય') : (language === 'en' ? 'Hidden' : 'છુપાયેલ')}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#1F2937]">{album.title?.[language] || album.title?.en}</h3>
                <p className="text-sm text-[#6B7280] capitalize">{album.category}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{album.images?.length || 0} {language === 'en' ? 'images' : 'ફોટા'}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setEditingAlbum(album)} variant="outline" size="sm" className="flex-1" data-testid={`edit-album-${album.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> {language === 'en' ? 'Edit' : 'સંપાદન'}
                  </Button>
                  <Button onClick={() => handleDelete(album.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-album-${album.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GallerySection;
