const authRoutes = require('../routes/auth.routes');

const registerAuthModule = (app) => {
  app.use('/api/auth', authRoutes);
};

module.exports = { registerAuthModule };
