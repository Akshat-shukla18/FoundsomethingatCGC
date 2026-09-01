const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      console.error('[VALIDATION ERROR]', errorMessages);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errorMessages
        }
      });
    }

    req.body = value;
    next();
  };
};

module.exports = validate;

