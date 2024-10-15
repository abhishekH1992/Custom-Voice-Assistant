const { Redis } = require('@upstash/redis');

let redis;

if (process.env.NODE_ENV === 'production') {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });
} else {
  redis = new Redis();
}

module.exports = redis;