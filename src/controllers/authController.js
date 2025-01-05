const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/authenticate");
const createError = require("http-errors");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");

const authController = {
  register: async (req, res, next) => {
    try {
      const { email, password, username, name, phone } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        throw createError(
          400,
          existingUser.email === email
            ? "Email already exists"
            : "Username already exists"
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email,
        password: hashedPassword,
        name,
        phone,
        role: "customer",
      });
      await user.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({
        $or: [{ email: username }, { username }, { phone: username }],
      });

      if (!user) {
        throw createError(401, "Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw createError(401, "Invalid credentials");
      }

      if (!user.status) {
        throw createError(401, "Account is inactive");
      }

      const accessToken = await auth.signAccessToken(user._id, user.role);
      const refreshToken = await auth.signRefreshToken(user._id);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        secure: true,
        sameSite: "None",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      const { password: _, ...userWithoutPassword } = user.toObject();

      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw createError(401, "Refresh token required");
      }

      const payload = await auth.verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.id).populate("role");

      if (!user) {
        throw createError(401, "User not found");
      }

      const accessToken = await auth.signAccessToken(user._id, user.role.name);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      res.json({
        success: true,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  logout: (req, res) => {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        throw createError(404, "User not found");
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
      });

      res.json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { token, password } = req.body;

      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        throw createError(400, "Invalid or expired reset token");
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
