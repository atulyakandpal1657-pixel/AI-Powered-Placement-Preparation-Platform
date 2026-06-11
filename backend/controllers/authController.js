const User = require("../models/User");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");
const { analyzePdfBuffer } = require("../services/aiService");

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
      returnDocument: "after",
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
      { returnDocument: "after", runValidators: true }
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

    const { analysis, extractedTextLength } = await analyzePdfBuffer(req.file.buffer);

    return res.status(200).json({
      success: true,
      analysis,
      extractedTextLength,
    });
  } catch (error) {
    if (error.statusCode === 500 && error.message === "GEMINI_NOT_CONFIGURED") {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured on server",
      });
    }
    if (error.statusCode === 400 && error.message === "NO_PDF_TEXT") {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from PDF",
      });
    }
    if (error.statusCode === 502) {
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response format",
      });
    }
    next(error);
  }
};

/**
 * @desc    Analyze the user's already-uploaded resume from Cloudinary
 * @route   POST /api/auth/resume/analyze-stored
 * @access  Private
 */
const analyzeStoredResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "No resume uploaded yet. Upload a PDF first.",
      });
    }

    const response = await fetch(user.resumeUrl);
    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: "Could not fetch your stored resume. Try uploading again.",
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const { analysis, extractedTextLength } = await analyzePdfBuffer(buffer);

    return res.status(200).json({
      success: true,
      analysis,
      extractedTextLength,
    });
  } catch (error) {
    if (error.statusCode === 500 && error.message === "GEMINI_NOT_CONFIGURED") {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured on server",
      });
    }
    if (error.statusCode === 400 && error.message === "NO_PDF_TEXT") {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from PDF",
      });
    }
    if (error.statusCode === 502) {
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response format",
      });
    }
    next(error);
  }
};

/**
 * @desc    Demo account credentials for one-click login (env-configured)
 * @route   GET /api/auth/demo-accounts
 * @access  Public (disabled unless ENABLE_DEMO_ACCOUNTS=true)
 */
const getDemoAccounts = async (req, res) => {
  if (process.env.ENABLE_DEMO_ACCOUNTS !== "true") {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  const accounts = [];
  if (process.env.DEMO_USER_EMAIL && process.env.DEMO_USER_PASSWORD) {
    accounts.push({
      label: "Demo User",
      email: process.env.DEMO_USER_EMAIL,
      password: process.env.DEMO_USER_PASSWORD,
    });
  }
  if (process.env.DEMO_ADMIN_EMAIL && process.env.DEMO_ADMIN_PASSWORD) {
    accounts.push({
      label: "Demo Admin",
      email: process.env.DEMO_ADMIN_EMAIL,
      password: process.env.DEMO_ADMIN_PASSWORD,
    });
  }

  return res.status(200).json({ success: true, accounts });
};

/**
 * @desc    Update user password
 * @route   PATCH /api/auth/password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both old and new password",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(oldPassword))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    user.password = newPassword;
    await user.save();

    // Remove old token and send new one so user stays logged in
    sendTokenResponse(user, 200, res, req);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete current logged in user
 * @route   DELETE /api/auth/me
 * @access  Private
 */
const deleteMe = async (req, res, next) => {
  try {
    // Optionally we could delete related UserQuestionStates and other data
    const user = await User.findByIdAndDelete(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.cookie("token", "none", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateMe,
  logout,
  uploadResume,
  analyzeResume,
  analyzeStoredResume,
  getDemoAccounts,
  updatePassword,
  deleteMe,
};
