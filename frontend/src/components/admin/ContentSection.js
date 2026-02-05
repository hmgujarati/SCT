import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { FileText, Edit, Save } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContentEditor = ({ item, onSave, onCancel, saving, language }) => {
  const [formData, setFormData] = useState({
    en: item.content?.en || '',
    gu: item.content?.gu || ''
  });

  const isLongText = item.section_key.includes('text') || item.section_key.includes('intro') || 
                     item.section_key.includes('vision') || item.section_key.includes('mission');

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">English</label>
          {isLongText ? (
            <Textarea
              value={formData.en}
              onChange={(e) => setFormData({ ...formData, en: e.target.value })}
              className="input-field min-h-[120px]"
              data-testid={`content-en-${item.section_key}`}
            />
          ) : (
            <Input
              value={formData.en}
              onChange={(e) => setFormData({ ...formData, en: e.target.value })}
              className="input-field"
              data-testid={`content-en-${item.section_key}`}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">ગુજરાતી</label>
          {isLongText ? (
            <Textarea
              value={formData.gu}
              onChange={(e) => setFormData({ ...formData, gu: e.target.value })}
              className="input-field min-h-[120px] font-gujarati"
              data-testid={`content-gu-${item.section_key}`}
            />
          ) : (
            <Input
              value={formData.gu}
              onChange={(e) => setFormData({ ...formData, gu: e.target.value })}
              className="input-field font-gujarati"
              data-testid={`content-gu-${item.section_key}`}
            />
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave(item.page_key, item.section_key, formData)}
          disabled={saving}
          className="btn-primary"
          data-testid={`save-${item.section_key}`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Save' : 'સાચવો'}
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">
          {language === 'en' ? 'Cancel' : 'રદ કરો'}
        </Button>
      </div>
    </div>
  );
};

export const ContentSection = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [editingItem, setEditingItem] = useState(null);

  const pages = [
    { id: 'home', label: language === 'en' ? 'Home Page' : 'હોમ પેજ' },
    { id: 'about', label: language === 'en' ? 'About Page' : 'અમારા વિશે' },
    { id: 'donate', label: language === 'en' ? 'Donate Page' : 'દાન પેજ' },
    { id: 'contact', label: language === 'en' ? 'Contact Page' : 'સંપર્ક પેજ' }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageKey, sectionKey, contentData) => {
    setSaving(true);
    try {
      await axios.put(`${API}/content/${pageKey}/${sectionKey}`, contentData);
      toast.success(language === 'en' ? 'Content saved!' : 'સામગ્રી સાચવી!');
      fetchContent();
      setEditingItem(null);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    } finally {
      setSaving(false);
    }
  };

  const pageContent = content.filter(c => c.page_key === activeTab);

  const sectionLabels = {
    hero_title: language === 'en' ? 'Hero Title' : 'હીરો શીર્ષક',
    hero_subtitle: language === 'en' ? 'Hero Subtitle' : 'હીરો ઉપશીર્ષક',
    donate_cta: language === 'en' ? 'Donate CTA' : 'દાન CTA',
    impact_title: language === 'en' ? 'Impact Title' : 'પ્રભાવ શીર્ષક',
    programs_title: language === 'en' ? 'Programs Title' : 'કાર્યક્રમો શીર્ષક',
    transparency_title: language === 'en' ? 'Transparency Title' : 'પારદર્શકતા શીર્ષક',
    transparency_text: language === 'en' ? 'Transparency Text' : 'પારદર્શકતા ટેક્સ્ટ',
    cta_title: language === 'en' ? 'CTA Title' : 'CTA શીર્ષક',
    cta_text: language === 'en' ? 'CTA Text' : 'CTA ટેક્સ્ટ',
    title: language === 'en' ? 'Page Title' : 'પેજ શીર્ષક',
    subtitle: language === 'en' ? 'Subtitle' : 'ઉપશીર્ષક',
    intro: language === 'en' ? 'Introduction' : 'પરિચય',
    vision_title: language === 'en' ? 'Vision Title' : 'વિઝન શીર્ષક',
    vision: language === 'en' ? 'Vision Text' : 'વિઝન ટેક્સ્ટ',
    mission_title: language === 'en' ? 'Mission Title' : 'મિશન શીર્ષક',
    mission: language === 'en' ? 'Mission Text' : 'મિશન ટેક્સ્ટ',
    values_title: language === 'en' ? 'Values Title' : 'મૂલ્યો શીર્ષક',
    impact_text: language === 'en' ? 'Impact Text' : 'પ્રભાવ ટેક્સ્ટ'
  };

  return (
    <div data-testid="content-section">
      <div className="flex flex-wrap gap-2 mb-6">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActiveTab(page.id)}
            data-testid={`content-tab-${page.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === page.id ? 'bg-[#8B1E1E] text-white' : 'bg-white text-[#6B7280] hover:bg-stone-100'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : pageContent.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <FileText className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No content found for this page' : 'આ પેજ માટે કોઈ સામગ્રી મળી નથી'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pageContent.map((item) => (
            <div key={`${item.page_key}-${item.section_key}`} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-[#1F2937]">{sectionLabels[item.section_key] || item.section_key}</h3>
                  <p className="text-xs text-[#9CA3AF]">{item.section_key}</p>
                </div>
                <button
                  onClick={() => setEditingItem(editingItem === item.section_key ? null : item.section_key)}
                  className="text-[#8B1E1E] hover:bg-[#F7F1E6] p-2 rounded-lg transition-colors"
                  data-testid={`edit-${item.section_key}`}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>

              {editingItem === item.section_key ? (
                <ContentEditor
                  item={item}
                  onSave={handleSave}
                  onCancel={() => setEditingItem(null)}
                  saving={saving}
                  language={language}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">English</p>
                    <p className="text-sm text-[#1F2937]">{item.content?.en || '-'}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">ગુજરાતી</p>
                    <p className="text-sm text-[#1F2937] font-gujarati">{item.content?.gu || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentSection;
