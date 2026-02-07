const AppError = require('../utils/AppError');

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Forbidden. Insufficient role.', 403));
  }
  return next();
};

module.exports = { allowRoles };
