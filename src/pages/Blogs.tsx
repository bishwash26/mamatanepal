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
  author_credit: string | null;
}

// Function to truncate content to a specific word limit
const truncateContent = (content: string, wordLimit: number = 0) => {
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">{t('Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('Blogs & Articles')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => {
          // Truncate content to 50 words
          const { content: truncatedContent, isTruncated } = truncateContent(blog.content, 50);
          
          return (
            <article 
              key={blog.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {blog.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.png';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-primary-600">
                  <a onClick={() => navigate(`/blogs/${blog.id}`)} className="cursor-pointer">
                    {blog.title}
                  </a>
                </h2>
                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-3">
                    {truncatedContent}
                  </p>
                </div>
                {isTruncated && (
                  <button 
                    onClick={() => navigate(`/blogs/${blog.id}`)}
                    className="text-primary-600 hover:text-primary-700 font-medium block mb-4"
                  >
                    {t('Read More')} →
                  </button>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <User size={14} className="mr-1" />
                    {blog.author_credit || blog.profiles?.username || t('Anonymous')}
                  </span>
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
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