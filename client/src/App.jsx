import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomeFeedPage from './pages/HomeFeedPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPage from './pages/EditBlogPage';
import AuthorProfilePage from './pages/AuthorProfilePage';
import AuthorDashboardPage from './pages/AuthorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BookmarksPage from './pages/BookmarksPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';

// Real-time socket & notifications
import { getSocket } from './services/socket';
import { addLiveNotification, fetchNotifications } from './redux/slices/notificationSlice';
import { AlertCircle } from 'lucide-react';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Initialize socket and attach real-time notification listener
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const socket = getSocket();
      socket.emit('join_user', user._id);

      const handleNotification = (notif) => {
        dispatch(addLiveNotification(notif));
      };

      socket.on('notification', handleNotification);

      // Fetch latest notifications on startup
      dispatch(fetchNotifications());

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [isAuthenticated, user?._id, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-600 selection:text-white">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<HomeFeedPage />} />
          <Route path="/blog/:slug" element={<BlogDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/author/:username" element={<AuthorProfilePage />} />

          {/* Auth Guest-only Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/feed" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/feed" replace /> : <SignupPage />}
          />

          {/* Protected Reader/Author/Admin Routes */}
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <BookmarksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Creator Routes (Author & Admin) */}
          <Route
            path="/create"
            element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <CreateBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <EditBlogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['author', 'admin']}>
                <AuthorDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Super Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto my-24 p-8 glass-card rounded-3xl border border-slate-800 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-brand-400 mx-auto" />
                <h1 className="text-3xl font-display font-black text-white">404</h1>
                <p className="text-sm text-slate-400">
                  The page you're searching for does not exist in our galaxy.
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-xs text-white transition shadow-lg shadow-brand-500/25"
                >
                  Return to Home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
