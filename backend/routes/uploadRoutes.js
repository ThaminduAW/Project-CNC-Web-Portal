import express from 'express';
import { uploadPhoto } from '../controllers/uploadController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Photo upload route (protected - only authenticated users can upload)
router.post('/photo', verifyToken, uploadPhoto);

export default router; 