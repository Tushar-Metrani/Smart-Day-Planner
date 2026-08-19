import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Goal from "../models/Goal.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(name && { name }) },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.userId);
    const matches = await user.comparePassword(currentPassword);
    if (!matches) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword; // pre-save hook rehashes it
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await Task.deleteMany({ user: req.userId });
    await Goal.deleteMany({ user: req.userId });
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Account and all associated data deleted" });
  } catch (err) {
    next(err);
  }
};