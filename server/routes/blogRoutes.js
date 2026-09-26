import express from 'express';
import {
  getTrendingBlogs,
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  toggleBookmarkBlog,
  getRelatedBlogs,
  reportBlog,
} from '../controllers/blogController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAuthorOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/trending', getTrendingBlogs);
router.get('/', getBlogs);
router.get('/:identifier', optionalAuth, getBlog);
router.post('/', protect, requireAuthorOrAdmin, createBlog);
router.put('/:id', protect, requireAuthorOrAdmin, updateBlog);
router.delete('/:id', protect, requireAuthorOrAdmin, deleteBlog);

router.post('/:id/like', protect, toggleLikeBlog);
router.post('/:id/bookmark', protect, toggleBookmarkBlog);
router.get('/:id/related', getRelatedBlogs);
router.post('/:id/report', protect, reportBlog);

export default router;
