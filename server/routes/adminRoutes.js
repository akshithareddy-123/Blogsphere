import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  toggleBanUser,
  getAllBlogsAdmin,
  toggleFeatureBlog,
  getAllReports,
  updateReportStatus,
  getCategories,
  createCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Allow public fetching of categories for landing page, but protect mutation
router.get('/categories', getCategories);

// Apply protect and requireAdmin to all administrative routes
router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', toggleBanUser);
router.get('/blogs', getAllBlogsAdmin);
router.put('/blogs/:id/feature', toggleFeatureBlog);
router.get('/reports', getAllReports);
router.put('/reports/:id', updateReportStatus);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
