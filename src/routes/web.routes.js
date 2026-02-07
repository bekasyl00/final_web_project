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
  showCreateForm: showShiftCreate,
  handleCreate: handleShiftCreate,
  showEditForm: showShiftEdit,
  handleUpdate: handleShiftUpdate,
  handleDelete: handleShiftDelete
} = require('../controllers/webShift.controller');
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

router.get('/organizations', listOrganizations);
router.get('/organizations/new', requireAuth, showOrganizationCreate);
router.post('/organizations', requireAuth, handleOrganizationCreate);
router.get('/organizations/:id', showOrganization);
router.get('/organizations/:id/edit', requireAuth, showOrganizationEdit);
router.post('/organizations/:id', requireAuth, handleOrganizationUpdate);
router.post('/organizations/:id/delete', requireAuth, handleOrganizationDelete);

router.get('/posts', listPosts);
router.get('/posts/new', requireAuth, showPostCreate);
router.post('/posts', requireAuth, handlePostCreate);
router.get('/posts/:id', showPost);
router.get('/posts/:id/edit', requireAuth, showPostEdit);
router.post('/posts/:id', requireAuth, handlePostUpdate);
router.post('/posts/:id/delete', requireAuth, handlePostDelete);

router.get('/shifts', requireAuth, listShifts);
router.get('/shifts/new', requireAuth, showShiftCreate);
router.post('/shifts', requireAuth, handleShiftCreate);
router.get('/shifts/:id/edit', requireAuth, showShiftEdit);
router.post('/shifts/:id', requireAuth, handleShiftUpdate);
router.post('/shifts/:id/delete', requireAuth, handleShiftDelete);

module.exports = router;
