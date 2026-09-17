require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'joineazy_jwt_secret_dev_32_chars_minimum_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/joineazy',
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? (process.env.CORS_ORIGIN === '*'
          ? true
          : (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : process.env.CORS_ORIGIN))
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  },
};
