const express = require("express");
const { body, param, query } = require("express-validator");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  startSession,
  sendMessage,
  endSession,
  listSessions,
  getSession,
} = require("../controllers/interviewController");

const router = express.Router();

router.use(protect);

const startSessionValidators = [
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Target role is required")
    .isLength({ max: 100 })
    .withMessage("Role cannot exceed 100 characters"),
  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 100 })
    .withMessage("Company cannot exceed 100 characters"),
];

const sendMessageValidators = [
  param("id").isMongoId().withMessage("Invalid session id"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 5000 })
    .withMessage("Message cannot exceed 5000 characters"),
];

const sessionIdValidators = [
  param("id").isMongoId().withMessage("Invalid session id"),
];

const listSessionsValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

router.post("/", startSessionValidators, validateRequest, startSession);
router.post("/:id/message", sendMessageValidators, validateRequest, sendMessage);
router.post("/:id/end", sessionIdValidators, validateRequest, endSession);
router.get("/", listSessionsValidators, validateRequest, listSessions);
router.get("/:id", sessionIdValidators, validateRequest, getSession);

module.exports = router;
