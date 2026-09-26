import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, BookOpen, Loader2, Sparkles, Filter } from 'lucide-react';
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

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedShareBlog, setSelectedShareBlog] = useState(null);

  // Sync state if URL query changes externally
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== query) {
      setQuery(urlQ);
    }
  }, [searchParams]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query.trim());
      if (category && category !== 'All') params.append('category', category);
      if (sort) params.append('sort', sort);
      params.append('limit', 20);

      const { data } = await api.get(`/blogs?${params.toString()}`);
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error searching blogs:', err);
      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [category, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      ...(query.trim() ? { q: query.trim() } : {}),
      ...(category !== 'All' ? { category } : {}),
      ...(sort !== 'latest' ? { sort } : {}),
    });
    performSearch();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Explore & Search</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-950 text-brand-400 border border-brand-800/60 font-semibold">
              Curated Tech
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search thousands of technical articles, deep dives, authors, and tutorials.
          </p>
        </div>

        {/* Big Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic, tags, keywords, or authors..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xl transition"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                category === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300 font-medium focus:outline-none focus:border-brand-500"
          >
            <option value="latest">Latest Stories</option>
            <option value="most_viewed">Most Popular</option>
            <option value="most_liked">Top Liked</option>
          </select>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <p>
          {loading ? (
            <span>Searching articles...</span>
          ) : (
            <span>
              Found <strong className="text-white font-semibold">{total}</strong> {total === 1 ? 'article' : 'articles'}
              {query && <span> for &ldquo;{query}&rdquo;</span>}
            </span>
          )}
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-xs text-slate-400 font-medium">Scanning BlogSphere stories...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-3xl p-10 border border-dashed border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No articles matched your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try adjusting your query, clearing filters, or exploring different technology topics above.
            </p>
          </div>
        ) : (
          blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onShare={(b) => setSelectedShareBlog(b)}
            />
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
