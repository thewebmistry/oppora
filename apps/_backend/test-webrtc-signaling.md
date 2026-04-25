# WebRTC Signaling Test Documentation

## Overview
The WebRTC signaling backend has been implemented with the following features:

### 1. WebRTC Signal Handlers (`src/utils/webrtcHandlers.ts`)
- **Event: 'register_user'** - Associates a socket with a user ID
- **Event: 'start_call'** - Initiates a call to another user (verifies if target exists)
- **Event: 'offer'** - Forwards WebRTC offer SDP to target user
- **Event: 'answer'** - Forwards WebRTC answer SDP back to caller
- **Event: 'ice_candidate'** - Forwards ICE candidates to help with NAT traversal
- **Event: 'end_call'** - Notifies the other party that call has ended

### 2. Updated Server (`src/server.ts`)
- Imports both `setupSocketHandlers` (chat) and `setupWebRTCHandlers` (WebRTC)
- Initializes both handlers alongside each other

### 3. Error Handling
- **Non-existent users**: When trying to call a user who is not registered/offline, the caller receives a `call_error` event with message "User is offline or does not exist"
- **Unregistered callers**: Users must send `register_user` before making calls, otherwise they receive an error
- **Missing parameters**: All required parameters are validated

## Event Flow Example

### Step 1: User Registration
```javascript
// Both users must register first
socket.emit('register_user', { userId: 'user123' });
// Server responds with 'user_registered' event
```

### Step 2: Initiating a Call
```javascript
// User A calls User B
socketA.emit('start_call', { targetUserId: 'user456' });

// If User B is online:
// - User A receives 'call_initiated' event
// - User B receives 'incoming_call' event

// If User B is offline:
// - User A receives 'call_error' event with error message
```

### Step 3: WebRTC Signaling Exchange
```javascript
// User A creates offer and sends to User B
socketA.emit('offer', { 
  targetUserId: 'user456', 
  offerSdp: offer 
});
// User B receives 'incoming_offer' event

// User B creates answer and sends back to User A
socketB.emit('answer', { 
  callerId: 'user123', 
  answerSdp: answer 
});
// User A receives 'incoming_answer' event

// ICE candidates exchange
socketA.emit('ice_candidate', {
  targetUserId: 'user456',
  candidate: iceCandidate
});
// User B receives 'incoming_ice_candidate' event
```

### Step 4: Ending Call
```javascript
// Either user can end the call
socketA.emit('end_call', { targetUserId: 'user456' });
// Both parties receive 'call_ended' or 'call_ended_ack' events
```

## Room System
- Each user automatically joins a room called `call_{userId}` when they register
- This allows for targeted messaging and presence notifications
- When a user disconnects, others in their call room receive `user_offline` event

## Testing the Implementation

### Manual Test Steps:
1. Start the backend server (`npm run dev` in apps/backend)
2. Connect two WebSocket clients to `ws://localhost:5000`
3. Both clients send `register_user` with unique user IDs
4. Client A sends `start_call` to Client B's user ID
5. Verify Client B receives `incoming_call`
6. Test error cases:
   - Try calling a non-existent user ID
   - Try sending offer without registering first
   - Try sending offer to offline user

### Expected Error Responses:
- **Calling non-existent user**: `call_error` event with message "User is offline or does not exist"
- **Unregistered caller**: `error` event with message "Caller not registered. Send register_user first."
- **Missing targetUserId**: `error` event with message "Target user ID is required"

## Implementation Notes
- Uses in-memory user-to-socket mapping (for development)
- In production, consider using Redis for distributed scaling
- The chat system remains separate and unaffected
- All WebRTC events are properly typed in TypeScript
- Console logs provide debugging visibility