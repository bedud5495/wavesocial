// lib/redisPublisher.ts
import Redis from 'ioredis';

const redis = new Redis(redis://localhost:6379);

export class RedisPublisher {
  static async publishNewPost(post: any) {
    await redis.publish('NEW_POST', JSON.stringify(post));
  }

  static async publishPostLiked(data: { postId: bigint; likes: number; liked: boolean }) {
    await redis.publish('POST_LIKED', JSON.stringify(data));
  }

  static async publishPostUpdated(post: any) {
    await redis.publish('POST_UPDATED', JSON.stringify(post));
  }
}