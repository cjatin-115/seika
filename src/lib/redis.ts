import Redis from 'redis';

// Use localhost Redis for development, or a valid REDIS_URL from env
const redisUrl = process.env.REDIS_URL && !process.env.REDIS_URL.includes('default:password') 
  ? process.env.REDIS_URL 
  : 'redis://localhost:6379';

const globalForRedis = (global as any) as { redis: ReturnType<typeof Redis.createClient> | null };

let redis = globalForRedis.redis;
let connectPromise: Promise<void> | null = null;
let lastConnectFailureAt = 0;
let lastConnectFailureMessage = '';
const CONNECT_TIMEOUT_MS = 300;
const FAILURE_BACKOFF_MS = 10_000;

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
    const now = Date.now();
    if (!redis.isOpen) {
      // Avoid hanging requests when Redis is down (common in local dev).
      if (now - lastConnectFailureAt < FAILURE_BACKOFF_MS) {
        throw new Error(
          lastConnectFailureMessage || 'Redis unavailable (recent connection failure)'
        );
      }

      if (!connectPromise) {
        connectPromise = Promise.race([
          redis.connect(),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Redis connect timed out')), CONNECT_TIMEOUT_MS)
          ),
        ])
          .then(() => {
            lastConnectFailureAt = 0;
            lastConnectFailureMessage = '';
          })
          .catch((err) => {
            lastConnectFailureAt = Date.now();
            lastConnectFailureMessage =
              err instanceof Error ? err.message : 'Redis connect failed';
            throw err;
          })
          .finally(() => {
            connectPromise = null;
          });
      }

      await connectPromise;
    }
    return redis;
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    throw err;
  }
};

export default redis;
