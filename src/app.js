const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { registerAuthModule } = require('./modules/auth.module');
const { registerUserModule } = require('./modules/user.module');
const { registerEventModule } = require('./modules/event.module');
const { notFound } = require('./middleware/notFound.middleware');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const publicDir = path.join(__dirname, 'public');
const pagesDir = path.join(publicDir, 'pages');

app.use(express.static(publicDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(pagesDir, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(pagesDir, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(pagesDir, 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(pagesDir, 'dashboard.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(pagesDir, 'events.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

registerAuthModule(app);
registerUserModule(app);
registerEventModule(app);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
