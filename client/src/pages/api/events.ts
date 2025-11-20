// pages/api/events.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';

// Initialize Redis connection - make sure you have Redis running
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send initial connection message
    res.write('data: ' + JSON.stringify({ type: 'CONNECTED', data: 'Connected to Redis SSE' }) + '\n\n');

    // Create a new Redis subscriber for this connection
    const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    try {
      await subscriber.subscribe('NEW_POST', 'POST_LIKED', 'POST_UPDATED');

      // Handle messages from Redis
      subscriber.on('message', (channel, message) => {
        try {
          const eventData = {
            type: channel,
            data: JSON.parse(message)
          };
          
          res.write('data: ' + JSON.stringify(eventData) + '\n\n');
        } catch (error) {
          console.error('Error parsing Redis message:', error);
        }
      });

      // Handle client disconnect
      req.on('close', () => {
        subscriber.unsubscribe();
        subscriber.quit();
        res.end();
      });

      // Keep the connection alive
      const keepAlive = setInterval(() => {
        res.write(': keep-alive\n\n');
      }, 30000);

      req.on('close', () => {
        clearInterval(keepAlive);
        subscriber.unsubscribe();
        subscriber.quit();
        res.end();
      });

    } catch (error) {
      console.error('Redis subscription error:', error);
      res.status(500).end();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}