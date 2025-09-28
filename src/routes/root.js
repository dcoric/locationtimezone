const { get } = require('lodash');
const ipProcessing = require('../ip-processing');
const { ROOT_ROUTE, IP_ADDRESS } = require('./routes');
const { repackIpInfo } = require('../helper/objectManipulation');
const { validateIpParam, validateIpHeader } = require('../middleware/validation');

module.exports = app => {
  app.get(ROOT_ROUTE, validateIpHeader, (req, res) => {
    const ip = get(req, 'headers.x-forwarded-for');
    try {
      const ipInfo = req.ipInfo;
      const responseData = repackIpInfo(ipInfo, ip);
      const currentDateTime = new Date();
      const message = `${currentDateTime.toISOString()} - IP ${responseData.IPv4} is from ${ipInfo.city}, ${ipInfo.country}`;
      console.log(message);
      res.set('Content-Type', 'application/json').send(responseData);
    } catch (exception) {
      console.error(exception);
      res.status(500).send('Error processing IP address');
    }
  });

  app.get(IP_ADDRESS, validateIpParam, (req, res) => {
    let ip = get(req, 'params.ip');
    console.log('Requested IP:', ip);
    if (!ip) {
      ip = get(req, 'headers.x-forwarded-for');
    }
    try {
      const ipInfo = ipProcessing().getIpInfo(ip);
      console.log('IP:', ipInfo);
      res.set('Content-Type', 'application/json').send(repackIpInfo(ipInfo, ip));
    } catch (e) {
      console.error(e);
      res.status(500).send('Error processing IP address ' + ip);
    }
  });
};
