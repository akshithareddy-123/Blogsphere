import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Eye, Bookmark, Clock, Share2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike, toggleBookmark } from '../../redux/slices/blogSlice';
import { timeAgo } from '../../utils/formatDate';

export default function BlogCard({ blog, onShare }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isLikedLocally, setIsLikedLocally] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likesCount || 0);
  const [isBookmarkedLocally, setIsBookmarkedLocally] = useState(false);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsLikedLocally(!isLikedLocally);
    setLikesCount((prev) => (isLikedLocally ? Math.max(0, prev - 1) : prev + 1));
    dispatch(toggleLike(blog._id));
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsBookmarkedLocally(!isBookmarkedLocally);
    dispatch(toggleBookmark(blog._id));
  };

  return (
    <article className="group relative flex flex-col sm:flex-row gap-6 p-5 sm:p-6 rounded-2xl glass-card hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-brand-950/30">
      {/* Blog Cover Image (clickable) */}
      <Link
        to={`/blog/${blog.slug || blog._id}`}
        className="sm:w-60 h-44 sm:h-auto rounded-xl overflow-hidden shrink-0 relative bg-slate-900"
      >
        <img
          src={blog.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-brand-300 border border-slate-700/60 shadow-sm">
          {blog.category}
        </span>
      </Link>

      {/* Content Area */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          {/* Author Header */}
          <div className="flex items-center gap-3 mb-2.5">
            <Link
              to={`/author/${blog.author?.username || 'author'}`}
              className="flex items-center gap-2 group/author shrink-0"
            >
              <img
                src={blog.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={blog.author?.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300 group-hover/author:text-brand-300 transition truncate max-w-[140px]">
                {blog.author?.name || 'Anonymous Writer'}
              </span>
            </Link>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(blog.createdAt)}</span>
          </div>

          {/* Title */}
          <Link to={`/blog/${blog.slug || blog._id}`} className="block group-hover:text-brand-400 transition-colors">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight line-clamp-2 leading-snug">
              {blog.title}
            </h2>
          </Link>

          {/* Short Description */}
          <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {blog.shortDescription || blog.content?.replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
          </p>
        </div>

        {/* Card Footer: Metadata & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            {/* Reading Time */}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.readingTime || 4} min read</span>
            </span>

            {/* Views */}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{(blog.views || 0).toLocaleString()}</span>
            </span>

            {/* Comments Count */}
            <Link
              to={`/blog/${blog.slug || blog._id}#comments`}
              className="inline-flex items-center gap-1 text-[11px] hover:text-sky-400 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{blog.commentsCount || 0}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                isLikedLocally
                  ? 'text-rose-400 bg-rose-950/40 border border-rose-900/60'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60'
              }`}
              title="Like blog"
            >
              <Heart className={`w-3.5 h-3.5 ${isLikedLocally ? 'fill-rose-400' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-full transition ${
                isBookmarkedLocally
                  ? 'text-brand-400 bg-brand-950/40'
                  : 'text-slate-400 hover:text-brand-400 hover:bg-slate-800/60'
              }`}
              title="Bookmark for later"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarkedLocally ? 'fill-brand-400' : ''}`} />
            </button>

            {/* Share Button */}
            {onShare && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShare(blog);
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition"
                title="Share article"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
