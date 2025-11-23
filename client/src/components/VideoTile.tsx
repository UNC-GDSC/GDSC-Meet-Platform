import { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import { Participant } from '../types';

interface VideoTileProps {
  participant: Participant;
  isLocal?: boolean;
}

export default function VideoTile({ participant, isLocal = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  useEffect(() => {
    if (videoRef.current && participant.screenStream) {
      videoRef.current.srcObject = participant.screenStream;
    }
  }, [participant.screenStream]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${
          !participant.isVideoEnabled && !participant.isScreenSharing ? 'hidden' : ''
        }`}
      />

      {!participant.isVideoEnabled && !participant.isScreenSharing && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {participant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate">
            {participant.name} {isLocal && '(You)'}
          </span>

          <div className="flex items-center gap-2">
            {participant.isScreenSharing && (
              <div className="bg-primary-500 p-1 rounded">
                <Monitor className="w-4 h-4 text-white" />
              </div>
            )}

            {!participant.isAudioEnabled ? (
              <div className="bg-red-500 p-1 rounded">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="bg-green-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <Mic className="w-4 h-4 text-white" />
              </div>
            )}

            {!participant.isVideoEnabled && !participant.isScreenSharing && (
              <div className="bg-red-500 p-1 rounded">
                <VideoOff className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
