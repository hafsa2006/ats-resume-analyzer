const path = require('path');

// Load .env from backend directory so it works regardless of cwd
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Set it in .env for auth to work.');
}
if (!process.env.MONGO_URI) {
  console.warn('Warning: MONGO_URI is not set. Set it in .env to connect to MongoDB.');
}
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', require('./routes/userRoutes'));

// Analysis routes will be mounted after controller and multer are set up
const analysisRoutes = require('./routes/analysisRoutes');
app.use('/api/analysis', analysisRoutes);

const HOST = process.env.HOST || '0.0.0.0';
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ats_analyzer';

// Listen immediately so Vite proxy never gets ECONNREFUSED while MongoDB connects
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

mongoose.set('strictQuery', true);
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.warn('API is up — auth/analysis need DB; /api/analysis/stats returns mock data.');
  });

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — stats and auth may use fallbacks.');
});
