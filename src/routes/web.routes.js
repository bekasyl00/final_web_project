const express = require('express');
const {
  showLogin,
  showRegister,
  handleRegister,
  handleLogin,
  logout
} = require('../controllers/webAuth.controller');
const { showProfile, handleProfileUpdate } = require('../controllers/webProfile.controller');
const { showHome } = require('../controllers/webHome.controller');
const {
  listEvents,
  showEvent,
  showCreateForm,
  handleCreate,
  showEditForm,
  handleUpdate,
  handleDelete
} = require('../controllers/webEvent.controller');
const { requireAuth } = require('../middleware/cookieAuth.middleware');

const router = express.Router();

router.get('/', showHome);

router.get('/login', showLogin);
router.post('/login', handleLogin);
router.get('/register', showRegister);
router.post('/register', handleRegister);
router.get('/logout', logout);

router.get('/profile', requireAuth, showProfile);
router.post('/profile', requireAuth, handleProfileUpdate);

router.get('/events', listEvents);
router.get('/events/new', requireAuth, showCreateForm);
router.post('/events', requireAuth, handleCreate);
router.get('/events/:id', showEvent);
router.get('/events/:id/edit', requireAuth, showEditForm);
router.post('/events/:id', requireAuth, handleUpdate);
router.post('/events/:id/delete', requireAuth, handleDelete);

module.exports = router;
