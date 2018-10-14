const express = require('express');
const expressip = require('express-ip');
const cors = require('cors');
const app = express();
const rootRoute = require('./routes/root');
const PORT = process.env.PORT || 5000;


app.use(expressip().getIpInfoMiddleware);
app.use(cors());
app.set('PORT', PORT);

rootRoute(app);

app.listen(app.PORT, () => {
    console.log('Express started on http://localhost:' +
        app.get('PORT') + '; press Ctrl-C to terminate.');
});
