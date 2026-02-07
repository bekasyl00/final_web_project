const asyncHandler = require('../utils/asyncHandler');
const { registerUser, loginUser } = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json({
    status: 'success',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

module.exports = { register, login };
