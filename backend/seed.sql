USE lms_db;

-- Passwords are 'password123' (hashed via bcrypt in real logic, but for raw SQL we use a pre-hashed string)
-- bcrypt hash for 'password123': $2b$10$wT0q.I/H9xI6n/8y1I18O.j5HqT8.T5kY/8M1r.Z5u.8jM5y5Bq5u
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$wT0q.I/H9xI6n/8y1I18O.j5HqT8.T5kY/8M1r.Z5u.8jM5y5Bq5u', 'admin'),
('Student User', 'student@example.com', '$2b$10$wT0q.I/H9xI6n/8y1I18O.j5HqT8.T5kY/8M1r.Z5u.8jM5y5Bq5u', 'student');

INSERT INTO subjects (title, description, thumbnail) VALUES 
('Introduction to React', 'Learn the basics of React', 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg'),
('Advanced Node.js', 'Master backend development with Node', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg');

INSERT INTO sections (subject_id, title, order_index) VALUES 
(1, 'Getting Started with React', 1),
(1, 'React Hooks', 2),
(2, 'Node Fundamentals', 1);

-- We need standard YouTube URLs for testing
INSERT INTO videos (section_id, title, youtube_url, duration, order_index) VALUES 
(1, 'What is React?', 'https://www.youtube.com/embed/Tn6-PIqc4UM', 300, 1),
(1, 'Your First React App', 'https://www.youtube.com/embed/bMknfKXIFA8', 600, 2),
(2, 'useState Hook', 'https://www.youtube.com/embed/O6P86uwfdR0', 450, 1),
(3, 'Event Loop explained', 'https://www.youtube.com/embed/8aGhZQkoFbQ', 1500, 1);
