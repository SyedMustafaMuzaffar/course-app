require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests for debugging Vercel routing
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Basic Route
app.get('/', (req, res) => {
  res.send('LMS API is running...');
});

// Health check to debug DB on Vercel
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    const [rows] = await pool.execute('SELECT 1 as connected');
    const [tables] = await pool.execute('SHOW TABLES');
    res.json({ 
      status: 'ok', 
      database: rows[0].connected === 1 ? 'connected' : 'error',
      found_tables: tables.map(t => Object.values(t)[0])
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Routes - flexible for both /api/ and direct paths (common for Vercel/proxying)
app.use(['/api/auth', '/auth'], require('./routes/auth'));
app.use(['/api/subjects', '/subjects'], require('./routes/subjects'));
app.use(['/api/sections', '/sections'], require('./routes/sections'));
app.use(['/api/videos', '/videos'], require('./routes/videos'));
app.use(['/api/enrollments', '/enrollments'], require('./routes/enrollments'));
app.use(['/api/progress', '/progress'], require('./routes/progress'));
app.use(['/api/ai', '/ai'], require('./routes/ai'));

// Final catch-all for debugging 404s on Vercel
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.path, 
    method: req.method,
    tip: 'Check your vercel.json rewrites or API base URL'
  });
});


if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
