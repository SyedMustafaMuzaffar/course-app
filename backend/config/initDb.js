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
    if (countResults[0].count < 10) {
      console.log('Seeding 15 default courses...');
      await pool.execute(`
        INSERT INTO subjects (title, description, thumbnail) VALUES 
        ('Python for Data Science', 'Master Python for data analysis, visualization, and machine learning.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'),
        ('Full Stack Web Development', 'Build modern web applications using React, Node.js, and MySQL.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'),
        ('AI & Machine Learning', 'Deep dive into AI with neural networks and deep learning.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80'),
        ('Modern React & Next.js', 'Build fast, SEO-friendly apps with the latest React 19 features.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'),
        ('Cloud Computing with AWS', 'Learn to deploy and scale applications on Amazon Web Services.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'),
        ('Cybersecurity Essentials', 'Protect systems and networks from digital attacks and threats.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'),
        ('Mobile App Dev (Flutter)', 'Create beautiful cross-platform apps for iOS and Android.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80'),
        ('UI/UX Design Masterclass', 'Design professional user interfaces and experiences.', 'https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?w=800&q=80'),
        ('Data Structures & Algorithms', 'Ace your technical interviews with core CS foundations.', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'),
        ('SQL & Database Design', 'Master relational databases and complex query optimization.', 'https://images.unsplash.com/photo-1544383335-df43a7abc728?w=800&q=80'),
        ('DevOps & Docker', 'Automate your workflow with CI/CD and containerization.', 'https://images.unsplash.com/photo-1605745341112-85968b193ef5?w=800&q=80'),
        ('Ethical Hacking', 'Learn to think like a hacker and defend your infrastructure.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80'),
        ('Blockchain Foundations', 'Build decentralized applications and understand crypto.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80'),
        ('Game Dev with Unity', 'Create immersive 3D games with C# and the Unity engine.', 'https://images.unsplash.com/photo-1556438158-8d8116aece14?w=800&q=80'),
        ('Digital Marketing Strategy', 'Master SEO, social media, and Google Ads for growth.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80')
      `);
      console.log('15 courses seeded.');
    }

    return true;
  } catch (err) {
    console.error('--- DATABASE INITIALIZATION FAILED ---');
    console.error('Error Details:', err.message);
    return false;
  }
};

module.exports = initDb;
