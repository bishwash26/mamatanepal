import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Blog {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_id: string;
  profiles: {
    username: string;
  };
}

const truncateContent = (content: string, wordLimit: number = 300) => {
  const words = content.split(' ');
  const isTruncated = words.length > wordLimit;
  const truncatedContent = isTruncated 
    ? words.slice(0, wordLimit).join(' ') + '...'
    : content;
  return { content: truncatedContent, isTruncated };
};

// Add this CSS class for truncation
const truncateStyle = {
  display: '-webkit-box',
  WebkitLineClamp: '3',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
} as React.CSSProperties;

const Blogs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('Pregnancy Resources')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => {
          const { content: truncatedContent, isTruncated } = truncateContent(blog.content);
          
          return (
            <article 
              key={blog.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {blog.image_url && (
                <img 
                  src={blog.image_url} 
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {blog.title}
                </h2>
                <div className="h-24 mb-4"> {/* Fixed height container for content */}
                  <p 
                    className="text-gray-600"
                    style={truncateStyle}
                  >
                    {truncatedContent}
                  </p>
                </div>
                {isTruncated && (
                  <button 
                    onClick={() => navigate(`/blogs/${blog.id}`)}
                    className="text-primary-600 hover:text-primary-700 font-medium block mb-4"
                  >
                    {t('readMore')} →
                  </button>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{blog.profiles?.username || t('Anonymous')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t('No blogs available yet')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Blogs;