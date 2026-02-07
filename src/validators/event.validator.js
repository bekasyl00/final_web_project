const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const eventCreateSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().max(2000).allow(''),
  location: Joi.string().max(200).allow(''),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
  status: Joi.string().valid('draft', 'published', 'completed'),
  capacity: Joi.number().min(1),
  organization: objectId
});

const eventUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(120),
  description: Joi.string().max(2000).allow(''),
  location: Joi.string().max(200).allow(''),
  startDate: Joi.date(),
  endDate: Joi.date(),
  status: Joi.string().valid('draft', 'published', 'completed'),
  capacity: Joi.number().min(1),
  organization: objectId
}).min(1);

module.exports = { eventCreateSchema, eventUpdateSchema };
