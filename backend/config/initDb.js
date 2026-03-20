const pool = require('./db');

const initDb = async () => {
  console.log('--- STARTING DATABASE INITIALIZATION ---');
  try {
    // 1. Create Users Table
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
    
    // 2. Create Refresh Tokens
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
    
    // 3. Create/Update Subjects Table
    console.log('Ensuring subjects table has correct schema...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Surgical updates for missing columns
    const [cols] = await pool.execute('DESCRIBE subjects');
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes('price')) await pool.execute('ALTER TABLE subjects ADD COLUMN price DECIMAL(10, 2) DEFAULT 0');
    if (!colNames.includes('duration_hours')) await pool.execute('ALTER TABLE subjects ADD COLUMN duration_hours INT DEFAULT 0');
    if (!colNames.includes('level')) await pool.execute("ALTER TABLE subjects ADD COLUMN level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner'");
    if (!colNames.includes('students_count')) await pool.execute('ALTER TABLE subjects ADD COLUMN students_count INT DEFAULT 0');
    if (!colNames.includes('rating')) await pool.execute('ALTER TABLE subjects ADD COLUMN rating DECIMAL(3, 1) DEFAULT 4.5');
    if (!colNames.includes('thumbnail_url') && colNames.includes('thumbnail')) {
       await pool.execute('ALTER TABLE subjects CHANGE thumbnail thumbnail_url VARCHAR(255)');
    }

    console.log('--- DATABASE SCHEMA SURGICALLY UPDATED ---');

    console.log('--- DATABASE SCHEMA UPDATED ---');

    // 4. Seed 15 Professional Courses (Only if empty or missing specific ones)
    console.log('Checking for missing courses...');
    const courses = [
      ['Python for Data Science', 'Master Python for data analysis, visualization, and machine learning.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', 5999, 45, 'Beginner', 1250, 4.8],
      ['Full Stack Web Development', 'Build modern web applications using React, Node.js, and MySQL.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', 8999, 120, 'Intermediate', 3400, 4.7],
      ['AI & Machine Learning', 'Deep dive into AI with neural networks and deep learning.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', 12999, 90, 'Advanced', 850, 4.9],
      ['Modern React & Next.js', 'Build fast, SEO-friendly apps with the latest React features.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', 4999, 35, 'Intermediate', 2100, 4.6],
      ['Cloud Computing with AWS', 'Learn to deploy and scale applications on Amazon Web Services.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', 7499, 50, 'Intermediate', 1600, 4.5],
      ['Cybersecurity Essentials', 'Protect systems and networks from digital attacks and threats.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', 9999, 65, 'Beginner', 950, 4.7],
      ['Mobile App Dev (Flutter)', 'Create beautiful cross-platform apps for iOS and Android.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80', 6999, 75, 'Beginner', 1400, 4.8],
      ['UI/UX Design Masterclass', 'Design professional user interfaces and experiences.', 'https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?w=800&q=80', 3999, 40, 'Beginner', 2800, 4.9],
      ['Data Structures & Algorithms', 'Ace your technical interviews with core CS foundations.', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80', 2999, 80, 'Intermediate', 5000, 4.7],
      ['SQL & Database Design', 'Master relational databases and complex query optimization.', 'https://images.unsplash.com/photo-1544383335-df43a7abc728?w=800&q=80', 1999, 30, 'Beginner', 4200, 4.6],
      ['DevOps & Docker', 'Automate your workflow with CI/CD and containerization.', 'https://images.unsplash.com/photo-1605745341112-85968b193ef5?w=800&q=80', 8499, 55, 'Advanced', 750, 4.8],
      ['Ethical Hacking', 'Learn to think like a hacker and defend your infrastructure.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80', 11999, 95, 'Advanced', 600, 4.9],
      ['Blockchain Foundations', 'Build decentralized applications and understand crypto.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80', 14999, 60, 'Advanced', 400, 4.7],
      ['Game Dev with Unity', 'Create immersive 3D games with C# and the Unity engine.', 'https://images.unsplash.com/photo-1556438158-8d8116aece14?w=800&q=80', 5499, 85, 'Intermediate', 1300, 4.8],
      ['Digital Marketing Strategy', 'Master SEO, social media, and Google Ads for growth.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 2499, 25, 'Beginner', 3200, 4.5]
    ];

    for (const c of courses) {
      const [existing] = await pool.execute('SELECT id FROM subjects WHERE title = ?', [c[0]]);
      if (existing.length === 0) {
        await pool.execute(
          'INSERT INTO subjects (title, description, thumbnail_url, price, duration_hours, level, students_count, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          c
        );
      }
    }
    
    console.log('--- DATABASE SEEDING SUCCESSFUL ---');

    // 5. Create Sections Table
    console.log('Creating sections table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        order_index INT DEFAULT 0,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);

    // 6. Create Videos Table
    console.log('Creating videos table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        youtube_url VARCHAR(255) NOT NULL,
        duration INT DEFAULT 0,
        order_index INT DEFAULT 0,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      )
    `);

    // 7. Seed Content for ANY Subject that has 0 sections
    const [allSubs] = await pool.execute('SELECT id, title FROM subjects');
    console.log(`Checking content for ${allSubs.length} subjects...`);

    for (const sub of allSubs) {
      const [existingSections] = await pool.execute('SELECT id FROM sections WHERE subject_id = ?', [sub.id]);
      
      if (existingSections.length === 0) {
        console.log(`Seeding content for: ${sub.title}`);
        
        // Add 2 Sections
        const [sec1] = await pool.execute('INSERT INTO sections (subject_id, title, order_index) VALUES (?, "Introduction & Basics", 1)', [sub.id]);
        const [sec2] = await pool.execute('INSERT INTO sections (subject_id, title, order_index) VALUES (?, "Intermediate Concepts", 2)', [sub.id]);
        
        const s1Id = sec1.insertId;
        const s2Id = sec2.insertId;

        // Add Videos to Section 1
        await pool.execute('INSERT INTO videos (section_id, title, youtube_url, duration, order_index) VALUES (?, "Course Overview", "https://www.youtube.com/watch?v=rfscVS0vtbw", 300, 1)', [s1Id]);
        await pool.execute('INSERT INTO videos (section_id, title, youtube_url, duration, order_index) VALUES (?, "Getting Started", "https://www.youtube.com/watch?v=kqtD5dpn9C8", 600, 2)', [s1Id]);

        // Add Videos to Section 2
        await pool.execute('INSERT INTO videos (section_id, title, youtube_url, duration, order_index) VALUES (?, "Main Principles", "https://www.youtube.com/watch?v=Z5iWr6SFEj8", 900, 1)', [s2Id]);
        await pool.execute('INSERT INTO videos (section_id, title, youtube_url, duration, order_index) VALUES (?, "Advanced Project", "https://www.youtube.com/watch?v=0ZJgJwR427Y", 1200, 2)', [s2Id]);
      }
    }

    console.log('--- CONTENT SEEDING COMPLETE ---');
    return true;
  } catch (err) {
    console.error('--- DATABASE INITIALIZATION FAILED ---');
    console.error('Error Details:', err.message);
    return false;
  }
};

module.exports = initDb;
