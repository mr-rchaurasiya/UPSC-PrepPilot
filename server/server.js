import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';
import mongoSanitize from './middleware/sanitizeMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import dbCheck from './middleware/dbCheck.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import mainsRoutes from './routes/mainsRoutes.js';
import timerRoutes from './routes/timerRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import mockTestRoutes from './routes/mockTestRoutes.js';
import currentAffairsRoutes from './routes/currentAffairsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Security and request parsing middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);

// Apply rate limiter to all API calls
app.use('/api', apiLimiter);

// Database availability check middleware for API paths (except health)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  dbCheck(req, res, next);
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/mains', mainsRoutes);
app.use('/api/timer', timerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/mock-test', mockTestRoutes);
app.use('/api/current-affairs', currentAffairsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// API health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UPSC PrepPilot API is running smoothly.',
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'online' : 'offline'
  });
});

// Serve uploads folder statically in dev environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
