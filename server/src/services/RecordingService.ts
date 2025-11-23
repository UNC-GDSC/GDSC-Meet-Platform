import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

interface Recording {
  id: string;
  roomId: string;
  startedAt: Date;
  stoppedAt?: Date;
  duration?: number;
  status: 'recording' | 'stopped' | 'processing' | 'completed' | 'failed';
  url?: string;
  size?: number;
}

class RecordingService {
  private recordings: Map<string, Recording> = new Map();
  private activeRecordings: Map<string, string> = new Map(); // roomId -> recordingId

  startRecording(roomId: string): Recording {
    if (this.activeRecordings.has(roomId)) {
      throw new Error('Recording already in progress for this room');
    }

    const recording: Recording = {
      id: uuidv4(),
      roomId,
      startedAt: new Date(),
      status: 'recording',
    };

    this.recordings.set(recording.id, recording);
    this.activeRecordings.set(roomId, recording.id);

    logger.info(`Recording started: ${recording.id} for room ${roomId}`);
    return recording;
  }

  stopRecording(roomId: string): Recording | null {
    const recordingId = this.activeRecordings.get(roomId);
    if (!recordingId) {
      return null;
    }

    const recording = this.recordings.get(recordingId);
    if (!recording) {
      return null;
    }

    recording.stoppedAt = new Date();
    recording.duration = recording.stoppedAt.getTime() - recording.startedAt.getTime();
    recording.status = 'processing';

    this.activeRecordings.delete(roomId);

    logger.info(`Recording stopped: ${recordingId} for room ${roomId}`);

    // Simulate processing
    setTimeout(() => {
      recording.status = 'completed';
      recording.url = `/recordings/${recording.id}.webm`;
      recording.size = Math.floor(Math.random() * 100000000); // Simulated size
    }, 5000);

    return recording;
  }

  getRecording(recordingId: string): Recording | undefined {
    return this.recordings.get(recordingId);
  }

  getRoomRecordings(roomId: string): Recording[] {
    return Array.from(this.recordings.values()).filter(
      (r) => r.roomId === roomId
    );
  }

  isRecording(roomId: string): boolean {
    return this.activeRecordings.has(roomId);
  }

  getActiveRecording(roomId: string): Recording | null {
    const recordingId = this.activeRecordings.get(roomId);
    if (!recordingId) return null;
    return this.recordings.get(recordingId) || null;
  }

  deleteRecording(recordingId: string): boolean {
    const recording = this.recordings.get(recordingId);
    if (!recording) return false;

    // Remove from active if still recording
    if (recording.status === 'recording') {
      this.activeRecordings.delete(recording.roomId);
    }

    this.recordings.delete(recordingId);
    logger.info(`Recording deleted: ${recordingId}`);
    return true;
  }
}

export default RecordingService;
