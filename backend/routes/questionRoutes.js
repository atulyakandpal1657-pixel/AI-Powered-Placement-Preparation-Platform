const express = require("express");
const { query, param } = require("express-validator");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  listQuestions,
  toggleSolved,
  toggleBookmark,
  getQuestionStats,
  getCompanies,
} = require("../controllers/questionController");

const router = express.Router();

router.use(protect);

const listQuestionsValidators = [
  query("search").optional().isString().trim().isLength({ max: 100 }).withMessage("Search must be 100 characters or fewer"),
  query("topic").optional().isString().trim().isLength({ max: 80 }).withMessage("Topic filter is invalid"),
  query("difficulty").optional().isIn(["All", "Easy", "Medium", "Hard"]).withMessage("Difficulty filter is invalid"),
  query("company").optional().isString().trim().isLength({ max: 80 }).withMessage("Company filter is invalid"),
  query("status").optional().isIn(["All", "Solved", "Unsolved"]).withMessage("Status filter is invalid"),
  query("bookmarked").optional().isIn(["true", "false"]).withMessage("Bookmarked filter must be true or false"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
];

const idValidators = [param("id").isMongoId().withMessage("Invalid question id")];

router.get("/stats", getQuestionStats);
router.get("/companies", getCompanies);
router.get("/", listQuestionsValidators, validateRequest, listQuestions);
router.patch("/:id/solve", idValidators, validateRequest, toggleSolved);
router.patch("/:id/bookmark", idValidators, validateRequest, toggleBookmark);

module.exports = router;
