const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/event.model');
const Post = require('../models/post.model');
const Organization = require('../models/organization.model');
const VolunteerShift = require('../models/volunteerShift.model');

const showDashboard = asyncHandler(async (req, res) => {
  const [events, posts, createdOrganizations, memberOrganizations, subscriptions] = await Promise.all([
    Event.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Post.find({ author: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Organization.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Organization.find({
      members: req.user._id,
      owner: { $ne: req.user._id }
    }).sort({ createdAt: -1 }).limit(5),
    VolunteerShift.find({ volunteer: req.user._id }).populate('event').sort({ createdAt: -1 }).limit(5)
  ]);

  res.render('dashboard', {
    events,
    posts,
    createdOrganizations,
    memberOrganizations,
    subscriptions,
    counts: {
      events: events.length,
      posts: posts.length,
      createdOrganizations: createdOrganizations.length,
      memberOrganizations: memberOrganizations.length,
      subscriptions: subscriptions.length
    },
    currentUser: req.user
  });
});

module.exports = { showDashboard };
