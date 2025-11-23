import crypto from 'crypto';
import logger from '../utils/logger';

interface RoomAuth {
  roomId: string;
  password: string;
  salt: string;
  createdAt: Date;
}

class AuthService {
  private roomPasswords: Map<string, RoomAuth> = new Map();

  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const newSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, newSalt, 10000, 64, 'sha512')
      .toString('hex');

    return { hash, salt: newSalt };
  }

  setRoomPassword(roomId: string, password: string): void {
    const { hash, salt } = this.hashPassword(password);

    this.roomPasswords.set(roomId, {
      roomId,
      password: hash,
      salt,
      createdAt: new Date(),
    });

    logger.info(`Password set for room: ${roomId}`);
  }

  verifyRoomPassword(roomId: string, password: string): boolean {
    const roomAuth = this.roomPasswords.get(roomId);

    if (!roomAuth) {
      return true; // No password set
    }

    const { hash } = this.hashPassword(password, roomAuth.salt);
    return hash === roomAuth.password;
  }

  removeRoomPassword(roomId: string): void {
    this.roomPasswords.delete(roomId);
    logger.info(`Password removed for room: ${roomId}`);
  }

  isRoomPasswordProtected(roomId: string): boolean {
    return this.roomPasswords.has(roomId);
  }

  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Clean up old room passwords (rooms older than 24 hours)
  cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    this.roomPasswords.forEach((auth, roomId) => {
      if (auth.createdAt < oneDayAgo) {
        this.roomPasswords.delete(roomId);
        logger.info(`Cleaned up old password for room: ${roomId}`);
      }
    });
  }
}

export default AuthService;
