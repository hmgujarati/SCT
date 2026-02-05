import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { BookOpen, Plus, Trash2, Edit, Eye, X, Save } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogForm = ({ post, onSave, onCancel, language }) => {
  const [formData, setFormData] = useState({
    title: post?.title || { en: '', gu: '' },
    slug: post?.slug || '',
    excerpt: post?.excerpt || { en: '', gu: '' },
    content: post?.content || { en: '', gu: '' },
    cover_image: post?.cover_image || '',
    author: post?.author || '',
    tags: post?.tags || [],
    is_published: post?.is_published ?? false
  });
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const generateSlug = () => {
    const slug = formData.title.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async () => {
    if (!formData.title.en || !formData.slug) {
      toast.error(language === 'en' ? 'Title and slug are required' : 'શીર્ષક અને slug જરૂરી છે');
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6" data-testid="blog-form">
      <h3 className="font-semibold text-lg mb-4">
        {post ? (language === 'en' ? 'Edit Post' : 'પોસ્ટ સંપાદિત કરો') : (language === 'en' ? 'New Post' : 'નવી પોસ્ટ')}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (English)' : 'શીર્ષક (English)'}</label>
          <Input value={formData.title.en} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value }})} className="input-field" data-testid="post-title-en" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Title (Gujarati)' : 'શીર્ષક (ગુજરાતી)'}</label>
          <Input value={formData.title.gu} onChange={(e) => setFormData({ ...formData, title: { ...formData.title, gu: e.target.value }})} className="input-field font-gujarati" data-testid="post-title-gu" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <div className="flex gap-2">
            <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input-field" data-testid="post-slug" />
            <Button onClick={generateSlug} type="button" variant="outline" size="sm">{language === 'en' ? 'Generate' : 'બનાવો'}</Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Author' : 'લેખક'}</label>
          <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="input-field" data-testid="post-author" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Cover Image URL' : 'કવર ઈમેજ URL'}</label>
          <Input value={formData.cover_image} onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} placeholder="https://..." className="input-field" data-testid="post-cover" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Excerpt (English)' : 'સારાંશ (English)'}</label>
          <Textarea value={formData.excerpt.en} onChange={(e) => setFormData({ ...formData, excerpt: { ...formData.excerpt, en: e.target.value }})} className="input-field min-h-[80px]" data-testid="post-excerpt-en" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Excerpt (Gujarati)' : 'સારાંશ (ગુજરાતી)'}</label>
          <Textarea value={formData.excerpt.gu} onChange={(e) => setFormData({ ...formData, excerpt: { ...formData.excerpt, gu: e.target.value }})} className="input-field min-h-[80px] font-gujarati" data-testid="post-excerpt-gu" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Content (English)' : 'સામગ્રી (English)'}</label>
          <Textarea value={formData.content.en} onChange={(e) => setFormData({ ...formData, content: { ...formData.content, en: e.target.value }})} className="input-field min-h-[200px]" data-testid="post-content-en" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Content (Gujarati)' : 'સામગ્રી (ગુજરાતી)'}</label>
          <Textarea value={formData.content.gu} onChange={(e) => setFormData({ ...formData, content: { ...formData.content, gu: e.target.value }})} className="input-field min-h-[200px] font-gujarati" data-testid="post-content-gu" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{language === 'en' ? 'Tags' : 'ટેગ્સ'}</label>
          <div className="flex gap-2 mb-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder={language === 'en' ? 'Add tag...' : 'ટેગ ઉમેરો...'} className="input-field" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
            <Button onClick={addTag} type="button" variant="outline" size="sm"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-stone-100 rounded-full text-sm flex items-center gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-stone-400 hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-7">
          <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="w-4 h-4" data-testid="post-published" />
          <label htmlFor="is_published" className="text-sm">{language === 'en' ? 'Publish immediately' : 'તરત પ્રકાશિત કરો'}</label>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleSubmit} disabled={saving} className="btn-primary" data-testid="save-post-btn">
          {saving ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{language === 'en' ? 'Saving...' : 'સાચવી રહ્યું છે...'}</span> : <><Save className="w-4 h-4 mr-2" />{language === 'en' ? 'Save Post' : 'પોસ્ટ સાચવો'}</>}
        </Button>
        <Button onClick={onCancel} variant="outline" className="btn-secondary">{language === 'en' ? 'Cancel' : 'રદ કરો'}</Button>
      </div>
    </div>
  );
};

export const BlogSection = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog/all`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'en' ? 'Delete this post?' : 'આ પોસ્ટ કાઢી નાખવી?')) return;
    try {
      await axios.delete(`${API}/blog/${id}`);
      toast.success(language === 'en' ? 'Post deleted!' : 'પોસ્ટ કાઢી નાખી!');
      fetchPosts();
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to delete' : 'કાઢી નાખવામાં નિષ્ફળ');
    }
  };

  const handleSave = async (postData) => {
    try {
      if (editingPost) {
        await axios.put(`${API}/blog/${editingPost.id}`, postData);
        toast.success(language === 'en' ? 'Post updated!' : 'પોસ્ટ અપડેટ થઈ!');
      } else {
        await axios.post(`${API}/blog`, postData);
        toast.success(language === 'en' ? 'Post created!' : 'પોસ્ટ બનાવી!');
      }
      fetchPosts();
      setEditingPost(null);
      setShowForm(false);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to save' : 'સાચવવામાં નિષ્ફળ');
    }
  };

  return (
    <div data-testid="blog-section">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B7280]">{posts.length} {language === 'en' ? 'posts' : 'પોસ્ટ્સ'}</p>
        <Button onClick={() => { setShowForm(true); setEditingPost(null); }} className="btn-primary" data-testid="add-post-btn">
          <Plus className="w-4 h-4 mr-2" />{language === 'en' ? 'Add Post' : 'પોસ્ટ ઉમેરો'}
        </Button>
      </div>

      {(showForm || editingPost) && <BlogForm post={editingPost} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingPost(null); }} language={language} />}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center"><div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-[#C9A24A] mx-auto mb-4" />
          <p className="text-[#6B7280]">{language === 'en' ? 'No posts yet' : 'હજી સુધી કોઈ પોસ્ટ નથી'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
              <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                {post.cover_image ? <img src={post.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-stone-300" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#1F2937]">{post.title?.[language] || post.title?.en}</h3>
                    <p className="text-sm text-[#6B7280]">{post.author} • {post.slug}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {post.is_published ? (language === 'en' ? 'Published' : 'પ્રકાશિત') : (language === 'en' ? 'Draft' : 'ડ્રાફ્ટ')}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{post.excerpt?.[language] || post.excerpt?.en}</p>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => setEditingPost(post)} variant="outline" size="sm" data-testid={`edit-post-${post.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> {language === 'en' ? 'Edit' : 'સંપાદન'}
                  </Button>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" /> {language === 'en' ? 'View' : 'જુઓ'}</Button>
                  </a>
                  <Button onClick={() => handleDelete(post.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50" data-testid={`delete-post-${post.id}`}>
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

export default BlogSection;
