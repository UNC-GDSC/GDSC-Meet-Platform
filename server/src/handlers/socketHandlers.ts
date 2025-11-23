import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import RoomManager from '../services/RoomManager';
import AuthService from '../services/AuthService';
import WaitingRoomService from '../services/WaitingRoom';
import RecordingService from '../services/RecordingService';
import {
  JoinRoomPayload,
  CreateRoomPayload,
  SendSignalPayload,
  SendMessagePayload,
  UpdateMediaStatePayload,
  ChatMessage,
  HostAction,
  WaitingRoomAction,
  RecordingAction,
} from '../types';
import logger from '../utils/logger';

export function registerSocketHandlers(
  io: Server,
  roomManager: RoomManager,
  authService: AuthService,
  waitingRoomService: WaitingRoomService,
  recordingService: RecordingService
) {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    let currentParticipantId: string | null = null;
    let currentRoomId: string | null = null;

    socket.on('create-room', (payload: CreateRoomPayload, callback) => {
      try {
        const participantId = uuidv4();
        currentParticipantId = participantId;

        const room = roomManager.createRoom(
          payload.roomName,
          participantId,
          payload.participantName,
          socket.id,
          {
            waitingRoomEnabled: payload.waitingRoomEnabled,
            hasPassword: !!payload.password,
            maxParticipants: payload.maxParticipants,
          }
        );

        if (payload.password) {
          authService.setRoomPassword(room.id, payload.password);
        }

        if (payload.waitingRoomEnabled) {
          waitingRoomService.enableWaitingRoom(room.id);
        }

        currentRoomId = room.id;
        socket.join(room.id);

        const participant = room.participants.get(participantId);

        callback({
          success: true,
          roomId: room.id,
          participantId,
          participant,
          isHost: true,
        });

        logger.info(`Room created: ${room.id} by participant ${participantId}`);
      } catch (error) {
        logger.error('Error creating room:', error);
        callback({ success: false, error: 'Failed to create room' });
      }
    });

    socket.on('check-room-password', (payload: { roomId: string }, callback) => {
      const isProtected = authService.isRoomPasswordProtected(payload.roomId);
      callback({ hasPassword: isProtected });
    });

    socket.on('join-room', (payload: JoinRoomPayload, callback) => {
      try {
        const room = roomManager.getRoom(payload.roomId);

        if (!room) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        // Check password
        if (room.hasPassword) {
          if (!payload.password || !authService.verifyRoomPassword(payload.roomId, payload.password)) {
            callback({ success: false, error: 'Invalid password' });
            return;
          }
        }

        const participantId = uuidv4();
        currentParticipantId = participantId;
        currentRoomId = payload.roomId;

        // Check if waiting room is enabled
        if (room.waitingRoomEnabled) {
          const waitingParticipant = waitingRoomService.addToWaitingRoom(
            payload.roomId,
            payload.participantName,
            socket.id
          );

          // Notify host about waiting participant
          const hostSocketId = room.participants.get(room.hostId)?.socketId;
          if (hostSocketId) {
            io.to(hostSocketId).emit('participant-waiting', {
              participant: waitingParticipant,
            });
          }

          callback({
            success: true,
            waiting: true,
            participantId: waitingParticipant.id,
          });

          logger.info(`Participant added to waiting room in ${payload.roomId}`);
          return;
        }

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
          isHost: result.room.hostId === participantId,
          roomInfo: {
            isLocked: result.room.isLocked,
            recordingEnabled: result.room.recordingEnabled,
          },
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

    socket.on('waiting-room-action', (payload: WaitingRoomAction) => {
      try {
        if (!currentParticipantId || !currentRoomId) return;

        // Verify requester is host
        if (!roomManager.isHost(currentRoomId, currentParticipantId)) {
          return;
        }

        if (payload.action === 'admit') {
          const participant = waitingRoomService.admitParticipant(
            payload.roomId,
            payload.participantId
          );

          if (participant) {
            const result = roomManager.joinRoom(
              payload.roomId,
              participant.id,
              participant.name,
              participant.socketId
            );

            if (result.success && result.room) {
              io.to(participant.socketId).emit('admitted-to-room', {
                roomId: payload.roomId,
                participants: Array.from(result.room.participants.values()).filter(
                  (p) => p.id !== participant.id
                ),
              });

              socket.to(payload.roomId).emit('participant-joined', {
                participant: result.room.participants.get(participant.id),
              });
            }
          }
        } else if (payload.action === 'reject') {
          const participant = waitingRoomService.getWaitingParticipants(payload.roomId)
            .find(p => p.id === payload.participantId);

          if (participant) {
            waitingRoomService.rejectParticipant(payload.roomId, payload.participantId);
            io.to(participant.socketId).emit('rejected-from-room', {
              roomId: payload.roomId,
            });
          }
        }
      } catch (error) {
        logger.error('Error handling waiting room action:', error);
      }
    });

    socket.on('host-action', (payload: HostAction) => {
      try {
        if (!currentParticipantId) return;

        // Verify requester is host
        if (!roomManager.isHost(payload.roomId, currentParticipantId)) {
          logger.warn(`Non-host attempted action: ${currentParticipantId}`);
          return;
        }

        switch (payload.action) {
          case 'kick':
            if (payload.targetParticipantId) {
              const success = roomManager.kickParticipant(
                payload.roomId,
                payload.targetParticipantId,
                currentParticipantId
              );

              if (success) {
                const room = roomManager.getRoom(payload.roomId);
                const targetSocketId = room?.participants.get(payload.targetParticipantId)?.socketId;

                if (targetSocketId) {
                  io.to(targetSocketId).emit('kicked-from-room');
                }

                socket.to(payload.roomId).emit('participant-left', {
                  participantId: payload.targetParticipantId,
                });
              }
            }
            break;

          case 'mute':
            if (payload.targetParticipantId) {
              roomManager.muteParticipant(
                payload.roomId,
                payload.targetParticipantId,
                currentParticipantId
              );

              const room = roomManager.getRoom(payload.roomId);
              const targetSocketId = room?.participants.get(payload.targetParticipantId)?.socketId;

              if (targetSocketId) {
                io.to(targetSocketId).emit('force-muted');
              }

              socket.to(payload.roomId).emit('participant-media-updated', {
                participantId: payload.targetParticipantId,
                isAudioEnabled: false,
              });
            }
            break;

          case 'muteAll':
            roomManager.muteAllParticipants(payload.roomId, currentParticipantId);
            socket.to(payload.roomId).emit('all-muted');
            break;

          case 'lock':
            roomManager.lockRoom(payload.roomId, currentParticipantId);
            io.to(payload.roomId).emit('room-locked');
            break;

          case 'unlock':
            roomManager.unlockRoom(payload.roomId, currentParticipantId);
            io.to(payload.roomId).emit('room-unlocked');
            break;

          case 'endMeeting':
            io.to(payload.roomId).emit('meeting-ended');
            // Clean up room
            const room = roomManager.getRoom(payload.roomId);
            if (room) {
              room.participants.forEach((participant) => {
                io.to(participant.socketId).emit('meeting-ended');
              });
              waitingRoomService.clearWaitingRoom(payload.roomId);
              authService.removeRoomPassword(payload.roomId);
            }
            break;
        }
      } catch (error) {
        logger.error('Error handling host action:', error);
      }
    });

    socket.on('recording-action', (payload: RecordingAction, callback) => {
      try {
        if (!currentParticipantId) {
          callback?.({ success: false, error: 'Not authenticated' });
          return;
        }

        // Verify requester is host
        if (!roomManager.isHost(payload.roomId, currentParticipantId)) {
          callback?.({ success: false, error: 'Only host can control recording' });
          return;
        }

        if (payload.action === 'start') {
          const recording = recordingService.startRecording(payload.roomId);
          roomManager.setRecordingStatus(payload.roomId, true);

          io.to(payload.roomId).emit('recording-started', {
            recordingId: recording.id,
          });

          callback?.({ success: true, recording });
        } else if (payload.action === 'stop') {
          const recording = recordingService.stopRecording(payload.roomId);
          roomManager.setRecordingStatus(payload.roomId, false);

          if (recording) {
            io.to(payload.roomId).emit('recording-stopped', {
              recordingId: recording.id,
            });

            callback?.({ success: true, recording });
          } else {
            callback?.({ success: false, error: 'No active recording' });
          }
        }
      } catch (error) {
        logger.error('Error handling recording action:', error);
        callback?.({ success: false, error: 'Failed to control recording' });
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
          isHandRaised: payload.isHandRaised,
          reaction: payload.reaction,
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
              isHandRaised: participant?.isHandRaised,
              reaction: participant?.reaction,
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

        // If host left, notify about new host
        if (room && room.participants.size > 0) {
          const newHost = Array.from(room.participants.values()).find(
            p => p.role === 'host'
          );

          if (newHost) {
            io.to(roomId).emit('host-changed', {
              newHostId: newHost.id,
            });
          }
        }

        // Clean up if room is empty
        if (!room || room.participants.size === 0) {
          waitingRoomService.clearWaitingRoom(roomId);
          authService.removeRoomPassword(roomId);

          if (recordingService.isRecording(roomId)) {
            recordingService.stopRecording(roomId);
          }
        }

        logger.info(`Participant ${currentParticipantId} left room ${roomId}`);
      }

      currentParticipantId = null;
      currentRoomId = null;
    }
  });
}
