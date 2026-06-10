const express = require("express");
const { body, query, param } = require("express-validator");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  getStats,
  getWeeklyActivity,
} = require("../controllers/dsaController");

const router = express.Router();

router.use(protect);

const listProblemsValidators = [
  query("search").optional().isString().trim().isLength({ max: 100 }).withMessage("Search must be 100 characters or fewer"),
  query("topic").optional().isString().trim().isLength({ max: 80 }).withMessage("Topic filter is invalid"),
  query("difficulty").optional().isIn(["All", "Easy", "Medium", "Hard"]).withMessage("Difficulty filter is invalid"),
  query("solved").optional().isIn(["true", "false"]).withMessage("Solved filter must be true or false"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
];

const createProblemValidators = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 150 }).withMessage("Title cannot exceed 150 characters"),
  body("topic").trim().notEmpty().withMessage("Topic is required").isLength({ max: 80 }).withMessage("Topic cannot exceed 80 characters"),
  body("difficulty").notEmpty().withMessage("Difficulty is required").isIn(["Easy", "Medium", "Hard"]).withMessage("Difficulty must be Easy, Medium, or Hard"),
  body("solved").optional().isBoolean().withMessage("Solved must be true or false"),
  body("link").optional().isURL().withMessage("Link must be a valid URL"),
];

const updateProblemValidators = [
  param("id").isMongoId().withMessage("Invalid problem id"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty").isLength({ max: 150 }).withMessage("Title cannot exceed 150 characters"),
  body("topic").optional().trim().notEmpty().withMessage("Topic cannot be empty").isLength({ max: 80 }).withMessage("Topic cannot exceed 80 characters"),
  body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]).withMessage("Difficulty must be Easy, Medium, or Hard"),
  body("solved").optional().isBoolean().withMessage("Solved must be true or false"),
  body("link").optional().isURL().withMessage("Link must be a valid URL"),
];

const deleteProblemValidators = [
  param("id").isMongoId().withMessage("Invalid problem id"),
];

router.get("/stats", getStats);
router.get("/weekly-activity", getWeeklyActivity);
router.get("/", listProblemsValidators, validateRequest, listProblems);
router.post("/", createProblemValidators, validateRequest, createProblem);
router.put("/:id", updateProblemValidators, validateRequest, updateProblem);
router.delete("/:id", deleteProblemValidators, validateRequest, deleteProblem);

module.exports = router;
