const Question = require("../models/Question");
const UserQuestionState = require("../models/UserQuestionState");
const { getCurrentStreak } = require("../utils/streak");
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
    const query = {};
    if (search) query.$text = { $search: search };
    if (topic && topic !== "All") query.topic = topic;
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;
    if (company && company !== "All") query.companies = company;

    const questions = await Question.find(query).sort({ createdAt: -1 });
    const states = await UserQuestionState.find({
      user: req.user._id,
      question: { $in: questions.map((q) => q._id) },
    });
    const stateMap = new Map(states.map((s) => [String(s.question), s]));

    let items = questions.map((q) => {
      const state = stateMap.get(String(q._id));
      return {
        _id: q._id,
        title: q.title,
        difficulty: q.difficulty,
        topic: q.topic,
        companies: q.companies,
        solveUrl: q.solveUrl,
        solved: state?.solved || false,
        bookmarked: state?.bookmarked || false,
      };
    });

    if (status === "Solved") items = items.filter((i) => i.solved);
    if (status === "Unsolved") items = items.filter((i) => !i.solved);
    if (bookmarked === "true") items = items.filter((i) => i.bookmarked);

    const topics = Array.from(new Set(questions.map((q) => q.topic))).sort();
    const companies = Array.from(new Set(questions.flatMap((q) => q.companies))).sort();

    res.status(200).json({
      success: true,
      questions: items,
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

module.exports = { listQuestions, toggleSolved, toggleBookmark, getQuestionStats };
