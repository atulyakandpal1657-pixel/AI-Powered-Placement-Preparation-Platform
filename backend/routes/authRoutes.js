const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const {
  signup,
  login,
  getMe,
  updateMe,
  logout,
  uploadResume,
  analyzeResume,
  analyzeStoredResume,
  getDemoAccounts,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// ──── Public Routes ────────────────────────────────────────

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many signup attempts, please try again later.",
    });
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again later.",
    });
  },
});

router.post(
  "/signup",
  signupLimiter,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 50 })
      .withMessage("Name cannot exceed 50 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      .withMessage(
        "Password must include uppercase, lowercase, number, and special character"
      ),
  ],
  validateRequest,
  signup
);

router.get("/demo-accounts", getDemoAccounts);

router.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

// ──── Protected Routes ─────────────────────────────────────

router.get("/me", protect, getMe);
router.put(
  "/me",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ max: 50 })
      .withMessage("Name cannot exceed 50 characters"),
    body("avatar")
      .optional()
      .trim()
      .isURL()
      .withMessage("Avatar must be a valid URL"),
  ],
  updateMe
);
router.post("/resume", protect, upload.single("resume"), uploadResume);
router.post("/resume/analyze", protect, upload.single("resume"), analyzeResume);
router.post("/resume/analyze-stored", protect, analyzeStoredResume);
router.post("/logout", protect, logout);

module.exports = router;
