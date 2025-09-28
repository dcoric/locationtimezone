require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ipProcessing = require('./ip-processing');
const cors = require('cors');
const rootRoute = require('./routes/root');
const app = express();
const PORT = process.env.PORT || 7755;


// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(ipProcessing().getIpInfoMiddleware);
app.set('PORT', PORT);

app.listen(PORT, () => {
  console.log(`Express started on http://localhost:${app.get('PORT')}; press Ctrl-C to terminate.`);
});

rootRoute(app);
