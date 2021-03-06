const express = require('express');
const ipProccessing = require('./ip-proccessing');
const cors = require('cors');
const rootRoute = require('./routes/root');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(ipProccessing().getIpInfoMiddleware);
// let whitelist = [
//   'http://localhost:3000',
//   'https://brio.groundlink.com',
//   'https://gq-brio.groundlink.com',
//   'https://brio.davelbostoncoach.com',
//   'https://gq-brio.davelbostoncoach.com',
// ];
// let corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };
app.use(cors());
app.set('PORT', PORT);

app.listen(PORT, () => {
  console.log('Express started on http://localhost:' +
        app.get('PORT') + '; press Ctrl-C to terminate.');
});

rootRoute(app);
