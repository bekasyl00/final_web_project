const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');
const env = require('../config/env');

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.pb_token;

  if (!token) {
    return res.redirect('/login?error=Сначала войдите в систему');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.redirect('/login?error=Пользователь не найден');
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.redirect('/login?error=Сессия истекла. Войдите снова');
  }
});

const attachUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.pb_token;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (error) {
    return next();
  }

  return next();
});

const clearAuth = (res) => {
  res.clearCookie('pb_token', { httpOnly: true, sameSite: 'lax' });
};

module.exports = { requireAuth, attachUser, clearAuth };
