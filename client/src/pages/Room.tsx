import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import useRoom from '../hooks/useRoom';
import VideoGrid from '../components/VideoGrid';
import ControlBar from '../components/ControlBar';
import Chat from '../components/Chat';
import ParticipantsList from '../components/ParticipantsList';
import ConnectionQuality from '../components/ConnectionQuality';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const { initializeMedia, leaveRoom } = useRoom();
  const {
    roomName,
    participants,
    isChatOpen,
    participantId,
  } = useRoomStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await initializeMedia();
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize media:', err);
        setError('Failed to access camera/microphone. Please check permissions.');
        setLoading(false);
      }
    };

    initialize();

    return () => {
      leaveRoom();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Setting up your video call...</p>
          <p className="text-gray-400 text-sm mt-2">
            Please allow camera and microphone access
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={leaveRoom}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-semibold">
              {roomName || 'Meeting Room'}
            </h1>
            <p className="text-gray-400 text-sm">Room ID: {roomId}</p>
          </div>

          <div className="flex items-center gap-4">
            <ConnectionQuality />

            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>{participants.size + 1}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showParticipants && (
          <div className="w-80 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
            <ParticipantsList />
          </div>
        )}

        <div className="flex-1 flex">
          <div className="flex-1 overflow-auto">
            <VideoGrid />
          </div>

          <Chat />
        </div>
      </div>

      <ControlBar onLeave={leaveRoom} />
    </div>
  );
}
