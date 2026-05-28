const User = require("../models/User");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Cookie options for JWT token
const cookieOptions = (req) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Helper: create token, set cookie, send response
 */
const sendTokenResponse = (user, statusCode, res, req) => {
  const token = user.generateToken();

  // Remove password from response
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).cookie("token", token, cookieOptions(req)).json({
    success: true,
    token,
    user: userObj,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    sendTokenResponse(user, 201, res, req);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, req);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ["name", "avatar"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload user resume PDF
 * @route   POST /api/auth/resume
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "placeprep/resumes",
          resource_type: "raw",
          format: "pdf",
          public_id: `resume_${req.user._id}_${Date.now()}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl: uploaded.secure_url },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: uploaded.secure_url,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const extractJsonBlock = (text) => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
};

/**
 * @desc    Analyze resume PDF with Gemini
 * @route   POST /api/auth/resume/analyze
 * @access  Private
 */
const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured on server",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text?.trim();
    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from PDF",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert ATS and resume reviewer.
Analyze the resume text and return STRICT JSON only using this exact schema:
{
  "atsScore": number, // integer 0-100
  "missingSkills": string[], // concise technical/professional skills likely missing
  "improvementSuggestions": string[] // actionable bullet-style suggestions
}

Rules:
- No markdown/code fences, JSON only.
- Keep missingSkills to maximum 12 items.
- Keep improvementSuggestions to maximum 10 items.
- Base your analysis only on the resume text provided.

Resume text:
${resumeText}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const jsonCandidate = extractJsonBlock(raw);

    let analysis;
    try {
      analysis = JSON.parse(jsonCandidate);
    } catch (parseError) {
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response format",
      });
    }

    const normalized = {
      atsScore: Math.max(0, Math.min(100, Number(analysis.atsScore) || 0)),
      missingSkills: Array.isArray(analysis.missingSkills)
        ? analysis.missingSkills.map((s) => String(s)).slice(0, 12)
        : [],
      improvementSuggestions: Array.isArray(analysis.improvementSuggestions)
        ? analysis.improvementSuggestions.map((s) => String(s)).slice(0, 10)
        : [],
    };

    return res.status(200).json({
      success: true,
      analysis: normalized,
      extractedTextLength: resumeText.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, updateMe, logout, uploadResume, analyzeResume };
