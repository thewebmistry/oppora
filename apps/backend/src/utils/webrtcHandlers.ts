import { Server as SocketIOServer, Socket } from 'socket.io';

// In-memory store for mapping user IDs to socket IDs
// In a production app, you'd want to use Redis or a database for this
const userSocketMap = new Map<string, string>();

// Helper to get socket ID for a user
export const getSocketIdForUser = (userId: string): string | null => {
  return userSocketMap.get(userId) || null;
};

// Helper to register a user's socket
export const registerUserSocket = (userId: string, socketId: string): void => {
  userSocketMap.set(userId, socketId);
  console.log(`📱 User ${userId} registered with socket ${socketId}`);
};

// Helper to remove a user's socket
export const unregisterUserSocket = (userId: string): void => {
  userSocketMap.delete(userId);
  console.log(`📱 User ${userId} unregistered`);
};

// Helper to find user ID by socket ID (reverse lookup)
export const findUserIdBySocketId = (socketId: string): string | null => {
  for (const [userId, sockId] of userSocketMap.entries()) {
    if (sockId === socketId) return userId;
  }
  return null;
};

/**
 * Setup WebRTC signaling event handlers on a socket instance
 * This should be called from within a socket connection handler
 * @param io - Socket.IO server instance (for emitting to other sockets)
 * @param socket - The socket instance to attach handlers to
 */
export const setupWebRTCOnSocket = (io: SocketIOServer, socket: Socket): void => {
  console.log(`🎥 WebRTC handlers attached to socket: ${socket.id}`);

  // Event: 'start_call' - Initiate a call to another user
  socket.on('start_call', (data: { targetUserId: string }) => {
    const { targetUserId } = data;
    const callerId = findUserIdBySocketId(socket.id);
    
    if (!callerId) {
      socket.emit('error', { message: 'Caller not registered. Send register_user first.' });
      return;
    }

    if (!targetUserId) {
      socket.emit('error', { message: 'Target user ID is required' });
      return;
    }

    const targetSocketId = getSocketIdForUser(targetUserId);
    
    if (!targetSocketId) {
      socket.emit('call_error', { 
        message: 'User is offline or does not exist',
        targetUserId 
      });
      return;
    }

    console.log(`📞 Call initiated: ${callerId} → ${targetUserId}`);
    
    // Notify the target user
    io.to(targetSocketId).emit('incoming_call', {
      callerId,
      callerSocketId: socket.id,
      timestamp: new Date().toISOString()
    });

    // Acknowledge to caller
    socket.emit('call_initiated', {
      targetUserId,
      targetSocketId,
      timestamp: new Date().toISOString()
    });
  });

  // Event: 'offer' - Send WebRTC offer SDP to target user
  socket.on('offer', (data: { targetUserId: string, offerSdp: any }) => {
    const { targetUserId, offerSdp } = data;
    const callerId = findUserIdBySocketId(socket.id);
    
    if (!callerId) {
      socket.emit('error', { message: 'Caller not registered' });
      return;
    }

    const targetSocketId = getSocketIdForUser(targetUserId);
    
    if (!targetSocketId) {
      socket.emit('error', { 
        message: 'Target user is offline',
        targetUserId 
      });
      return;
    }

    console.log(`📨 Offer from ${callerId} to ${targetUserId}`);
    
    // Forward offer to target user
    io.to(targetSocketId).emit('incoming_offer', {
      callerId,
      offerSdp,
      callerSocketId: socket.id
    });
  });

  // Event: 'answer' - Send WebRTC answer SDP back to caller
  socket.on('answer', (data: { callerId: string, answerSdp: any }) => {
    const { callerId, answerSdp } = data;
    const answererId = findUserIdBySocketId(socket.id);
    
    if (!answererId) {
      socket.emit('error', { message: 'Answerer not registered' });
      return;
    }

    const callerSocketId = getSocketIdForUser(callerId);
    
    if (!callerSocketId) {
      socket.emit('error', { 
        message: 'Caller is no longer online',
        callerId 
      });
      return;
    }

    console.log(`📨 Answer from ${answererId} to ${callerId}`);
    
    // Forward answer to caller
    io.to(callerSocketId).emit('incoming_answer', {
      answererId,
      answerSdp,
      answererSocketId: socket.id
    });
  });

  // Event: 'ice_candidate' - Forward ICE candidate to target user
  socket.on('ice_candidate', (data: { targetUserId: string, candidate: any }) => {
    const { targetUserId, candidate } = data;
    const senderId = findUserIdBySocketId(socket.id);
    
    if (!senderId) {
      socket.emit('error', { message: 'Sender not registered' });
      return;
    }

    const targetSocketId = getSocketIdForUser(targetUserId);
    
    if (!targetSocketId) {
      socket.emit('error', { 
        message: 'Target user is offline',
        targetUserId 
      });
      return;
    }

    console.log(`🧊 ICE candidate from ${senderId} to ${targetUserId}`);
    
    // Forward ICE candidate to target user
    io.to(targetSocketId).emit('incoming_ice_candidate', {
      senderId,
      candidate,
      senderSocketId: socket.id
    });
  });

  // Event: 'end_call' - Notify the other party that call has ended
  socket.on('end_call', (data: { targetUserId: string }) => {
    const { targetUserId } = data;
    const callerId = findUserIdBySocketId(socket.id);
    
    if (!callerId) return;

    const targetSocketId = getSocketIdForUser(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call_ended', {
        endedBy: callerId,
        timestamp: new Date().toISOString()
      });
    }

    socket.emit('call_ended_ack', {
      targetUserId,
      timestamp: new Date().toISOString()
    });
  });

  // Join user-specific call room if user is registered
  const userId = findUserIdBySocketId(socket.id);
  if (userId) {
    socket.join(`call_${userId}`);
    console.log(`🚪 User ${userId} joined call room: call_${userId}`);
  }
};

