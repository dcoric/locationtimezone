const Joi = require('joi');
const logger = require('../config/logger');

// IP address validation schema
const ipSchema = Joi.string().ip({
  version: ['ipv4', 'ipv6'],
  cidr: 'forbidden'
}).required();

// Middleware to validate IP parameter
const validateIpParam = (req, res, next) => {
  const { ip } = req.params;

  const { error } = ipSchema.validate(ip);

  if (error) {
    const validationError = new Error('Invalid IP address format');
    validationError.status = 400;
    validationError.isJoi = true;
    validationError.details = error.details;

    logger.warn('IP parameter validation failed', {
      ip,
      error: error.details[0].message,
      userAgent: req.get('User-Agent')
    });

    return next(validationError);
  }

  next();
};

// Middleware to validate IP from headers (optional validation)
const validateIpHeader = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (ip) {
    // Clean up forwarded-for header (remove port, take first IP)
    const cleanIp = ip.split(',')[0].split(':')[0].trim();

    const { error } = ipSchema.validate(cleanIp);

    if (error) {
      logger.warn('Invalid IP in headers detected', {
        ip: cleanIp,
        originalHeader: ip,
        error: error.details[0].message
      });
      // Don't block the request, just log the warning
    }
  }

  next();
};

module.exports = {
  validateIpParam,
  validateIpHeader
};