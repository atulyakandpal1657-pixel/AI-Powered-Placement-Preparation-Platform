const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
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

router.get("/", listNotes);
router.post("/", createNoteValidators, createNote);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.patch("/:id/pin", togglePin);

module.exports = router;
