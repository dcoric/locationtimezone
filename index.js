const express = require('express');
const app = express();

app.get('/', (req, res) => {
    console.info('Request:', req.headers);
    const headers = req.headers;
    res.send({status: 'Working!', receivedHeaders: headers});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT);
