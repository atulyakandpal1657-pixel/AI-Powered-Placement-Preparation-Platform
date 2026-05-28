const express = require("express");
const { protect } = require("../middleware/auth");
const {
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  getStats,
} = require("../controllers/dsaController");

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/", listProblems);
router.post("/", createProblem);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);

module.exports = router;
