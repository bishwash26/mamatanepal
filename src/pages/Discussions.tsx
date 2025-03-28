import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Plus, X, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  author_id: string;
  author_name?: string;
  likes: { count: number }[];
  user_has_liked?: boolean;
  comments: { count: number }[];
}

const POSTS_PER_PAGE = 10;

const Discussions = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const {user} = useAuth();

  const fetchPosts = async (page = 0) => {
    try {
      setLoading(true);
      const from = page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      // First get posts with their like and comment counts
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          is_anonymous,
          author_id,
          profiles!posts_author_id_fkey (
            username
          ),
          likes: likes!post_id (
            id
          ),
          comments: comments!post_id (
            id
          ),
          user_liked: likes!left (
            id,
            author_id
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (posts) {
        const formattedPosts = posts.map(post => ({
          ...post,
          likes: [{ count: Array.isArray(post.likes) ? post.likes.length : 0 }],
          comments: [{ count: Array.isArray(post.comments) ? post.comments.length : 0 }],
          author_name: post.profiles && typeof post.profiles === 'object' ? 
            (post.profiles as any).username : undefined,
          user_has_liked: post.user_liked?.some(like => like.author_id === user?.id)
        }));

        // Set liked status
        const likedMap = posts.reduce((acc: Record<string, boolean>, post) => {
          acc[post.id] = post.user_liked?.some(like => like.author_id === user?.id) || false;
          return acc;
        }, {});
        setLikedPosts(likedMap);

        if (page === 0) {
          setPosts(formattedPosts);
        } else {
          setPosts(prev => [...prev, ...formattedPosts]);
        }
        setHasMore(posts.length === POSTS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      if (hasMore && !loading) {
        setCurrentPage(prev => prev + 1);
      }
    }
  }, [hasMore, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);


  const handleCreatePost = () => {
    if (!user) {
      // Redirect to login
      navigate('/login', { state: { from: location, action: 'createPost' } });
      return;
    }
    
    setIsModalOpen(true);
  };

  const createPost = async () => {
    console.log("Created post froom here")
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    if (!user) return;

    console.log("user is logged in", user);

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          author_id: user.id,
          is_anonymous: isAnonymous,
        },
      ]);

    if (error) {
      console.error('Error creating post:', error);
      return;
    }

    setIsModalOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setIsAnonymous(false);
    fetchPosts();
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      // Redirect to login
      navigate('/login', { state: { from: location, action: 'like' } });
      return;
    }

    // Optimistically update UI
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: [{ count: post.likes[0].count + (isLiked ? -1 : 1) }]
            }
          : post
      )
    );

    // Make API call in background
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('author_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([
            {
              post_id: postId,
              author_id: user.id,
            },
          ]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error handling like:', error);
      
      // Revert UI changes on error (optional)
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: [{ count: post.likes[0].count + (isLiked ? 1 : -1) }]
              }
            : post
        )
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Login Banner for non-authenticated users */}
      {!user && (
        <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-primary-700">{t('Sign in to create posts, like, and comment')}</p>
          </div>
          <button 
            onClick={() => navigate('/login', { state: { from: location } })}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <LogIn size={16} />
            <span>{t('Sign In')}</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('Discussions')}
        </h1>
        <button
          onClick={handleCreatePost}
          className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus size={20} />
          <span>{t('Create Post')}</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/discussions/${post.id}`)}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {post.title}
            </h2>
            <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>
                  {post.is_anonymous
                    ? t('Anonymous')
                    : post.author_name || t('User')}
                </span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(post.id, post.user_has_liked ?? false);
                  }}
                  className={`flex items-center space-x-1 transition-colors ${
                    post.user_has_liked ? 'text-pink-600' : 'hover:text-pink-600'
                  }`}
                >
                  <Heart 
                    size={16} 
                    className={post.user_has_liked ? 'fill-current' : ''} 
                  />
                  <span>{post.likes?.[0]?.count || 0}</span>
                </button>
                <div className="flex items-center space-x-1 text-pink-600">
                  <MessageCircle size={16} />
                  <span>{post.comments?.[0]?.count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            {loading ? t('Loading...') : t('Load More')}
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {t('Create New Post')}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:ring-pink-500 focus:border-pink-500"
              placeholder={t('Enter post title...')}
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg mb-4 focus:ring-pink-500 focus:border-pink-500"
              placeholder={t('Write your post here...')}
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="anonymous" className="text-gray-700">
                {t('Post anonymously')}
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={createPost}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                {t('Post')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discussions;