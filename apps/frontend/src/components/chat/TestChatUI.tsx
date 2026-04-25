'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '@/providers/SocketProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
}

/**
 * A test UI component to demonstrate real-time socket communication.
 * Displays received messages and allows sending broadcast messages.
 */
export const TestChatUI: React.FC = () => {
  const { sendMessage, onMessage, socket } = useSocketContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for incoming chat messages
  useEffect(() => {
    if (!socket) return;

    const cleanup = onMessage('chatMessage', (data: { sender: string; message: string }) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: data.sender,
        message: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    // Listen for connection status
    const handleConnect = () => {
      setConnectionStatus('connected');
      console.log('Socket connected');
    };
    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
      console.log('Socket disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setConnectionStatus('connected');
    }

    return () => {
      cleanup();
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, onMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    sendMessage('chatMessage', {
      sender: 'User',
      message: inputValue,
    });

    // Add local optimistic update
    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: 'You',
      message: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Real‑Time Chat Test</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>
            <Button variant="outline" size="sm" onClick={clearMessages}>
              Clear Messages
            </Button>
          </div>
        </div>

        {/* Messages Panel */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Send a message to see it appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === 'You'
                      ? 'ml-auto bg-blue-100 border border-blue-200'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-800">{msg.sender}</span>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700">{msg.message}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <InputField
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={setInputValue}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || connectionStatus !== 'connected'}
            className="px-6"
          >
            Broadcast Message
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600 border-t pt-4">
          <p className="font-medium mb-1">How this works:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Messages are sent via Socket.IO to the backend (port 5000).</li>
            <li>Any connected client will receive the message in real‑time.</li>
            <li>Open this page in multiple tabs/browsers to see broadcast.</li>
            <li>Check browser console for socket events and errors.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};