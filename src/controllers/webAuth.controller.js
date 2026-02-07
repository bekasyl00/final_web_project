const asyncHandler = require('../utils/asyncHandler');
const { registerUser, loginUser } = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { clearAuth } = require('../middleware/cookieAuth.middleware');

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

const showLogin = (req, res) => {
  res.render('login', {
    values: {},
    errors: {},
    message: req.query.message || null,
    error: req.query.error || null
  });
};

const showRegister = (req, res) => {
  res.render('register', {
    values: {},
    errors: {},
    message: req.query.message || null,
    error: req.query.error || null
  });
};

const wantsJson = (req) => {
  const contentType = req.headers['content-type'] || '';
  const accept = req.headers.accept || '';
  return contentType.includes('application/json') || accept.includes('application/json');
};

const handleRegister = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    if (wantsJson(req)) {
      return res.status(400).json({ status: 'fail', message: 'Validation error', errors: buildErrorMap(error) });
    }
    return res.status(400).render('register', {
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.'
    });
  }

  try {
    const result = await registerUser(value);
    if (wantsJson(req)) {
      return res.status(201).json({ status: 'success', data: result });
    }
    return res.redirect('/login?message=Регистрация успешна. Войдите в аккаунт');
  } catch (err) {
    if (wantsJson(req)) {
      return res.status(err.statusCode || 400).json({ status: 'fail', message: err.message || 'Registration failed.' });
    }
    return res.status(err.statusCode || 400).render('register', {
      values: req.body,
      errors: {},
      message: null,
      error: err.message || 'Registration failed.'
    });
  }
});

const handleLogin = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    if (wantsJson(req)) {
      return res.status(400).json({ status: 'fail', message: 'Validation error', errors: buildErrorMap(error) });
    }
    return res.status(400).render('login', {
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Введите корректные данные.'
    });
  }

  try {
    const result = await loginUser(value);
    if (wantsJson(req)) {
      return res.status(200).json({ status: 'success', data: result });
    }
    res.cookie('pb_token', result.token, {
      httpOnly: true,
      sameSite: 'lax'
    });
    return res.redirect('/profile');
  } catch (err) {
    if (wantsJson(req)) {
      return res.status(err.statusCode || 401).json({ status: 'fail', message: err.message || 'Login failed.' });
    }
    return res.status(err.statusCode || 401).render('login', {
      values: req.body,
      errors: {},
      message: null,
      error: err.message || 'Login failed.'
    });
  }
});

const logout = (req, res) => {
  clearAuth(res);
  res.redirect('/login?message=Вы вышли из системы');
};

module.exports = {
  showLogin,
  showRegister,
  handleRegister,
  handleLogin,
  logout
};
