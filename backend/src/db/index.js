const { Pool } = require('pg');
const config = require('../config');

let activePool = null;

const createPool = () => {
  if (config.db.connectionString) {
    return new Pool({
      connectionString: config.db.connectionString,
      ssl: config.db.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl,
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
