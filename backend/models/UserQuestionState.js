const mongoose = require("mongoose");

const userQuestionStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    solved: {
      type: Boolean,
      default: false,
      index: true,
    },
    bookmarked: {
      type: Boolean,
      default: false,
      index: true,
    },
    solvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userQuestionStateSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model("UserQuestionState", userQuestionStateSchema);
