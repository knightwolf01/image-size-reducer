import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import imageRoutes from './routes/image.routes.js';

// Load environment variables based on NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Basic rate limiting
const rateLimit = new Map();
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - (15 * 60 * 1000); // 15 minutes window
    
    const requestTimestamps = rateLimit.get(ip) || [];
    const windowRequests = requestTimestamps.filter(timestamp => timestamp > windowStart);
    
    if (windowRequests.length >= 100) { // Max 100 requests per 15 minutes
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    
    windowRequests.push(now);
    rateLimit.set(ip, windowRequests);
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/images', imageRoutes);

// Connect to MongoDB with retry logic
const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log('Connected to MongoDB');
  } catch (error) {
    if (retries > 0) {
      console.log(`MongoDB connection failed. Retrying... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('MongoDB connection failed after all retries:', error);
      process.exit(1);
    }
  }
};

connectDB();

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;
  res.status(500).json({ message: errorMessage });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  mongoose.connection.close()
    .then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error during shutdown:', err);
      process.exit(1);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});