import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  Users,
  Feather,
  CheckCircle2,
  Bookmark,
  Share2,
  Eye,
  BookOpen,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { fetchTrendingBlogs, fetchBlogs } from '../redux/slices/blogSlice';
import TrendingCarousel from '../components/blog/TrendingCarousel';
import BlogCard from '../components/blog/BlogCard';
import ShareModal from '../components/blog/ShareModal';
import api from '../services/api';

export default function LandingPage() {
  const dispatch = useDispatch();
  const { trending, feed, feedLoading } = useSelector((state) => state.blogs);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [featuredAuthors, setFeaturedAuthors] = useState([]);
  const [selectedShareBlog, setSelectedShareBlog] = useState(null);

  useEffect(() => {
    dispatch(fetchTrendingBlogs());
    dispatch(fetchBlogs({ page: 1, limit: 6 }));

    // Fetch categories
    api.get('/admin/categories').then(({ data }) => {
      setCategories(data.categories || []);
    }).catch(() => {});

    // Demo featured authors
    setFeaturedAuthors([
      {
        name: 'Elena Rostova',
        username: 'elenarostova',
        role: 'Staff Cloud Architect',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        followers: 1240,
        bio: 'Writing about distributed systems, React, and scalable AI infrastructure.',
      },
      {
        name: 'Marcus Chen',
        username: 'marcuschen',
        role: 'Frontend Lead',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        followers: 980,
        bio: 'UI/UX design fanatic, Tailwind CSS advocate, and open-source creator.',
      },
      {
        name: 'Alex Vance',
        username: 'alexvance',
        role: 'Chief Platform Editor',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        followers: 2450,
        bio: 'Platform Administrator & Tech Evangelist on BlogSphere.',
      },
    ]);
  }, [dispatch]);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-purple-600/20 to-pink-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-brand-500/30 text-xs font-semibold text-brand-300 shadow-lg shadow-brand-500/10 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Next-Gen MERN Publishing with AI & Real-Time Socket.io</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Where Great Tech Minds <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Publish & Inspire.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover peer-reviewed architectural deep-dives, modern software paradigms, and intelligent AI-assisted publishing designed for developers and creators.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/feed"
              className="px-7 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-xl shadow-brand-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Stories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/create"
              className="px-7 py-3.5 rounded-full font-semibold text-sm text-slate-200 glass-card hover:bg-slate-800/80 border border-slate-700/80 hover:text-white flex items-center gap-2 transition"
            >
              <Feather className="w-4 h-4 text-brand-400" />
              <span>Write a Story</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time WebSockets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>AI Writing Assistant</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. Trending Blogs Carousel */}
        <TrendingCarousel blogs={trending} />

        {/* 3. Popular Categories */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Popular Categories</h2>
              <p className="text-xs text-slate-400">Browse stories grouped by technology discipline</p>
            </div>
            <Link to="/search" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories.length > 0 ? categories : [
              { name: 'Technology', count: '14+' },
              { name: 'Web Development', count: '28+' },
              { name: 'AI & Machine Learning', count: '19+' },
              { name: 'Cloud & DevOps', count: '12+' },
              { name: 'UI/UX Design', count: '16+' },
              { name: 'Career & Growth', count: '10+' },
            ]).map((cat, idx) => (
              <Link
                key={idx}
                to={`/search?category=${encodeURIComponent(cat.name)}`}
                className="glass-card p-4 rounded-2xl border border-slate-800/90 hover:border-brand-500/50 hover:bg-slate-800/40 transition group text-center flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-brand-300 transition truncate w-full">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-500">Explore &rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Latest Posts & Featured Authors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Feed: Latest Posts */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Latest Stories</h2>
              </div>
              <Link to="/feed" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
                View feed &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {feedLoading && (!feed || feed.length === 0) ? (
                <div className="py-12 text-center text-slate-400">Loading stories...</div>
              ) : (
                (feed || []).slice(0, 5).map((blog) => (
                  <BlogCard key={blog._id} blog={blog} onShare={(b) => setSelectedShareBlog(b)} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Featured Authors & Community Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Featured Authors Card */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Users className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Featured Authors</h3>
              </div>

              <div className="space-y-5">
                {featuredAuthors.map((author, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Link to={`/author/${author.username}`}>
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link to={`/author/${author.username}`} className="block">
                          <h4 className="text-xs font-bold text-white hover:text-brand-400 transition truncate">
                            {author.name}
                          </h4>
                        </Link>
                        <p className="text-[11px] text-brand-400 truncate">{author.role}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">{author.bio}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/feed"
                className="mt-6 block w-full py-2 rounded-xl text-center text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition"
              >
                Discover More Creators
              </Link>
            </div>

            {/* Quick Demo Accounts Banner */}
            <div className="glass-card rounded-3xl p-6 border border-brand-500/20 bg-gradient-to-br from-slate-900 to-brand-950/40">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>One-Click Demo Accounts</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Explore BlogSphere with pre-configured roles: Reader, Author, or Admin.
              </p>
              <Link
                to="/login"
                className="block w-full py-2.5 rounded-xl text-center text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition"
              >
                Launch Demo Login
              </Link>
            </div>
          </div>
        </div>
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
