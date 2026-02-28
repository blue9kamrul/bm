import redisClient from "../configs/redis.js";

const NEGOTIATION_KEY_PREFIX = "neg:";
const DEFAULT_TTL = 60 * 15;

export const saveNegotiationState = async (userId, productId, state, ttl = DEFAULT_TTL) => {
  const key = `${NEGOTIATION_KEY_PREFIX}${userId}:${productId}`;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(state));
  } catch (error) {
    console.error('Redis save error:', error);
    throw new Error('Failed to save negotiation state');
  }
};

export const getNegotiationState = async (userId, productId) => {
  const key = `${NEGOTIATION_KEY_PREFIX}${userId}:${productId}`;
  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const clearNegotiationState = async (userId, productId) => {
  const key = `${NEGOTIATION_KEY_PREFIX}${userId}:${productId}`;
  try {
    const result = await redisClient.del(key);
    return result > 0;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};