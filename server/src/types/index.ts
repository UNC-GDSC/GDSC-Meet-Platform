export interface Participant {
  id: string;
  socketId: string;
  name: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  reaction?: string;
  role: 'host' | 'participant';
  joinedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  participants: Map<string, Participant>;
  createdAt: Date;
  createdBy: string;
  hostId: string;
  isLocked: boolean;
  hasPassword: boolean;
  waitingRoomEnabled: boolean;
  recordingEnabled: boolean;
  maxParticipants: number;
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
  password?: string;
}

export interface CreateRoomPayload {
  roomName: string;
  participantName: string;
  password?: string;
  waitingRoomEnabled?: boolean;
  maxParticipants?: number;
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
  isHandRaised?: boolean;
  reaction?: string;
}

export interface HostAction {
  roomId: string;
  action: 'kick' | 'mute' | 'muteAll' | 'lock' | 'unlock' | 'endMeeting';
  targetParticipantId?: string;
}

export interface WaitingRoomAction {
  roomId: string;
  participantId: string;
  action: 'admit' | 'reject';
}

export interface RecordingAction {
  roomId: string;
  action: 'start' | 'stop';
}
