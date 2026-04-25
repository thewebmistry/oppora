import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  sendMessage: (eventType: string, data: any) => void;
  onMessage: (eventType: string, callback: (data: any) => void) => () => void;
  disconnect: () => void;
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:5000';

/**
 * Custom React hook for managing Socket.IO connection.
 * Provides socket instance, sendMessage, onMessage, and disconnect functions.
 * Automatically connects on mount and disconnects on unmount.
 */
export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, ((data: any) => void)[]>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      console.log('Socket.IO connecting to:', SOCKET_SERVER_URL);

      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected:', socketRef.current?.id);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        // Remove all custom listeners
        listenersRef.current.forEach((callbacks, eventType) => {
          callbacks.forEach(callback => {
            socketRef.current?.off(eventType, callback);
          });
        });
        listenersRef.current.clear();
        // Disconnect socket
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log('Socket.IO cleaned up');
      }
    };
  }, []);

  /**
   * Send a message to the server via socket.emit
   */
  const sendMessage = useCallback((eventType: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventType, data);
    } else {
      console.warn('Socket not connected, cannot send:', eventType);
    }
  }, []);

  /**
   * Register a listener for a specific event type.
   * Returns a cleanup function to remove the listener.
   */
  const onMessage = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!socketRef.current) {
      // Return a no-op cleanup if socket not yet initialized
      return () => {};
    }

    socketRef.current.on(eventType, callback);

    // Track listener for cleanup
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, []);
    }
    listenersRef.current.get(eventType)?.push(callback);

    // Return removal function
    return () => {
      socketRef.current?.off(eventType, callback);
      const callbacks = listenersRef.current.get(eventType) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        listenersRef.current.set(eventType, callbacks);
      }
    };
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    onMessage,
    disconnect,
  };
};