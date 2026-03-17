const ProgressModel = require('../models/progressModel');

const getVideoProgress = async (req, res) => {
  try {
    const progress = await ProgressModel.getProgress(req.user.id, req.params.videoId);
    res.json(progress || { watched_seconds: 0, completed: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubjectProgress = async (req, res) => {
  try {
    const progress = await ProgressModel.getSubjectProgress(req.user.id, req.params.subjectId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { video_id, watched_seconds, completed } = req.body;
    await ProgressModel.updateProgress(req.user.id, video_id, watched_seconds, completed);
    res.json({ message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getVideoProgress, getSubjectProgress, updateProgress };
