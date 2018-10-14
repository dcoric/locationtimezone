const {get} = require('lodash');

module.exports = app => {
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
            };
            const message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
            console.log(message);
            res.send(responseData);
        } catch (exception) {
            res.status(500).send('Error processing IP address');
        }
    });
}