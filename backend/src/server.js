const app = require('./app');
const config = require('./config');
const { connectDB } = require('./db');

const PORT = process.env.PORT || config.port || 5000;

const startServer = async () => {
  try {
    console.log('\n[DB] Connecting to MongoDB...');
    try {
      await connectDB();
      console.log(' [DB] Successfully connected to MongoDB.');
    } catch (dbError) {
      console.warn('⚠️ [DB] Standard MongoDB connection failed:', dbError.message);
      if (config.nodeEnv !== 'production') {
        console.log(' [DB] Initializing in-memory MongoDB engine for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memoryUri = mongod.getUri();
        await connectDB(memoryUri);
        console.log(' [DB] In-memory MongoDB successfully initialized.');
      } else {
        throw dbError;
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n==================================================`);
      console.log(` Joineazy MERN Server active on http://0.0.0.0:${PORT}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Healthcheck: http://0.0.0.0:${PORT}/api/health`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error('❌ [Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();
