import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Sparkles,
  CheckCheck,
  Trash2,
  Loader2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from '../redux/slices/notificationSlice';
import api from '../services/api';
import { timeAgo } from '../utils/formatDate';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setClearing(true);
      try {
        await api.delete('/notifications');
        dispatch(fetchNotifications());
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      } finally {
        setClearing(false);
      }
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-400" />;
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      dispatch(markAsRead(notif._id));
    }
    if (notif.blog) {
      navigate(`/blog/${notif.blog.slug || notif.blog}`);
    } else if (notif.sender) {
      navigate(`/author/${notif.sender.username || notif.sender}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-brand-400" />
            <span>Activity Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time updates on likes, comments, author follows, and community reactions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-950 hover:bg-brand-900 border border-brand-800/80 text-brand-300 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 text-slate-400 hover:text-rose-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'unread'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-xs text-slate-400 font-medium">Checking notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-3xl p-10 border border-dashed border-slate-800">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No notifications yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              When readers like your posts, comment on your stories, or start following you, your updates will show up here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-2xl border transition flex items-start gap-4 cursor-pointer group ${
                notif.isRead
                  ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                  : 'bg-brand-950/20 border-brand-800/50 hover:bg-brand-950/30'
              }`}
            >
              {/* Icon / Avatar */}
              <div className="relative shrink-0">
                {notif.sender?.avatar ? (
                  <img
                    src={notif.sender.avatar}
                    alt={notif.sender.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    {getNotificationIcon(notif.type)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-800">
                  {getNotificationIcon(notif.type)}
                </span>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 group-hover:text-white transition leading-snug">
                  {notif.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(notif.createdAt)}
                  </span>
                  {!notif.isRead && (
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="shrink-0 text-slate-500 group-hover:text-slate-300 transition">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
