const asyncHandler = require('../utils/asyncHandler');
const {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../services/event.service');

const createEventHandler = asyncHandler(async (req, res) => {
  const event = await createEvent(req.body, req.user);
  res.status(201).json({
    status: 'success',
    data: event
  });
});

const getEventsHandler = asyncHandler(async (req, res) => {
  const events = await listEvents(req.user);
  res.status(200).json({
    status: 'success',
    results: events.length,
    data: events
  });
});

const getEventByIdHandler = asyncHandler(async (req, res) => {
  const event = await getEventById(req.params.id, req.user);
  res.status(200).json({
    status: 'success',
    data: event
  });
});

const updateEventHandler = asyncHandler(async (req, res) => {
  const event = await updateEvent(req.params.id, req.body, req.user);
  res.status(200).json({
    status: 'success',
    data: event
  });
});

const deleteEventHandler = asyncHandler(async (req, res) => {
  const result = await deleteEvent(req.params.id, req.user);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

module.exports = {
  createEventHandler,
  getEventsHandler,
  getEventByIdHandler,
  updateEventHandler,
  deleteEventHandler
};
