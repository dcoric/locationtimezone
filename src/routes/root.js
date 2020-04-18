const {get} = require('lodash');
const ipProccessing = require('../ip-proccessing');
const {ROOT_ROUTE, IP_ADDRESS} = require('./routes');
const {repackIpInfo} = require('../helper/objectManipulation');

module.exports = app => {
  app.get(ROOT_ROUTE, (req, res) => {
    const ip = get(req, 'headers.x-forwarded-for');
    try {
      const ipInfo = req.ipInfo;
      let responseData = repackIpInfo(ipInfo, ip);
      const currentDateTime = new Date();
      const message = `${currentDateTime.toISOString()} - IP ${responseData.IPv4} is from ${ipInfo.city}, ${ipInfo.country}`;
      console.log(message);
      res.set('Content-Type', 'application/json').send(responseData);
    } catch (exception) {
      console.error(exception);
      res.status(500).send('Error processing IP address');
    }
  });

  app.get(IP_ADDRESS, (req, res) => {
    let ip = get(req, 'params.ip');
    console.log('Requested IP:', ip);
    if (!ip) {
      ip = get(req, 'headers.x-forwarded-for');
    }
    try {
      const ipInfo = ipProccessing().getIpInfo(ip);
      console.log('IP:', ipInfo);
      res.set('Content-Type', 'application/json').send(repackIpInfo(ipInfo, ip));
    } catch (e) {
      console.error(e);
      res.status(500).send('Error processing IP address ' + ip);
    }
  });
};
