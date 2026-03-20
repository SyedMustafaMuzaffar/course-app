const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;
if (process.env.DATABASE_URL) {
  // Use connection string but force SSL options
  const url = new URL(process.env.DATABASE_URL);
  pool = mysql.createPool({
    host: url.hostname,
    port: url.port,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.substring(1),
    ssl: {
      rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  const poolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lms_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    };
  pool = mysql.createPool(poolConfig);
}

// Helper to check connection but not crash
if (process.env.DATABASE_URL) {
  console.log('Attempting to connect to DB via DATABASE_URL...');
} else {
  console.log(`Attempting to connect to DB at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}...`);
}

pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.message.includes('getaddrinfo')) {
      console.error('DEBUG: This usually means the hostname is incorrect or the Aiven Firewall (IP Allowlist) is blocking Vercel.');
    }
  });

module.exports = pool;
