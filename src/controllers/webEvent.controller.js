const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/event.model');
const { eventCreateSchema, eventUpdateSchema } = require('../validators/event.validator');

const buildErrorMap = (joiError) => {
  const errors = {};
  if (!joiError) return errors;
  joiError.details.forEach((detail) => {
    const field = detail.path[0];
    if (!errors[field]) {
      errors[field] = detail.message.replace(/"/g, '');
    }
  });
  return errors;
};

const formatDateTimeLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (num) => String(num).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const listEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({}).sort({ startDate: 1 });
  res.render('events', {
    events,
    formatDate,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organization');

  if (!event) {
    return res.status(404).render('event-detail', {
      event: null,
      formatDate,
      currentUser: req.user || null,
      error: 'Event not found.'
    });
  }

  const canEdit = req.user && (req.user.role === 'admin' || event.owner.toString() === req.user._id.toString());
  const canDelete = req.user && req.user.role === 'admin';

  res.render('event-detail', {
    event,
    formatDate,
    currentUser: req.user || null,
    canEdit,
    canDelete,
    message: req.query.message || null,
    error: req.query.error || null
  });
});

const showCreateForm = (req, res) => {
  res.render('event-new', {
    values: {},
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
};

const handleCreate = asyncHandler(async (req, res) => {
  const { error, value } = eventCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).render('event-new', {
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  const event = await Event.create({
    ...value,
    owner: req.user._id
  });

  return res.redirect(`/events/${event._id}?message=Event created`);
});

const showEditForm = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.redirect('/events?error=Event not found');
  }

  const canEdit = req.user.role === 'admin' || event.owner.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect(`/events/${event._id}?error=Вы не можете редактировать это событие`);
  }

  res.render('event-edit', {
    event,
    values: {
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      location: event.location,
      startDate: formatDateTimeLocal(event.startDate),
      endDate: formatDateTimeLocal(event.endDate),
      status: event.status,
      capacity: event.capacity,
      organization: event.organization
    },
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleUpdate = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.redirect('/events?error=Event not found');
  }

  const canEdit = req.user.role === 'admin' || event.owner.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect(`/events/${event._id}?error=Вы не можете редактировать это событие`);
  }

  const { error, value } = eventUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).render('event-edit', {
      event,
      values: { ...req.body },
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  Object.assign(event, value);
  await event.save();

  return res.redirect(`/events/${event._id}?message=Event updated`);
});

const handleDelete = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.redirect('/events?error=Event not found');
  }

  if (req.user.role !== 'admin') {
    return res.redirect(`/events/${event._id}?error=Только администратор может удалять события`);
  }

  await event.deleteOne();
  return res.redirect('/events?message=Event deleted');
});

module.exports = {
  listEvents,
  showEvent,
  showCreateForm,
  handleCreate,
  showEditForm,
  handleUpdate,
  handleDelete,
  formatDate
};
