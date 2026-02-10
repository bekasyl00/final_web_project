const asyncHandler = require('../utils/asyncHandler');
const VolunteerShift = require('../models/volunteerShift.model');
const Event = require('../models/event.model');
const { shiftCreateSchema, shiftReminderSchema } = require('../validators/shift.validator');
const { sendSubscriptionEmail } = require('../services/mail.service');

const listShifts = asyncHandler(async (req, res) => {
  const filter = req.user && req.user.role === 'admin' ? {} : { volunteer: req.user._id };
  const subscriptions = await VolunteerShift.find(filter).populate('event').populate('volunteer').sort({ createdAt: -1 });

  res.render('shifts', {
    subscriptions,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const subscribeToEvent = asyncHandler(async (req, res) => {
  const { error } = shiftCreateSchema.validate({ event: req.params.id });
  if (error) {
    return res.redirect('/events?error=Некорректное событие');
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.redirect('/events?error=Event not found');
  }

  if (event.owner && event.owner.toString() === req.user._id.toString()) {
    return res.redirect(`/events/${event._id}?error=Вы не можете подписаться на свое событие`);
  }

  const existing = await VolunteerShift.findOne({ event: event._id, volunteer: req.user._id });
  if (existing) {
    return res.redirect(`/events/${event._id}?message=Вы уже подписаны`);
  }

  await VolunteerShift.create({
    event: event._id,
    volunteer: req.user._id,
    status: 'subscribed',
    reminderHours: 24,
    reminderSent: false
  });

  try {
    await sendSubscriptionEmail({
      user: req.user,
      event,
      reminderHours: 24
    });
  } catch (err) {
    console.error('Subscription email failed:', err && err.message ? err.message : err);
  }

  return res.redirect(`/events/${event._id}?message=Вы подписались на событие. Напоминание придет за 24 часа`);
});

const unsubscribeFromEvent = asyncHandler(async (req, res) => {
  const { error } = shiftCreateSchema.validate({ event: req.params.id });
  if (error) {
    return res.redirect('/events?error=Некорректное событие');
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.redirect('/events?error=Event not found');
  }

  const subscription = await VolunteerShift.findOne({ event: event._id, volunteer: req.user._id });
  if (!subscription) {
    return res.redirect(`/events/${event._id}?error=Вы не подписаны на это событие`);
  }

  await subscription.deleteOne();
  return res.redirect(`/events/${event._id}?message=Вы отписались от события`);
});

const unsubscribeById = asyncHandler(async (req, res) => {
  const subscription = await VolunteerShift.findById(req.params.id).populate('event');
  if (!subscription) {
    return res.redirect('/shifts?error=Подписка не найдена');
  }

  const canDelete = req.user.role === 'admin' || subscription.volunteer.toString() === req.user._id.toString();
  if (!canDelete) {
    return res.redirect('/shifts?error=Вы не можете удалить эту подписку');
  }

  await subscription.deleteOne();
  return res.redirect('/shifts?message=Подписка удалена');
});

const updateReminder = asyncHandler(async (req, res) => {
  const { error, value } = shiftReminderSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.redirect('/shifts?error=Некорректное время напоминания');
  }

  const subscription = await VolunteerShift.findById(req.params.id).populate('event').populate('volunteer');
  if (!subscription) {
    return res.redirect('/shifts?error=Подписка не найдена');
  }

  const volunteerId = subscription.volunteer && subscription.volunteer._id ? subscription.volunteer._id : subscription.volunteer;
  const canEdit = req.user.role === 'admin' || volunteerId.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect('/shifts?error=Вы не можете изменить это напоминание');
  }

  if (!subscription.event || !subscription.event.startDate) {
    return res.redirect('/shifts?error=Событие не найдено');
  }

  const now = new Date();
  if (now > subscription.event.startDate) {
    return res.redirect('/shifts?error=Событие уже началось');
  }

  subscription.reminderHours = value.reminderHours;
  subscription.reminderSent = false;
  await subscription.save();

  return res.redirect('/shifts?message=Настройки напоминания обновлены');
});

module.exports = {
  listShifts,
  subscribeToEvent,
  unsubscribeFromEvent,
  unsubscribeById,
  updateReminder
};
