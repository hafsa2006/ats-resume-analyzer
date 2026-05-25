const dns = require('dns');
const mongoose = require('mongoose');

// Fixes querySrv ECONNREFUSED on some Windows networks (forces IPv4 DNS order)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 20000,
  family: 4,
  retryWrites: true,
  maxPoolSize: 10,
};

const RETRY_ATTEMPTS = 4;
const RETRY_DELAY_MS = 2500;

let reconnectTimer = null;
let isConnecting = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskUri(uri) {
  return uri.replace(/:([^:@/]+)@/, ':****@');
}

function getConnectionCandidates() {
  const list = [
    process.env.MONGO_URI,
    process.env.MONGO_URI_STANDARD,
    process.env.MONGODB_URI,
  ]
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter(Boolean);

  if (process.env.USE_LOCAL_MONGO === 'true') {
    list.push('mongodb://127.0.0.1:27017/ats_analyzer');
  }

  if (!list.length) {
    list.push('mongodb://127.0.0.1:27017/ats_analyzer');
  }

  return [...new Set(list)];
}

function isSrvRefusedError(err) {
  const msg = err?.message || '';
  return msg.includes('querySrv') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND');
}

function printConnectionHelp(lastError) {
  console.error('\n--- MongoDB connection failed ---');
  console.error(lastError?.message || 'Unknown error');
  console.error('\nFix (pick one):');
  console.error('1. Atlas → Network Access → Add IP Address → Allow access from anywhere (dev)');
  console.error('2. Atlas → Connect → Drivers → copy STANDARD connection string (not SRV)');
  console.error('   Paste it as MONGO_URI_STANDARD in backend/.env');
  console.error('3. Install local MongoDB and set: USE_LOCAL_MONGO=true');
  console.error('4. Disable VPN / try another network if querySrv ECONNREFUSED persists\n');
}

async function tryConnectOnce(uri) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }

  await mongoose.connect(uri, CONNECT_OPTIONS);
  return mongoose.connection;
}

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;
  const candidates = getConnectionCandidates();
  let lastError = null;

  try {
    for (const uri of candidates) {
      for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
        try {
          await tryConnectOnce(uri);
          console.log(`MongoDB connected → ${maskUri(uri)}`);
          return mongoose.connection;
        } catch (err) {
          lastError = err;
          const delay = RETRY_DELAY_MS * attempt;
          console.warn(
            `MongoDB [${attempt}/${RETRY_ATTEMPTS}] ${maskUri(uri)}: ${err.message}`
          );
          if (attempt < RETRY_ATTEMPTS) {
            await sleep(delay);
          }
        }
      }
      if (isSrvRefusedError(lastError)) {
        console.warn('SRV/DNS failed — trying next connection string if configured...');
      }
    }

    printConnectionHelp(lastError);
    throw lastError;
  } finally {
    isConnecting = false;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectDatabase();
    } catch {
      scheduleReconnect();
    }
  }, 8000);
}

function setupDatabaseEvents() {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection active');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — will retry automatically...');
    scheduleReconnect();
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  setupDatabaseEvents,
  isDatabaseConnected,
  getConnectionCandidates,
};
