import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, SlidersHorizontal, Loader2, Sparkles, BookOpen, RefreshCw } from 'lucide-react';
import { fetchBlogs, resetFeed } from '../redux/slices/blogSlice';
import BlogCard from '../components/blog/BlogCard';
import ShareModal from '../components/blog/ShareModal';
import api from '../services/api';

const CATEGORIES = [
  'All',
  'Technology',
  'Web Development',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'UI/UX Design',
  'Career & Growth',
];

export default function HomeFeedPage() {
  const dispatch = useDispatch();
  const { feed, totalPages, currentPage, feedLoading } = useSelector((state) => state.blogs);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [selectedShareBlog, setSelectedShareBlog] = useState(null);

  // Load blogs on filter change
  useEffect(() => {
    dispatch(resetFeed());
    setPage(1);
    dispatch(
      fetchBlogs({
        page: 1,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        search,
        sort,
        append: false,
      })
    );
  }, [dispatch, selectedCategory, sort]);

  // Handle Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(resetFeed());
    setPage(1);
    dispatch(
      fetchBlogs({
        page: 1,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        search,
        sort,
        append: false,
      })
    );
  };

  // Load More (Infinite scroll pagination)
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(
      fetchBlogs({
        page: nextPage,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        search,
        sort,
        append: true,
      })
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner / Feed Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Home Feed</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-950 text-brand-400 border border-brand-800/60 font-semibold">
              Medium-style
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized programming stories, architectural deep-dives, and tech discussions.
          </p>
        </div>

        {/* Sort & Search Controls */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search feed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </form>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300 font-medium focus:outline-none focus:border-brand-500"
          >
            <option value="latest">Latest Stories</option>
            <option value="most_viewed">Most Viewed</option>
            <option value="most_liked">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed Blogs List */}
      <div className="space-y-4">
        {feedLoading && feed.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-xs text-slate-400 font-medium">Fetching curated stories...</p>
          </div>
        ) : feed.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-3xl p-10 border border-dashed border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No stories found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find any stories matching your current filters or search terms. Try picking a different category.
            </p>
          </div>
        ) : (
          feed.map((blog) => (
            <BlogCard key={blog._id} blog={blog} onShare={(b) => setSelectedShareBlog(b)} />
          ))
        )}
      </div>

      {/* Infinite Scroll / Load More Button */}
      {currentPage < totalPages && (
        <div className="pt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={feedLoading}
            className="px-6 py-3 rounded-full font-semibold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white shadow-lg inline-flex items-center gap-2 transition"
          >
            {feedLoading ? <Loader2 className="w-4 h-4 animate-spin text-brand-400" /> : <RefreshCw className="w-4 h-4 text-brand-400" />}
            <span>Load More Stories</span>
          </button>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={!!selectedShareBlog}
        onClose={() => setSelectedShareBlog(null)}
        blog={selectedShareBlog}
      />
    </div>
  );
}
