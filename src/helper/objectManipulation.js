module.exports = {
  repackIpInfo: (ipInfo, ip) => {
    if (ipInfo.error) {
      return { error: ipInfo.error };
    }
    
    if (!ipInfo.ll || ipInfo.ll.length < 2) {
      return { error: 'Invalid location data' };
    }
    
    return {
      country_code: ipInfo.country,
      country_name: ipInfo.country,
      city: ipInfo.city,
      latitude: ipInfo.ll[0],
      longitude: ipInfo.ll[1],
      IPv4: ip,
      eu: ipInfo.eu,
      region: ipInfo.region,
      timezone: ipInfo.timezone
    };
  }
};
