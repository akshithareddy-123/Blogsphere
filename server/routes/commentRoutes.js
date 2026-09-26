import express from 'express';
import {
  getBlogComments,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/blog/:blogId', getBlogComments);
router.post('/', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleLikeComment);

export default router;
