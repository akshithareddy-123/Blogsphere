import express from 'express';
import { generateSummary, suggestTags, suggestTitles } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/summarize', generateSummary);
router.post('/suggest-tags', suggestTags);
router.post('/suggest-titles', suggestTitles);

export default router;
