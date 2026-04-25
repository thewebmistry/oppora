# Video/Audio Call Interface

A premium video/audio call component built with WebRTC, React, and Socket.IO signaling.

## Features

- **Media Stream Setup**: Automatic camera and microphone access with `getUserMedia`
- **WebRTC Peer Connection**: Full WebRTC implementation with STUN servers
- **Socket.IO Signaling**: Real-time signaling for offer/answer exchange and ICE candidates
- **Premium UI**: Glassmorphism design with responsive layout
- **Call Controls**: Mute/unmute, video toggle, and end call buttons
- **Error Handling**: Graceful error handling for media permissions and connection issues
- **Status Indicators**: Visual feedback for connection status

## Component: `VideoCallScreen`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `calleeId` | `string` | **Required** | User ID of the person being called |
| `callerId` | `string` | **Required** | User ID of the caller (current user) |
| `isInitiator` | `boolean` | `false` | Whether this user initiated the call |
| `onCallEnd` | `() => void` | `undefined` | Callback when call ends |

### Usage Example

```tsx
import { VideoCallScreen } from '@/components/calls';
import { SocketProvider } from '@/providers/SocketProvider';

function CallPage() {
  return (
    <SocketProvider>
      <VideoCallScreen
        calleeId="user123"
        callerId="currentUser"
        isInitiator={true}
        onCallEnd={() => router.push('/chat')}
      />
    </SocketProvider>
  );
}
```

## WebRTC Implementation Details

### Media Stream Setup
- Uses `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`
- Stores stream in React state and attaches to local video element
- Handles permission errors gracefully

### Peer Connection
- Creates `RTCPeerConnection` with Google STUN servers
- Adds local tracks to connection
- Sets up remote track handling for remote video
- Manages ICE candidate exchange

### Signaling Events
The component listens for these socket events:
- `incoming_offer`: Handle incoming call offer
- `incoming_answer`: Handle answer to your offer
- `ice_candidate`: Add remote ICE candidates
- `call_ended`: Handle remote party ending call

### UI Layout
- **Main View**: Remote user's video feed (full screen)
- **Self View**: Local user's video preview (top-right corner)
- **Controls**: Bottom-center controls with mute, video toggle, and end call
- **Status**: Connection status badge (top-left of self view)

## Styling
- Uses Tailwind CSS with glassmorphism effects
- Responsive design for all screen sizes
- Dark theme with gradient backgrounds
- Smooth animations and transitions

## Testing
A test page is available at `/video-call-test` that demonstrates:
- Starting a call as initiator
- Simulating incoming calls
- Testing all controls and features

## Dependencies
- `react`: Core React library
- `socket.io-client`: WebSocket communication
- `lucide-react`: Icons for controls
- `@/providers/SocketProvider`: Socket context provider
- `@/components/ui/Button`: Button component

## Browser Support
- Modern browsers with WebRTC support (Chrome, Firefox, Safari, Edge)
- HTTPS required for `getUserMedia` in production
- Camera and microphone permissions required

## Integration Notes
1. Wrap component with `SocketProvider` for socket functionality
2. Ensure signaling backend is running (handles offer/answer/ICE)
3. Call `onCallEnd` to handle navigation after call ends
4. Provide proper user IDs for `calleeId` and `callerId`