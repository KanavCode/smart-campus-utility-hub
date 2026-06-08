const geoip = require('geoip-lite');
const { UAParser } = require('ua-parser-js');

/**
 * Get IP, User Agent details, Device type and Geolocation from request
 * @param {Object} req Express request object
 * @returns {Object} Parse details
 */
const getSessionDetails = (req) => {
  if (!req) {
    return {
      ip: '127.0.0.1',
      userAgent: 'Unknown',
      deviceType: 'Unknown Device',
      location: 'Unknown Location'
    };
  }

  // Parse IP address
  let ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  // If IPv6 mapped IPv4, clean it up
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // Lookup location
  let location = 'Unknown Location';
  if (ip === '127.0.0.1' || ip === '::1') {
    location = 'Localhost';
  } else {
    try {
      const geo = geoip.lookup(ip);
      if (geo) {
        const city = geo.city;
        const countryCode = geo.country;
        let countryName = countryCode;
        try {
          const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
          countryName = regionNames.of(countryCode) || countryCode;
        } catch (e) {
          // Fallback
        }
        location = city ? `${city}, ${countryName}` : countryName;
      }
    } catch (err) {
      console.error('GeoIP lookup error:', err);
    }
  }

  // Parse User-Agent
  const userAgent = req.headers['user-agent'] || '';
  let deviceType = 'Unknown Device';
  
  try {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    if (browser.name && os.name) {
      deviceType = `${browser.name} on ${os.name}`;
    } else if (browser.name) {
      deviceType = browser.name;
    } else if (os.name) {
      deviceType = os.name;
    }
    
    if (device.type) {
      deviceType += ` (${device.type})`;
    }
  } catch (err) {
    console.error('User-Agent parser error:', err);
  }

  return {
    ip,
    userAgent,
    deviceType,
    location
  };
};

module.exports = {
  getSessionDetails
};
