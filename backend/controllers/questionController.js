const Question = require("../models/Question");
const UserQuestionState = require("../models/UserQuestionState");
const { getCurrentStreak } = require("../utils/streak");
const { getPaginationOptions, getPaginationResponse } = require("../utils/pagination");
const questionsSeedData = require("../data/questions.json");

const seedQuestionsIfEmpty = async () => {
  const count = await Question.countDocuments();
  if (count > 0) return count;

  for (const q of questionsSeedData) {
    await Question.updateOne({ slug: q.slug }, { $set: q }, { upsert: true });
  }
  return questionsSeedData.length;
};

const listQuestions = async (req, res, next) => {
  try {
    await seedQuestionsIfEmpty();

    const { search, topic, difficulty, company, status, bookmarked } = req.query;
    const { page, limit, skip } = getPaginationOptions(req.query);

    const baseQuery = {};
    if (search) baseQuery.$text = { $search: search };
    if (topic && topic !== "All") baseQuery.topic = topic;
    if (difficulty && difficulty !== "All") baseQuery.difficulty = difficulty;
    if (company && company !== "All") baseQuery.companies = company;

    const topics = Array.from(new Set((await Question.find(baseQuery)).map((q) => q.topic))).sort();
    const companies = Array.from(new Set((await Question.find(baseQuery)).flatMap((q) => q.companies))).sort();

    const aggregatePipeline = [
      { $match: baseQuery },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "userquestionstates",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$question", "$$questionId"] },
                    { $eq: ["$user", req.user._id] },
                  ],
                },
              },
            },
          ],
          as: "state",
        },
      },
      { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          solved: { $ifNull: ["$state.solved", false] },
          bookmarked: { $ifNull: ["$state.bookmarked", false] },
        },
      },
    ];

    if (status === "Solved") {
      aggregatePipeline.push({ $match: { solved: true } });
    }
    if (status === "Unsolved") {
      aggregatePipeline.push({ $match: { solved: false } });
    }
    if (bookmarked === "true") {
      aggregatePipeline.push({ $match: { bookmarked: true } });
    }

    aggregatePipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              title: 1,
              difficulty: 1,
              topic: 1,
              companies: 1,
              solveUrl: 1,
              solved: 1,
              bookmarked: 1,
            },
          },
        ],
      },
    });

    const aggregateResult = await Question.aggregate(aggregatePipeline);
    const metadata = aggregateResult[0]?.metadata?.[0] || { total: 0 };
    const questions = aggregateResult[0]?.data || [];

    res.status(200).json({
      success: true,
      ...getPaginationResponse(metadata.total, page, limit, "questions", questions),
      filters: {
        topics,
        companies,
      },
    });
  } catch (error) {
    next(error);
  }
};

const toggleSolved = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    const state =
      (await UserQuestionState.findOne({ user: req.user._id, question: question._id })) ||
      new UserQuestionState({ user: req.user._id, question: question._id });

    state.solved = !state.solved;
    state.solvedAt = state.solved ? new Date() : null;
    await state.save();

    return res.status(200).json({
      success: true,
      solved: state.solved,
    });
  } catch (error) {
    next(error);
  }
};

const toggleBookmark = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    const state =
      (await UserQuestionState.findOne({ user: req.user._id, question: question._id })) ||
      new UserQuestionState({ user: req.user._id, question: question._id });

    state.bookmarked = !state.bookmarked;
    await state.save();

    return res.status(200).json({
      success: true,
      bookmarked: state.bookmarked,
    });
  } catch (error) {
    next(error);
  }
};

const getQuestionStats = async (req, res, next) => {
  try {
    await seedQuestionsIfEmpty();

    const [total, states] = await Promise.all([
      Question.countDocuments(),
      UserQuestionState.find({ user: req.user._id }),
    ]);
    const solvedCount = states.filter((s) => s.solved).length;
    const bookmarkedCount = states.filter((s) => s.bookmarked).length;
    const streak = getCurrentStreak(
      states.filter((s) => s.solved && s.solvedAt).map((s) => s.solvedAt)
    );

    return res.status(200).json({
      success: true,
      stats: {
        total,
        solved: solvedCount,
        unsolved: Math.max(total - solvedCount, 0),
        bookmarked: bookmarkedCount,
        progress: total ? Math.round((solvedCount / total) * 100) : 0,
        dailyStreak: streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCompanies = async (req, res, next) => {
  try {
    await seedQuestionsIfEmpty();

    const aggregatePipeline = [
      { $unwind: "$companies" },
      {
        $lookup: {
          from: "userquestionstates",
          let: { questionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$question", "$$questionId"] },
                    { $eq: ["$user", req.user._id] },
                  ],
                },
              },
            },
          ],
          as: "state",
        },
      },
      { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          solved: { $ifNull: ["$state.solved", false] },
        },
      },
      {
        $group: {
          _id: "$companies",
          totalQuestions: { $sum: 1 },
          solvedQuestions: { $sum: { $cond: ["$solved", 1, 0] } },
          easyTotal: { $sum: { $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0] } },
          mediumTotal: { $sum: { $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0] } },
          hardTotal: { $sum: { $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0] } },
          easySolved: { $sum: { $cond: [{ $and: [{ $eq: ["$difficulty", "Easy"] }, "$solved"] }, 1, 0] } },
          mediumSolved: { $sum: { $cond: [{ $and: [{ $eq: ["$difficulty", "Medium"] }, "$solved"] }, 1, 0] } },
          hardSolved: { $sum: { $cond: [{ $and: [{ $eq: ["$difficulty", "Hard"] }, "$solved"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          company: "$_id",
          totalQuestions: 1,
          solvedQuestions: 1,
          difficultyBreakdown: {
            Easy: { total: "$easyTotal", solved: "$easySolved" },
            Medium: { total: "$mediumTotal", solved: "$mediumSolved" },
            Hard: { total: "$hardTotal", solved: "$hardSolved" },
          },
        },
      },
      { $sort: { company: 1 } },
    ];

    const companiesStats = await Question.aggregate(aggregatePipeline);

    res.status(200).json({
      success: true,
      data: companiesStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listQuestions, toggleSolved, toggleBookmark, getQuestionStats, getCompanies };
