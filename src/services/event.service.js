const Event = require('../models/event.model');
const AppError = require('../utils/AppError');

const createEvent = async (data, user) => {
  const event = await Event.create({
    ...data,
    owner: user._id
  });

  return event;
};

const listEvents = async (user) => {
  const filter = user.role === 'admin' ? {} : { owner: user._id };
  return Event.find(filter).sort({ createdAt: -1 });
};

const getEventById = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found.', 404);
  }

  if (user.role !== 'admin' && event.owner.toString() !== user._id.toString()) {
    throw new AppError('Forbidden. Not your event.', 403);
  }

  return event;
};

const updateEvent = async (eventId, updates, user) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found.', 404);
  }

  if (user.role !== 'admin' && event.owner.toString() !== user._id.toString()) {
    throw new AppError('Forbidden. Not your event.', 403);
  }

  const allowed = ['title', 'description', 'imageUrl', 'location', 'startDate', 'endDate', 'capacity', 'organization'];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) {
      event[field] = updates[field];
    }
  });

  await event.save();
  return event;
};

const deleteEvent = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found.', 404);
  }

  if (user.role !== 'admin' && event.owner.toString() !== user._id.toString()) {
    throw new AppError('Forbidden. Not your event.', 403);
  }

  await event.deleteOne();
  return { message: 'Event deleted.' };
};

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
