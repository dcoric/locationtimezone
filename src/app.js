const express = require('express');
const expressip = require('express-ip');
const cors = require('cors');
const rootRoute = require('./routes/root');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(expressip().getIpInfoMiddleware);
app.use(cors());
app.set('PORT', PORT);

app.listen(PORT, () => {
    console.log('Express started on http://localhost:' +
        app.get('PORT') + '; press Ctrl-C to terminate.');
});

rootRoute(app);
