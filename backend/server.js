const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const questionRoutes = require("./routes/questionRoutes");
const noteRoutes = require("./routes/noteRoutes");

// ──── Initialize Express ───────────────────────────────────
const app = express();

// ──── Middleware ────────────────────────────────────────────

// CORS — allow frontend origin with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// ──── Routes ───────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PlacePrep AI API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/notes", noteRoutes);

// 404 handler for unknown API routes
app.use("/api/{*path}", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ──── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
┌─────────────────────────────────────────────┐
│                                             │
│   🚀 PlacePrep AI API Server               │
│                                             │
│   Port:        ${PORT}                         │
│   Environment: ${process.env.NODE_ENV || "development"}               │
│   MongoDB:     Connected                    │
│   Health:      http://localhost:${PORT}/api/health │
│                                             │
└─────────────────────────────────────────────┘
    `);
  });
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err.message);
  process.exit(1);
});
