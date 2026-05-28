const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const codingNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    personalExplanation: {
      type: String,
      default: "",
    },
    codeSolution: {
      type: String,
      default: "",
    },
    revisionNotes: {
      type: String,
      default: "",
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

codingNoteSchema.index({ user: 1, title: "text", topic: "text", tags: "text" });

module.exports = mongoose.model("CodingNote", codingNoteSchema);
