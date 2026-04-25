'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import Card from '@/components/ui/Card';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  online: boolean;
  unread?: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

const mockUsers: ChatUser[] = [
  { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', lastMsg: 'Hey, how are you?', online: true, unread: 2 },
  { id: '2', name: 'Alice Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', lastMsg: 'Meeting at 3 PM', online: true },
  { id: '3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', lastMsg: 'Thanks for the help!', online: false, unread: 1 },
  { id: '4', name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', lastMsg: 'See you tomorrow', online: true },
  { id: '5', name: 'Diana Prince', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', lastMsg: 'Check this out', online: false },
  { id: '6', name: 'Ethan Hunt', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan', lastMsg: 'Mission accomplished', online: true },
];

const mockMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: '1', sender: 'John Doe', senderId: '1', message: 'Hello there!', timestamp: new Date(Date.now() - 3600000), isOwn: false },
    { id: '2', sender: 'You', senderId: 'me', message: 'Hi John! How are you?', timestamp: new Date(Date.now() - 1800000), isOwn: true },
    { id: '3', sender: 'John Doe', senderId: '1', message: 'I\'m good, thanks! Working on the project.', timestamp: new Date(Date.now() - 1200000), isOwn: false },
    { id: '4', sender: 'You', senderId: 'me', message: 'Great! Let me know if you need help.', timestamp: new Date(Date.now() - 600000), isOwn: true },
  ],
  '2': [
    { id: '5', sender: 'Alice Smith', senderId: '2', message: 'Meeting at 3 PM tomorrow', timestamp: new Date(Date.now() - 86400000), isOwn: false },
    { id: '6', sender: 'You', senderId: 'me', message: 'Got it, will be there.', timestamp: new Date(Date.now() - 43200000), isOwn: true },
  ],
  '3': [
    { id: '7', sender: 'Bob Johnson', senderId: '3', message: 'Thanks for the help with the code!', timestamp: new Date(Date.now() - 172800000), isOwn: false },
  ],
};

export default function ChatPage() {
  const { socket, sendMessage, onMessage } = useSocket();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showChat, setShowChat] = useState(false); // For mobile toggle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedUser = mockUsers.find(user => user.id === selectedUserId);

  // Load mock messages when user is selected
  useEffect(() => {
    if (selectedUserId) {
      const userMessages = mockMessages[selectedUserId] || [];
      setMessages(userMessages);
    } else {
      setMessages([]);
    }
  }, [selectedUserId]);

  // Socket integration: listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const cleanup = onMessage('chatMessage', (data: { sender: string; message: string; senderId: string }) => {
      // If the message is for the currently selected user
      if (selectedUserId && data.senderId === selectedUserId) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: data.sender,
          senderId: data.senderId,
          message: data.message,
          timestamp: new Date(),
          isOwn: false,
        };
        setMessages(prev => [...prev, newMessage]);
      }
      // TODO: Update lastMsg in mockUsers and show notification
    });

    return cleanup;
  }, [socket, onMessage, selectedUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedUserId || !socket) return;

    // Send via socket
    sendMessage('chatMessage', {
      sender: 'You',
      senderId: 'me',
      message: inputText,
      recipientId: selectedUserId,
    });

    // Optimistic update
    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: 'You',
      senderId: 'me',
      message: inputText,
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Update lastMsg in mockUsers (simulated)
    // In a real app, you would update via state
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowChat(true); // On mobile, show chat view
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  // Determine if we're on mobile (for conditional logic)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <div className="md:hidden flex items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        {showChat ? (
          <>
            <button
              onClick={handleBackToList}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Back to conversations"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-500 mr-3 flex items-center justify-center text-white font-semibold">
                {selectedUser?.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold">{selectedUser?.name || 'Chat'}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedUser?.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold flex-1">Messages</h1>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile when chat is shown */}
        <div className={`
          ${showChat ? 'hidden' : 'flex'}
          md:flex flex-col w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700 bg-white dark:bg-gray-800
        `}>
          <div className="p-4 border-b dark:border-gray-700">
            <h1 className="text-2xl font-bold hidden md:block">Messages</h1>
            <div className="mt-4">
              <InputField
                placeholder="Search conversations..."
                value=""
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">Online Now</h3>
              {mockUsers.filter(u => u.online).map(user => (
                <div
                  key={user.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedUserId === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-lg">{user.name.charAt(0)}</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{user.name}</h4>
                      {user.unread && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                          {user.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.lastMsg}</p>
                  </div>
                </div>
              ))}

              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 mt-4 mb-2">All Conversations</h3>
              {mockUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedUserId === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-lg">{user.name.charAt(0)}</span>
                    </div>
                    {user.online ? (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    ) : (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{user.name}</h4>
                      {user.unread && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                          {user.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.lastMsg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`
          ${showChat ? 'flex' : 'hidden'}
          md:flex flex-col flex-1 bg-white dark:bg-gray-800
        `}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b dark:border-gray-700 flex items-center">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-500 mr-3 flex items-center justify-center text-white">
                    {selectedUser?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{selectedUser?.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedUser?.online ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  ⋮
                </Button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} items-end`}
                  >
                    {!msg.isOwn && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 flex-shrink-0 flex items-center justify-center text-sm">
                        {msg.sender.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 ${msg.isOwn
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
                        }`}
                    >
                      {!msg.isOwn && (
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {msg.sender}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className={`text-xs mt-2 ${msg.isOwn ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.isOwn && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 ml-2 flex-shrink-0 flex items-center justify-center text-sm text-blue-600 dark:text-blue-300">
                        You
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex items-center">
                  <InputField
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={setInputText}
                    onKeyDown={handleKeyPress}
                    className="flex-1 mr-2"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputText.trim()}>
                    Send
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            // Welcome screen when no user selected (desktop)
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-6">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Oppora Chat</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Select a conversation from the sidebar to start chatting. Your messages are synced in real-time across all devices.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
                <Card className="p-4">
                  <h4 className="font-semibold">Real-time</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Messages delivered instantly via Socket.IO</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold">Secure</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">End-to-end encryption coming soon</p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}