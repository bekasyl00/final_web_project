const Joi = require('joi');

const updateProfileSchema = Joi.object({
  username: Joi.string().min(2).max(50),
  email: Joi.string().email()
}).min(1);

module.exports = { updateProfileSchema };
