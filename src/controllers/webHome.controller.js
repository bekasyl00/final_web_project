const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const Organization = require('../models/organization.model');
const Post = require('../models/post.model');
const VolunteerShift = require('../models/volunteerShift.model');

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
};

const showHome = asyncHandler(async (req, res) => {
  const [events, usersCount, orgCount, postCount, subscriptionCount] = await Promise.all([
    Event.find({})
      .populate('owner')
      .populate('organization')
      .sort({ startDate: 1 })
      .limit(4),
    User.countDocuments(),
    Organization.countDocuments(),
    Post.countDocuments(),
    VolunteerShift.countDocuments()
  ]);

  res.render('home', {
    events,
    formatDate,
    stats: {
      users: usersCount,
      organizations: orgCount,
      posts: postCount,
      subscriptions: subscriptionCount
    },
    currentUser: req.user || null
  });
});

module.exports = { showHome, formatDate };
