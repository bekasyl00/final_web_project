const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user;
};

const updateProfile = async (userId, updates) => {
  if (updates.email) {
    const existing = await User.findOne({ email: updates.email.toLowerCase() });
    if (existing && existing._id.toString() !== String(userId)) {
      throw new AppError('Email already in use.', 400);
    }
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (updates.username) {
    user.username = updates.username;
  }

  if (updates.email) {
    user.email = updates.email.toLowerCase();
  }

  await user.save();
  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

module.exports = { getProfile, updateProfile };
