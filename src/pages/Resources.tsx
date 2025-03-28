import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CreateBlog from '../components/CreateBlog';
import { useAuth } from '../context/AuthContext.tsx';

// Function to truncate content to a specific word limit
const truncateContent = (content: string, wordLimit: number = 50) => {
  const words = content.split(' ');
  const isTruncated = words.length > wordLimit;
  const truncatedContent = isTruncated 
    ? words.slice(0, wordLimit).join(' ') + '...'
    : content;
  return { content: truncatedContent, isTruncated };
};

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

export default function Resources() {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'doctor'>('user');
  const navigate = useNavigate();
  const { user } = useAuth(); // Use AuthContext to get user
  
  // Memoize the user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user]);

  // Memoize the fetchBlogs function to maintain consistent reference
  const fetchBlogs = useCallback(async () => {
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
  }, []);

  // Memoize the fetchUserRole function to maintain consistent reference
  const fetchUserRole = useCallback(async (id: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return;
      }
      
      if (profile) {
        setUserRole(profile.role as 'user' | 'doctor');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }, []);

  // Single useEffect to handle initial data loading
  useEffect(() => {
    // Initial data fetch - only runs once
    fetchBlogs();
    
    // Only fetch user role if we have a userId
    if (userId) {
      fetchUserRole(userId);
    }
  }, [userId, fetchBlogs, fetchUserRole]); 

  // Handle "create" parameter in URL
  useEffect(() => {
    if (searchParams.get('tab') === 'articles' && searchParams.get('create') === 'true') {
      setShowCreateBlog(true);
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">{t('resources')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert advice and resources to guide you through your pregnancy journey
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {userRole === 'doctor' && (
            <button
              onClick={() => setShowCreateBlog(true)}
              className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
            >
              <Plus size={20} />
              <span>{t('Create Blog')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => {
            // Truncate content to 50 words
            const { content: truncatedContent, isTruncated } = truncateContent(blog.content, 50);
            
            return (
              <article 
                key={blog.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.01] hover:shadow-lg"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    src={blog.image_url || 'https://via.placeholder.com/400x300'} 
                    alt={blog.title}
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {blog.title}
                  </h2>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <User size={14} className="mr-1" />
                      {blog.author_credit || blog.profiles?.username || t('Anonymous')}
                    </span>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {truncatedContent}
                  </p>
                  <button 
                    onClick={() => navigate(`/blogs/${blog.id}`)}
                    className="text-primary-600 hover:text-primary-700 font-medium mt-auto self-start"
                  >
                    {t('readMore')} →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t('No articles available yet')}
          </p>
        </div>
      )}

      {showCreateBlog && (
        <CreateBlog
          onClose={() => setShowCreateBlog(false)}
          onSuccess={() => {
            fetchBlogs();
            setShowCreateBlog(false);
          }}
        />
      )}
    </div>
  );
}