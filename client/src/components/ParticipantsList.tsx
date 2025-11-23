import { Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';

export default function ParticipantsList() {
  const { participants, participantId } = useRoomStore();

  const participantArray = Array.from(participants.values());

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3">
        Participants ({participantArray.length + 1})
      </h3>

      <div className="space-y-2">
        <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">Y</span>
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">You</div>
          </div>
          <div className="flex items-center gap-1">
            <Mic className="w-4 h-4 text-green-400" />
            <Video className="w-4 h-4 text-green-400" />
          </div>
        </div>

        {participantArray.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">
                {participant.name}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {participant.isScreenSharing && (
                <Monitor className="w-4 h-4 text-primary-400" />
              )}
              {participant.isAudioEnabled ? (
                <Mic className="w-4 h-4 text-green-400" />
              ) : (
                <MicOff className="w-4 h-4 text-red-400" />
              )}
              {participant.isVideoEnabled ? (
                <Video className="w-4 h-4 text-green-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
