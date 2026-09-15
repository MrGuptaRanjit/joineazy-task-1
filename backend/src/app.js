const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Security & Parsing Middleware with dynamic CORS resolution
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const configuredOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Support private LAN/Wi-Fi IPs (e.g. 10.84.157.240:3000)
    const isPrivateIpPattern =
      /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);

    if (isPrivateIpPattern || config.nodeEnv !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Joineazy Student, Group & Assignment Management API is healthy and running.',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Mount Main API Routes
app.use('/api', apiRoutes);

// 404 Catch-All Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
