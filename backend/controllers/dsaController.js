const DSAProblem = require("../models/DSAProblem");
const User = require("../models/User");
const { getPaginationOptions, getPaginationResponse } = require("../utils/pagination");

const buildFilters = (query) => {
  const filters = {};
  if (query.topic && query.topic !== "All") {
    filters.topic = query.topic;
  }
  if (query.difficulty && query.difficulty !== "All") {
    filters.difficulty = query.difficulty;
  }
  if (query.solved === "true") {
    filters.solved = true;
  } else if (query.solved === "false") {
    filters.solved = false;
  }
  return filters;
};

const listProblems = async (req, res, next) => {
  try {
    const search = req.query.search?.trim();
    const { page, limit, skip } = getPaginationOptions(req.query);
    const filters = buildFilters(req.query);

    const query = {
      user: req.user._id,
      ...filters,
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const total = await DSAProblem.countDocuments(query);
    const problems = await DSAProblem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: problems.length,
      ...getPaginationResponse(total, page, limit, "problems", problems),
    });
  } catch (error) {
    next(error);
  }
};

const createProblem = async (req, res, next) => {
  try {
    const { title, topic, difficulty, solved, link } = req.body;
    const problem = await DSAProblem.create({
      user: req.user._id,
      title,
      topic,
      difficulty,
      solved: Boolean(solved),
      link,
    });

    if (problem.solved) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { problemsSolved: 1 } });
    }

    res.status(201).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

const updateProblem = async (req, res, next) => {
  try {
    const existing = await DSAProblem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const wasSolved = existing.solved;
    const updates = {};
    const allowed = ["title", "topic", "difficulty", "solved", "link"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const problem = await DSAProblem.findByIdAndUpdate(existing._id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (wasSolved !== problem.solved) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { problemsSolved: problem.solved ? 1 : -1 },
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProblem = async (req, res, next) => {
  try {
    const problem = await DSAProblem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    if (problem.solved) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { problemsSolved: -1 } });
    }

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getWeeklyActivity = async (req, res, next) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    // Monday-based week: calculate start of current week (Monday 00:00)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const problems = await DSAProblem.find({
      user: req.user._id,
      solved: true,
      createdAt: { $gte: previousWeekStart },
    }).select("createdAt").lean();

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const current = new Array(7).fill(0);
    const previous = new Array(7).fill(0);

    for (const p of problems) {
      const d = new Date(p.createdAt);
      // Convert JS day (0=Sun) to Mon-based index (0=Mon)
      const jsDay = d.getDay();
      const idx = jsDay === 0 ? 6 : jsDay - 1;

      if (d >= currentWeekStart) {
        current[idx]++;
      } else if (d >= previousWeekStart) {
        previous[idx]++;
      }
    }

    // Normalize to percentages (max value = 100%)
    const maxVal = Math.max(...current, ...previous, 1);
    const weeklyActivity = dayNames.map((day, i) => ({
      day,
      current: Math.round((current[i] / maxVal) * 100),
      previous: Math.round((previous[i] / maxVal) * 100),
    }));

    res.status(200).json({ success: true, weeklyActivity });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [summaryResult, topicStats] = await Promise.all([
      DSAProblem.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            solved: { $sum: { $cond: ["$solved", 1, 0] } },
            easyTotal: {
              $sum: {
                $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0],
              },
            },
            easySolved: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$difficulty", "Easy"] }, "$solved"] },
                  1,
                  0,
                ],
              },
            },
            mediumTotal: {
              $sum: {
                $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0],
              },
            },
            mediumSolved: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$difficulty", "Medium"] }, "$solved"] },
                  1,
                  0,
                ],
              },
            },
            hardTotal: {
              $sum: {
                $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0],
              },
            },
            hardSolved: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$difficulty", "Hard"] }, "$solved"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      DSAProblem.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: "$topic",
            total: { $sum: 1 },
            solved: { $sum: { $cond: ["$solved", 1, 0] } },
          },
        },
        { $project: { _id: 0, topic: "$_id", total: 1, solved: 1 } },
      ]),
    ]);

    const summary = summaryResult[0] || {
      total: 0,
      solved: 0,
      easyTotal: 0,
      easySolved: 0,
      mediumTotal: 0,
      mediumSolved: 0,
      hardTotal: 0,
      hardSolved: 0,
    };

    const byDifficulty = {
      Easy: { total: summary.easyTotal, solved: summary.easySolved },
      Medium: { total: summary.mediumTotal, solved: summary.mediumSolved },
      Hard: { total: summary.hardTotal, solved: summary.hardSolved },
    };

    const byTopic = topicStats.reduce((acc, topic) => {
      acc[topic.topic] = { total: topic.total, solved: topic.solved };
      return acc;
    }, {});

    const total = summary.total;
    const solved = summary.solved;
    const unsolved = total - solved;

    res.status(200).json({
      success: true,
      stats: {
        total,
        solved,
        unsolved,
        completionRate: total ? Math.round((solved / total) * 100) : 0,
        byDifficulty,
        byTopic,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  getStats,
  getWeeklyActivity,
};
