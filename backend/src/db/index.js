const { Pool } = require('pg');
const config = require('../config');

let activePool = null;

const createPool = () => {
  return new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
};

activePool = createPool();

activePool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = {
  query: (text, params) => activePool.query(text, params),
  getClient: () => activePool.connect(),
  get pool() {
    return activePool;
  },
  setPool: (newPool) => {
    activePool = newPool;
  },
};
