import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { User, Calendar } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    username: string;
  };
}

export default function BlogDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
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
        .eq('id', id)
        .single();

      if (error) throw error;
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!blog) return <div className="text-center py-12">{t('Blog not found')}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>
        <div className="flex items-center justify-center text-gray-600 space-x-4">
          <span className="flex items-center">
            <User size={16} className="mr-2" />
            {blog.profiles?.username || t('Anonymous')}
          </span>
          <span>•</span>
          <span className="flex items-center">
            <Calendar size={16} className="mr-2" />
            {new Date(blog.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Image Section */}
      {blog.image_url && (
        <div className="mb-8">
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full max-h-[500px] object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="prose max-w-none text-gray-800">
        {blog.content.split('\n').map((paragraph, index) => (
          paragraph.trim() && (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          )
        ))}
      </div>
    </div>
  );
} 