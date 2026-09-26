import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, BookOpen, Clock, Loader2, Compass } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import ShareModal from '../components/blog/ShareModal';
import api from '../services/api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShareBlog, setSelectedShareBlog] = useState(null);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me/bookmarks');
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (blogId) => {
    try {
      await api.post(`/blogs/${blogId}/bookmark`);
      setBookmarks((prev) => prev.filter((item) => (item.blog?._id || item.blog) !== blogId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-brand-400" />
            <span>Saved Bookmarks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your reading library of curated tech articles and references.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 self-start sm:self-auto">
          {bookmarks.length} {bookmarks.length === 1 ? 'article saved' : 'articles saved'}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-xs text-slate-400 font-medium">Loading your reading list...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-3xl p-10 border border-dashed border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-950/60 border border-brand-800/40 flex items-center justify-center mx-auto text-brand-400">
              <Bookmark className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Your library is currently empty</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Save stories you want to read later by clicking the bookmark icon on any blog post card or reader screen.
              </p>
            </div>
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Stories in Feed</span>
            </Link>
          </div>
        ) : (
          bookmarks.map((item) => (
            <div key={item._id} className="relative group">
              <BlogCard
                blog={item.blog}
                onShare={(b) => setSelectedShareBlog(b)}
              />
            </div>
          ))
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={!!selectedShareBlog}
        onClose={() => setSelectedShareBlog(null)}
        blog={selectedShareBlog}
      />
    </div>
  );
}
