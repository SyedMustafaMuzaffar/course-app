const pool = require('./db');

const initDb = async () => {
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

    // 4. Seed Default Data if empty
    const [countResults] = await pool.execute('SELECT COUNT(*) as count FROM subjects');
    if (countResults[0].count === 0) {
      console.log('Seeding default courses...');
      await pool.execute(`
        INSERT INTO subjects (title, description, thumbnail) VALUES 
        ('Python for Data Science', 'Master Python for data analysis, visualization, and machine learning with hands-on projects.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'),
        ('Full Stack Web Development', 'Build modern web applications using React, Node.js, and MySQL.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'),
        ('AI & Machine Learning', 'Enter the world of Artificial Intelligence with neural networks and deep learning.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80')
      `);
      console.log('Default courses seeded.');
    }

    return true;
  } catch (err) {
    console.error('--- DATABASE INITIALIZATION FAILED ---');
    console.error('Error Details:', err.message);
    return false;
  }
};

module.exports = initDb;
