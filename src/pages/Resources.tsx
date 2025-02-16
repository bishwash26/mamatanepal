import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Share2, BookOpen, Youtube, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CreateBlog from '../components/CreateBlog';
import CreateVideo from '../components/CreateVideo';
import CreateShort from '../components/CreateShort';

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

      <div className="flex justify-between items-center mb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'articles'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-primary-50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>{t('articles')}</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'videos'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-primary-50'
            }`}
          >
            <Youtube className="h-5 w-5" />
            <span>{t('videos')}</span>
          </button>
          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'shorts'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-primary-50'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>{t('shorts')}</span>
          </button>
        </div>

        {userRole === 'doctor' && (
          <div className="flex space-x-4">
            {activeTab === 'articles' && (
              <button
                onClick={() => setShowCreateBlog(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                <span>{t('Create Blog')}</span>
              </button>
            )}
            {activeTab === 'videos' && (
              <button
                onClick={() => setShowCreateVideo(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                <span>{t('Add Video')}</span>
              </button>
            )}
            {activeTab === 'shorts' && (
              <button
                onClick={() => setShowCreateShort(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                <span>{t('Add Short')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8">
        {activeTab === 'articles' && (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : blogs.length > 0 ? (
            blogs.map(blog => (
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
                    <p className="text-sm text-primary-600 mb-4">
                      By {blog.profiles?.username || t('Anonymous')} • {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {blog.content}
                    </p>
                    <button 
                      onClick={() => navigate(`/blogs/${blog.id}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {t('readMore')} →
                    </button>
                  </div>
                </div>
              </article>
            ))
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
                    <p className="text-sm text-primary-600 mb-4">
                      By {video.profiles?.username || t('Anonymous')} • {video.duration}
                    </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <p className="text-sm text-primary-600">
                      By {short.profiles?.username || t('Anonymous')} • {short.duration}
                    </p>
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