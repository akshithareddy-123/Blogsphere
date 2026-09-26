import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageSquare, Send, Loader2, UserCheck } from 'lucide-react';
import CommentItem from './CommentItem';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { incrementCommentsCount, decrementCommentsCount } from '../../redux/slices/blogSlice';

export default function CommentSection({ blogId }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  // Load comments
  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/blog/${blogId}`);
      setComments(data.comments);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchComments();

      // Real-time socket room subscription
      const socket = getSocket();
      if (socket) {
        socket.emit('join_blog', blogId);

        // Listen for new comments
        socket.on('new_comment', ({ comment, parentCommentId }) => {
          fetchComments();
          dispatch(incrementCommentsCount(blogId));
        });

        // Listen for comment updates or deletes
        socket.on('update_comment', () => fetchComments());
        socket.on('delete_comment', () => {
          fetchComments();
          dispatch(decrementCommentsCount(blogId));
        });

        // Listen for typing indicator
        socket.on('user_typing', ({ user: u }) => {
          setTypingUser(u);
        });
        socket.on('user_stop_typing', () => {
          setTypingUser(null);
        });
      }

      return () => {
        if (socket) {
          socket.emit('leave_blog', blogId);
          socket.off('new_comment');
          socket.off('update_comment');
          socket.off('delete_comment');
          socket.off('user_typing');
          socket.off('user_stop_typing');
        }
      };
    }
  }, [blogId, dispatch]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to participate in discussion.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/comments', {
        blogId,
        content: newComment.trim(),
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    if (!isAuthenticated) {
      alert('Please sign in to reply.');
      return;
    }
    try {
      await api.post('/comments', {
        blogId,
        content,
        parentCommentId,
      });
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (commentId, content) => {
    try {
      await api.put(`/comments/${commentId}`, { content });
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (commentId) => {
    if (!isAuthenticated) {
      alert('Please sign in to like comments.');
      return;
    }
    try {
      await api.post(`/comments/${commentId}/like`);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="comments" className="mt-16 pt-12 border-t border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Community Discussion</h3>
            <p className="text-xs text-slate-400">Share insights, ask questions, and engage with the author</p>
          </div>
        </div>

        {/* Live Socket Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time connected</span>
        </div>
      </div>

      {/* Main Comment Input Box */}
      <form onSubmit={handleAddComment} className="mb-10 glass-card rounded-2xl p-4 border border-slate-800">
        <div className="flex items-start gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-700 mt-1"
          />
          <div className="flex-1 min-w-0">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAuthenticated
                  ? 'What are your thoughts on this story? Markdown supported...'
                  : 'Please sign in to leave a comment...'
              }
              rows={3}
              disabled={!isAuthenticated}
              className="w-full p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-500">Be respectful and constructive</span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim() || !isAuthenticated}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 transition disabled:opacity-40"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Publish Comment</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Typing Indicator */}
      {typingUser && (
        <div className="text-xs text-brand-400 italic mb-4 animate-pulse flex items-center gap-1.5">
          <span>{typingUser.name} is typing a response...</span>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          <span className="text-xs">Loading conversation...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center glass-card rounded-2xl border border-dashed border-slate-800 p-8">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No comments yet</p>
          <p className="text-xs text-slate-500 mt-1">Be the first to start the discussion on this article!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLike={handleLike}
              currentUserId={user?._id}
              isAdmin={user?.role === 'admin'}
            />
          ))}
        </div>
      )}
    </section>
  );
}
