import express from 'express';
import {
  getRecords,
  getStats,
  getRecordById,
  updateRecord,
  deleteRecord,
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Protect all admin endpoints with authentication and role-based checks
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/records', getRecords);
router.get('/stats', getStats);
router.get('/records/:id', getRecordById);
router.put('/records/:id', updateRecord);
router.delete('/records/:id', deleteRecord);

export default router;
