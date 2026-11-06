import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeDatabase } from './backend/config/db';
import { router as apiRouter } from './backend/routes/api';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'epms-secret-key-enterprise-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for standard HTTP/preview iframe compatibility
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Serve static assets from public (e.g. employee photos, uploaded files)
app.use('/assets/aistudio', express.static(path.resolve(__dirname, 'public/assets/aistudio')));
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend directory
const frontendDir = path.resolve(__dirname, 'frontend');
app.use(express.static(frontendDir));

// Fallback route: serve frontend/index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(frontendDir, 'index.html'));
});

// Start Express Server
async function startServer() {
  await initializeDatabase();
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` Employee Payroll Management System (EPMS) Running `);
    console.log(` Port: http://0.0.0.0:${PORT}                       `);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting EPMS server:', err);
});
