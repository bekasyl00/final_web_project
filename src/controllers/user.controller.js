const asyncHandler = require('../utils/asyncHandler');
const { getProfile, updateProfile } = require('../services/user.service');

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user._id);
  res.status(200).json({
    status: 'success',
    data: user
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user._id, req.body);
  res.status(200).json({
    status: 'success',
    data: user
  });
});

module.exports = { getUserProfile, updateUserProfile };
