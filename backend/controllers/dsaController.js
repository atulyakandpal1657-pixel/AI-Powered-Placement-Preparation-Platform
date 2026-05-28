const DSAProblem = require("../models/DSAProblem");
const User = require("../models/User");

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
    const filters = buildFilters(req.query);

    const query = {
      user: req.user._id,
      ...filters,
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const problems = await DSAProblem.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
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
      new: true,
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

const getStats = async (req, res, next) => {
  try {
    const problems = await DSAProblem.find({ user: req.user._id });
    const total = problems.length;
    const solved = problems.filter((p) => p.solved).length;
    const unsolved = total - solved;

    const byDifficulty = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
    };
    const byTopic = {};

    for (const p of problems) {
      byDifficulty[p.difficulty].total += 1;
      if (p.solved) byDifficulty[p.difficulty].solved += 1;

      if (!byTopic[p.topic]) byTopic[p.topic] = { total: 0, solved: 0 };
      byTopic[p.topic].total += 1;
      if (p.solved) byTopic[p.topic].solved += 1;
    }

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
};
