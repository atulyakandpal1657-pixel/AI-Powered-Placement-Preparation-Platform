const express = require("express");
const { query } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const UserQuestionState = require("../models/UserQuestionState");
const { getCurrentStreak } = require("../utils/streak");

const router = express.Router();

// All routes here require authentication
router.use(protect);

const listUsersValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
];

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
router.get(
  "/",
  listUsersValidators,
  validateRequest,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const User = require("../models/User");

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(),
      ]);

      res.status(200).json({
        success: true,
        count: users.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        users,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @desc    Get user stats (for dashboard)
 * @route   GET /api/users/stats
 * @access  Private
 */
router.get("/stats", async (req, res, next) => {
  try {
    const user = req.user;
    const solvedStates = await UserQuestionState.find({
      user: user._id,
      solved: true,
      solvedAt: { $ne: null },
    });
    const dailyStreak = getCurrentStreak(solvedStates.map((s) => s.solvedAt));

    res.status(200).json({
      success: true,
      stats: {
        problemsSolved: user.problemsSolved,
        streak: dailyStreak,
        lastActive: user.lastActive,
        memberSince: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
