import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Heart,
  Bookmark,
  Share2,
  Clock,
  Eye,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  UserPlus,
  UserCheck,
  Tag,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { fetchBlogDetails, toggleLike, toggleBookmark } from '../redux/slices/blogSlice';
import CommentSection from '../components/blog/CommentSection';
import ShareModal from '../components/blog/ShareModal';
import ReportModal from '../components/blog/ReportModal';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeBlog, isLiked, isBookmarked, detailsLoading } = useSelector((state) => state.blogs);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    if (slug) {
      dispatch(fetchBlogDetails(slug));
      window.scrollTo(0, 0);
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (activeBlog) {
      // Check author follow status
      if (activeBlog.author?.username) {
        api.get(`/users/${activeBlog.author.username}`).then(({ data }) => {
          setIsFollowingAuthor(data.author?.isFollowing || false);
          setFollowersCount(data.author?.followersCount || 0);
        }).catch(() => {});
      }

      // Fetch related blogs
      api.get(`/blogs/${activeBlog._id}/related`).then(({ data }) => {
        setRelatedBlogs(data.blogs || []);
      }).catch(() => {});
    }
  }, [activeBlog]);

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleLike(activeBlog._id));
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleBookmark(activeBlog._id));
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.post(`/users/${activeBlog.author._id}/follow`);
      setIsFollowingAuthor(data.isFollowing);
      setFollowersCount(data.followersCount);
    } catch (err) {
      console.error(err);
    }
  };

  if (detailsLoading || !activeBlog) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading story...</span>
        </div>
      </div>
    );
  }

  // Convert raw markdown / text into readable paragraphs / code blocks
  const renderFormattedContent = (content) => {
    // If it already looks like HTML or markdown
    const sections = content.split('\n\n');
    return sections.map((sec, i) => {
      if (sec.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold text-white mt-6 mb-2">{sec.replace('### ', '')}</h3>;
      }
      if (sec.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-3">{sec.replace('## ', '')}</h2>;
      }
      if (sec.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-extrabold text-white mt-10 mb-4">{sec.replace('# ', '')}</h1>;
      }
      if (sec.startsWith('```')) {
        const codeLines = sec.replace(/```[a-z]*/g, '').trim();
        return (
          <pre key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-brand-300 overflow-x-auto my-4">
            <code>{codeLines}</code>
          </pre>
        );
      }
      if (sec.startsWith('> ')) {
        return (
          <blockquote key={i} className="pl-4 border-l-4 border-brand-500 my-4 text-slate-300 italic bg-brand-950/20 py-2 rounded-r-lg">
            {sec.replace('> ', '')}
          </blockquote>
        );
      }
      if (sec.startsWith('- ')) {
        const items = sec.split('\n- ');
        return (
          <ul key={i} className="list-disc pl-6 my-3 space-y-1.5 text-slate-300 text-sm">
            {items.map((item, idx) => (
              <li key={idx}>{item.replace(/^- /, '')}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
          {sec}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to feed</span>
      </Link>

      {/* Header Info */}
      <header className="space-y-4">
        {/* Category Pill & Reading Time */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-400 border border-brand-800/60">
            {activeBlog.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{activeBlog.readingTime || 4} min read</span>
          </span>
          <span className="text-slate-600 text-xs">•</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{(activeBlog.views || 0).toLocaleString()} views</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {activeBlog.title}
        </h1>

        {/* Short Description excerpt */}
        {activeBlog.shortDescription && (
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            {activeBlog.shortDescription}
          </p>
        )}

        {/* Author Details Row */}
        <div className="pt-4 pb-4 border-y border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/author/${activeBlog.author?.username}`}>
              <img
                src={activeBlog.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={activeBlog.author?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/author/${activeBlog.author?.username}`}>
                  <h3 className="text-sm font-bold text-white hover:text-brand-400 transition">
                    {activeBlog.author?.name}
                  </h3>
                </Link>
                {user?._id !== activeBlog.author?._id && (
                  <button
                    onClick={handleToggleFollow}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                      isFollowingAuthor
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-brand-600 hover:bg-brand-500 text-white'
                    }`}
                  >
                    {isFollowingAuthor ? 'Following' : '+ Follow'}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Published on {formatDate(activeBlog.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isLiked
                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800/80 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400' : ''}`} />
              <span>{activeBlog.likesCount || 0}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition ${
                isBookmarked
                  ? 'bg-brand-950/60 text-brand-400 border border-brand-800/80'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Save to bookmarks"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-brand-400' : ''}`} />
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              title="Share story"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
              title="Report content"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {activeBlog.coverImage && (
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 aspect-video max-h-[460px] bg-slate-900">
          <img
            src={activeBlog.coverImage}
            alt={activeBlog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Blog Content Area */}
      <article className="prose-custom pt-4">
        {renderFormattedContent(activeBlog.content)}
      </article>

      {/* Tags Row */}
      {activeBlog.tags && activeBlog.tags.length > 0 && (
        <div className="pt-6 pb-6 border-b border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Tags:</span>
          </span>
          {activeBlog.tags.map((tag, i) => (
            <Link
              key={i}
              to={`/search?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Author Bio Box */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <Link to={`/author/${activeBlog.author?.username}`}>
          <img
            src={activeBlog.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={activeBlog.author?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-500/50 shrink-0"
          />
        </Link>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Link to={`/author/${activeBlog.author?.username}`}>
                <h4 className="text-base font-bold text-white hover:text-brand-400 transition">
                  Written by {activeBlog.author?.name}
                </h4>
              </Link>
              <p className="text-xs text-brand-400">@{activeBlog.author?.username}</p>
            </div>
            {user?._id !== activeBlog.author?._id && (
              <button
                onClick={handleToggleFollow}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md transition self-center sm:self-start"
              >
                {isFollowingAuthor ? 'Following' : 'Follow Author'}
              </button>
            )}
          </div>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            {activeBlog.author?.bio || 'Passionate writer sharing insights on BlogSphere.'}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection blogId={activeBlog._id} />

      {/* Related Blogs Section */}
      {relatedBlogs.length > 0 && (
        <section className="pt-10 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <span>Recommended in {activeBlog.category}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedBlogs.map((b) => (
              <Link
                key={b._id}
                to={`/blog/${b.slug || b._id}`}
                className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-brand-500/40 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-slate-900">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-400 line-clamp-2 leading-snug">
                    {b.title}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{b.author?.name}</span>
                  <span className="flex items-center gap-1 text-brand-300">
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        blog={activeBlog}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        blogId={activeBlog._id}
        blogTitle={activeBlog.title}
      />
    </div>
  );
}
