const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Post = require('../models/post.model');
const Organization = require('../models/organization.model');

const showUserProfile = asyncHandler(async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.redirect('/?error=User not found');
  }

  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.redirect('/?error=User not found');
  }

  const [events, posts, organizations] = await Promise.all([
    Event.find({ owner: user._id }).sort({ createdAt: -1 }).limit(6),
    Post.find({ author: user._id }).sort({ createdAt: -1 }).limit(6),
    Organization.find({ owner: user._id }).sort({ createdAt: -1 }).limit(6)
  ]);

  res.render('user-profile', {
    profileUser: user,
    events,
    posts,
    organizations,
    currentUser: req.user || null
  });
});

module.exports = { showUserProfile };
