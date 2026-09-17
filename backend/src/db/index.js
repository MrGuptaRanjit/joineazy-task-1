const mongoose = require('mongoose');
const config = require('../config');

let isConnected = false;

const connectDB = async (customUri = null) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = customUri || config.db.uri;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(` [MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(' [MongoDB] Connection error:', error.message);
    isConnected = false;
    throw error;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log(' [MongoDB] Disconnected from database.');
  }
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ [MongoDB] Connection lost.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log(' [MongoDB] Connection restored.');
});

module.exports = {
  connectDB,
  disconnectDB,
  isDbConnected,
  get connection() {
    return mongoose.connection;
  },
};
