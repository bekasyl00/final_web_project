const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const shiftCreateSchema = Joi.object({
  event: objectId.required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().min(Joi.ref('startTime')).required(),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional()
});

const shiftUpdateSchema = Joi.object({
  event: objectId,
  startTime: Joi.date(),
  endTime: Joi.date().min(Joi.ref('startTime')),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled')
}).min(1);

module.exports = { shiftCreateSchema, shiftUpdateSchema };
