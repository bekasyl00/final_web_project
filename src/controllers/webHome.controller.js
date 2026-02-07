const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/event.model');

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
};

const showHome = asyncHandler(async (req, res) => {
  const events = await Event.find({}).sort({ startDate: 1 }).limit(4);

  res.render('home', {
    events,
    formatDate,
    currentUser: req.user || null
  });
});

module.exports = { showHome, formatDate };
