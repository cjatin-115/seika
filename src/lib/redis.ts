import Redis from 'redis';

// Use localhost Redis for development, or a valid REDIS_URL from env
const redisUrl = process.env.REDIS_URL && !process.env.REDIS_URL.includes('default:password') 
  ? process.env.REDIS_URL 
  : 'redis://localhost:6379';

const globalForRedis = (global as any) as { redis: ReturnType<typeof Redis.createClient> | null };

let redis = globalForRedis.redis;

if (!redis) {
  try {
    redis = Redis.createClient({
      url: redisUrl,
    });

    redis.on('error', (err) => console.error('Redis error:', err));
    redis.on('connect', () => console.log('Redis connected'));
  } catch (err) {
    console.error('Failed to create Redis client:', err);
  }
}

export const getRedis = async () => {
  if (!redis) {
    throw new Error('Redis client not initialized');
  }
  try {
    if (!redis?.isOpen) {
      await redis?.connect();
    }
    return redis;
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    throw err;
  }
};

export default redis;
