const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateProfileSchema } = require('../validators/user.validator');

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', validate(updateProfileSchema), updateUserProfile);

module.exports = router;
