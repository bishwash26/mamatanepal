import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  username: string;
  role: 'user' | 'doctor';
}

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
  profiles: {
    username: string;
  };
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'user' | 'doctor'>('user');
  const [loading, setLoading] = useState(true);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [popularShorts, setPopularShorts] = useState<Short[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingShorts, setLoadingShorts] = useState(true);

  useEffect(() => {
    fetchUserRole();
    fetchPopularBlogs();
    fetchPopularVideos();
    fetchPopularShorts();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      console.log("user", user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log("profile", profile);

      if (error) throw error;
      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setPopularBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const fetchPopularVideos = async () => {
    try {
      setLoadingVideos(true);
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('views', { ascending: false })
        .limit(4);

      if (error) throw error;
      setPopularVideos(data || []);
    } catch (error) {
      console.error('Error fetching popular videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const fetchPopularShorts = async () => {
    try {
      setLoadingShorts(true);
      const { data, error } = await supabase
        .from('shorts')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('views', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPopularShorts(data || []);
    } catch (error) {
      console.error('Error fetching popular shorts:', error);
    } finally {
      setLoadingShorts(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-primary-700 mb-4">
            {t('welcome')}
          </h1>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-primary-600">{t('Blogs')}</h2>
            <button 
              onClick={() => navigate('/resources?tab=articles')}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              {t('View all blogs')} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {loadingBlogs ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularBlogs.map(blog => (
                <div 
                  key={blog.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blogs/${blog.id}`)}
                >
                  <img 
                    src={blog.image_url || 'https://via.placeholder.com/400x300'} 
                    alt={blog.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {blog.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <User size={14} className="mr-1" />
                        {blog.profiles?.username || t('Anonymous')}
                      </span>
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-primary-600">{t('Videos')}</h2>
            <button 
              onClick={() => navigate('/resources?tab=videos')}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              {t('View all videos')} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {loadingVideos ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {popularVideos.map(video => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[300px]"
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <User size={14} className="mr-1" />
                        {video.profiles?.username || t('Anonymous')}
                      </span>
                      <span>{video.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-primary-600">{t('Shorts')}</h2>
            <button 
              onClick={() => navigate('/resources?tab=shorts')}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              {t('View all shorts')} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {loadingShorts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularShorts.map(short => (
                <div key={short.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-9 aspect-h-16">
                    <iframe
                      src={`https://www.youtube.com/embed/${short.youtube_id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[200px]"
                    ></iframe>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                      {short.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {short.profiles?.username || t('Anonymous')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}