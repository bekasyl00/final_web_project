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
    error: req.query.error || null,
    currentUser: req.user
  });
};

const handleProfileUpdate = asyncHandler(async (req, res) => {
  let value = {};
  let error = null;
  const hasBody = Object.keys(req.body || {}).length > 0;

  if (hasBody) {
    const validation = updateProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    value = validation.value;
    error = validation.error;
  }

  if (req.fileValidationError) {
    return res.status(400).render('profile', {
      user: req.user,
      values: req.body,
      errors: { avatar: req.fileValidationError },
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user
    });
  }

  if (error) {
    return res.status(400).render('profile', {
      user: req.user,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user
    });
  }

  try {
    if (req.file) {
      value.avatar = req.file.filename;
    }

    const updated = await updateProfile(req.user._id, value);
    return res.render('profile', {
      user: updated,
      values: {
        username: updated.username,
        email: updated.email
      },
      errors: {},
      message: 'Профиль обновлён.',
      error: null,
      currentUser: req.user
    });
  } catch (err) {
    return res.status(err.statusCode || 400).render('profile', {
      user: req.user,
      values: req.body,
      errors: {},
      message: null,
      error: err.message || 'Update failed.',
      currentUser: req.user
    });
  }
});

module.exports = { showProfile, handleProfileUpdate };
