const { validateIpParam, validateIpHeader } = require('../../src/middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      headers: {},
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateIpParam', () => {
    it('should pass valid IPv4 address', () => {
      req.params.ip = '192.168.1.1';

      validateIpParam(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass valid IPv6 address', () => {
      req.params.ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';

      validateIpParam(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should reject invalid IP address', () => {
      req.params.ip = 'invalid-ip';
      req.get.mockReturnValue('test-user-agent');

      validateIpParam(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid IP address format',
        status: 400,
        isJoi: true
      }));
    });

    it('should reject empty IP address', () => {
      req.params.ip = '';

      validateIpParam(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid IP address format',
        status: 400
      }));
    });

    it('should reject IP with CIDR notation', () => {
      req.params.ip = '192.168.1.1/24';

      validateIpParam(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid IP address format',
        status: 400
      }));
    });
  });

  describe('validateIpHeader', () => {
    it('should pass when no IP in headers', () => {
      validateIpHeader(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass with valid IP in x-forwarded-for header', () => {
      req.headers['x-forwarded-for'] = '192.168.1.1';

      validateIpHeader(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should handle multiple IPs in x-forwarded-for header', () => {
      req.headers['x-forwarded-for'] = '192.168.1.1, 10.0.0.1';

      validateIpHeader(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should log warning for invalid IP but still continue', () => {
      req.headers['x-forwarded-for'] = 'invalid-ip';

      validateIpHeader(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});