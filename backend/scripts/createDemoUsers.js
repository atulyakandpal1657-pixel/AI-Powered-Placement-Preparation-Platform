const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const demoUsers = [
  {
    name: "Demo User",
    email: "demo.user@placeprep.ai",
    password: "Demo@123",
    role: "user",
  },
  {
    name: "Demo Admin",
    email: "demo.admin@placeprep.ai",
    password: "Admin@123",
    role: "admin",
  },
];

const createDemoUsers = async () => {
  try {
    await connectDB();

    for (const demo of demoUsers) {
      const existing = await User.findOne({ email: demo.email });
      if (existing) {
        console.log(`↺ Already exists: ${demo.email}`);
        continue;
      }
      await User.create(demo);
      console.log(`✓ Created: ${demo.email}`);
    }

    console.log("Demo account setup complete.");
  } catch (error) {
    console.error("Failed to create demo users:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

createDemoUsers();
