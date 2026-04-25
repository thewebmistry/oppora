import { Server as SocketIOServer, Socket } from 'socket.io';

// Define types for chat message payload
interface ChatMessage {
  sender: string;
  message: string;
  timestamp?: Date;
}

/**
 * Setup Socket.IO event handlers for chat
 * @param io - Socket.IO server instance
 */
export const setupSocketHandlers = (io: SocketIOServer): void => {
  console.log('🔌 Socket.IO chat handlers initialized');

  io.on('connection', (socket: Socket) => {
    console.log(`✅ New client connected: ${socket.id}`);
    
    // Join a default room (global chat)
    socket.join('global');

    // Listen for chat messages
    socket.on('chatMessage', (data: ChatMessage) => {
      console.log(`💬 Chat message from ${data.sender}: ${data.message}`);
      
      // Add timestamp
      const messageWithTimestamp: ChatMessage = {
        ...data,
        timestamp: new Date(),
      };

      // Emit back to sender (acknowledgment)
      socket.emit('chatMessage', messageWithTimestamp);
      
      // Broadcast to everyone else in the global room
      socket.to('global').emit('chatMessage', messageWithTimestamp);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Optional: Send welcome message to new connection
    socket.emit('welcome', {
      message: 'Welcome to the real-time chat!',
      socketId: socket.id,
      timestamp: new Date(),
    });
  });
};

// Socket.IO Real-time Engine for live chat