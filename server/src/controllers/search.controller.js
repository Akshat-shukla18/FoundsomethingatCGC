const searchService = require('../services/search.service');
const Joi = require('joi');

const searchFoundSchema = Joi.object({
  q: Joi.string().max(100).allow(''),
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().optional(),
  category: Joi.string().max(50).optional(),
  limit: Joi.number().min(1).max(50).default(20),
  cursor: Joi.number().min(0).default(0) // treating cursor as skip offset for search
});

const searchFound = async (req, res, next) => {
  try {
    const { error, value } = searchFoundSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { code: 'SEARCH_INVALID_QUERY', message: error.details[0].message }
      });
    }

    // Spec constraint: Validate query length
    if (value.q && value.q.length < 2) {
       return res.status(400).json({
         success: false,
         error: { code: 'SEARCH_INVALID_QUERY', message: 'Search query must be at least 2 characters long' }
       });
    }

    const result = await searchService.searchFoundReports({
      query: value.q,
      startTime: value.startTime,
      endTime: value.endTime,
      category: value.category,
      limit: value.limit,
      cursor: value.cursor
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchFound
};
