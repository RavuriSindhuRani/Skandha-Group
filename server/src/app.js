import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// CORS Configuration (supporting localhost, custom domains, and Vercel preview/production URLs)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.endsWith('.vercel.app') ||
      (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL))
    ) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static assets & client build (resolves across local monolithic, root cwd, and cloud layouts)
const candidateDistDirs = [
  path.join(__dirname, '../../client/dist'),
  path.join(__dirname, '../../dist'),
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'dist')
];
const clientDist = candidateDistDirs.find(d => fs.existsSync(d)) || candidateDistDirs[0];
const clientPublic = path.join(__dirname, '../../client/public');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
}
if (fs.existsSync(clientPublic)) {
  app.use(express.static(clientPublic));
}

// Fallback for stale asset hashes from previous builds
app.use('/assets', (req, res, next) => {
  const assetsDir = path.join(clientDist, 'assets');
  if (req.path.endsWith('.css') && fs.existsSync(assetsDir)) {
    const cssFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.css'));
    if (cssFiles.length > 0) {
      res.setHeader('Content-Type', 'text/css');
      return res.sendFile(path.join(assetsDir, cssFiles[0]));
    }
  } else if (req.path.endsWith('.js') && fs.existsSync(assetsDir)) {
    const jsFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
    if (jsFiles.length > 0) {
      res.setHeader('Content-Type', 'application/javascript');
      return res.sendFile(path.join(assetsDir, jsFiles[0]));
    }
  }
  res.status(404).send('Asset not found');
});

// Health check endpoints
const healthHandler = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: "Skandha Group Kadthal API"
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Connect to MongoDB on-demand (cached for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Database Connection Middleware Error]:', err.message);
  }
  next();
});

// Mount REST API
app.use('/api', apiRoutes);

// SPA fallback for HTML5 routing (when running monolithically locally)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/assets') || req.path === '/health') {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(indexPath);
  }
  next();
});

// Central error handler
app.use(errorHandler);

export default app;
