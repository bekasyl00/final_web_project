const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const organizationCreateSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(2000).allow(''),
  members: Joi.alternatives().try(
    objectId,
    Joi.array().items(objectId)
  ).optional()
});

const organizationUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  description: Joi.string().max(2000).allow(''),
  members: Joi.alternatives().try(
    objectId,
    Joi.array().items(objectId)
  )
}).min(1);

module.exports = { organizationCreateSchema, organizationUpdateSchema };
