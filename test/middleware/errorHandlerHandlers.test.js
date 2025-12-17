jest.mock('../../src/config/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
}));

const logger = require('../../src/config/logger');
const {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validationErrorHandler,
  formatError
} = require('../../src/middleware/errorHandler');

const createMockReq = (overrides = {}) => ({
  method: 'GET',
  url: '/test',
  path: '/test',
  headers: {},
  id: 'test-request',
  body: {},
  params: {},
  query: {},
  ip: '127.0.0.1',
  connection: { remoteAddress: '127.0.0.1' },
  get: jest.fn().mockReturnValue('jest-agent'),
  ...overrides
});

const createMockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('error handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formats errors with request context', () => {
    const req = createMockReq();
    const result = formatError(new Error('Boom'), req);
    expect(result.error).toEqual(expect.objectContaining({
      message: 'Boom',
      status: 500,
      requestId: 'test-request',
      path: '/test'
    }));
    expect(result.error.timestamp).toBeDefined();
  });

  it('uses header request id and default message when missing fields', () => {
    const req = createMockReq({
      id: undefined,
      headers: { 'x-request-id': 'header-123' }
    });

    const result = formatError({ status: 418 }, req);

    expect(result.error.requestId).toBe('header-123');
    expect(result.error.message).toBe('Internal Server Error');
    expect(result.error.status).toBe(418);
  });

  it('falls back to unknown request id when none provided', () => {
    const req = createMockReq({
      id: undefined,
      headers: {}
    });

    const result = formatError({}, req);

    expect(result.error.requestId).toBe('unknown');
  });

  it('logs and hides server error details', () => {
    const req = createMockReq();
    const res = createMockRes();

    errorHandler(new Error('Sensitive failure'), req, res, jest.fn());

    expect(logger.error).toHaveBeenCalledWith(
      'Server error occurred',
      expect.objectContaining({ error: 'Sensitive failure' })
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ message: 'Internal Server Error' })
    }));
  });

  it('keeps verbose server errors in development', () => {
    const req = createMockReq();
    const res = createMockRes();
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    errorHandler(new Error('Dev failure'), req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ message: 'Dev failure' })
    }));

    process.env.NODE_ENV = originalEnv;
  });

  it('logs fallback IP and request id values when missing', () => {
    const req = createMockReq({
      ip: undefined,
      id: undefined,
      headers: { 'x-request-id': 'from-header' },
      connection: { remoteAddress: '10.0.0.5' }
    });
    const res = createMockRes();

    errorHandler(new Error('fallback check'), req, res, jest.fn());

    expect(logger.error).toHaveBeenCalledWith(
      'Server error occurred',
      expect.objectContaining({
        ip: '10.0.0.5',
        requestId: 'from-header'
      })
    );
  });

  it('returns client errors as-is and logs warning', () => {
    const req = createMockReq();
    const res = createMockRes();
    const err = new Error('Bad Request');
    err.status = 400;

    errorHandler(err, req, res, jest.fn());

    expect(logger.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ message: 'Bad Request' })
    }));
  });

  it('notFoundHandler emits 404 error', () => {
    const next = jest.fn();
    notFoundHandler(createMockReq(), createMockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 404,
      message: expect.stringContaining('Route GET /test not found')
    }));
  });

  it('validationErrorHandler maps Joi details to 400 error', () => {
    const next = jest.fn();
    const err = {
      isJoi: true,
      details: [{ path: ['ip'], message: '"ip" must be valid' }]
    };

    validationErrorHandler(err, createMockReq(), createMockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      details: [{ field: 'ip', message: '"ip" must be valid' }]
    }));
  });

  it('validationErrorHandler passes through non-Joi errors', () => {
    const next = jest.fn();
    const err = new Error('not joi');

    validationErrorHandler(err, createMockReq(), createMockRes(), next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it('asyncHandler propagates rejected promises', async () => {
    const next = jest.fn();
    const handler = asyncHandler(async () => {
      throw new Error('async failure');
    });

    await handler(createMockReq(), createMockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'async failure'
    }));
  });
});
