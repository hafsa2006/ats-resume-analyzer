/**
 * Test MongoDB connectivity. Run: node scripts/check-mongo.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const { connectDatabase, getConnectionCandidates } = require('../config/database');

console.log('Trying connection strings:', getConnectionCandidates().map((u) => u.replace(/:([^:@/]+)@/, ':****@')));

connectDatabase()
  .then(() => {
    console.log('SUCCESS: MongoDB is reachable.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
