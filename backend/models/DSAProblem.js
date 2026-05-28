const mongoose = require("mongoose");

const dsaProblemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      maxlength: [60, "Topic cannot exceed 60 characters"],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
    },
    solved: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Link cannot exceed 300 characters"],
    },
  },
  { timestamps: true }
);

dsaProblemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("DSAProblem", dsaProblemSchema);
