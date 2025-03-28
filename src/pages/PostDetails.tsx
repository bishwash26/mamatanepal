import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Send, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    username: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  author_id: string;
  profiles: {
    username: string;
  };
  likes: number;
  user_has_liked?: boolean;
}

const PostDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use AuthContext instead of direct calls
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const userId = useMemo(() => user?.id, [user]);

  useEffect(() => {
    if (!id) {
      setError('Post ID is missing');
      setLoading(false);
      return;
    }
    
    fetchPost();
    fetchComments();
  }, [id, userId]); // Add userId as dependency to refetch when user changes

  const fetchPost = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username
          ),
          likes: likes(count)
        `)
        .eq('id', id);
        
      // Only check if user has liked if they're logged in
      if (userId) {
        query = supabase
          .from('posts')
          .select(`
            *,
            profiles (
              username
            ),
            likes: likes(count),
            user_has_liked: likes!left(id)
          `)
          .eq('id', id)
          .eq('likes.author_id', userId);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) {
        console.error('Error fetching post:', fetchError);
        setError('Failed to load post');
        return;
      }

      setPost(data);
      setLikeCount(data.likes?.[0]?.count || 0);
      setIsLiked(!!data.user_has_liked?.length);
    } catch (err) {
      console.error('Error in fetchPost:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching comments:', fetchError);
        return;
      }

      setComments(data || []);
    } catch (err) {
      console.error('Error in fetchComments:', err);
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !userId) return;

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          content: newComment.trim(),
          post_id: id,
          author_id: userId,
        },
      ]);

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    setNewComment('');
    fetchComments();
  };

  const handleLike = async () => {
    if (!userId) {
      // Redirect to login
      navigate('/login', { state: { from: location, action: 'like' } });
      return;
    }

    // Optimistically update UI
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', id)
          .eq('author_id', userId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([
            {
              post_id: id,
              author_id: userId,
            },
          ]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error handling like:', error);
      // Revert UI changes on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6 text-center">Loading...</div>;
  if (error) return <div className="max-w-4xl mx-auto p-6 text-center text-red-600">{error}</div>;
  if (!post) return <div className="max-w-4xl mx-auto p-6 text-center">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Login Banner for non-authenticated users */}
      {isAuthenticated === false && (
        <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-primary-700">{t('Sign in to like posts and join the conversation')}</p>
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

      {/* Post Details */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.content}</p>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {post.is_anonymous
                ? t('Anonymous')
                : post.profiles?.username || t('User')}
            </span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-pink-600' : 'hover:text-pink-600'
              }`}
            >
              <Heart 
                size={16} 
                className={isLiked ? 'fill-current' : ''} 
              />
              <span>{likeCount}</span>
            </button>
            <div className="flex items-center space-x-1 text-pink-600">
              <MessageCircle size={16} />
              <span>{comments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('Comments')} ({comments.length})
        </h2>

        {/* Add Comment */}
        <div className="flex items-center space-x-4 mb-8">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isAuthenticated ? t('Write a comment...') : t('Sign in to comment')}
            className="flex-1 p-2 border rounded-lg focus:ring-pink-500 focus:border-pink-500"
            disabled={!isAuthenticated}
          />
          <button
            onClick={handleAddComment}
            className={`p-2 ${isAuthenticated ? 'text-pink-600 hover:text-pink-700' : 'text-gray-400 cursor-not-allowed'}`}
            disabled={!isAuthenticated}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">
                  {comment.profiles?.username || t('User')}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetails; 