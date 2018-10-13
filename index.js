const express = require('express');
const app = express();
const lodash = require('lodash');
const {get} = lodash;

app.get('/', (req, res) => {
    const userIp = get(req, 'headers.x-forwarded-for') || '127.0.0.1';
    console.info('Request IP:', userIp);
    res.send({status: 'Working!', userIp: userIp});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT);
