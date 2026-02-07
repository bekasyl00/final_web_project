const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const postCreateSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  content: Joi.string().min(10).max(4000).required(),
  event: objectId.allow('').optional()
});

const postUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(120),
  content: Joi.string().min(10).max(4000),
  event: objectId.allow('')
}).min(1);

module.exports = { postCreateSchema, postUpdateSchema };
