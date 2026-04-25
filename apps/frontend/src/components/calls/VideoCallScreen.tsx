'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '@/providers/SocketProvider';
import { Button } from '@/components/ui';
import { PhoneOff, Mic, MicOff, Video, VideoOff, User } from 'lucide-react';

interface VideoCallScreenProps {
  calleeId: string;
  callerId: string;
  isInitiator?: boolean;
  onCallEnd?: () => void;
}

export default function VideoCallScreen({
  calleeId,
  callerId,
  isInitiator = false,
  onCallEnd,
}: VideoCallScreenProps) {
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State for media streams and connection
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [error, setError] = useState<string | null>(null);
  
  // Refs for WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socket = useSocketContext();
  
  // Initialize media stream
  useEffect(() => {
    const initMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        setLocalStream(stream);
        
        // Attach stream to local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Initialize peer connection after getting local stream
        initPeerConnection(stream);
        
        // If we're the initiator, create and send offer
        if (isInitiator) {
          setTimeout(() => {
            createAndSendOffer();
          }, 1000);
        }
        
        setCallStatus('connecting');
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Camera/microphone access denied. Please check permissions.');
        setCallStatus('failed');
      }
    };
    
    initMediaStream();
    
    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);
  
  // Initialize WebRTC peer connection
  const initPeerConnection = useCallback((stream: MediaStream) => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;
    
    // Add local tracks to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
    // Handle remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteStream(event.streams[0]);
        setCallStatus('connected');
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.sendMessage('ice_candidate', {
          targetUserId: calleeId,
          candidate: event.candidate,
        });
      }
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setCallStatus('failed');
        setError('Connection lost. Please try again.');
      }
    };
    
    // Set up socket listeners
    setupSocketListeners(pc);
  }, [calleeId, socket]);
  
  // Set up socket event listeners for WebRTC signaling
  const setupSocketListeners = useCallback((pc: RTCPeerConnection) => {
    // Listen for incoming offer
    socket.onMessage('incoming_offer', async (data: { offerSdp: RTCSessionDescriptionInit; fromUserId: string }) => {
      if (data.fromUserId !== calleeId) return;
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offerSdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.sendMessage('answer', {
          targetUserId: data.fromUserId,
          answerSdp: answer,
        });
      } catch (err) {
        console.error('Error handling incoming offer:', err);
        setError('Failed to handle incoming call.');
      }
    });
    
    // Listen for incoming answer
    socket.onMessage('incoming_answer', async (data: { answerSdp: RTCSessionDescriptionInit; fromUserId: string }) => {
      if (data.fromUserId !== calleeId) return;
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answerSdp));
      } catch (err) {
        console.error('Error setting remote description:', err);
      }
    });
    
    // Listen for ICE candidates
    socket.onMessage('ice_candidate', async (data: { candidate: RTCIceCandidateInit; fromUserId: string }) => {
      if (data.fromUserId !== calleeId) return;
      
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });
    
    // Listen for call ended
    socket.onMessage('call_ended', (data: { fromUserId: string }) => {
      if (data.fromUserId === calleeId) {
        handleEndCall();
      }
    });
  }, [calleeId, socket]);
  
  // Create and send offer
  const createAndSendOffer = async () => {
    if (!peerConnectionRef.current) return;
    
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      socket.sendMessage('offer', {
        targetUserId: calleeId,
        offerSdp: offer,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      setError('Failed to initiate call.');
    }
  };
  
  // Toggle mute/unmute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };
  
  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  // End call
  const handleEndCall = () => {
    // Send call ended event
    socket.sendMessage('call_ended', {
      targetUserId: calleeId,
    });
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Call onCallEnd callback if provided
    if (onCallEnd) {
      onCallEnd();
    }
  };
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Call Failed</h2>
          <p className="mb-6">{error}</p>
          <Button variant="danger" onClick={onCallEnd}>
            Return to Chat
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Remote video (full screen) */}
      <div className="absolute inset-0">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                <User size={64} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connecting to {calleeId}</h2>
              <p className="text-gray-300">
                {callStatus === 'connecting' ? 'Establishing connection...' : 'Waiting for response...'}
              </p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      
      {/* Local video preview (glassmorphism bubble) */}
      <div className="absolute top-6 right-6 w-48 h-64 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
            <div className="text-center">
              <User size={32} className="text-white mx-auto mb-2" />
              <p className="text-sm text-white">You</p>
            </div>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
            callStatus === 'connected' 
              ? 'bg-green-500/30 text-green-100 border border-green-500/50' 
              : 'bg-yellow-500/30 text-yellow-100 border border-yellow-500/50'
          }`}>
            {callStatus === 'connected' ? 'Connected' : 'Connecting...'}
          </div>
        </div>
      </div>
      
      {/* Call info header */}
      <div className="absolute top-6 left-6 backdrop-blur-xl bg-black/30 rounded-2xl p-4 border border-white/10">
        <h1 className="text-xl font-bold text-white">Video Call</h1>
        <p className="text-gray-300">With: <span className="font-medium">{calleeId}</span></p>
        <p className="text-sm text-gray-400 mt-1">
          {callStatus === 'connected' ? 'Secure connection established' : 'Establishing secure connection...'}
        </p>
      </div>
      
      {/* Call controls (bottom center) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${
            isMuted 
              ? 'bg-red-500/30 border border-red-500/50 hover:bg-red-500/40' 
              : 'bg-white/10 border border-white/20 hover:bg-white/20'
          }`}
        >
          {isMuted ? (
            <MicOff size={28} className="text-white" />
          ) : (
            <Mic size={28} className="text-white" />
          )}
        </button>
        
        {/* Video toggle */}
        <button
          onClick={toggleVideo}
          className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${
            isVideoOff 
              ? 'bg-red-500/30 border border-red-500/50 hover:bg-red-500/40' 
              : 'bg-white/10 border border-white/20 hover:bg-white/20'
          }`}
        >
          {isVideoOff ? (
            <VideoOff size={28} className="text-white" />
          ) : (
            <Video size={28} className="text-white" />
          )}
        </button>
        
        {/* End call button (large red) */}
        <button
          onClick={handleEndCall}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center shadow-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <PhoneOff size={32} className="text-white" />
        </button>
      </div>
      
      {/* Additional info footer */}
      <div className="absolute bottom-8 right-6 text-right">
        <p className="text-sm text-gray-400">Call duration: <span className="font-mono">00:00</span></p>
        <p className="text-xs text-gray-500 mt-1">Secure WebRTC connection</p>
      </div>
    </div>
  );
}