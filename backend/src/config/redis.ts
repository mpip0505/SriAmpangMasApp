import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis error:', err);
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

// Helper functions
export const setCache = async (key: string, value: any, expirySeconds?: number) => {
  try {
    const serialized = JSON.stringify(value);
    if (expirySeconds) {
      await redisClient.setEx(key, expirySeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
  } catch (error) {
    console.error('Redis set error:', error);
    throw error;
  }
};

export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export const clearCachePattern = async (pattern: string) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis clear pattern error:', error);
  }
};

export default redisClient;