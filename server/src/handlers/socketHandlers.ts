import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import RoomManager from '../services/RoomManager';
import {
  JoinRoomPayload,
  CreateRoomPayload,
  SendSignalPayload,
  SendMessagePayload,
  UpdateMediaStatePayload,
  ChatMessage,
} from '../types';
import logger from '../utils/logger';

export function registerSocketHandlers(io: Server, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    let currentParticipantId: string | null = null;

    socket.on('create-room', (payload: CreateRoomPayload, callback) => {
      try {
        const participantId = uuidv4();
        currentParticipantId = participantId;

        const room = roomManager.createRoom(
          payload.roomName,
          participantId,
          payload.participantName,
          socket.id
        );

        socket.join(room.id);

        const participant = room.participants.get(participantId);

        callback({
          success: true,
          roomId: room.id,
          participantId,
          participant,
        });

        logger.info(`Room created: ${room.id} by participant ${participantId}`);
      } catch (error) {
        logger.error('Error creating room:', error);
        callback({ success: false, error: 'Failed to create room' });
      }
    });

    socket.on('join-room', (payload: JoinRoomPayload, callback) => {
      try {
        const participantId = uuidv4();
        currentParticipantId = participantId;

        const result = roomManager.joinRoom(
          payload.roomId,
          participantId,
          payload.participantName,
          socket.id
        );

        if (!result.success || !result.room) {
          callback({ success: false, error: result.error });
          return;
        }

        socket.join(payload.roomId);

        const participants = Array.from(result.room.participants.values()).filter(
          (p) => p.id !== participantId
        );

        const currentParticipant = result.room.participants.get(participantId);

        callback({
          success: true,
          participantId,
          participants,
          participant: currentParticipant,
        });

        socket.to(payload.roomId).emit('participant-joined', {
          participant: currentParticipant,
        });

        logger.info(`Participant ${participantId} joined room ${payload.roomId}`);
      } catch (error) {
        logger.error('Error joining room:', error);
        callback({ success: false, error: 'Failed to join room' });
      }
    });

    socket.on('signal', (payload: SendSignalPayload) => {
      try {
        const room = roomManager.getRoom(payload.roomId);

        if (!room) {
          logger.warn(`Signal sent to non-existent room: ${payload.roomId}`);
          return;
        }

        const targetParticipant = room.participants.get(payload.to);

        if (!targetParticipant) {
          logger.warn(`Signal sent to non-existent participant: ${payload.to}`);
          return;
        }

        io.to(targetParticipant.socketId).emit('signal', {
          from: currentParticipantId,
          signal: payload.signal,
          type: payload.type,
        });

        logger.debug(
          `Signal relayed from ${currentParticipantId} to ${payload.to} in room ${payload.roomId}`
        );
      } catch (error) {
        logger.error('Error handling signal:', error);
      }
    });

    socket.on('send-message', (payload: SendMessagePayload) => {
      try {
        if (!currentParticipantId) {
          return;
        }

        const room = roomManager.getRoom(payload.roomId);

        if (!room) {
          return;
        }

        const participant = room.participants.get(currentParticipantId);

        if (!participant) {
          return;
        }

        const message: ChatMessage = {
          id: uuidv4(),
          roomId: payload.roomId,
          senderId: currentParticipantId,
          senderName: participant.name,
          message: payload.message,
          timestamp: new Date(),
        };

        io.to(payload.roomId).emit('new-message', message);

        logger.debug(`Message sent in room ${payload.roomId} by ${participant.name}`);
      } catch (error) {
        logger.error('Error sending message:', error);
      }
    });

    socket.on('update-media-state', (payload: UpdateMediaStatePayload) => {
      try {
        if (!currentParticipantId) {
          return;
        }

        const success = roomManager.updateParticipantMedia(currentParticipantId, {
          isAudioEnabled: payload.isAudioEnabled,
          isVideoEnabled: payload.isVideoEnabled,
          isScreenSharing: payload.isScreenSharing,
        });

        if (success) {
          const room = roomManager.getRoomByParticipant(currentParticipantId);

          if (room) {
            const participant = room.participants.get(currentParticipantId);

            socket.to(payload.roomId).emit('participant-media-updated', {
              participantId: currentParticipantId,
              isAudioEnabled: participant?.isAudioEnabled,
              isVideoEnabled: participant?.isVideoEnabled,
              isScreenSharing: participant?.isScreenSharing,
            });
          }
        }
      } catch (error) {
        logger.error('Error updating media state:', error);
      }
    });

    socket.on('leave-room', () => {
      handleDisconnect();
    });

    socket.on('disconnect', () => {
      handleDisconnect();
    });

    function handleDisconnect() {
      if (!currentParticipantId) {
        return;
      }

      const { roomId, room } = roomManager.leaveRoom(currentParticipantId);

      if (roomId) {
        socket.to(roomId).emit('participant-left', {
          participantId: currentParticipantId,
        });

        logger.info(`Participant ${currentParticipantId} left room ${roomId}`);
      }

      currentParticipantId = null;
    }
  });
}
