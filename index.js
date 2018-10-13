const express = require('express');
const app = express();
const expressip = require('express-ip');
const PORT = process.env.PORT || 5000;
const path = require('path');
const cors = require('cors');
const {get} = require('lodash');


app.use(expressip().getIpInfoMiddleware);
app.use(cors());


app.set('PORT', PORT);

app.get('/', (req, res) => {
    try {
        const ipInfo = req.ipInfo;
        let responseData = {
            country_code: ipInfo.country,
            country_name: ipInfo.country,
            city: ipInfo.city,
            latitude: ipInfo.ll[0],
            longitude: ipInfo.ll[1],
            IPv4: get(req, 'headers.x-forwarded-for'),
            eu: ipInfo.eu,
            region: ipInfo.region,
            timezone: ipInfo.timezone
        }
        var message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
        console.log(message);
        res.send(responseData);
    } catch (exception) {
        res.status(500).send('Error processing IP address');
    }
});

app.listen(app.get('PORT'), () => {
    console.log('Express started on http://localhost:' +
        app.get('PORT') + '; press Ctrl-C to terminate.');
});