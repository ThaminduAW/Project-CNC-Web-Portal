import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authRoutes from "./routes/authRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from './routes/requestRoutes.js';
import menuRoutes from "./routes/menuRoutes.js";
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import multer from 'multer';

// Load environment variables from .env file
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const toursUploadsDir = path.join(uploadsDir, "tours");
const restaurantsUploadsDir = path.join(uploadsDir, "restaurants");
const dishesUploadsDir = path.join(uploadsDir, "dishes");

[uploadsDir, toursUploadsDir, restaurantsUploadsDir, dishesUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors({
  origin: '*', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/users", userRoutes);
app.use('/api/requests', requestRoutes);
app.use("/api/partner/menu", menuRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
