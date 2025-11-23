import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, LogIn, Loader2 } from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import useRoom from '../hooks/useRoom';

export default function Home() {
  const navigate = useNavigate();
  const { setRoomId, setRoomName, setParticipantId } = useRoomStore();
  const { createRoom, joinRoom } = useRoom();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomNameInput.trim() || !participantName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await createRoom(roomNameInput, participantName) as any;

      setRoomId(response.roomId);
      setRoomName(roomNameInput);
      setParticipantId(response.participantId);

      navigate(`/room/${response.roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!roomIdInput.trim() || !participantName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await joinRoom(roomIdInput, participantName) as any;

      setRoomId(roomIdInput);
      setRoomName(roomIdInput);
      setParticipantId(response.participantId);

      navigate(`/room/${roomIdInput}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">GDSC Meet</h1>
          <p className="text-xl text-gray-400">
            Open-source video conferencing platform powered by WebRTC
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-colors ${
                activeTab === 'create'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create Room
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-colors ${
                activeTab === 'join'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn className="w-5 h-5 inline mr-2" />
              Join Room
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                {error}
              </div>
            )}

            {activeTab === 'create' ? (
              <form onSubmit={handleCreateRoom} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    placeholder="Enter room name"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Room
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinRoom} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    placeholder="Enter room ID"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Join Room
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Built with React, WebRTC, Socket.IO, and TypeScript
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span>✓ HD Video & Audio</span>
            <span>✓ Screen Sharing</span>
            <span>✓ Real-time Chat</span>
            <span>✓ End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
