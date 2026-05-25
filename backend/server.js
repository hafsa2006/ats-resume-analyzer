const path = require('path');

// Load .env once from backend directory
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Set it in .env for auth to work.');
}
if (!process.env.MONGO_URI && !process.env.MONGO_URI_STANDARD) {
  console.warn('Warning: Set MONGO_URI or MONGO_URI_STANDARD in backend/.env');
}

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const { connectDatabase, setupDatabaseEvents, isDatabaseConnected } = require('./config/database');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const corsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'ok',
    message: 'ATS Resume Analyzer API',
    port: PORT,
    database: dbStatus,
    dbReady: isDatabaseConnected(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message || err);
  if (!res.headersSent) {
    res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

const HOST = process.env.HOST || '0.0.0.0';

mongoose.set('strictQuery', true);
setupDatabaseEvents();

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  connectDatabase().catch(() => {
    console.warn('API is running — auth/analysis need DB until MongoDB connects.');
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
