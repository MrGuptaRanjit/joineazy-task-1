const app = require('./app');
const config = require('./config');
const db = require('./db');

const PORT = config.port;
const MAX_RETRIES = 2;
const RETRY_INTERVAL_MS = 1000;


const connectWithRetry = async (retryCount = 1) => {
  try {
    console.log(`[DB] Attempting database connection (Attempt ${retryCount}/${MAX_RETRIES})...`);
    await db.query('SELECT 1');
    console.log(' [DB] Successfully connected to PostgreSQL Database.');
    return true;
  } catch (error) {
    console.error(` [DB] Connection attempt ${retryCount} failed:`, error.message);
    if (retryCount < MAX_RETRIES) {
      console.log(`[DB] Retrying in ${RETRY_INTERVAL_MS / 1000} seconds...`);
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL_MS));
      return await connectWithRetry(retryCount + 1);
    }
    console.log('\n [DB] External PostgreSQL not detected. Initializing embedded PostgreSQL Database engine...');
    const { setupTestDb } = require('../tests/testDb');
    const embeddedPool = await setupTestDb();
    db.setPool(embeddedPool);
    console.log(' [DB] Embedded PostgreSQL Database successfully initialized and seeded.\n');
    return true;
  }
};

const startServer = async () => {
  try {
    await connectWithRetry();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n==================================================`);
      console.log(` Server active on http://0.0.0.0:${PORT}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Healthcheck: http://0.0.0.0:${PORT}/api/health`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error(' [Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();

