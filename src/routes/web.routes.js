const express = require('express');
const {
  showLogin,
  showRegister,
  handleRegister,
  handleLogin,
  logout
} = require('../controllers/webAuth.controller');
const { showProfile, handleProfileUpdate } = require('../controllers/webProfile.controller');
const { requireAuth } = require('../middleware/cookieAuth.middleware');

const router = express.Router();

router.get('/login', showLogin);
router.post('/login', handleLogin);
router.get('/register', showRegister);
router.post('/register', handleRegister);
router.get('/logout', logout);

router.get('/profile', requireAuth, showProfile);
router.post('/profile', requireAuth, handleProfileUpdate);

module.exports = router;
