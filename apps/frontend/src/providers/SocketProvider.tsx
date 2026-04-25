'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface SocketContextType {
  socket: ReturnType<typeof useSocket>['socket'];
  sendMessage: (eventType: string, data: any) => void;
  onMessage: (eventType: string, callback: (data: any) => void) => () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Provider component that makes socket instance and methods available to any child component.
 * Wrap your application (or part of it) with this provider to enable real-time features.
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket, sendMessage, onMessage, disconnect } = useSocket();

  const value: SocketContextType = {
    socket,
    sendMessage,
    onMessage,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Custom hook to access the socket context.
 * Must be used within a SocketProvider.
 */
export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};