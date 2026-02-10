const wantsJson = (req) => {
  const contentType = req.headers['content-type'] || '';
  const accept = req.headers.accept || '';
  return contentType.includes('application/json') || accept.includes('application/json');
};

const createRateLimiter = ({ windowMs, max, message, redirectTo }) => {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { count: 1, start: now });
      return next();
    }

    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      const errorMessage = message || 'Слишком много попыток. Попробуйте позже.';
      if (wantsJson(req)) {
        return res.status(429).json({ status: 'fail', message: errorMessage });
      }
      return res.redirect(`${redirectTo}?error=${encodeURIComponent(errorMessage)}`);
    }

    return next();
  };
};

const loginRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток входа. Подождите 10 минут.',
  redirectTo: '/login'
});

const registerRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток регистрации. Подождите 10 минут.',
  redirectTo: '/register'
});

module.exports = {
  loginRateLimiter,
  registerRateLimiter
};
