const eventRoutes = require('../routes/event.routes');

const registerEventModule = (app) => {
  app.use('/api/events', eventRoutes);
};

module.exports = { registerEventModule };
