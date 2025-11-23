export interface Participant {
  id: string;
  socketId: string;
  name: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  participants: Map<string, Participant>;
  createdAt: Date;
  createdBy: string;
}

export interface SignalData {
  from: string;
  to: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice-candidate';
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface MediaState {
  participantId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

export interface JoinRoomPayload {
  roomId: string;
  participantName: string;
}

export interface CreateRoomPayload {
  roomName: string;
  participantName: string;
}

export interface SendSignalPayload {
  roomId: string;
  to: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice-candidate';
}

export interface SendMessagePayload {
  roomId: string;
  message: string;
}

export interface UpdateMediaStatePayload {
  roomId: string;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
}
