import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  BookOpen,
  FileText,
  Bookmark,
  Heart,
  Calendar,
  Edit,
  UserPlus,
  UserCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import ShareModal from '../components/blog/ShareModal';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';

export default function AuthorProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'drafts' | 'bookmarks' | 'likes'
  const [blogs, setBlogs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedShareBlog, setSelectedShareBlog] = useState(null);

  const isOwnProfile =
    currentUser &&
    (currentUser.username === username?.toLowerCase() || currentUser.username === author?.username);

  // Fetch author profile
  useEffect(() => {
    if (username) {
      setLoading(true);
      api
        .get(`/users/${username}`)
        .then(({ data }) => {
          setAuthor(data.author);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [username]);

  // Load active tab content
  useEffect(() => {
    if (author) {
      setTabLoading(true);

      if (activeTab === 'published') {
        api.get(`/users/${author.username}/blogs?status=published`).then(({ data }) => {
          setBlogs(data.blogs || []);
          setTabLoading(false);
        });
      } else if (activeTab === 'drafts' && isOwnProfile) {
        api.get(`/users/${author.username}/blogs?status=draft`).then(({ data }) => {
          setDrafts(data.blogs || []);
          setTabLoading(false);
        });
      } else if (activeTab === 'bookmarks' && isOwnProfile) {
        api.get('/users/me/bookmarks').then(({ data }) => {
          setBookmarks((data.bookmarks || []).map((b) => b.blog).filter(Boolean));
          setTabLoading(false);
        });
      } else if (activeTab === 'likes' && isOwnProfile) {
        api.get('/users/me/liked').then(({ data }) => {
          setLikedPosts((data.likes || []).map((l) => l.blog).filter(Boolean));
          setTabLoading(false);
        });
      } else {
        setTabLoading(false);
      }
    }
  }, [author, activeTab, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/users/${author._id}/follow`);
      setAuthor({
        ...author,
        isFollowing: data.isFollowing,
        followersCount: data.followersCount,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Author Not Found</h2>
        <p className="text-xs">We couldn't find a creator profile with username @{username}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar */}
          <img
            src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={author.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-800 shadow-xl"
          />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                  <span>{author.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider bg-brand-950 text-brand-400 border border-brand-800/60 font-semibold">
                    {author.role}
                  </span>
                </h1>
                <p className="text-xs text-brand-400 mt-0.5">@{author.username}</p>
              </div>

              {/* Follow / Edit Profile Button */}
              <div>
                {!isOwnProfile ? (
                  <button
                    onClick={handleToggleFollow}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 ${
                      author.isFollowing
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        : 'bg-brand-600 hover:bg-brand-500 text-white'
                    }`}
                  >
                    {author.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{author.isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                ) : (
                  <Link
                    to="/create"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md transition inline-flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>New Story</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {author.bio || 'Passionate author exploring the digital frontier on BlogSphere.'}
            </p>

            {/* Metrics & Joined Date */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-slate-400">
              <div>
                <strong className="text-white font-bold text-sm mr-1">{(author.followersCount || 0).toLocaleString()}</strong>
                <span>Followers</span>
              </div>
              <div>
                <strong className="text-white font-bold text-sm mr-1">{(author.followingCount || 0).toLocaleString()}</strong>
                <span>Following</span>
              </div>
              <div>
                <strong className="text-white font-bold text-sm mr-1">{author.totalBlogs || 0}</strong>
                <span>Published Stories</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {formatDate(author.createdAt, 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('published')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'published'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Published ({blogs.length})</span>
        </button>

        {isOwnProfile && (
          <>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'drafts'
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Drafts ({drafts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'bookmarks'
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('likes')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'likes'
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Liked Posts ({likedPosts.length})</span>
            </button>
          </>
        )}
      </div>

      {/* Tab Content List */}
      <div className="space-y-4">
        {tabLoading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <span className="text-xs text-slate-400">Loading stories...</span>
          </div>
        ) : (
          <>
            {activeTab === 'published' && (
              blogs.length === 0 ? (
                <div className="py-16 text-center glass-card rounded-2xl p-8 border border-dashed border-slate-800">
                  <p className="text-xs text-slate-400">This author hasn't published any stories yet.</p>
                </div>
              ) : (
                blogs.map((b) => <BlogCard key={b._id} blog={b} onShare={(item) => setSelectedShareBlog(item)} />)
              )
            )}

            {activeTab === 'drafts' && (
              drafts.length === 0 ? (
                <div className="py-16 text-center glass-card rounded-2xl p-8 border border-dashed border-slate-800">
                  <p className="text-xs text-slate-400">No saved drafts found.</p>
                </div>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d._id}
                    className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50 uppercase font-semibold">
                        Draft
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{d.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{d.shortDescription}</p>
                    </div>
                    <Link
                      to={`/edit/${d._id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shrink-0"
                    >
                      Continue Editing
                    </Link>
                  </div>
                ))
              )
            )}

            {activeTab === 'bookmarks' && (
              bookmarks.length === 0 ? (
                <div className="py-16 text-center glass-card rounded-2xl p-8 border border-dashed border-slate-800">
                  <p className="text-xs text-slate-400">No saved bookmarks yet.</p>
                </div>
              ) : (
                bookmarks.map((b) => <BlogCard key={b._id} blog={b} onShare={(item) => setSelectedShareBlog(item)} />)
              )
            )}

            {activeTab === 'likes' && (
              likedPosts.length === 0 ? (
                <div className="py-16 text-center glass-card rounded-2xl p-8 border border-dashed border-slate-800">
                  <p className="text-xs text-slate-400">No liked posts yet.</p>
                </div>
              ) : (
                likedPosts.map((b) => <BlogCard key={b._id} blog={b} onShare={(item) => setSelectedShareBlog(item)} />)
              )
            )}
          </>
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
