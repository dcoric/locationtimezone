const express = require('express');
const app = express();
const expressip = require('express-ip');
const PORT = process.env.PORT || 5000;
const path = require('path');
const {get} = require('lodash');


app.use(expressip().getIpInfoMiddleware);


app.set('PORT', PORT);

app.get('/', (req, res) => {
    const ipInfo = req.ipInfo;
    let responseData = req.ipInfo;
    responseData.country_code = ipInfo.country;
    responseData.country_name = ipInfo.country;
    responseData.city = ipInfo.city;
    responseData.longitude = ipInfo.ll[0];
    responseData.latitude = ipInfo.ll[1];
    responseData.IPv4 = get(req, 'headers.x-forwarded-for');
    var message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
    console.log(message);
    res.send(responseData);
});

app.listen(app.get('PORT'), () => {
    console.log('Express started on http://localhost:' +
        app.get('PORT') + '; press Ctrl-C to terminate.');
});