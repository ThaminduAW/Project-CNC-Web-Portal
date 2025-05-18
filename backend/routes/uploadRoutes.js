import express from 'express';
import { uploadFile, uploadMiddleware } from '../controllers/uploadController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Upload route - protected by authentication
router.post('/', verifyToken, uploadMiddleware, uploadFile);

export default router; 