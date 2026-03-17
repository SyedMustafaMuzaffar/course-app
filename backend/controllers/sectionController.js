const SectionModel = require('../models/sectionModel');

const getSectionsBySubject = async (req, res) => {
  try {
    const sections = await SectionModel.getBySubjectId(req.params.subjectId);
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createSection = async (req, res) => {
  try {
    const { subject_id, title, order_index } = req.body;
    const id = await SectionModel.create(subject_id, title, order_index || 0);
    res.status(201).json({ message: 'Section created', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSection = async (req, res) => {
  try {
    const { title, order_index } = req.body;
    await SectionModel.update(req.params.id, title, order_index);
    res.json({ message: 'Section updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSection = async (req, res) => {
  try {
    await SectionModel.delete(req.params.id);
    res.json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSectionsBySubject, createSection, updateSection, deleteSection };
