const { validationResult } = require("express-validator");
const CodingNote = require("../models/CodingNote");

const pickAllowedFields = (body) => {
  const allowed = [
    "title",
    "topic",
    "difficulty",
    "tags",
    "personalExplanation",
    "codeSolution",
    "revisionNotes",
    "checklist",
  ];
  const payload = {};
  for (const key of allowed) {
    if (body[key] !== undefined) payload[key] = body[key];
  }
  return payload;
};

const listNotes = async (req, res, next) => {
  try {
    const { search, topic, pinned } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const query = { user: req.user._id };
    if (search) query.$text = { $search: search };
    if (topic && topic !== "All") query.topic = topic;
    if (pinned === "true") query.pinned = true;

    const total = await CodingNote.countDocuments(query);
    const notes = await CodingNote.find(query)
      .sort({ pinned: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      notes,
      page,
      limit,
      total,
      totalPages: total ? Math.ceil(total / limit) : 0,
    });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const payload = { ...pickAllowedFields(req.body), user: req.user._id };
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
    const updates = {};
    const allowed = [
      "title", "topic", "difficulty", "tags", "pinned",
      "personalExplanation", "codeSolution", "revisionNotes", "checklist",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const note = await CodingNote.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { returnDocument: "after", runValidators: true }
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
