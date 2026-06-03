const express = require("express");
const { body, query, param } = require("express-validator");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  listNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  togglePin,
} = require("../controllers/noteController");

const router = express.Router();
router.use(protect);

const listNotesValidators = [
  query("search").optional().isString().trim().isLength({ max: 100 }).withMessage("Search must be 100 characters or fewer"),
  query("topic").optional().isString().trim().isLength({ max: 80 }).withMessage("Topic filter is invalid"),
  query("pinned").optional().isIn(["true", "false"]).withMessage("Pinned filter must be true or false"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
];

const createNoteValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 120 })
    .withMessage("Title cannot exceed 120 characters"),
  body("topic")
    .trim()
    .notEmpty()
    .withMessage("Topic is required")
    .isLength({ max: 80 })
    .withMessage("Topic cannot exceed 80 characters"),
  body("difficulty")
    .optional()
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be Easy, Medium, or Hard"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim(),
  body("personalExplanation").optional().isString(),
  body("codeSolution").optional().isString(),
  body("revisionNotes").optional().isString(),
  body("checklist").optional().isArray(),
];

const updateNoteValidators = [
  param("id").isMongoId().withMessage("Invalid note id"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty").isLength({ max: 120 }).withMessage("Title cannot exceed 120 characters"),
  body("topic").optional().trim().notEmpty().withMessage("Topic cannot be empty").isLength({ max: 80 }).withMessage("Topic cannot exceed 80 characters"),
  body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]).withMessage("Difficulty must be Easy, Medium, or Hard"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().trim(),
  body("pinned").optional().isBoolean().withMessage("Pinned must be true or false"),
  body("personalExplanation").optional().isString(),
  body("codeSolution").optional().isString(),
  body("revisionNotes").optional().isString(),
  body("checklist").optional().isArray(),
];

const idValidators = [param("id").isMongoId().withMessage("Invalid note id")];

router.get("/", listNotesValidators, validateRequest, listNotes);
router.post("/", createNoteValidators, validateRequest, createNote);
router.get("/:id", idValidators, validateRequest, getNoteById);
router.put("/:id", updateNoteValidators, validateRequest, updateNote);
router.delete("/:id", idValidators, validateRequest, deleteNote);
router.patch("/:id/pin", idValidators, validateRequest, togglePin);

module.exports = router;
