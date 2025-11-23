import RoomManager from '../RoomManager';

describe('RoomManager', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager(50);
  });

  describe('createRoom', () => {
    it('should create a new room', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');

      expect(room).toBeDefined();
      expect(room.name).toBe('Test Room');
      expect(room.hostId).toBe('user1');
      expect(room.participants.size).toBe(1);
    });

    it('should set creator as host', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      const creator = room.participants.get('user1');

      expect(creator?.role).toBe('host');
    });
  });

  describe('joinRoom', () => {
    it('should allow participant to join existing room', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      const result = roomManager.joinRoom(room.id, 'user2', 'Jane Doe', 'socket2');

      expect(result.success).toBe(true);
      expect(result.room?.participants.size).toBe(2);
    });

    it('should not allow joining non-existent room', () => {
      const result = roomManager.joinRoom('invalid-room', 'user1', 'John Doe', 'socket1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Room not found');
    });

    it('should not allow joining locked room', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      roomManager.lockRoom(room.id, 'user1');

      const result = roomManager.joinRoom(room.id, 'user2', 'Jane Doe', 'socket2');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Room is locked');
    });
  });

  describe('leaveRoom', () => {
    it('should remove participant from room', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      roomManager.joinRoom(room.id, 'user2', 'Jane Doe', 'socket2');

      const result = roomManager.leaveRoom('user2');

      expect(result.roomId).toBe(room.id);
      expect(room.participants.size).toBe(1);
    });

    it('should assign new host when host leaves', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      roomManager.joinRoom(room.id, 'user2', 'Jane Doe', 'socket2');

      roomManager.leaveRoom('user1');

      expect(room.hostId).toBe('user2');
      expect(room.participants.get('user2')?.role).toBe('host');
    });
  });

  describe('host controls', () => {
    it('should allow host to kick participant', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      roomManager.joinRoom(room.id, 'user2', 'Jane Doe', 'socket2');

      const success = roomManager.kickParticipant(room.id, 'user2', 'user1');

      expect(success).toBe(true);
      expect(room.participants.size).toBe(1);
    });

    it('should not allow non-host to kick participant', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      roomManager.joinRoom(room.id, 'user2', 'Jane Doe', 'socket2');

      const success = roomManager.kickParticipant(room.id, 'user1', 'user2');

      expect(success).toBe(false);
    });

    it('should allow host to mute participant', () => {
      const room = roomManager.createRoom('Test Room', 'user1', 'John Doe', 'socket1');
      roomManager.joinRoom(room.id, 'user2', 'Jane Doe', 'socket2');

      const success = roomManager.muteParticipant(room.id, 'user2', 'user1');

      expect(success).toBe(true);
      expect(room.participants.get('user2')?.isAudioEnabled).toBe(false);
    });
  });
});
