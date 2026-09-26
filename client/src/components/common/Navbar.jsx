import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  PenSquare,
  Search,
  Bell,
  Bookmark,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { fetchNotifications, markAsRead } from '../../redux/slices/notificationSlice';
import { timeAgo } from '../../utils/formatDate';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white animate-pulse-slow" />
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-white flex items-center">
                Blog<span className="text-brand-400">Sphere</span>
              </span>
            </Link>

            {/* Quick Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <Link to="/feed" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition">
                Feed
              </Link>
              <Link to="/search" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition">
                Explore
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search blogs, topics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition shadow-inner"
            />
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Write Blog Button */}
            <Link
              to="/create"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition"
            >
              <PenSquare className="w-4 h-4 text-brand-400" />
              <span>Write</span>
            </Link>

            {isAuthenticated ? (
              <>
                {/* Bookmarks Icon */}
                <Link
                  to="/bookmarks"
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition"
                  title="Saved Bookmarks"
                >
                  <Bookmark className="w-5 h-5" />
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full relative transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="font-semibold text-white text-sm">Notifications</h3>
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs text-brand-400 hover:text-brand-300 transition"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">No new notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                dispatch(markAsRead(notif._id));
                                setNotificationsOpen(false);
                                if (notif.blog) navigate(`/blog/${notif.blog.slug || notif.blog}`);
                              }}
                              className={`py-2.5 px-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition flex items-start gap-3 ${
                                !notif.isRead ? 'bg-brand-950/20' : ''
                              }`}
                            >
                              <div className="mt-0.5 p-1.5 rounded-full bg-slate-800 text-brand-400">
                                {notif.type === 'like' ? (
                                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                                ) : notif.type === 'comment' ? (
                                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                                ) : (
                                  <Bell className="w-3.5 h-3.5 text-brand-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-200 line-clamp-2">{notif.message}</p>
                                <span className="text-[10px] text-slate-500 mt-1 block">{timeAgo(notif.createdAt)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/50 transition"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-2xl p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">@{user?.username}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-brand-950 text-brand-400 border border-brand-800/60">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/author/${user?.username}`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>

                        {(user?.role === 'author' || user?.role === 'admin') && (
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                            <span>Author Dashboard</span>
                          </Link>
                        )}

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 rounded-lg transition"
                          >
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            <span>Admin Moderation</span>
                          </Link>
                        )}

                        <Link
                          to="/bookmarks"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          <span>Bookmarks</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 rounded-lg transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-full shadow-lg shadow-brand-600/30 transition transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-2">
            <form onSubmit={handleSearchSubmit} className="mb-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white"
              />
            </form>
            <Link
              to="/feed"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Feed
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Explore
            </Link>
            <Link
              to="/create"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-brand-400 hover:bg-slate-800 rounded-lg"
            >
              Write a Blog
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
