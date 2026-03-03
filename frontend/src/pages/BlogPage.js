import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogPostCard = ({ post, language, t, formatDate }) => {
  const title = t(post.title) || '';
  const excerpt = t(post.excerpt) || '';
  const tags = post.tags || [];
  
  return (
    <Link 
      to={`/blog/${post.slug}`} 
      className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1" 
      data-testid={`blog-card-${post.slug}`}
    >
      <div className="relative overflow-hidden">
        {post.cover_image ? (
          <img src={post.cover_image} alt={title} className="h-48 w-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-48 bg-[#F7F1E6] flex items-center justify-center">
            <span className="text-[#C9A24A] text-4xl font-bold">{title ? title[0] : 'B'}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-xs text-[#6B7280]">
          {post.author && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author}
            </span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.published_at)}
            </span>
          )}
        </div>
        <h2 className="text-xl font-semibold text-[#1F2937] mb-3 hover:text-[#8B1E1E] transition-colors line-clamp-2">
          {title}
        </h2>
        <p className="text-[#6B7280] text-sm line-clamp-3 mb-4">{excerpt}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-[#F7F1E6] text-[#8B1E1E] text-xs font-medium rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

const BlogPage = () => {
  const { language, t, ui } = useLanguage();
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    } else {
      fetchPosts();
    }
  }, [slug]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPost = async (postSlug) => {
    try {
      const response = await axios.get(`${API}/blog/${postSlug}`);
      setCurrentPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const locale = language === 'gu' ? 'gu-IN' : 'en-IN';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Single Post View
  if (slug && currentPost) {
    const title = t(currentPost.title) || '';
    const content = t(currentPost.content) || '';
    const tags = currentPost.tags || [];
    const paragraphs = content.split('\n\n');
    
    return (
      <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
        <article className="section bg-white" data-testid="blog-post">
          <div className="container-custom max-w-4xl">
            <Link to="/blog" className="inline-flex items-center text-[#8B1E1E] font-medium mb-8 hover:gap-3 transition-all" data-testid="back-to-blog">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Back to Blog' : 'બ્લોગ પર પાછા'}
            </Link>

            {currentPost.cover_image && (
              <div className="rounded-2xl overflow-hidden mb-8">
                <img src={currentPost.cover_image} alt={title} className="w-full h-[400px] object-cover" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#6B7280]">
              {currentPost.author && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {currentPost.author}
                </span>
              )}
              {currentPost.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(currentPost.published_at)}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">{title}</h1>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#F7F1E6] text-[#8B1E1E] text-sm font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-[#6B7280] leading-relaxed mb-6">{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Blog List View
  return (
    <div className={`pt-24 ${language === 'gu' ? 'font-gujarati' : ''}`}>
      <section className="py-20 bg-[#F7F1E6]" data-testid="blog-hero">
        <div className="container-custom text-center">
          <span className="inline-block px-4 py-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-medium mb-6">
            {language === 'en' ? 'Our Blog' : 'અમારો બ્લોગ'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
            {language === 'en' ? 'News & Insights' : 'સમાચાર અને અંતર્દૃષ્ટિ'}
          </h1>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Stay updated with our latest initiatives, success stories, and insights on community development.'
              : 'અમારી નવીનતમ પહેલ, સફળતાની વાર્તાઓ અને સમુદાય વિકાસ પરની અંતર્દૃષ્ટિ સાથે અપડેટ રહો.'}
          </p>
        </div>
      </section>

      <section className="section bg-white" data-testid="blog-grid">
        <div className="container-custom">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-[#6B7280]">{ui.loading}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7280]">
                {language === 'en' ? 'No blog posts yet. Check back soon!' : 'હજી સુધી કોઈ બ્લોગ પોસ્ટ નથી. ટૂંક સમયમાં ફરી તપાસો!'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} language={language} t={t} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
