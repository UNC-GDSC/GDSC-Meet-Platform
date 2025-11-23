export const APP_NAME = 'GDSC Meet';
export const APP_VERSION = '1.0.0';

export const MEDIA_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
};

export const SCREEN_SHARE_CONSTRAINTS = {
  video: {
    cursor: 'always',
  },
  audio: false,
};

export const CONNECTION_TIMEOUT = 30000; // 30 seconds
export const RECONNECT_ATTEMPTS = 5;
export const RECONNECT_DELAY = 1000;

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_ROOM_NAME_LENGTH = 100;
export const MAX_PARTICIPANT_NAME_LENGTH = 50;
