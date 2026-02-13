const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/event.model');
const Organization = require('../models/organization.model');
const VolunteerShift = require('../models/volunteerShift.model');
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

const getOrganizationsFilter = (user) => {
  if (user.role === 'admin') {
    return {};
  }

  return {
    $or: [
      { owner: user._id },
      { members: user._id }
    ]
  };
};

const getAvailableOrganizations = (user) => {
  return Organization.find(getOrganizationsFilter(user)).sort({ name: 1 });
};

const canUseOrganization = async (organizationId, user) => {
  if (!organizationId || user.role === 'admin') {
    return true;
  }

  const organization = await Organization.findOne({
    _id: organizationId,
    ...getOrganizationsFilter(user)
  }).select('_id');

  return Boolean(organization);
};

const listEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .populate('owner')
    .populate('organization')
    .sort({ startDate: 1 });
  res.render('events', {
    events,
    formatDate,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organization')
    .populate('owner');

  if (!event) {
    return res.status(404).render('event-detail', {
      event: null,
      formatDate,
      currentUser: req.user || null,
      error: 'Event not found.'
    });
  }

  const ownerId = event.owner && event.owner._id ? event.owner._id : event.owner;
  const isOwner = req.user && ownerId && ownerId.toString() === req.user._id.toString();
  const canEdit = req.user && (req.user.role === 'admin' || isOwner);
  const canDelete = req.user && (req.user.role === 'admin' || isOwner);
  let isSubscribed = false;

  if (req.user && !isOwner) {
    const subscription = await VolunteerShift.findOne({ event: event._id, volunteer: req.user._id });
    isSubscribed = Boolean(subscription);
  }

  res.render('event-detail', {
    event,
    formatDate,
    currentUser: req.user || null,
    canEdit,
    canDelete,
    canSubscribe: Boolean(req.user && !isOwner),
    isSubscribed,
    message: req.query.message || null,
    error: req.query.error || null
  });
});

const showCreateForm = asyncHandler(async (req, res) => {
  const organizations = await getAvailableOrganizations(req.user);
  res.render('event-new', {
    organizations,
    values: {},
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleCreate = asyncHandler(async (req, res) => {
  const { error, value } = eventCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (req.fileValidationError) {
    const organizations = await getAvailableOrganizations(req.user);
    return res.status(400).render('event-new', {
      organizations,
      values: req.body,
      errors: { imageUrl: req.fileValidationError },
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (error) {
    const organizations = await getAvailableOrganizations(req.user);
    return res.status(400).render('event-new', {
      organizations,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (!req.file) {
    const organizations = await getAvailableOrganizations(req.user);
    return res.status(400).render('event-new', {
      organizations,
      values: req.body,
      errors: { imageUrl: 'Загрузите изображение события.' },
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (value.organization === '') {
    delete value.organization;
  }

  if (value.organization) {
    const hasAccess = await canUseOrganization(value.organization, req.user);
    if (!hasAccess) {
      const organizations = await getAvailableOrganizations(req.user);
      return res.status(403).render('event-new', {
        organizations,
        values: req.body,
        errors: { organization: 'Вы можете выбрать только свою организацию или организацию, где вы участник.' },
        message: null,
        error: 'Недостаточно прав для выбранной организации.',
        currentUser: req.user || null
      });
    }
  }

  value.imageUrl = req.file.filename;

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

  const organizations = await getAvailableOrganizations(req.user);

  res.render('event-edit', {
    event,
    organizations,
    values: {
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      location: event.location,
      startDate: formatDateTimeLocal(event.startDate),
      endDate: formatDateTimeLocal(event.endDate),
      capacity: event.capacity,
      organization: event.organization ? event.organization.toString() : ''
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

  let value = {};
  let error = null;
  const hasBody = Object.keys(req.body || {}).length > 0;

  if (hasBody) {
    const validation = eventUpdateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    value = validation.value;
    error = validation.error;
  }

  if (req.fileValidationError) {
    const organizations = await getAvailableOrganizations(req.user);
    return res.status(400).render('event-edit', {
      event,
      organizations,
      values: { ...req.body },
      errors: { imageUrl: req.fileValidationError },
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (error) {
    const organizations = await getAvailableOrganizations(req.user);
    return res.status(400).render('event-edit', {
      event,
      organizations,
      values: { ...req.body },
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (value.organization === '') {
    value.organization = null;
  }

  if (value.organization) {
    const hasAccess = await canUseOrganization(value.organization, req.user);
    if (!hasAccess) {
      const organizations = await getAvailableOrganizations(req.user);
      return res.status(403).render('event-edit', {
        event,
        organizations,
        values: { ...req.body },
        errors: { organization: 'Вы можете выбрать только свою организацию или организацию, где вы участник.' },
        message: null,
        error: 'Недостаточно прав для выбранной организации.',
        currentUser: req.user || null
      });
    }
  }

  if (req.file) {
    value.imageUrl = req.file.filename;
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

  const canDelete = req.user.role === 'admin' || event.owner.toString() === req.user._id.toString();
  if (!canDelete) {
    return res.redirect(`/events/${event._id}?error=Вы не можете удалить это событие`);
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
