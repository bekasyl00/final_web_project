const asyncHandler = require('../utils/asyncHandler');
const Organization = require('../models/organization.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const { organizationCreateSchema, organizationUpdateSchema } = require('../validators/organization.validator');

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

const listOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find({})
    .populate('owner')
    .sort({ createdAt: -1 });
  res.render('organizations', {
    organizations,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id)
    .populate('owner')
    .populate('members');
  if (!organization) {
    return res.redirect('/organizations?error=Organization not found');
  }

  const events = await Event.find({ organization: organization._id })
    .populate('owner')
    .sort({ startDate: 1 });
  const canEdit = req.user && (req.user.role === 'admin' || organization.owner._id.toString() === req.user._id.toString());
  const canDelete = req.user && (req.user.role === 'admin' || organization.owner._id.toString() === req.user._id.toString());

  res.render('organization-detail', {
    organization,
    events,
    canEdit,
    canDelete,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showCreateForm = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('username avatar').sort({ username: 1 });
  res.render('organization-new', {
    users,
    values: {},
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleCreate = asyncHandler(async (req, res) => {
  const { error, value } = organizationCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (req.fileValidationError) {
    const users = await User.find({}).select('username avatar').sort({ username: 1 });
    return res.status(400).render('organization-new', {
      users,
      values: req.body,
      errors: { imageUrl: req.fileValidationError },
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (error) {
    const users = await User.find({}).select('username avatar').sort({ username: 1 });
    return res.status(400).render('organization-new', {
      users,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  const members = value.members
    ? Array.isArray(value.members) ? value.members : [value.members]
    : [];
  const uniqueMembers = [...new Set(members.map((member) => member.toString()))];

  if (req.file) {
    value.imageUrl = req.file.filename;
  }

  const organization = await Organization.create({
    ...value,
    members: uniqueMembers,
    owner: req.user._id
  });

  return res.redirect(`/organizations/${organization._id}?message=Organization created`);
});

const showEditForm = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  if (!organization) {
    return res.redirect('/organizations?error=Organization not found');
  }

  const canEdit = req.user.role === 'admin' || organization.owner.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect(`/organizations/${organization._id}?error=Вы не можете редактировать эту организацию`);
  }

  const users = await User.find({}).select('username avatar').sort({ username: 1 });

  res.render('organization-edit', {
    organization,
    users,
    values: {
      name: organization.name,
      description: organization.description,
      members: organization.members.map((member) => member.toString())
    },
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleUpdate = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  if (!organization) {
    return res.redirect('/organizations?error=Organization not found');
  }

  const canEdit = req.user.role === 'admin' || organization.owner.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect(`/organizations/${organization._id}?error=Вы не можете редактировать эту организацию`);
  }

  const { error, value } = organizationUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (req.fileValidationError) {
    const users = await User.find({}).select('username avatar').sort({ username: 1 });
    return res.status(400).render('organization-edit', {
      organization,
      users,
      values: req.body,
      errors: { imageUrl: req.fileValidationError },
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (error) {
    const users = await User.find({}).select('username avatar').sort({ username: 1 });
    return res.status(400).render('organization-edit', {
      organization,
      users,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (value.members) {
    const members = Array.isArray(value.members) ? value.members : [value.members];
    value.members = [...new Set(members.map((member) => member.toString()))];
  }

  if (req.file) {
    value.imageUrl = req.file.filename;
  }

  Object.assign(organization, value);
  await organization.save();

  return res.redirect(`/organizations/${organization._id}?message=Organization updated`);
});

const handleDelete = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  if (!organization) {
    return res.redirect('/organizations?error=Organization not found');
  }

  const canDelete = req.user.role === 'admin' || organization.owner.toString() === req.user._id.toString();
  if (!canDelete) {
    return res.redirect(`/organizations/${organization._id}?error=Вы не можете удалить эту организацию`);
  }

  await organization.deleteOne();
  return res.redirect('/organizations?message=Organization deleted');
});

module.exports = {
  listOrganizations,
  showOrganization,
  showCreateForm,
  handleCreate,
  showEditForm,
  handleUpdate,
  handleDelete
};
