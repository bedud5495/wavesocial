// hooks/useRedisSync.ts
import { useEffect, useRef, useCallback } from 'react';

interface RedisMessage {
  type: 'NEW_POST' | 'POST_LIKED' | 'POST_UPDATED';
  data: any;
}

export const useRedisSync = (url: string, onMessage: (message: RedisMessage) => void) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    try {
      const eventSource = new EventSource(url);
      
      eventSource.onopen = () => {
        console.log('Redis SSE connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const message: RedisMessage = JSON.parse(event.data);
          onMessageRef.current(message);
        } catch (error) {
          console.error('Failed to parse Redis SSE message:', error);
        }
      };

      eventSource.addEventListener('NEW_POST', (event: MessageEvent) => {
        try {
          const message: RedisMessage = JSON.parse(event.data);
          onMessageRef.current(message);
        } catch (error) {
          console.error('Failed to parse NEW_POST message:', error);
        }
      });

      eventSource.addEventListener('POST_LIKED', (event: MessageEvent) => {
        try {
          const message: RedisMessage = JSON.parse(event.data);
          onMessageRef.current(message);
        } catch (error) {
          console.error('Failed to parse POST_LIKED message:', error);
        }
      });

      eventSource.addEventListener('POST_UPDATED', (event: MessageEvent) => {
        try {
          const message: RedisMessage = JSON.parse(event.data);
          onMessageRef.current(message);
        } catch (error) {
          console.error('Failed to parse POST_UPDATED message:', error);
        }
      });

      eventSource.onerror = (error) => {
        console.error('Redis SSE error:', error);
        eventSource.close();
        
        // Attempt reconnect after delay
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to establish Redis SSE connection:', error);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: connect,
    disconnect
  };
};

const { isConnected: isRedisConnected } = useRedisSync(
  '/api/events', // This calls your local Next.js API route
  (message) => {
    switch (message.type) {
      case 'NEW_POST':
        handleNewPostFromRedis(message.data);
        break;
      case 'POST_LIKED':
        handleLikeFromRedis(message.data);
        break;
      case 'POST_UPDATED':
        handlePostUpdateFromRedis(message.data);
        break;
    }
  }
);