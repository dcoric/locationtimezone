const request = require('supertest');
const express = require('express');
const rootRoute = require('../../src/routes/root');
const { errorHandler, notFoundHandler, validationErrorHandler } = require('../../src/middleware/errorHandler');

// Create test app
const createTestApp = () => {
  const app = express();

  // Add basic middleware
  app.use(express.json());

  // Add routes
  rootRoute(app);

  // Add error handling
  app.use(validationErrorHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('Health Check Endpoint', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('message', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('dependencies');
      expect(response.body.dependencies).toHaveProperty('geoipLite');
    });

    it('should include proper timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should have numerical uptime', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});