const userRoutes = require('../routes/user.routes');

const registerUserModule = (app) => {
  app.use('/api/users', userRoutes);
};

module.exports = { registerUserModule };