/**
 * Legacy function for backward compatibility
 * Sets up WebRTC handlers with its own connection handler
 * @deprecated Use setupWebRTCOnSocket instead
 */
export const setupWebRTCHandlers = (io: SocketIOServer): void => {
  console.log('🎥 WebRTC signaling handlers initialized (legacy mode)');

  io.on('connection', (socket: Socket) => {
    console.log(`✅ New WebRTC client connected: ${socket.id}`);

    // Event: 'register_user' - Associate socket with a user ID
    socket.on('register_user', (data: { userId: string }) => {
      const { userId } = data;
      if (!userId) {
        socket.emit('error', { message: 'User ID is required' });
        return;
      }
      registerUserSocket(userId, socket.id);
      socket.emit('user_registered', { success: true, userId });
      
      // Join a user-specific room for call signaling
      socket.join(`call_${userId}`);
      console.log(`🚪 User ${userId} joined call room: call_${userId}`);
    });

    // Setup WebRTC handlers
    setupWebRTCOnSocket(io, socket);

    // Handle disconnection - clean up user mapping
    socket.on('disconnect', () => {
      const userId = findUserIdBySocketId(socket.id);
      if (userId) {
        unregisterUserSocket(userId);
        
        // Notify others in the user's call room
        socket.to(`call_${userId}`).emit('user_offline', {
          userId,
          timestamp: new Date().toISOString()
        });
      }
      console.log(`❌ WebRTC client disconnected: ${socket.id}`);
    });

    // Optional: Send welcome message
    socket.emit('webrtc_welcome', {
      message: 'WebRTC signaling server ready',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });
};

// Export helper functions for testing or other modules
export const webrtcHelpers = {
  getSocketIdForUser,
  registerUserSocket,
  unregisterUserSocket,
  findUserIdBySocketId,
  getUserCount: () => userSocketMap.size
};