export interface Participant {
  id: string;
  socketId: string;
  name: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream;
  screenStream?: MediaStream;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface RoomInfo {
  id: string;
  name: string;
  participantCount: number;
  createdAt: Date;
}
