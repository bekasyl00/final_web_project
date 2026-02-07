const asyncHandler = require('../utils/asyncHandler');
const Post = require('../models/post.model');
const Event = require('../models/event.model');
const { postCreateSchema, postUpdateSchema } = require('../validators/post.validator');

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

const listPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate('author').populate('event').sort({ createdAt: -1 });
  res.render('posts', {
    posts,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author').populate('event');
  if (!post) {
    return res.redirect('/posts?error=Post not found');
  }

  const canEdit = req.user && (req.user.role === 'admin' || post.author._id.toString() === req.user._id.toString());
  const canDelete = req.user && req.user.role === 'admin';

  res.render('post-detail', {
    post,
    canEdit,
    canDelete,
    message: req.query.message || null,
    error: req.query.error || null,
    currentUser: req.user || null
  });
});

const showCreateForm = asyncHandler(async (req, res) => {
  const events = await Event.find({}).sort({ startDate: 1 });
  res.render('post-new', {
    events,
    values: {},
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleCreate = asyncHandler(async (req, res) => {
  const { error, value } = postCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const events = await Event.find({}).sort({ startDate: 1 });
    return res.status(400).render('post-new', {
      events,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  const payload = { ...value };
  if (!payload.event) {
    delete payload.event;
  }

  const post = await Post.create({
    ...payload,
    author: req.user._id
  });

  return res.redirect(`/posts/${post._id}?message=Post created`);
});

const showEditForm = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.redirect('/posts?error=Post not found');
  }

  const canEdit = req.user.role === 'admin' || post.author.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect(`/posts/${post._id}?error=Вы не можете редактировать этот пост`);
  }

  const events = await Event.find({}).sort({ startDate: 1 });
  res.render('post-edit', {
    post,
    events,
    values: {
      title: post.title,
      content: post.content,
      event: post.event ? post.event.toString() : ''
    },
    errors: {},
    message: null,
    error: null,
    currentUser: req.user || null
  });
});

const handleUpdate = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.redirect('/posts?error=Post not found');
  }

  const canEdit = req.user.role === 'admin' || post.author.toString() === req.user._id.toString();
  if (!canEdit) {
    return res.redirect(`/posts/${post._id}?error=Вы не можете редактировать этот пост`);
  }

  const { error, value } = postUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const events = await Event.find({}).sort({ startDate: 1 });
    return res.status(400).render('post-edit', {
      post,
      events,
      values: req.body,
      errors: buildErrorMap(error),
      message: null,
      error: 'Проверьте корректность данных.',
      currentUser: req.user || null
    });
  }

  if (value.event === '') {
    value.event = null;
  }

  Object.assign(post, value);
  await post.save();

  return res.redirect(`/posts/${post._id}?message=Post updated`);
});

const handleDelete = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.redirect('/posts?error=Post not found');
  }

  if (req.user.role !== 'admin') {
    return res.redirect(`/posts/${post._id}?error=Только администратор может удалять посты`);
  }

  await post.deleteOne();
  return res.redirect('/posts?message=Post deleted');
});

module.exports = {
  listPosts,
  showPost,
  showCreateForm,
  handleCreate,
  showEditForm,
  handleUpdate,
  handleDelete
};
