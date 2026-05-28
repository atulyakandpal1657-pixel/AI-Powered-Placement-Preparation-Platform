const CodingNote = require("../models/CodingNote");

const listNotes = async (req, res, next) => {
  try {
    const { search, topic, pinned } = req.query;
    const query = { user: req.user._id };
    if (search) query.$text = { $search: search };
    if (topic && topic !== "All") query.topic = topic;
    if (pinned === "true") query.pinned = true;

    const notes = await CodingNote.find(query).sort({ pinned: -1, updatedAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user._id };
    const note = await CodingNote.create(payload);
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const note = await CodingNote.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const note = await CodingNote.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await CodingNote.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.status(200).json({ success: true, message: "Note deleted" });
  } catch (error) {
    next(error);
  }
};

const togglePin = async (req, res, next) => {
  try {
    const note = await CodingNote.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    note.pinned = !note.pinned;
    await note.save();
    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

module.exports = { listNotes, createNote, getNoteById, updateNote, deleteNote, togglePin };
