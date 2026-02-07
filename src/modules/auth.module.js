const authRoutes = require('../routes/auth.routes');

const registerAuthModule = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/', authRoutes);
};

module.exports = { registerAuthModule };
