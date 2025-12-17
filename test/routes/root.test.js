jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../src/ip-processing', () => {
  const getIpInfo = jest.fn();
  const middleware = jest.fn((req, res, next) => next());

  const factory = jest.fn(() => ({
    getIpInfo,
    getIpInfoMiddleware: middleware
  }));

  factory.__mockGetIpInfo = getIpInfo;
  factory.__mockMiddleware = middleware;

  return factory;
});

const request = require('supertest');
const express = require('express');
const logger = require('../../src/config/logger');
const rootRoute = require('../../src/routes/root');
const ipProcessing = require('../../src/ip-processing');
const { IP_ADDRESS } = require('../../src/routes/routes');

const defaultIpInfo = {
  country: 'US',
  city: 'Seattle',
  ll: [47.6062, -122.3321],
  eu: '0',
  region: 'WA',
  timezone: 'America/Los_Angeles'
};

const createApp = ({ attachIpInfo = true, ipInfo = defaultIpInfo } = {}) => {
  const app = express();
  app.use(express.json());

  if (attachIpInfo) {
    app.use((req, res, next) => {
      req.ipInfo = typeof ipInfo === 'function' ? ipInfo(req) : { ...ipInfo };
      next();
    });
  }

  rootRoute(app);

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    res.status(err.status || 500).json({
      message: err.message,
      status: err.status || 500,
      healthCheck: err.healthCheck
    });
  });

  return app;
};

describe('root routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ipProcessing.__mockGetIpInfo.mockReset();
    ipProcessing.__mockMiddleware.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns repacked IP info from the root endpoint', async () => {
    const app = createApp({
      ipInfo: {
        ...defaultIpInfo,
        country: 'CA',
        city: 'Toronto',
        ll: [43.6532, -79.3832],
        region: 'ON',
        timezone: 'America/Toronto'
      }
    });

    const response = await request(app)
      .get('/')
      .set('x-forwarded-for', '203.0.113.10')
      .expect(200);

    expect(response.body).toEqual({
      country_code: 'CA',
      country_name: 'CA',
      city: 'Toronto',
      latitude: 43.6532,
      longitude: -79.3832,
      IPv4: '203.0.113.10',
      eu: '0',
      region: 'ON',
      timezone: 'America/Toronto'
    });
  });

  it('surfaces a 500 error when logging fails', async () => {
    const app = createApp();
    logger.info.mockImplementationOnce(() => {
      throw new Error('logger failure');
    });

    const response = await request(app)
      .get('/')
      .set('x-forwarded-for', '198.51.100.7')
      .expect(500);

    expect(response.body).toEqual(expect.objectContaining({
      message: 'Error processing IP address from header',
      status: 500
    }));
  });

  it('returns IP lookup data for /ip/:ip', async () => {
    ipProcessing.__mockGetIpInfo.mockReturnValue({
      ...defaultIpInfo,
      country: 'GB',
      city: 'London',
      ll: [51.5074, -0.1278],
      region: 'LND',
      timezone: 'Europe/London'
    });

    const app = createApp({ attachIpInfo: false });

    const response = await request(app)
      .get('/ip/203.0.113.44')
      .set('User-Agent', 'jest')
      .expect(200);

    expect(ipProcessing.__mockGetIpInfo).toHaveBeenCalledWith('203.0.113.44');
    expect(response.body).toEqual({
      country_code: 'GB',
      country_name: 'GB',
      city: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      IPv4: '203.0.113.44',
      eu: '0',
      region: 'LND',
      timezone: 'Europe/London'
    });
  });

  it('marks health check as degraded when GeoIP data is unavailable', async () => {
    ipProcessing.__mockGetIpInfo.mockReturnValueOnce(null);
    const app = createApp();

    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.message).toBe('Service degraded - GeoIP lookup issues');
    expect(response.body.dependencies.geoipLite).toBe('warning');
  });

  it('fails health check when GeoIP lookup throws', async () => {
    ipProcessing.__mockGetIpInfo.mockImplementation(() => {
      throw new Error('geoip failure');
    });

    const app = createApp();

    const response = await request(app)
      .get('/health')
      .expect(503);

    expect(response.body).toEqual(expect.objectContaining({
      message: 'Health check failed - service unavailable',
      status: 503,
      healthCheck: expect.objectContaining({
        dependencies: { geoipLite: 'error' }
      })
    }));
  });
});

describe('route handler internals', () => {
  const getIpRouteHandler = () => {
    const handlers = {};
    const mockApp = {
      get: jest.fn((path, ...callbacks) => {
        handlers[path] = callbacks;
      })
    };

    rootRoute(mockApp);

    return handlers[IP_ADDRESS][1];
  };

  it('falls back to x-forwarded-for header when route param is missing', () => {
    const handler = getIpRouteHandler();
    const req = {
      params: {},
      headers: { 'x-forwarded-for': '198.51.100.88' },
      get: jest.fn().mockReturnValue('jest-agent')
    };
    const res = {
      set: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const next = jest.fn();
    ipProcessing.__mockGetIpInfo.mockReturnValue({
      ...defaultIpInfo,
      ll: [10, 20]
    });

    handler(req, res, next);

    expect(ipProcessing.__mockGetIpInfo).toHaveBeenCalledWith('198.51.100.88');
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      IPv4: '198.51.100.88'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('bubbles IP lookup failures to Express error handling', () => {
    const handler = getIpRouteHandler();
    const req = {
      params: { ip: '198.51.100.44' },
      headers: {},
      get: jest.fn().mockReturnValue('jest-agent')
    };
    const res = {
      set: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    const next = jest.fn();
    ipProcessing.__mockGetIpInfo.mockImplementation(() => {
      throw new Error('lookup failure');
    });

    handler(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Error processing IP address: 198.51.100.44',
      status: 500
    }));
  });
});
