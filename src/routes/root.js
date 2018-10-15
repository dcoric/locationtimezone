const {get} = require('lodash');
const expressip = require('express-ip');
const {ROOT_ROUTE, IP_ADDRESS} = require('./routes');
const {repackIpInfo} = require('../helper/objectManipulation');

module.exports = app => {
  app.get(ROOT_ROUTE, (req, res) => {
    const ip = get(req, 'headers.x-forwarded-for');
    try {
      const ipInfo = req.ipInfo;
      let responseData = repackIpInfo(ipInfo, ip);
      const message = `IP ${responseData.IPv4} is from ${ipInfo.city}, ${ipInfo.country}`;
      console.log(message);
      res.setHeader('Content-Type', 'application/json').send(responseData);
    } catch (exception) {
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
      const ipInfo = expressip().getIpInfo(ip);
      console.log('IP:', ipInfo);
      res.setHeader('Content-Type', 'application/json').send(repackIpInfo(ipInfo, ip));
    } catch (e) {
      res.status(500).send('Error processing IP address ' + ip);
    }
  });
};