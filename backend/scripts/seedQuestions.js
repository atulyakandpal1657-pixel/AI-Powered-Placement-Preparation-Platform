const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Question = require("../models/Question");
const questions = require("../data/questions.json");

const seedQuestions = async () => {
  try {
    await connectDB();
    for (const q of questions) {
      await Question.updateOne({ slug: q.slug }, { $set: q }, { upsert: true });
    }
    console.log(`Questions synced: ${questions.length}`);
  } catch (error) {
    console.error("Failed to seed questions:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedQuestions();
