const express = require('express');
const {
  createEventHandler,
  getEventsHandler,
  getEventByIdHandler,
  updateEventHandler,
  deleteEventHandler
} = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { eventCreateSchema, eventUpdateSchema } = require('../validators/event.validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(validate(eventCreateSchema), createEventHandler)
  .get(getEventsHandler);

router.route('/:id')
  .get(getEventByIdHandler)
  .put(validate(eventUpdateSchema), updateEventHandler)
  .delete(deleteEventHandler);

module.exports = router;
