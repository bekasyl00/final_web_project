const asyncHandler = require('../utils/asyncHandler');
const Organization = require('../models/organization.model');
const Event = require('../models/event.model');
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
  const organizations = await Organization.find({}).sort({ createdAt: -1 });
  res.render('organizations', {
    organizations,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id).populate('owner');
  if (!organization) {
    return res.redirect('/organizations?error=Organization not found');
  }

  const events = await Event.find({ organization: organization._id }).sort({ startDate: 1 });
  const canEdit = req.user && (req.user.role === 'admin' || organization.owner._id.toString() === req.user._id.toString());
  const canDelete = req.user && req.user.role === 'admin';

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

const showCreateForm = (req, res) => {
  res.render('organization-new', {
    values: {},
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
};

const handleCreate = asyncHandler(async (req, res) => {
  const { error, value } = organizationCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).render('organization-new', {
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  const organization = await Organization.create({
    ...value,
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

  res.render('organization-edit', {
    organization,
    values: {
      name: organization.name,
      description: organization.description
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

  if (error) {
    return res.status(400).render('organization-edit', {
      organization,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
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

  if (req.user.role !== 'admin') {
    return res.redirect(`/organizations/${organization._id}?error=Только администратор может удалять организации`);
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
