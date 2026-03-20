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

    const [rows] = await pool.execute('SELECT 1 as connected');
    
    // Check if tables exist
    const [tables] = await pool.execute('SHOW TABLES');
    res.json({ 
      status: 'ok', 
      database: 'connected', 
      tables_count: tables.length,
      init_url: '/api/health?init=true',
      details: rows[0].connected === 1 ? 'ready' : 'error' 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Auto-initialize tables (Crucial for 100% working app on Vercel)
const initDb = async () => {
  const pool = require('./config/db');
  console.log('--- STARTING DATABASE INITIALIZATION ---');
  try {
    // 1. Create Users Table First (Essential for foreign keys)
    console.log('Creating users table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. Create Refresh Tokens (Depends on users)
    console.log('Creating refresh_tokens table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // 3. Create Subjects
    console.log('Creating subjects table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('--- DATABASE INITIALIZATION SUCCESSFUL ---');
    return true;
  } catch (err) {
    console.error('--- DATABASE INITIALIZATION FAILED ---');
    console.error('Error Details:', err.message);
    return false;
  }
};

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

module.exports = { app, initDb };
