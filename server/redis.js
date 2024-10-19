const Redis = require('ioredis');

let redis;

if (process.env.NODE_ENV === 'production') {
  redis = new Redis(process.env.REDIS_URL, {
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    }
  });
} else {
  redis = new Redis();
}

module.exports = redis;