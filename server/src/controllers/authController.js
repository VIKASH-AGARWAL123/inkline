import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateUsername } from "../utils/generateUsername.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../utils/mailer.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(400)
        .json({ message: "An account with that email already exists." });
    }

    const username = await generateUsername(name);
    const user = await User.create({ name, email, password, username });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not create your account.", error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Could not sign in.", error: err.message });
  }
}

export async function getMe(req, res) {
  res.json(req.user);
}

// Step 1 — send OTP to email
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond OK so we don't expose whether an email is registered
    if (!user)
      return res.json({
        message: "If that email is registered, a code has been sent.",
      });

    // Invalidate any previous unused OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    await OTP.create({
      email: email.toLowerCase(),
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendOTPEmail(email, code);

    res.json({ message: "If that email is registered, a code has been sent." });
  } catch (err) {
    console.error("=== FORGOT PASSWORD ERROR ===");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
      message: "Could not send reset email.",
      error: err.message,
    });
  }
}

// Step 2 — verify OTP (returns a short-lived reset token)
export async function verifyOTP(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email and code are required." });

    const record = await OTP.findOne({
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res
        .status(400)
        .json({ message: "Code is invalid or has expired." });
    }

    const valid = await record.verifyCode(code);
    if (!valid) {
      return res
        .status(400)
        .json({ message: "Code is invalid or has expired." });
    }

    // Mark as used so it can't be reused
    record.used = true;
    await record.save();

    // Issue a short-lived JWT scoped only for password reset
    const resetToken = generateToken(
      (await User.findOne({ email: email.toLowerCase() }))._id,
      "15m",
    );

    res.json({ resetToken });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not verify code.", error: err.message });
  }
}

// Step 3 — set new password using the reset token
export async function resetPassword(req, res) {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res
        .status(400)
        .json({ message: "Reset token and new password are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    let decoded;
    try {
      const jwt = await import("jsonwebtoken");
      decoded = jwt.default.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.password = password;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      message: "Password updated.",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not reset password.", error: err.message });
  }
}
