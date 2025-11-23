import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

interface WaitingParticipant {
  id: string;
  name: string;
  socketId: string;
  roomId: string;
  joinedAt: Date;
}

class WaitingRoomService {
  private waitingParticipants: Map<string, WaitingParticipant[]> = new Map();
  private enabledRooms: Set<string> = new Set();

  enableWaitingRoom(roomId: string): void {
    this.enabledRooms.add(roomId);
    if (!this.waitingParticipants.has(roomId)) {
      this.waitingParticipants.set(roomId, []);
    }
    logger.info(`Waiting room enabled for: ${roomId}`);
  }

  disableWaitingRoom(roomId: string): void {
    this.enabledRooms.delete(roomId);
    logger.info(`Waiting room disabled for: ${roomId}`);
  }

  isWaitingRoomEnabled(roomId: string): boolean {
    return this.enabledRooms.has(roomId);
  }

  addToWaitingRoom(
    roomId: string,
    participantName: string,
    socketId: string
  ): WaitingParticipant {
    const participant: WaitingParticipant = {
      id: uuidv4(),
      name: participantName,
      socketId,
      roomId,
      joinedAt: new Date(),
    };

    const waiting = this.waitingParticipants.get(roomId) || [];
    waiting.push(participant);
    this.waitingParticipants.set(roomId, waiting);

    logger.info(`Participant added to waiting room: ${participant.id} in ${roomId}`);
    return participant;
  }

  admitParticipant(roomId: string, participantId: string): WaitingParticipant | null {
    const waiting = this.waitingParticipants.get(roomId);
    if (!waiting) return null;

    const index = waiting.findIndex((p) => p.id === participantId);
    if (index === -1) return null;

    const [participant] = waiting.splice(index, 1);
    logger.info(`Participant admitted: ${participantId} from ${roomId}`);
    return participant;
  }

  rejectParticipant(roomId: string, participantId: string): boolean {
    const waiting = this.waitingParticipants.get(roomId);
    if (!waiting) return false;

    const index = waiting.findIndex((p) => p.id === participantId);
    if (index === -1) return false;

    waiting.splice(index, 1);
    logger.info(`Participant rejected: ${participantId} from ${roomId}`);
    return true;
  }

  getWaitingParticipants(roomId: string): WaitingParticipant[] {
    return this.waitingParticipants.get(roomId) || [];
  }

  removeParticipant(roomId: string, participantId: string): boolean {
    const waiting = this.waitingParticipants.get(roomId);
    if (!waiting) return false;

    const index = waiting.findIndex((p) => p.id === participantId);
    if (index === -1) return false;

    waiting.splice(index, 1);
    return true;
  }

  clearWaitingRoom(roomId: string): void {
    this.waitingParticipants.delete(roomId);
    this.enabledRooms.delete(roomId);
    logger.info(`Waiting room cleared for: ${roomId}`);
  }
}

export default WaitingRoomService;
