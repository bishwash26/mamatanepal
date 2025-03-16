import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Share2, BookOpen, Youtube, Plus, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CreateBlog from '../components/CreateBlog';
import CreateVideo from '../components/CreateVideo';
import CreateShort from '../components/CreateShort';

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

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  youtube_id: string;
  duration: string;
  created_at: string;
  description: string;
  views: number;
  profiles: {
    username: string;
  };
  author_credit?: string;
}

interface Short {
  id: string;
  title: string;
  thumbnail_url: string;
  youtube_id: string;
  duration: string;
  created_at: string;
  description: string;
  views: number;
  profiles: {
    username: string;
  };
  author_credit?: string;
}

export default function Resources() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('articles');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [showCreateVideo, setShowCreateVideo] = useState(false);
  const [showCreateShort, setShowCreateShort] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'doctor'>('user');
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingShorts, setLoadingShorts] = useState(false);

  // Define tabs
  const tabs = [
    { value: 'articles', label: 'articles', icon: BookOpen },
    { value: 'videos', label: 'videos', icon: Youtube },
    { value: 'shorts', label: 'shorts', icon: Play }
  ];

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (activeTab === 'articles') {
      fetchBlogs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchParams.get('tab') === 'articles' && searchParams.get('create') === 'true') {
      setShowCreateBlog(true);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('userRole state changed to:', userRole);
  }, [userRole]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'videos') {
      fetchVideos();
    } else if (activeTab === 'shorts') {
      fetchShorts();
    }
  }, [activeTab]);

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

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, id, username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      if (profile) {
        console.log('Raw role value:', profile.role);
        setUserRole(profile.role as 'user' | 'doctor');
        console.log('Set user role to:', profile.role);
      } else {
        console.log('No profile found');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_author_id_fkey (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const fetchShorts = async () => {
    try {
      setLoadingShorts(true);
      const { data, error } = await supabase
        .from('shorts')
        .select(`
          *,
          profiles!shorts_author_id_fkey (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShorts(data || []);
    } catch (error) {
      console.error('Error fetching shorts:', error);
    } finally {
      setLoadingShorts(false);
    }
  };

  console.log('Current userRole:', userRole);
  console.log('Current activeTab:', activeTab);

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">{t('resources')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert advice, videos, and resources to guide you through your pregnancy journey
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2 px-4 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-primary-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{t(tab.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {userRole === 'doctor' && (
            <>
              {activeTab === 'articles' && (
                <button
                  onClick={() => setShowCreateBlog(true)}
                  className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
                >
                  <Plus size={20} />
                  <span>{t('Create Blog')}</span>
                </button>
              )}
              {activeTab === 'videos' && (
                <button
                  onClick={() => setShowCreateVideo(true)}
                  className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
                >
                  <Plus size={20} />
                  <span>{t('Add Video')}</span>
                </button>
              )}
              {activeTab === 'shorts' && (
                <button
                  onClick={() => setShowCreateShort(true)}
                  className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
                >
                  <Plus size={20} />
                  <span>{t('Add Short')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-8">
        {activeTab === 'articles' && (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : blogs.length > 0 ? (
            blogs.map(blog => {
              // Truncate content to 50 words
              const { content: truncatedContent, isTruncated } = truncateContent(blog.content, 50);
              
              return (
                <article key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0">
                      <img 
                        className="h-48 w-full md:w-64 object-cover" 
                        src={blog.image_url || 'https://via.placeholder.com/400x300'} 
                        alt={blog.title}
                      />
                    </div>
                    <div className="p-8">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {blog.title}
                      </h2>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <User size={14} className="mr-1" />
                          {blog.author_credit || blog.profiles?.username || t('Anonymous')}
                        </span>
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {truncatedContent}
                      </p>
                      {isTruncated && (
                        <button 
                          onClick={() => navigate(`/blogs/${blog.id}`)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {t('readMore')} →
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {t('No articles available yet')}
              </p>
            </div>
          )
        )}

        {activeTab === 'videos' && (
          loadingVideos ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {videos.map(video => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[400px]"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {video.title}
                    </h2>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <User size={14} className="mr-1" />
                        {video.author_credit || video.profiles?.username || t('Anonymous')}
                      </span>
                      <span>{video.duration}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{video.description}</p>
                    <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>{t('shareResource')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('No videos available yet')}</p>
            </div>
          )
        )}

        {activeTab === 'shorts' && (
          loadingShorts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : shorts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {shorts.map(short => (
                <div key={short.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-9 aspect-h-16">
                    <iframe
                      src={`https://www.youtube.com/embed/${short.youtube_id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[400px]"
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {short.title}
                    </h3>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 mt-1">
                        {short.author_credit || short.profiles?.username || t('Anonymous')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('No shorts available yet')}</p>
            </div>
          )
        )}
      </div>

      {showCreateBlog && (
        <CreateBlog
          onClose={() => setShowCreateBlog(false)}
          onSuccess={() => {
            fetchBlogs();
            setShowCreateBlog(false);
          }}
        />
      )}

      {showCreateVideo && (
        <CreateVideo
          onClose={() => setShowCreateVideo(false)}
          onSuccess={() => {
            fetchVideos();
            setShowCreateVideo(false);
          }}
        />
      )}

      {showCreateShort && (
        <CreateShort
          onClose={() => setShowCreateShort(false)}
          onSuccess={() => {
            fetchShorts();
            setShowCreateShort(false);
          }}
        />
      )}
    </div>
  );
}