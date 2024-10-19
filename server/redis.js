const Redis = require('ioredis');

let redis;

if (process.env.NODE_ENV === 'production') {
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis();
}

module.exports = redis;