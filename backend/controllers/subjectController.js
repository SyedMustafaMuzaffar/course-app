const SubjectModel = require('../models/subjectModel');

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await SubjectModel.getAll();
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
