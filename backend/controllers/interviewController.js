const InterviewSession = require("../models/InterviewSession");
const { conductInterview, generateInterviewSummary } = require("../services/aiService");
const { getPaginationOptions, getPaginationResponse } = require("../utils/pagination");

const startSession = async (req, res, next) => {
  try {
    const { role, company } = req.body;

    // Get the AI's opening message (empty history = first turn)
    const aiOpening = await conductInterview([], role, company);

    const session = await InterviewSession.create({
      user: req.user._id,
      role,
      company,
      messages: [{ role: "model", content: aiOpening }],
    });

    res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        role: session.role,
        company: session.company,
        status: session.status,
        messages: session.messages,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    if (session.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This interview session has already ended",
      });
    }

    const { content } = req.body;

    // Append user message
    session.messages.push({ role: "user", content });

    // Get AI response
    const aiReply = await conductInterview(session.messages, session.role, session.company);

    // Append AI reply
    session.messages.push({ role: "model", content: aiReply });

    await session.save();

    res.status(200).json({
      success: true,
      message: {
        role: "model",
        content: aiReply,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const endSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This interview session has already ended",
      });
    }

    // Generate performance summary
    const summary = await generateInterviewSummary(
      session.messages,
      session.role,
      session.company
    );

    session.status = "completed";
    session.summary = summary;
    await session.save();

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

const listSessions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);

    const query = { user: req.user._id };

    const total = await InterviewSession.countDocuments(query);
    const sessionsWithCount = await InterviewSession.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          role: 1,
          company: 1,
          status: 1,
          summary: 1,
          createdAt: 1,
          updatedAt: 1,
          messageCount: { $size: { $ifNull: ["$messages", []] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: sessionsWithCount.length,
      ...getPaginationResponse(total, page, limit, "sessions", sessionsWithCount),
    });
  } catch (error) {
    next(error);
  }
};

const getSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startSession,
  sendMessage,
  endSession,
  listSessions,
  getSession,
};
