import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();
if (!process.env.MONGODB_URI) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

import Admin from './models/Admin.js';

// Connect to Database and Auto-Seed
await connectDB();

try {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      console.log('No administrator found. Auto-seeding default admin...');
      const admin = new Admin({
        email: adminEmail.toLowerCase(),
        password: adminPassword,
      });
      await admin.save();
      console.log(`Default administrator seeded successfully: ${adminEmail}`);
    } else {
      console.warn('Admin auto-seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment.');
    }
  }
} catch (seedError) {
  console.error('Failed to auto-seed admin on startup:', seedError.message);
}

const app = express();

// Security headers
app.use(helmet());

// CORS config (supporting credentials for HTTP-only cookies)
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like postman/curl) or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Route mappings
app.use('/api/records', recordRoutes);
app.use('/api/admin', authRoutes);  // login, logout, me
app.use('/api/admin', adminRoutes); // records dashboard, stats

// Centralized error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
