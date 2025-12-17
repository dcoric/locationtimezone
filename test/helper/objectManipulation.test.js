const { repackIpInfo } = require('../../src/helper/objectManipulation');

describe('repackIpInfo', () => {
  const baseIpInfo = {
    country: 'US',
    city: 'San Francisco',
    ll: [37.7749, -122.4194],
    eu: '0',
    region: 'CA',
    timezone: 'America/Los_Angeles'
  };

  it('returns upstream error unchanged', () => {
    const result = repackIpInfo({ error: 'lookup failed' }, '203.0.113.1');
    expect(result).toEqual({ error: 'lookup failed' });
  });

  it('fails when latitude/longitude data is missing', () => {
    const result = repackIpInfo({ ...baseIpInfo, ll: [] }, '198.51.100.5');
    expect(result).toEqual({ error: 'Invalid location data' });
  });

  it('maps geo data to the public API shape', () => {
    const result = repackIpInfo(baseIpInfo, '203.0.113.4');
    expect(result).toEqual({
      country_code: 'US',
      country_name: 'US',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      IPv4: '203.0.113.4',
      eu: '0',
      region: 'CA',
      timezone: 'America/Los_Angeles'
    });
  });
});
