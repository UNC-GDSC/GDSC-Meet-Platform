import { v4 as uuidv4 } from 'uuid';
import { Room, Participant } from '../types';
import logger from '../utils/logger';

class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private participantToRoom: Map<string, string> = new Map();
  private maxParticipantsPerRoom: number;

  constructor(maxParticipantsPerRoom: number = 50) {
    this.maxParticipantsPerRoom = maxParticipantsPerRoom;
  }

  createRoom(roomName: string, creatorId: string, creatorName: string, socketId: string): Room {
    const roomId = uuidv4();

    const creator: Participant = {
      id: creatorId,
      socketId,
      name: creatorName,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      joinedAt: new Date(),
    };

    const room: Room = {
      id: roomId,
      name: roomName,
      participants: new Map([[creatorId, creator]]),
      createdAt: new Date(),
      createdBy: creatorId,
    };

    this.rooms.set(roomId, room);
    this.participantToRoom.set(creatorId, roomId);

    logger.info(`Room created: ${roomId} by ${creatorName}`);
    return room;
  }

  joinRoom(
    roomId: string,
    participantId: string,
    participantName: string,
    socketId: string
  ): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.participants.size >= this.maxParticipantsPerRoom) {
      return { success: false, error: 'Room is full' };
    }

    const participant: Participant = {
      id: participantId,
      socketId,
      name: participantName,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      joinedAt: new Date(),
    };

    room.participants.set(participantId, participant);
    this.participantToRoom.set(participantId, roomId);

    logger.info(`Participant ${participantName} joined room ${roomId}`);
    return { success: true, room };
  }

  leaveRoom(participantId: string): { roomId?: string; room?: Room } {
    const roomId = this.participantToRoom.get(participantId);

    if (!roomId) {
      return {};
    }

    const room = this.rooms.get(roomId);

    if (room) {
      room.participants.delete(participantId);

      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
        logger.info(`Room ${roomId} deleted (empty)`);
      } else {
        logger.info(`Participant ${participantId} left room ${roomId}`);
      }
    }

    this.participantToRoom.delete(participantId);
    return { roomId, room };
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByParticipant(participantId: string): Room | undefined {
    const roomId = this.participantToRoom.get(participantId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  updateParticipantMedia(
    participantId: string,
    updates: {
      isAudioEnabled?: boolean;
      isVideoEnabled?: boolean;
      isScreenSharing?: boolean;
    }
  ): boolean {
    const room = this.getRoomByParticipant(participantId);

    if (!room) {
      return false;
    }

    const participant = room.participants.get(participantId);

    if (!participant) {
      return false;
    }

    if (updates.isAudioEnabled !== undefined) {
      participant.isAudioEnabled = updates.isAudioEnabled;
    }
    if (updates.isVideoEnabled !== undefined) {
      participant.isVideoEnabled = updates.isVideoEnabled;
    }
    if (updates.isScreenSharing !== undefined) {
      participant.isScreenSharing = updates.isScreenSharing;
    }

    return true;
  }

  updateParticipantSocketId(participantId: string, socketId: string): boolean {
    const room = this.getRoomByParticipant(participantId);

    if (!room) {
      return false;
    }

    const participant = room.participants.get(participantId);

    if (!participant) {
      return false;
    }

    participant.socketId = socketId;
    return true;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomStats(roomId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    return {
      id: room.id,
      name: room.name,
      participantCount: room.participants.size,
      createdAt: room.createdAt,
    };
  }
}

export default RoomManager;
