require('dotenv').config({ path: '../.env' }); // or assume it's loaded in index

const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required(),
  SESSION_SECRET: Joi.string().required(),
  CLIENT_URL: Joi.string().uri().required(),
  CORS_ORIGINS: Joi.string().required(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGODB_URI: envVars.MONGODB_URI,
  SESSION_SECRET: envVars.SESSION_SECRET,
  CLIENT_URL: envVars.CLIENT_URL,
  CORS_ORIGINS: envVars.CORS_ORIGINS.split(','),
};

