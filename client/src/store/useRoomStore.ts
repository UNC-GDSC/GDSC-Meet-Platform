import { create } from 'zustand';
import { Participant, ChatMessage } from '../types';

interface RoomState {
  roomId: string | null;
  roomName: string | null;
  participantId: string | null;
  participants: Map<string, Participant>;
  localStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  messages: ChatMessage[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;

  setRoomId: (roomId: string) => void;
  setRoomName: (name: string) => void;
  setParticipantId: (id: string) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setLocalScreenStream: (stream: MediaStream | null) => void;
  addMessage: (message: ChatMessage) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  setScreenSharing: (sharing: boolean) => void;
  toggleChat: () => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  roomName: null,
  participantId: null,
  participants: new Map(),
  localStream: null,
  localScreenStream: null,
  messages: [],
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  isChatOpen: false,

  setRoomId: (roomId) => set({ roomId }),
  setRoomName: (roomName) => set({ roomName }),
  setParticipantId: (participantId) => set({ participantId }),

  addParticipant: (participant) =>
    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.set(participant.id, participant);
      return { participants: newParticipants };
    }),

  removeParticipant: (participantId) =>
    set((state) => {
      const newParticipants = new Map(state.participants);
      const participant = newParticipants.get(participantId);

      if (participant?.stream) {
        participant.stream.getTracks().forEach((track) => track.stop());
      }
      if (participant?.screenStream) {
        participant.screenStream.getTracks().forEach((track) => track.stop());
      }

      newParticipants.delete(participantId);
      return { participants: newParticipants };
    }),

  updateParticipant: (participantId, updates) =>
    set((state) => {
      const newParticipants = new Map(state.participants);
      const participant = newParticipants.get(participantId);

      if (participant) {
        newParticipants.set(participantId, { ...participant, ...updates });
      }

      return { participants: newParticipants };
    }),

  setLocalStream: (stream) => set({ localStream: stream }),
  setLocalScreenStream: (stream) => set({ localScreenStream: stream }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  toggleAudio: () =>
    set((state) => {
      const newState = !state.isAudioEnabled;
      if (state.localStream) {
        state.localStream.getAudioTracks().forEach((track) => {
          track.enabled = newState;
        });
      }
      return { isAudioEnabled: newState };
    }),

  toggleVideo: () =>
    set((state) => {
      const newState = !state.isVideoEnabled;
      if (state.localStream) {
        state.localStream.getVideoTracks().forEach((track) => {
          track.enabled = newState;
        });
      }
      return { isVideoEnabled: newState };
    }),

  setScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  reset: () =>
    set((state) => {
      if (state.localStream) {
        state.localStream.getTracks().forEach((track) => track.stop());
      }
      if (state.localScreenStream) {
        state.localScreenStream.getTracks().forEach((track) => track.stop());
      }

      state.participants.forEach((participant) => {
        if (participant.stream) {
          participant.stream.getTracks().forEach((track) => track.stop());
        }
        if (participant.screenStream) {
          participant.screenStream.getTracks().forEach((track) => track.stop());
        }
      });

      return {
        roomId: null,
        roomName: null,
        participantId: null,
        participants: new Map(),
        localStream: null,
        localScreenStream: null,
        messages: [],
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
        isChatOpen: false,
      };
    }),
}));
