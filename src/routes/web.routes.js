const express = require('express');
const {
  showLogin,
  showRegister,
  handleRegister,
  handleLogin,
  logout
} = require('../controllers/webAuth.controller');
const { showProfile, handleProfileUpdate } = require('../controllers/webProfile.controller');
const { showUserProfile } = require('../controllers/webUser.controller');
const { showDashboard } = require('../controllers/webDashboard.controller');
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
const {
  listOrganizations,
  showOrganization,
  showCreateForm: showOrganizationCreate,
  handleCreate: handleOrganizationCreate,
  showEditForm: showOrganizationEdit,
  handleUpdate: handleOrganizationUpdate,
  handleDelete: handleOrganizationDelete
} = require('../controllers/webOrganization.controller');
const {
  listPosts,
  showPost,
  showCreateForm: showPostCreate,
  handleCreate: handlePostCreate,
  showEditForm: showPostEdit,
  handleUpdate: handlePostUpdate,
  handleDelete: handlePostDelete
} = require('../controllers/webPost.controller');
const {
  listShifts,
  subscribeToEvent,
  unsubscribeFromEvent,
  unsubscribeById,
  updateReminder
} = require('../controllers/webShift.controller');
const { loginRateLimiter, registerRateLimiter } = require('../middleware/rateLimit.middleware');
const { requireAuth } = require('../middleware/cookieAuth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', showHome);

router.get('/login', showLogin);
router.post('/login', loginRateLimiter, handleLogin);
router.get('/register', showRegister);
router.post('/register', registerRateLimiter, handleRegister);
router.get('/logout', logout);

router.get('/profile', requireAuth, showProfile);
router.post('/profile', requireAuth, upload.single('avatar'), handleProfileUpdate);
router.get('/users/:id', showUserProfile);
router.get('/dashboard', requireAuth, showDashboard);

router.get('/events', listEvents);
router.get('/events/new', requireAuth, showCreateForm);
router.post('/events', requireAuth, upload.single('image'), handleCreate);
router.get('/events/:id', showEvent);
router.get('/events/:id/edit', requireAuth, showEditForm);
router.post('/events/:id', requireAuth, upload.single('image'), handleUpdate);
router.post('/events/:id/delete', requireAuth, handleDelete);

router.get('/organizations', listOrganizations);
router.get('/organizations/new', requireAuth, showOrganizationCreate);
router.post('/organizations', requireAuth, upload.single('image'), handleOrganizationCreate);
router.get('/organizations/:id', showOrganization);
router.get('/organizations/:id/edit', requireAuth, showOrganizationEdit);
router.post('/organizations/:id', requireAuth, upload.single('image'), handleOrganizationUpdate);
router.post('/organizations/:id/delete', requireAuth, handleOrganizationDelete);

router.get('/posts', listPosts);
router.get('/posts/new', requireAuth, showPostCreate);
router.post('/posts', requireAuth, handlePostCreate);
router.get('/posts/:id', showPost);
router.get('/posts/:id/edit', requireAuth, showPostEdit);
router.post('/posts/:id', requireAuth, handlePostUpdate);
router.post('/posts/:id/delete', requireAuth, handlePostDelete);

router.post('/events/:id/subscribe', requireAuth, subscribeToEvent);
router.post('/events/:id/unsubscribe', requireAuth, unsubscribeFromEvent);

router.get('/shifts', requireAuth, listShifts);
router.post('/shifts/:id/delete', requireAuth, unsubscribeById);
router.post('/shifts/:id/reminder', requireAuth, updateReminder);

module.exports = router;
