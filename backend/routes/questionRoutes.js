const express = require("express");
const { protect } = require("../middleware/auth");
const {
  listQuestions,
  toggleSolved,
  toggleBookmark,
  getQuestionStats,
} = require("../controllers/questionController");

const router = express.Router();

router.use(protect);
router.get("/", listQuestions);
router.get("/stats", getQuestionStats);
router.patch("/:id/solve", toggleSolved);
router.patch("/:id/bookmark", toggleBookmark);

module.exports = router;
