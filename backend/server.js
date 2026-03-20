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

// Health check and One-Click DB Init
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    
    // Check if user wants to force initialize tables
    if (req.query.init === 'true') {
      await initDb();
    }

    const [dbResult] = await pool.execute('SELECT DATABASE() as db');
    const [tables] = await pool.execute('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0]);
    const [subjectsCols] = await pool.execute('DESCRIBE subjects').catch(() => [[]]);
    const [subjectsCount] = await pool.execute('SELECT COUNT(*) as count FROM subjects').catch(() => [[{count: 0}]]);
    
    let enrollmentsCount = 0;
    if (tableList.includes('enrollments')) {
        const [enCount] = await pool.execute('SELECT COUNT(*) as count FROM enrollments');
        enrollmentsCount = enCount[0].count;
    }

    res.json({
      status: 'healthy',
      database_name: dbResult[0]?.db || 'unknown',
      tables: tableList,
      subjects_exists: subjectsCols.length > 0,
      subjects_count: subjectsCount[0].count,
      enrollments_count: enrollmentsCount,
      time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      stack: error.stack
    });
  }
});

const initDb = require('./config/initDb');

// Run init in background (don't block server start)
initDb();

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
