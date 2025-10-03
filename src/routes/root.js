const { get } = require('lodash');
const ipProcessing = require('../ip-processing');
const { ROOT_ROUTE, IP_ADDRESS, HEALTH_CHECK } = require('./routes');
const { repackIpInfo } = require('../helper/objectManipulation');
const { validateIpParam, validateIpHeader } = require('../middleware/validation');
const logger = require('../config/logger');

module.exports = app => {
  app.get(ROOT_ROUTE, validateIpHeader, (req, res, next) => {
    const ip = get(req, 'headers.x-forwarded-for');
    try {
      const ipInfo = req.ipInfo;
      const responseData = repackIpInfo(ipInfo, ip);
      logger.info('IP geolocation lookup successful', {
        ip: responseData.IPv4,
        city: ipInfo.city,
        country: ipInfo.country,
        userAgent: req.get('User-Agent')
      });
      res.set('Content-Type', 'application/json').send(responseData);
    } catch (exception) {
      const error = new Error('Error processing IP address from header');
      error.status = 500;
      error.originalError = exception;
      next(error);
    }
  });

  app.get(IP_ADDRESS, validateIpParam, (req, res, next) => {
    let ip = get(req, 'params.ip');
    logger.info('IP lookup request received', {
      requestedIp: ip,
      userAgent: req.get('User-Agent')
    });

    if (!ip) {
      ip = get(req, 'headers.x-forwarded-for');
    }

    try {
      const ipInfo = ipProcessing().getIpInfo(ip);
      logger.info('IP geolocation lookup successful', {
        ip,
        city: ipInfo?.city,
        country: ipInfo?.country,
        region: ipInfo?.region
      });
      res.set('Content-Type', 'application/json').send(repackIpInfo(ipInfo, ip));
    } catch (e) {
      const error = new Error(`Error processing IP address: ${ip}`);
      error.status = 500;
      error.originalError = e;
      next(error);
    }
  });

  app.get(HEALTH_CHECK, (req, res, next) => {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: require('../../package.json').version,
      dependencies: {
        geoipLite: 'operational'
      }
    };

    try {
      // Test basic functionality
      const testIp = '8.8.8.8';
      const testResult = ipProcessing().getIpInfo(testIp);
      if (!testResult) {
        healthCheck.dependencies.geoipLite = 'warning';
        healthCheck.message = 'Service degraded - GeoIP lookup issues';
      }

      res.status(200).set('Content-Type', 'application/json').send(healthCheck);
    } catch (error) {
      const serviceError = new Error('Health check failed - service unavailable');
      serviceError.status = 503;
      serviceError.healthCheck = {
        ...healthCheck,
        message: 'Service unavailable',
        dependencies: { geoipLite: 'error' },
        error: error.message
      };
      next(serviceError);
    }
  });
};
