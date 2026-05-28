const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    companies: {
      type: [String],
      default: [],
      index: true,
    },
    solveUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ title: "text", topic: "text", companies: "text" });

module.exports = mongoose.model("Question", questionSchema);
