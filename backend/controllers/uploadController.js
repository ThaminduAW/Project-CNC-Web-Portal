import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/restaurants';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'restaurant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('photo');

export const uploadPhoto = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Get the current user
      const userId = req.user._id;
      
      // Update user's restaurant photo
      const photoUrl = `/uploads/restaurants/${req.file.filename}`;
      await User.findByIdAndUpdate(userId, { restaurantPhoto: photoUrl });

      res.json({
        message: 'Photo uploaded successfully',
        photoUrl: photoUrl
      });
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ message: 'Error uploading photo' });
  }
}; 