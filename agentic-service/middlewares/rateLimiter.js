import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../configs/redis.js';

export const negotiationRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 reqs/min
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please wait a moment before sending another message.'
  },
  skip: (req) => req.body?.close === true || req.body?.confirm === true
});