const webRoutes = require('../routes/web.routes');

const registerWebModule = (app) => {
  app.use('/', webRoutes);
};

module.exports = { registerWebModule };
