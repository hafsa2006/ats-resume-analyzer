const dns = require('dns');
const mongoose = require('mongoose');

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

/** Stable pool + keep sockets alive (reduces Atlas idle disconnects) */
const CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 0,
  heartbeatFrequencyMS: 10000,
  maxIdleTimeMS: 600000,
  minPoolSize: 2,
  maxPoolSize: 20,
  family: 4,
  retryWrites: true,
  retryReads: true,
  autoIndex: true,
};

const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;
const PING_INTERVAL_MS = 25000;
const RECONNECT_BASE_MS = 1500;
const RECONNECT_MAX_MS = 30000;

let reconnectTimer = null;
let reconnectAttempt = 0;
let connectPromise = null;
let pingInterval = null;
let lastWorkingUri = null;

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', true);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskUri(uri) {
  return uri.replace(/:([^:@/]+)@/, ':****@');
}

function getConnectionCandidates() {
  const list = [];

  if (lastWorkingUri) list.push(lastWorkingUri);
  list.push(
    process.env.MONGO_URI,
    process.env.MONGO_URI_STANDARD,
    process.env.MONGODB_URI,
  );

  if (process.env.USE_LOCAL_MONGO === 'true') {
    list.push('mongodb://127.0.0.1:27017/ats_analyzer');
  }

  if (!list.filter(Boolean).length) {
    list.push('mongodb://127.0.0.1:27017/ats_analyzer');
  }

  return [...new Set(list.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean))];
}

function isSrvRefusedError(err) {
  const msg = err?.message || '';
  return msg.includes('querySrv') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND');
}

function printConnectionHelp(lastError) {
  console.error('\n--- MongoDB connection failed ---');
  console.error(lastError?.message || 'Unknown error');
  console.error('\nFix (pick one):');
  console.error('1. Atlas → Network Access → Add IP Address (0.0.0.0/0 for dev)');
  console.error('2. Atlas → Connect → Drivers → STANDARD string → MONGO_URI_STANDARD in .env');
  console.error('3. USE_LOCAL_MONGO=true with local MongoDB installed');
  console.error('4. Disable VPN if querySrv ECONNREFUSED\n');
}

async function tryConnectOnce(uri) {
  const state = mongoose.connection.readyState;

  if (state === 1) {
    return mongoose.connection;
  }

  if (state === 2) {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 30000);
      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve();
      });
      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    return mongoose.connection;
  }

  if (state !== 0) {
    await mongoose.disconnect().catch(() => {});
  }

  await mongoose.connect(uri, CONNECT_OPTIONS);
  lastWorkingUri = uri;
  return mongoose.connection;
}

async function performConnect() {
  const candidates = getConnectionCandidates();
  let lastError = null;

  for (const uri of candidates) {
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
      try {
        await tryConnectOnce(uri);
        reconnectAttempt = 0;
        console.log(`MongoDB connected → ${maskUri(uri)}`);
        return mongoose.connection;
      } catch (err) {
        lastError = err;
        console.warn(`MongoDB [${attempt}/${RETRY_ATTEMPTS}] ${maskUri(uri)}: ${err.message}`);
        if (attempt < RETRY_ATTEMPTS) {
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }
    if (isSrvRefusedError(lastError)) {
      console.warn('SRV/DNS failed — trying next URI...');
    }
  }

  printConnectionHelp(lastError);
  throw lastError;
}

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectPromise) {
    connectPromise = performConnect()
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        connectPromise = null;
      });
  }

  return connectPromise;
}

function scheduleReconnect(immediate = false) {
  if (reconnectTimer) return;

  const delay = immediate
    ? 0
    : Math.min(RECONNECT_BASE_MS * 2 ** reconnectAttempt, RECONNECT_MAX_MS);

  reconnectAttempt += 1;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectDatabase();
      reconnectAttempt = 0;
    } catch {
      scheduleReconnect(false);
    }
  }, delay);
}

async function pingDatabase() {
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase().catch(() => scheduleReconnect(true));
    return;
  }

  try {
    await mongoose.connection.db.admin().command({ ping: 1 });
  } catch (err) {
    console.warn('MongoDB ping failed — reconnecting:', err.message);
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
    scheduleReconnect(true);
  }
}

function startConnectionMonitor() {
  if (pingInterval) return;

  pingInterval = setInterval(() => {
    pingDatabase().catch(() => {});
  }, PING_INTERVAL_MS);

  if (typeof pingInterval.unref === 'function') {
    pingInterval.unref();
  }
}

function setupDatabaseEvents() {
  const conn = mongoose.connection;

  conn.on('connected', () => {
    console.log('MongoDB connection active (pool ready)');
    reconnectAttempt = 0;
  });

  conn.on('reconnected', () => {
    console.log('MongoDB reconnected');
    reconnectAttempt = 0;
  });

  conn.on('disconnected', () => {
    console.warn('MongoDB disconnected — reconnecting...');
    scheduleReconnect(true);
  });

  conn.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
    if (conn.readyState !== 1) {
      scheduleReconnect(true);
    }
  });

  conn.on('close', () => {
    if (conn.readyState === 0) {
      scheduleReconnect(true);
    }
  });

  startConnectionMonitor();
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

/** Wait until DB is up (for critical routes) */
async function waitForDatabase(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isDatabaseConnected()) return true;
    try {
      await connectDatabase();
      if (isDatabaseConnected()) return true;
    } catch {
      /* retry */
    }
    await sleep(1500);
  }
  return isDatabaseConnected();
}

module.exports = {
  connectDatabase,
  setupDatabaseEvents,
  isDatabaseConnected,
  waitForDatabase,
  getConnectionCandidates,
  pingDatabase,
};
