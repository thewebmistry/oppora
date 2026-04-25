'use client';

import { useState } from 'react';
import VideoCallScreen from '@/components/calls/VideoCallScreen';
import { SocketProvider } from '@/providers/SocketProvider';

export default function VideoCallTestPage() {
  const [isInCall, setIsInCall] = useState(false);
  const [calleeId, setCalleeId] = useState('user123');
  const [callerId, setCallerId] = useState('currentUser');

  const startCall = () => {
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Video/Audio Call Interface Test</h1>
        <p className="text-gray-400 mb-8">
          Test the premium video call interface with WebRTC and socket signaling
        </p>

        {!isInCall ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Start a Test Call</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium mb-2">Caller ID (You)</label>
                <input
                  type="text"
                  value={callerId}
                  onChange={(e) => setCallerId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your user ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Callee ID (Other User)</label>
                <input
                  type="text"
                  value={calleeId}
                  onChange={(e) => setCalleeId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recipient user ID"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={startCall}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Start Video Call (Initiator)
              </button>
              
              <button
                onClick={() => {
                  setCalleeId('user456');
                  startCall();
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300"
              >
                Simulate Incoming Call
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold mb-4">Features Implemented</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Camera & Microphone access with getUserMedia</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>WebRTC Peer Connection with STUN servers</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Socket.IO signaling for offer/answer/ICE</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Premium UI with glassmorphism effects</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Mute/Unmute and Video toggle controls</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Call status indicators and error handling</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <SocketProvider>
            <div className="relative">
              <VideoCallScreen
                calleeId={calleeId}
                callerId={callerId}
                isInitiator={true}
                onCallEnd={endCall}
              />
              
              <button
                onClick={endCall}
                className="absolute top-4 right-4 z-50 px-6 py-3 bg-red-600/80 backdrop-blur-md rounded-xl font-bold hover:bg-red-700 transition-all duration-300"
              >
                Exit Test
              </button>
            </div>
          </SocketProvider>
        )}

        <div className="mt-8 text-sm text-gray-500">
          <p>
            <strong>Note:</strong> This is a frontend test interface. For a full call to work, 
            you need the signaling backend running and both users connected via sockets.
          </p>
          <p className="mt-2">
            The component handles media stream setup, WebRTC peer connection, and socket signaling 
            for offer/answer exchange and ICE candidates.
          </p>
        </div>
      </div>
    </div>
  );
}