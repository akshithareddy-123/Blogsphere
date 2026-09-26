import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Eye, Heart, Clock } from 'lucide-react';
import { timeAgo } from '../../utils/formatDate';

export default function TrendingCarousel({ blogs = [] }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Trending on BlogSphere</h2>
            <p className="text-xs text-slate-400">The most discussed and widely read articles this week</p>
          </div>
        </div>

        {/* Carousel arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-full glass-card hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-30"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-full glass-card hover:bg-slate-800 text-slate-300 hover:text-white transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {blogs.map((blog, idx) => (
          <div
            key={blog._id}
            className="w-[290px] sm:w-[350px] shrink-0 glass-card rounded-2xl p-5 flex flex-col justify-between group hover:border-brand-500/40 transition duration-300 relative overflow-hidden"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Ambient subtle glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all pointer-events-none" />

            <div>
              {/* Ranking Number & Category */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-black text-3xl sm:text-4xl text-slate-800 group-hover:text-brand-500/40 transition-colors">
                  0{idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-900 border border-slate-800 text-brand-400">
                  {blog.category}
                </span>
              </div>

              {/* Cover Image thumbnail */}
              <div className="h-36 rounded-xl overflow-hidden mb-3 relative bg-slate-900">
                <img
                  src={blog.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Author Row */}
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={blog.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                  alt={blog.author?.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-700"
                />
                <span className="text-xs text-slate-300 font-medium truncate">{blog.author?.name}</span>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] text-slate-500">{timeAgo(blog.createdAt)}</span>
              </div>

              {/* Title */}
              <Link to={`/blog/${blog.slug || blog._id}`} className="block">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>
              </Link>
            </div>

            {/* Bottom Meta */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{blog.readingTime || 4} min read</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart className="w-3 h-3 fill-rose-400/20" />
                  <span>{blog.likesCount || 0}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{(blog.views || 0).toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
