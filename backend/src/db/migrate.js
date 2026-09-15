const fs = require('fs');
const path = require('path');
const db = require('./index');

const runMigration = async () => {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log(' Running database migration...');
    await db.query(schemaSql);
    console.log(' Database migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(' Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
