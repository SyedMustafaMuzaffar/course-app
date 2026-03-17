const VideoModel = require('../models/videoModel');

const getVideosBySection = async (req, res) => {
  try {
    const videos = await VideoModel.getBySectionId(req.params.sectionId);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createVideo = async (req, res) => {
  try {
    const { section_id, title, youtube_url, duration, order_index } = req.body;
    const id = await VideoModel.create(section_id, title, youtube_url, duration || 0, order_index || 0);
    res.status(201).json({ message: 'Video created', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { title, youtube_url, duration, order_index } = req.body;
    await VideoModel.update(req.params.id, title, youtube_url, duration, order_index);
    res.json({ message: 'Video updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reorderVideos = async (req, res) => {
  try {
    const { updates } = req.body; // array of { id, order_index }
    await VideoModel.reorder(updates);
    res.json({ message: 'Videos reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    await VideoModel.delete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getVideosBySection, createVideo, updateVideo, reorderVideos, deleteVideo };
