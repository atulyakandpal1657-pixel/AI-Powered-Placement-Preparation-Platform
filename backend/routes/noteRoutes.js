const express = require("express");
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

router.get("/", listNotes);
router.post("/", createNote);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.patch("/:id/pin", togglePin);

module.exports = router;
