import { useRoomStore } from '../store/useRoomStore';
import VideoTile from './VideoTile';

export default function VideoGrid() {
  const { participants, participantId, localStream, isVideoEnabled, isAudioEnabled } =
    useRoomStore();

  const participantArray = Array.from(participants.values());

  const gridCols =
    participantArray.length + 1 <= 2
      ? 'grid-cols-1 md:grid-cols-2'
      : participantArray.length + 1 <= 4
      ? 'grid-cols-2'
      : participantArray.length + 1 <= 6
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  const localParticipant = {
    id: participantId || 'local',
    socketId: 'local',
    name: 'You',
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing: false,
    stream: localStream || undefined,
  };

  return (
    <div className={`grid ${gridCols} gap-4 p-4 h-full`}>
      <VideoTile participant={localParticipant} isLocal />

      {participantArray.map((participant) => (
        <VideoTile key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
