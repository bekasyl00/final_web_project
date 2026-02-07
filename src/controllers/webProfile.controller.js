const asyncHandler = require('../utils/asyncHandler');
const { updateProfile } = require('../services/user.service');
const { updateProfileSchema } = require('../validators/user.validator');

const buildErrorMap = (joiError) => {
  const errors = {};
  if (!joiError) {
    return errors;
  }
  joiError.details.forEach((detail) => {
    const field = detail.path[0];
    if (!errors[field]) {
      errors[field] = detail.message.replace(/"/g, '');
    }
  });
  return errors;
};

const showProfile = (req, res) => {
  res.render('profile', {
    user: req.user,
    values: {
      username: req.user.username,
      email: req.user.email
    },
    errors: {},
    message: req.query.message || null,
    error: req.query.error || null
  });
};

const handleProfileUpdate = asyncHandler(async (req, res) => {
  const { error, value } = updateProfileSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).render('profile', {
      user: req.user,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.'
    });
  }

  try {
    const updated = await updateProfile(req.user._id, value);
    return res.render('profile', {
      user: updated,
      values: {
        username: updated.username,
        email: updated.email
      },
      errors: {},
      message: 'Профиль обновлён.',
      error: null
    });
  } catch (err) {
    return res.status(err.statusCode || 400).render('profile', {
      user: req.user,
      values: req.body,
      errors: {},
      message: null,
      error: err.message || 'Update failed.'
    });
  }
});

module.exports = { showProfile, handleProfileUpdate };
