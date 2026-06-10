const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const questionRoutes = require("./routes/questionRoutes");
const noteRoutes = require("./routes/noteRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

// ──── Initialize Express ───────────────────────────────────
const app = express();

// ──── Middleware ────────────────────────────────────────────

// Security headers
app.use(helmet());

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

// API docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api/docs.json", (req, res) => res.json(swaggerDocument));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/interview", interviewRoutes);

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

if (require.main === module) {
  startServer().catch((err) => {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  });
}

module.exports = app;
