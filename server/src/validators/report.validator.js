const Joi = require('joi');

const createReportSchema = Joi.object({
  reportType: Joi.string().valid('LOST', 'FOUND').required(),
  itemName: Joi.string().required().trim().max(100),
  description: Joi.string().required().max(1000),
  category: Joi.string().trim().max(50).optional().allow(''),
  color: Joi.string().trim().max(30).optional().allow(''),
  brand: Joi.string().trim().max(50).optional().allow(''),
  location: Joi.object({
    label: Joi.string().required().trim().max(100)
  }).required(),
  eventAt: Joi.date().iso().required(),
  timePrecision: Joi.string().valid('EXACT', 'APPROXIMATE', 'UNKNOWN').default('APPROXIMATE'),
  additionalInfo: Joi.string().max(500).optional().allow(''),
  images: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    objectKey: Joi.string().optional().default('local_upload'),
    mimeType: Joi.string().optional(),
    size: Joi.number().optional(),
    width: Joi.number().optional(),
    height: Joi.number().optional()
  })).max(5).optional(),
  contactPreferences: Joi.object({
    email: Joi.boolean().default(false),
    name: Joi.boolean().default(false),
    department: Joi.boolean().default(false),
    rollNumber: Joi.boolean().default(false),
    phoneNumber: Joi.boolean().default(false),
    telegramId: Joi.boolean().default(false),
    classSection: Joi.boolean().default(false)
  }).default()
});

const updateReportSchema = Joi.object({
  itemName: Joi.string().trim().max(100).optional(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().trim().max(50).optional().allow(''),
  color: Joi.string().trim().max(30).optional().allow(''),
  brand: Joi.string().trim().max(50).optional().allow(''),
  location: Joi.object({
    label: Joi.string().required().trim().max(100)
  }).optional(),
  eventAt: Joi.date().iso().optional(),
  timePrecision: Joi.string().valid('EXACT', 'APPROXIMATE', 'UNKNOWN').optional(),
  additionalInfo: Joi.string().max(500).optional().allow(''),
  images: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    objectKey: Joi.string().optional().default('local_upload'),
    mimeType: Joi.string().optional(),
    size: Joi.number().optional(),
    width: Joi.number().optional(),
    height: Joi.number().optional()
  })).max(5).optional(),
  contactPreferences: Joi.object({
    email: Joi.boolean(),
    name: Joi.boolean(),
    department: Joi.boolean(),
    rollNumber: Joi.boolean(),
    phoneNumber: Joi.boolean(),
    telegramId: Joi.boolean(),
    classSection: Joi.boolean()
  }).optional(),
  status: Joi.string().valid('ACTIVE', 'CLAIM_PENDING', 'RESOLVED', 'EXPIRED', 'REMOVED').optional()
});

module.exports = {
  createReportSchema,
  updateReportSchema
};

