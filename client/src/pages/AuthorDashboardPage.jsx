import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FileText,
  Eye,
  Heart,
  Users,
  MessageSquare,
  PenSquare,
  TrendingUp,
  BarChart3,
  Calendar,
  ExternalLink,
  Edit,
  Loader2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';

export default function AuthorDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/author/dashboard');
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load author dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-sm text-slate-400 font-medium">Aggregating your author analytics...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    followersCount: 0,
    totalComments: 0,
  };

  const monthlyStats = dashboardData?.monthlyStats || [];
  const topBlogs = dashboardData?.topBlogs || [];

  // Calculate highest view for scaling chart
  const maxViews = Math.max(...monthlyStats.map((m) => m.views), 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator Analytics Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor real-time audience reach, reader engagement, and publication performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/create"
            className="px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write New Story</span>
          </Link>
          <Link
            to={`/author/${user?.username}`}
            className="px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <span>Public Profile</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 1. Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Stories */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Stories</span>
            <div className="p-2 rounded-xl bg-brand-950/80 text-brand-400 border border-brand-800/50">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.totalBlogs}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Published on BlogSphere</p>
          </div>
        </div>

        {/* Total Views */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Views</span>
            <div className="p-2 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/50">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.totalViews.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Active impressions</span>
            </p>
          </div>
        </div>

        {/* Total Likes */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Likes</span>
            <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/50">
              <Heart className="w-4 h-4 fill-rose-400/20" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.totalLikes.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Appreciations received</p>
          </div>
        </div>

        {/* Followers */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Followers</span>
            <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.followersCount.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Community subscribers</p>
          </div>
        </div>

        {/* Discussion Comments */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Comments</span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/50">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.totalComments.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Reader responses</p>
          </div>
        </div>
      </div>

      {/* 2. Monthly Trend Chart (Visual Bar + Sparkline) */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-400" />
              <span>Readership & Engagement Trajectory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              6-Month trend analysis across story reads and claps
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
              <span>Views</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>Likes</span>
            </div>
          </div>
        </div>

        {/* Visual Chart Bars */}
        <div className="grid grid-cols-6 gap-2 sm:gap-6 pt-6 pb-2 items-end h-56 border-b border-slate-800">
          {monthlyStats.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.views / maxViews) * 100));
            const likePercent = Math.max(8, Math.round(((item.likes * 3) / maxViews) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                  {/* Views Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-1/2 sm:w-8 bg-gradient-to-t from-brand-700 to-brand-400 rounded-t-lg transition-all group-hover:brightness-125 relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-white font-bold pointer-events-none transition whitespace-nowrap z-10">
                      {item.views} views
                    </div>
                  </div>
                  {/* Likes Bar */}
                  <div
                    style={{ height: `${likePercent}%` }}
                    className="w-1/2 sm:w-8 bg-gradient-to-t from-rose-700 to-rose-400 rounded-t-lg transition-all group-hover:brightness-125 relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-white font-bold pointer-events-none transition whitespace-nowrap z-10">
                      {item.likes} likes
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Top Performing Stories Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Top Performing Stories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your most viewed and engaged publications</p>
          </div>
          <Link
            to={`/author/${user?.username}`}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
          >
            View all stories &rarr;
          </Link>
        </div>

        {topBlogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No published stories found yet. Write your first article to see analytics!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Story Title</th>
                  <th className="pb-3 font-semibold text-center">Category</th>
                  <th className="pb-3 font-semibold text-center">Views</th>
                  <th className="pb-3 font-semibold text-center">Likes</th>
                  <th className="pb-3 font-semibold text-center">Comments</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {topBlogs.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 pr-4">
                      <Link
                        to={`/blog/${b.slug || b._id}`}
                        className="font-medium text-white hover:text-brand-400 transition line-clamp-1"
                      >
                        {b.title}
                      </Link>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {formatDate(b.createdAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center font-semibold text-white">
                      {b.views || 0}
                    </td>
                    <td className="py-3.5 px-2 text-center font-semibold text-rose-400">
                      {b.likesCount || 0}
                    </td>
                    <td className="py-3.5 px-2 text-center font-semibold text-sky-400">
                      {b.commentsCount || 0}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/blog/${b.slug || b._id}`}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="View Story"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/edit/${b._id}`}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-brand-400 transition"
                          title="Edit Story"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
