import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';
import socketService from '../services/socket';
import webrtcService from '../services/webrtc';

export default function useRoom() {
  const navigate = useNavigate();
  const {
    roomId,
    participantId,
    addParticipant,
    removeParticipant,
    updateParticipant,
    addMessage,
    reset,
    setLocalStream,
  } = useRoomStore();

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await webrtcService.getLocalStream(true, true);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to get media:', error);
      throw error;
    }
  }, [setLocalStream]);

  const setupSocketListeners = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on('participant-joined', ({ participant }) => {
      console.log('Participant joined:', participant);
      addParticipant(participant);

      if (roomId && participantId) {
        webrtcService.createPeerConnection(participant.id, roomId, true);
      }
    });

    socket.on('participant-left', ({ participantId: leftParticipantId }) => {
      console.log('Participant left:', leftParticipantId);
      removeParticipant(leftParticipantId);
      webrtcService.removePeerConnection(leftParticipantId);
    });

    socket.on('signal', async ({ from, signal, type }) => {
      console.log('Received signal:', type, 'from:', from);

      if (type === 'offer' && roomId) {
        await webrtcService.handleOffer(from, roomId, signal);
      } else if (type === 'answer') {
        await webrtcService.handleAnswer(from, signal);
      } else if (type === 'ice-candidate') {
        await webrtcService.handleIceCandidate(from, signal);
      }

      setTimeout(() => {
        const stream = webrtcService.getPeerStream(from);
        const screenStream = webrtcService.getPeerScreenStream(from);

        if (stream || screenStream) {
          updateParticipant(from, {
            stream,
            screenStream,
          });
        }
      }, 1000);
    });

    socket.on('participant-media-updated', ({ participantId: pid, isAudioEnabled, isVideoEnabled, isScreenSharing }) => {
      updateParticipant(pid, {
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing,
      });
    });

    socket.on('new-message', (message) => {
      addMessage({
        ...message,
        timestamp: new Date(message.timestamp),
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }, [roomId, participantId, addParticipant, removeParticipant, updateParticipant, addMessage]);

  const createRoom = useCallback(
    async (roomName: string, participantName: string) => {
      try {
        const socket = socketService.connect();

        return new Promise((resolve, reject) => {
          socket.emit(
            'create-room',
            { roomName, participantName },
            (response: any) => {
              if (response.success) {
                resolve(response);
              } else {
                reject(new Error(response.error));
              }
            }
          );
        });
      } catch (error) {
        console.error('Failed to create room:', error);
        throw error;
      }
    },
    []
  );

  const joinRoom = useCallback(
    async (roomId: string, participantName: string) => {
      try {
        const socket = socketService.connect();

        return new Promise((resolve, reject) => {
          socket.emit(
            'join-room',
            { roomId, participantName },
            (response: any) => {
              if (response.success) {
                resolve(response);
              } else {
                reject(new Error(response.error));
              }
            }
          );
        });
      } catch (error) {
        console.error('Failed to join room:', error);
        throw error;
      }
    },
    []
  );

  const leaveRoom = useCallback(() => {
    socketService.emit('leave-room');
    webrtcService.cleanup();
    reset();
    socketService.disconnect();
    navigate('/');
  }, [reset, navigate]);

  useEffect(() => {
    setupSocketListeners();

    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('participant-joined');
        socket.off('participant-left');
        socket.off('signal');
        socket.off('participant-media-updated');
        socket.off('new-message');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, [setupSocketListeners]);

  return {
    initializeMedia,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
