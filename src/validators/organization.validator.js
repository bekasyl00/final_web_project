const Joi = require('joi');

const organizationCreateSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(2000).allow('')
});

const organizationUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  description: Joi.string().max(2000).allow('')
}).min(1);

module.exports = { organizationCreateSchema, organizationUpdateSchema };
