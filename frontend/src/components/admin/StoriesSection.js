import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Users, Plus, Trash2, Edit, Save } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StoryForm = ({ story, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    title: story?.title || { en: '', gu: '' },
    person_name: story?.person_name || { en: '', gu: '' },
    location: story?.location || { en: '', gu: '' },
    problem: story?.problem || { en: '', gu: '' },
    help_provided: story?.help_provided || { en: '', gu: '' },
    impact: story?.impact || { en: '', gu: '' },
    quote: story?.quote || { en: '', gu: '' },
    image_url: story?.image_url || '',
    category: story?.category || 'education',
    is_active: story?.is_active ?? true,
    order: story?.order || 0
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: 'education', label: language === 'en' ? 'Education' : 'શિક્ષણ' },
    { id: 'health', label: language === 'en' ? 'Health' : 'આરોગ્ય' },
    { id: 'relief', label: language === 'en' ? 'Relief' : 'રાહત' }
  ];

  const handleSubmit = async () => {
    if (!formData.title.en || !formData.person_name.en) {
      toast.error(language === 'en' ? 'Title and name are required' : 'શીર્ષક અને નામ જરૂરી છે');
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const BilingualField = ({ label, field, isTextarea }) => (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium mb-2">{label} (English)</label>
        {isTextarea ? (
          <Textarea value={formData[field].en} onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], en: e.target.value }})} className="input-field min-h-[80px]" />
        ) : (
          <Input value={formData[field].en} onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], en: e.target.value }})} className="input-field" />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{label} (ગુજરાતી)</label>
        {isTextarea ? (
          <Textarea value={formData[field].gu} onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], gu: e.target.value }})} className="input-field min-h-[80px] font-gujarati" />
        ) : (
          <Input value={formData[field].gu} onChange={(e) => setFormData({ ...formData, [field]: { ...formData[field], gu: e.target.value }})} className="input-field font-gujarati" />
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6" data-testid="story-form">
      <h3 className="font-semibold text-lg mb-4">
        {story ? (language === 'en' ? 'Edit Story' : 'વાર્તા સંપાદિત કરો') : (language === 'en' ? 'New Story' : 'નવી વાર્તા')}
      </h3>
      
      <BilingualField label={language === 'en' ? 'Title' : 'શીર્ષક'} field="title" />
      <BilingualField label={language === 'en' ? 'Person Name' : 'વ્યક્તિનું નામ'} field="person_name" />
      <BilingualField label={language === 'en' ? 'Location' : 'સ્થાન'} field="location" />
      <BilingualField label={language === 'en' ? 'Problem' : 'સમસ્યા'} field="problem" isTextarea />
      <BilingualField label={language === 'en' ? 'Help Provided' : 'પ્રદાન કરેલ મદદ'} field="help_provided" isTextarea />
      <BilingualField label={language === 'en' ? 'Impact' : 'પ્રભાવ'} field="impact" isTextarea />
      <BilingualField label={language === 'en' ? 'Quote' : 'અવતરણ'} field="quote" isTextarea />

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Image URL' : 'ફોટો URL'}</label>
          <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Category' : 'શ્રેણી'}</label>
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full input-field">
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-7">
          <input type="checkbox" id="story_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
          <label htmlFor="story_active" className="text-sm">{language === 'en' ? 'Active' : 'સક્રિય'}</label>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSubmit} disabled={saving} className="btn-primary" data-testid="save-story-btn">
          {saving ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}</span> : <><Save className="w-4 h-4 mr-2" />{language === 'en' ? 'Save Story' : 'વાર્તા સાચવો'}</>}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">{language === 'en' ? 'Cancel' : 'રદ કરો'}</Button>
      </div>
    </div>
  );
};

export const StoriesSection = () => {
  const { language } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchStories(); }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API}/stories/all`);
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'en' ? 'Delete this story?' : 'આ વાર્તા કાઢી નાખવી?')) return;
    try {
      await axios.delete(`${API}/stories/${id}`);
      toast.success(language === 'en' ? 'Story deleted!' : 'વાર્તા કાઢી નાખી!');
      fetchStories();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to delete' : 'કાઢી નાખવામાં નિષ્ફળ');
    }
  };

  const handleSave = async (storyData) => {
    try {
      if (editingStory) {
        await axios.put(`${API}/stories/${editingStory.id}`, storyData);
        toast.success(language === 'en' ? 'Story updated!' : 'વાર્તા અપડેટ થઈ!');
      } else {
        await axios.post(`${API}/stories`, storyData);
        toast.success(language === 'en' ? 'Story created!' : 'વાર્તા બનાવી!');
      }
      fetchStories();
      setEditingStory(null);
      setShowForm(false);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    }
  };

  return (
    <div data-testid="stories-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">{stories.length} {language === 'en' ? 'stories' : 'વાર્તાઓ'}</p>
        <Button onClick={() => { setShowForm(true); setEditingStory(null); }} className="btn-primary" data-testid="add-story-btn">
          <Plus className="w-4 h-4 mr-2" />{language === 'en' ? 'Add Story' : 'વાર્તા ઉમેરો'}
        </Button>
      </div>

      {(showForm || editingStory) && <StoryForm story={editingStory} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingStory(null); }} language={language} />}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center"><div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Users className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No stories yet' : 'હજી સુધી કોઈ વાર્તા નથી'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                {story.image_url ? <img src={story.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users className="w-8 h-8 text-stone-300" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">{story.title?.[language] || story.title?.en}</h3>
                    <p className="text-sm text-[#6B7280]">{story.person_name?.[language] || story.person_name?.en} • {story.location?.[language] || story.location?.en}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${story.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                    {story.is_active ? (language === 'en' ? 'Active' : 'સક્રિય') : (language === 'en' ? 'Hidden' : 'છુપાયેલ')}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{story.problem?.[language] || story.problem?.en}</p>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => setEditingStory(story)} variant="outline" size="sm" data-testid={`edit-story-${story.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> {language === 'en' ? 'Edit' : 'સંપાદન'}
                  </Button>
                  <Button onClick={() => handleDelete(story.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-story-${story.id}`}>
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

export default StoriesSection;
