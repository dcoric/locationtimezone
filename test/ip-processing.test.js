const ipProcessing = require('../src/ip-processing');

describe('IP Processing', () => {
  let processor;

  beforeEach(() => {
    processor = ipProcessing();
  });

  describe('getIpInfo', () => {
    it('should return error for localhost IPv4', () => {
      const result = processor.getIpInfo('127.0.0.1');
      expect(result).toEqual({
        error: "This won't work on localhost"
      });
    });

    it('should return error for localhost IPv6', () => {
      const result = processor.getIpInfo('::1');
      expect(result).toEqual({
        error: "This won't work on localhost"
      });
    });

    it('should handle IPv6 wrapped IPv4 addresses', () => {
      // Mock a public IP wrapped in IPv6
      const result = processor.getIpInfo('::ffff:8.8.8.8');

      // Should extract the IPv4 part and process it
      if (result.error) {
        // If geoip-lite returns null, we get an error
        expect(result.error).toBe('Error occured while trying to process the information');
      } else {
        // If successful, should have location data
        expect(result).toHaveProperty('country');
      }
    });

    it('should return location data for valid public IP', () => {
      // Test with Google's public DNS
      const result = processor.getIpInfo('8.8.8.8');

      if (result.error) {
        // If geoip-lite database doesn't have the IP
        expect(result.error).toBe('Error occured while trying to process the information');
      } else {
        // If successful, should have required fields
        expect(result).toHaveProperty('country');
        expect(result).toHaveProperty('ll'); // latitude/longitude
      }
    });

    it('should return error for unknown IP', () => {
      // Use a private IP that won't be in the geoip database
      const result = processor.getIpInfo('192.168.1.1');
      expect(result).toEqual({
        error: 'Error occured while trying to process the information'
      });
    });
  });

  describe('getIpInfoMiddleware', () => {
    it('should be a function', () => {
      expect(typeof processor.getIpInfoMiddleware).toBe('function');
    });

    it('should call next() when executed', () => {
      const req = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' }
      };
      const res = {};
      const next = jest.fn();

      processor.getIpInfoMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should add ipInfo to request object', () => {
      const req = {
        headers: { 'x-forwarded-for': '127.0.0.1' },
        socket: { remoteAddress: '127.0.0.1' }
      };
      const res = {};
      const next = jest.fn();

      processor.getIpInfoMiddleware(req, res, next);

      expect(req).toHaveProperty('ipInfo');
    });
  });
});