const Joi = require('joi');

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
    return res.status(400).json({
      error: 'Invalid IP address format',
      message: error.details[0].message,
      received: ip
    });
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
      console.warn(`Invalid IP in headers: ${cleanIp}`);
      // Don't block the request, just log the warning
    }
  }

  next();
};

module.exports = {
  validateIpParam,
  validateIpHeader
};