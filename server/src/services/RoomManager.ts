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

  createRoom(
    roomName: string,
    creatorId: string,
    creatorName: string,
    socketId: string,
    options?: {
      waitingRoomEnabled?: boolean;
      hasPassword?: boolean;
      maxParticipants?: number;
    }
  ): Room {
    const roomId = uuidv4();

    const creator: Participant = {
      id: creatorId,
      socketId,
      name: creatorName,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      isHandRaised: false,
      role: 'host',
      joinedAt: new Date(),
    };

    const room: Room = {
      id: roomId,
      name: roomName,
      participants: new Map([[creatorId, creator]]),
      createdAt: new Date(),
      createdBy: creatorId,
      hostId: creatorId,
      isLocked: false,
      hasPassword: options?.hasPassword || false,
      waitingRoomEnabled: options?.waitingRoomEnabled || false,
      recordingEnabled: false,
      maxParticipants: options?.maxParticipants || this.maxParticipantsPerRoom,
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

    if (room.isLocked) {
      return { success: false, error: 'Room is locked' };
    }

    if (room.participants.size >= room.maxParticipants) {
      return { success: false, error: 'Room is full' };
    }

    const participant: Participant = {
      id: participantId,
      socketId,
      name: participantName,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      isHandRaised: false,
      role: 'participant',
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

      // If host leaves, assign new host
      if (room.hostId === participantId && room.participants.size > 0) {
        const newHost = Array.from(room.participants.values())[0];
        room.hostId = newHost.id;
        newHost.role = 'host';
        logger.info(`New host assigned: ${newHost.id} in room ${roomId}`);
      }

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
      isHandRaised?: boolean;
      reaction?: string;
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
    if (updates.isHandRaised !== undefined) {
      participant.isHandRaised = updates.isHandRaised;
    }
    if (updates.reaction !== undefined) {
      participant.reaction = updates.reaction;

      // Clear reaction after 5 seconds
      setTimeout(() => {
        participant.reaction = undefined;
      }, 5000);
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

  kickParticipant(roomId: string, participantId: string, hostId: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room || room.hostId !== hostId) {
      return false;
    }

    if (participantId === hostId) {
      return false; // Can't kick yourself
    }

    room.participants.delete(participantId);
    this.participantToRoom.delete(participantId);

    logger.info(`Participant ${participantId} kicked from room ${roomId}`);
    return true;
  }

  muteParticipant(roomId: string, participantId: string, hostId: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room || room.hostId !== hostId) {
      return false;
    }

    const participant = room.participants.get(participantId);
    if (!participant) {
      return false;
    }

    participant.isAudioEnabled = false;
    logger.info(`Participant ${participantId} muted in room ${roomId}`);
    return true;
  }

  muteAllParticipants(roomId: string, hostId: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room || room.hostId !== hostId) {
      return false;
    }

    room.participants.forEach((participant) => {
      if (participant.id !== hostId) {
        participant.isAudioEnabled = false;
      }
    });

    logger.info(`All participants muted in room ${roomId}`);
    return true;
  }

  lockRoom(roomId: string, hostId: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room || room.hostId !== hostId) {
      return false;
    }

    room.isLocked = true;
    logger.info(`Room ${roomId} locked`);
    return true;
  }

  unlockRoom(roomId: string, hostId: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room || room.hostId !== hostId) {
      return false;
    }

    room.isLocked = false;
    logger.info(`Room ${roomId} unlocked`);
    return true;
  }

  setRecordingStatus(roomId: string, status: boolean): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    room.recordingEnabled = status;
    return true;
  }

  isHost(roomId: string, participantId: string): boolean {
    const room = this.rooms.get(roomId);
    return room?.hostId === participantId;
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
      isLocked: room.isLocked,
      hasPassword: room.hasPassword,
      recordingEnabled: room.recordingEnabled,
    };
  }
}

export default RoomManager;
