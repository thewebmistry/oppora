import { TestChatUI } from '@/components/chat/TestChatUI';
import { SocketProvider } from '@/providers/SocketProvider';

export default function ChatTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Real‑Time Socket.IO Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            This page demonstrates real‑time bidirectional communication between the frontend and backend via Socket.IO.
            Use the interface below to send and receive live messages.
          </p>
        </header>

        <SocketProvider>
          <TestChatUI />
        </SocketProvider>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Frontend Hook</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Custom <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">useSocket</code> hook manages
              connection, automatic reconnection, and provides clean API for emitting/listening.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Backend Handlers</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Socket.IO server runs on port 5000, broadcasting messages to all connected clients.
              See <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">apps/backend/src/utils/socketHandlers.ts</code>.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Context Provider</h3>
            <p className="text-gray-600 dark:text-gray-300">
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">SocketProvider</code> makes the socket
              instance available anywhere in the component tree without prop drilling.
            </p>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            This is a development‑only page. In production, consider adding authentication, rate‑limiting, and proper error handling.
          </p>
        </footer>
      </div>
    </div>
  );
}