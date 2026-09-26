import express from 'express';
import {
  getAuthorProfile,
  getAuthorBlogs,
  toggleFollowAuthor,
  getUserBookmarks,
  getUserLikedPosts,
  getUserReadingHistory,
  getAuthorDashboard,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAuthorOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/me/bookmarks', protect, getUserBookmarks);
router.get('/me/liked', protect, getUserLikedPosts);
router.get('/me/history', protect, getUserReadingHistory);
router.get('/author/dashboard', protect, requireAuthorOrAdmin, getAuthorDashboard);
router.post('/:id/follow', protect, toggleFollowAuthor);
router.get('/:username', optionalAuth, getAuthorProfile);
router.get('/:username/blogs', optionalAuth, getAuthorBlogs);

export default router;
