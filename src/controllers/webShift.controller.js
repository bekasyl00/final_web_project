const asyncHandler = require('../utils/asyncHandler');
const VolunteerShift = require('../models/volunteerShift.model');
const Event = require('../models/event.model');
const { shiftCreateSchema, shiftUpdateSchema } = require('../validators/shift.validator');

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

const listShifts = asyncHandler(async (req, res) => {
  const filter = req.user && req.user.role === 'admin' ? {} : { volunteer: req.user._id };
  const shifts = await VolunteerShift.find(filter).populate('event').populate('volunteer').sort({ startTime: 1 });

  res.render('shifts', {
    shifts,
    formatDate,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showCreateForm = asyncHandler(async (req, res) => {
  const events = await Event.find({}).sort({ startDate: 1 });
  res.render('shift-new', {
    events,
    values: {},
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleCreate = asyncHandler(async (req, res) => {
  const { error, value } = shiftCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const events = await Event.find({}).sort({ startDate: 1 });
    return res.status(400).render('shift-new', {
      events,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  const shift = await VolunteerShift.create({
    ...value,
    volunteer: req.user._id
  });

  return res.redirect(`/shifts?message=Shift created`);
});

const showEditForm = asyncHandler(async (req, res) => {
  const shift = await VolunteerShift.findById(req.params.id).populate('event');
  if (!shift) {
    return res.redirect('/shifts?error=Shift not found');
  }

  const canEdit = req.user.role === 'admin' || shift.volunteer.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect('/shifts?error=Вы не можете редактировать эту смену');
  }

  const events = await Event.find({}).sort({ startDate: 1 });
  res.render('shift-edit', {
    shift,
    events,
    values: {
      event: shift.event ? shift.event._id.toString() : '',
      startTime: formatDateTimeLocal(shift.startTime),
      endTime: formatDateTimeLocal(shift.endTime),
      status: shift.status
    },
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleUpdate = asyncHandler(async (req, res) => {
  const shift = await VolunteerShift.findById(req.params.id);
  if (!shift) {
    return res.redirect('/shifts?error=Shift not found');
  }

  const canEdit = req.user.role === 'admin' || shift.volunteer.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect('/shifts?error=Вы не можете редактировать эту смену');
  }

  const { error, value } = shiftUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const events = await Event.find({}).sort({ startDate: 1 });
    return res.status(400).render('shift-edit', {
      shift,
      events,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  Object.assign(shift, value);
  await shift.save();

  return res.redirect('/shifts?message=Shift updated');
});

const handleDelete = asyncHandler(async (req, res) => {
  const shift = await VolunteerShift.findById(req.params.id);
  if (!shift) {
    return res.redirect('/shifts?error=Shift not found');
  }

  const canDelete = req.user.role === 'admin' || shift.volunteer.toString() === req.user._id.toString();
  if (!canDelete) {
    return res.redirect('/shifts?error=Вы не можете удалить эту смену');
  }

  await shift.deleteOne();
  return res.redirect('/shifts?message=Shift deleted');
});

module.exports = {
  listShifts,
  showCreateForm,
  handleCreate,
  showEditForm,
  handleUpdate,
  handleDelete,
  formatDate
};
