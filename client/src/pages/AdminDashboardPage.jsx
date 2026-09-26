import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ShieldAlert,
  Users,
  FileText,
  AlertTriangle,
  FolderTree,
  Activity,
  Search,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
  Plus,
  Trash2,
  Filter,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles,
  BarChart2,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { formatDate, timeAgo } from '../utils/formatDate';

export default function AdminDashboardPage() {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('overview'); // overview | users | blogs | reports | categories
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [categoryDist, setCategoryDist] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const [blogsList, setBlogsList] = useState([]);
  const [blogSearch, setBlogSearch] = useState('');

  const [reportsList, setReportsList] = useState([]);
  const [reportFilter, setReportFilter] = useState('all');

  const [categoriesList, setCategoriesList] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Auto-dismiss messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
      setCategoryDist(data.categoryDistribution || []);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch.trim()) params.search = userSearch.trim();
      const { data } = await api.get('/admin/users', { params });
      setUsersList(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchBlogs = async () => {
    try {
      const { data } = await api.get('/admin/blogs');
      setBlogsList(data.blogs || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/admin/reports');
      setReportsList(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategoriesList(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchBlogs(),
          fetchReports(),
          fetchCategories(),
        ]);
      } catch (err) {
        setError('Failed to load admin telemetry.');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Filter re-fetches
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [userRoleFilter, userSearch]);

  // Actions
  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccessMessage(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      setActionLoading(true);
      const { data } = await api.put(`/admin/users/${userId}/ban`);
      setSuccessMessage(data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change ban status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeature = async (blogId) => {
    try {
      setActionLoading(true);
      const { data } = await api.put(`/admin/blogs/${blogId}/feature`);
      setSuccessMessage(data.message);
      fetchBlogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle featured status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/reports/${reportId}`, { status: newStatus });
      setSuccessMessage(`Report marked as ${newStatus}`);
      fetchReports();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setActionLoading(true);
      await api.post('/admin/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        color: newCatColor,
      });
      setSuccessMessage(`Category "${newCatName}" created successfully!`);
      setNewCatName('');
      setNewCatDesc('');
      setShowAddCatModal(false);
      fetchCategories();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/categories/${catId}`);
      setSuccessMessage(`Category "${catName}" removed`);
      fetchCategories();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400 font-medium">Loading platform moderation telemetry...</p>
      </div>
    );
  }

  const filteredReports = reportsList.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const filteredBlogs = blogsList.filter((b) => {
    if (!blogSearch.trim()) return true;
    const q = blogSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.author?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
                Admin Moderation & Analytics
              </h1>
              <p className="text-sm text-slate-400">
                Logged in as <span className="text-amber-400 font-semibold">{user?.name}</span> (Super Admin)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchUsers();
              fetchBlogs();
              fetchReports();
              fetchCategories();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>
            <XCircle className="w-4 h-4 hover:opacity-75" />
          </button>
        </div>
      )}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <XCircle className="w-4 h-4 hover:opacity-75" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 mt-6 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'overview'
              ? 'bg-slate-800/90 text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'users'
              ? 'bg-slate-800/90 text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({stats?.usersCount || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'blogs'
              ? 'bg-slate-800/90 text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Blogs Moderation ({stats?.blogsCount || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition relative ${
            activeTab === 'reports'
              ? 'bg-slate-800/90 text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reports Triage</span>
          {stats?.reportsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
              {stats.reportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
            activeTab === 'categories'
              ? 'bg-slate-800/90 text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories ({categoriesList.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 mt-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Registered Users</span>
              <p className="text-2xl font-bold text-white mt-1">{stats?.usersCount || 0}</p>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                +12% this month
              </span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Published Articles</span>
              <p className="text-2xl font-bold text-white mt-1">{stats?.blogsCount || 0}</p>
              <span className="text-[11px] text-brand-400 flex items-center gap-1 mt-1">
                Across 8 topics
              </span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Pending Reports</span>
              <p className={`text-2xl font-bold mt-1 ${stats?.reportsCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {stats?.reportsCount || 0}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">Requires action</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Estimated DAU</span>
              <p className="text-2xl font-bold text-white mt-1">{stats?.dailyActiveUsers || 24}</p>
              <span className="text-[11px] text-emerald-400 mt-1 block">Active readers</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Discussions</span>
              <p className="text-2xl font-bold text-white mt-1">{stats?.commentsCount || 0}</p>
              <span className="text-[11px] text-sky-400 mt-1 block">Real-time comments</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Categories</span>
              <p className="text-2xl font-bold text-white mt-1">{categoriesList.length}</p>
              <span className="text-[11px] text-purple-400 mt-1 block">Active tags</span>
            </div>
          </div>

          {/* Distribution & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800/80">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                <span>Published Blogs by Category</span>
              </h2>

              <div className="space-y-4">
                {categoryDist.length === 0 ? (
                  <p className="text-xs text-slate-500">No blog distribution data available.</p>
                ) : (
                  categoryDist.map((item) => {
                    const total = stats?.blogsCount || 1;
                    const percent = Math.round((item.count / total) * 100);
                    return (
                      <div key={item._id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300">{item._id || 'Uncategorized'}</span>
                          <span className="text-slate-400">
                            {item.count} blogs ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-white mb-3">Admin Quick Operations</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Perform critical platform administration actions, triage flagged articles, or introduce new categories.
                </p>

                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Triage Pending Reports
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold">
                      {stats?.reportsCount || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('categories');
                      setShowAddCatModal(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Create New Category
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      Review User Permissions
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Automated system health status: Normal (MongoDB + Memory fallback)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="mt-6 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Roles</option>
                <option value="reader">Reader</option>
                <option value="author">Author</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role Tier</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No users matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                u.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                              }
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <Link
                                to={`/author/${u.username}`}
                                className="font-semibold text-white hover:text-amber-400 transition"
                              >
                                {u.name}
                              </Link>
                              <span className="block text-[10px] text-slate-500">@{u.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            disabled={actionLoading || u.role === 'admin' && u._id === user?._id}
                            onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                          >
                            <option value="reader">Reader</option>
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(u.createdAt)}</td>
                        <td className="py-3 px-4">
                          {u.isBanned ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Banned
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBan(u._id)}
                              disabled={actionLoading}
                              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                                u.isBanned
                                  ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'
                                  : 'bg-rose-600/30 text-rose-300 hover:bg-rose-600/50'
                              }`}
                            >
                              {u.isBanned ? 'Unban User' : 'Ban Account'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: BLOGS MODERATION */}
      {activeTab === 'blogs' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search blogs by title, category, author..."
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <span className="text-xs text-slate-400">Total Blogs: {filteredBlogs.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBlogs.map((b) => (
              <div
                key={b._id}
                className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-brand-950 text-brand-400 border border-brand-800/50 text-[10px] font-bold uppercase tracking-wider">
                      {b.category}
                    </span>
                    <button
                      onClick={() => handleToggleFeature(b._id)}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                        b.isFeatured
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Toggle Featured on Landing Carousel"
                    >
                      <Star className={`w-3.5 h-3.5 ${b.isFeatured ? 'fill-amber-400' : ''}`} />
                      <span>{b.isFeatured ? 'Featured' : 'Not Featured'}</span>
                    </button>
                  </div>

                  <Link to={`/blog/${b.slug}`}>
                    <h2 className="text-sm font-bold text-white hover:text-amber-400 transition mt-2.5 line-clamp-2">
                      {b.title}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <img
                      src={
                        b.author?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={b.author?.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{b.author?.name || 'Unknown Author'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      {b.views || 0}
                    </span>
                    <span>•</span>
                    <span>{formatDate(b.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    b.status === 'published' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {b.status}
                  </span>

                  <Link
                    to={`/blog/${b.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: REPORTS TRIAGE */}
      {activeTab === 'reports' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between glass-card p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Status Filter:</span>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Reports ({reportsList.length})</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">No Flagged Reports</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Community content moderation queue is completely clear!
                </p>
              </div>
            ) : (
              filteredReports.map((r) => (
                <div
                  key={r._id}
                  className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'pending'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : r.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {r.status}
                      </span>
                      <span className="text-xs text-slate-500">• {timeAgo(r.createdAt)}</span>
                      <span className="text-xs font-semibold text-rose-300">Reason: {r.reason}</span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Reported Blog:{' '}
                      <Link
                        to={`/blog/${r.blog?.slug}`}
                        className="text-white font-bold hover:underline"
                      >
                        {r.blog?.title || 'Unknown Title'}
                      </Link>
                    </p>

                    {r.details && (
                      <p className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg italic">
                        "{r.details}"
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500">
                      Reported by: <span className="text-slate-300 font-medium">{r.reporter?.name || 'Anonymous'}</span> ({r.reporter?.email})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {r.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateReportStatus(r._id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-medium transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                    {r.status !== 'dismissed' && (
                      <button
                        onClick={() => handleUpdateReportStatus(r._id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Categories help organize reader feeds and trending carousels.
            </p>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesList.map((cat) => (
              <div
                key={cat._id}
                className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color || '#3b82f6' }}
                    />
                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-2">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                  slug: /{cat.slug}
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {showAddCatModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-amber-400" />
                    <span>Create New Category</span>
                  </h3>
                  <button onClick={() => setShowAddCatModal(false)}>
                    <XCircle className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                </div>

                <form onSubmit={handleCreateCategory} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cloud Computing"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Brief summary of articles in this category..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Theme Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-400">{newCatColor}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCatModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
