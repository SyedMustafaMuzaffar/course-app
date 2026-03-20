const SubjectModel = require('../models/subjectModel');

const getAllSubjects = async (req, res) => {
  try {
    let subjects = await SubjectModel.getAll();
    
    // If no subjects found, try a blocking initialization
    if (subjects.length === 0) {
      console.log('No subjects found. Running blocking initialization...');
      const initDb = require('../config/initDb');
      const success = await initDb();
      if (!success) {
        return res.status(500).json({ message: 'Database initialization failed. Check server logs.' });
      }
      subjects = await SubjectModel.getAll();
    }
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const subject = await SubjectModel.getById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;
    const id = await SubjectModel.create(title, description, thumbnail);
    res.status(201).json({ message: 'Subject created', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;
    await SubjectModel.update(req.params.id, title, description, thumbnail);
    res.json({ message: 'Subject updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    await SubjectModel.delete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };
