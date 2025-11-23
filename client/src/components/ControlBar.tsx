import { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  PhoneOff,
  Copy,
  Check,
} from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import socketService from '../services/socket';
import webrtcService from '../services/webrtc';

interface ControlBarProps {
  onLeave: () => void;
}

export default function ControlBar({ onLeave }: ControlBarProps) {
  const {
    roomId,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleChat,
    setScreenSharing,
    setLocalScreenStream,
  } = useRoomStore();

  const [copied, setCopied] = useState(false);

  const handleToggleAudio = () => {
    toggleAudio();
    socketService.emit('update-media-state', {
      roomId,
      isAudioEnabled: !isAudioEnabled,
    });
  };

  const handleToggleVideo = () => {
    toggleVideo();
    socketService.emit('update-media-state', {
      roomId,
      isVideoEnabled: !isVideoEnabled,
    });
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      await webrtcService.restoreVideoStream();
      setLocalScreenStream(null);
      setScreenSharing(false);
      socketService.emit('update-media-state', {
        roomId,
        isScreenSharing: false,
      });
    } else {
      try {
        const screenStream = await webrtcService.getScreenStream();
        await webrtcService.addScreenStream(screenStream);
        setLocalScreenStream(screenStream);
        setScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = async () => {
          await webrtcService.restoreVideoStream();
          setLocalScreenStream(null);
          setScreenSharing(false);
          socketService.emit('update-media-state', {
            roomId,
            isScreenSharing: false,
          });
        };

        socketService.emit('update-media-state', {
          roomId,
          isScreenSharing: true,
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRoomId}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Room ID
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleToggleScreenShare}
            className={`p-4 rounded-full transition-colors ${
              isScreenSharing
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-6 h-6" />
            ) : (
              <Monitor className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleChat}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Toggle Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button
            onClick={onLeave}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="Leave Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        <div className="w-32"></div>
      </div>
    </div>
  );
}
