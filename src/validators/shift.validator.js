const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const shiftCreateSchema = Joi.object({
  event: objectId.required(),
  status: Joi.string().valid('subscribed', 'cancelled').optional(),
  reminderHours: Joi.number().integer().min(1).max(168).optional()
});

const shiftUpdateSchema = Joi.object({
  status: Joi.string().valid('subscribed', 'cancelled'),
  reminderHours: Joi.number().integer().min(1).max(168)
}).min(1);

const shiftReminderSchema = Joi.object({
  reminderHours: Joi.number().integer().min(1).max(168).required()
});

module.exports = { shiftCreateSchema, shiftUpdateSchema, shiftReminderSchema };
