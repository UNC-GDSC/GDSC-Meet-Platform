import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import socketService from '../services/socket';

export default function Chat() {
  const { roomId, messages, isChatOpen, toggleChat, participantId } = useRoomStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && roomId) {
      socketService.emit('send-message', {
        roomId,
        message: message.trim(),
      });
      setMessage('');
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-white font-semibold">Chat</h2>
        <button
          onClick={toggleChat}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${
                msg.senderId === participantId ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[80%] ${
                  msg.senderId === participantId
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-white'
                } rounded-lg px-3 py-2`}
              >
                {msg.senderId !== participantId && (
                  <div className="text-xs text-gray-300 mb-1 font-medium">
                    {msg.senderName}
                  </div>
                )}
                <div className="text-sm break-words">{msg.message}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
