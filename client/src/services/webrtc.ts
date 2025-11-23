import socketService from './socket';

const STUN_SERVER = import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302';

interface PeerConnection {
  connection: RTCPeerConnection;
  stream?: MediaStream;
  screenStream?: MediaStream;
}

class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: STUN_SERVER },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  };

  async getLocalStream(audio: boolean = true, video: boolean = true): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        } : false,
      });

      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }

  async getScreenStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      });

      return stream;
    } catch (error) {
      console.error('Error getting screen stream:', error);
      throw error;
    }
  }

  createPeerConnection(
    participantId: string,
    roomId: string,
    isInitiator: boolean = false
  ): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.configuration);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emit('signal', {
          roomId,
          to: participantId,
          signal: event.candidate,
          type: 'ice-candidate',
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const peerData = this.peerConnections.get(participantId);
      if (peerData) {
        if (event.streams[0].getVideoTracks().length > 0) {
          const videoTrack = event.streams[0].getVideoTracks()[0];
          if (videoTrack.label.includes('screen')) {
            peerData.screenStream = event.streams[0];
          } else {
            peerData.stream = event.streams[0];
          }
        } else {
          peerData.stream = event.streams[0];
        }
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Connection state with ${participantId}: ${peerConnection.connectionState}`
      );

      if (
        peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'closed'
      ) {
        this.removePeerConnection(participantId);
      }
    };

    this.peerConnections.set(participantId, { connection: peerConnection });

    if (isInitiator) {
      this.createOffer(participantId, roomId);
    }

    return peerConnection;
  }

  async createOffer(participantId: string, roomId: string) {
    const peerData = this.peerConnections.get(participantId);
    if (!peerData) return;

    try {
      const offer = await peerData.connection.createOffer();
      await peerData.connection.setLocalDescription(offer);

      socketService.emit('signal', {
        roomId,
        to: participantId,
        signal: offer,
        type: 'offer',
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  async handleOffer(participantId: string, roomId: string, offer: RTCSessionDescriptionInit) {
    let peerData = this.peerConnections.get(participantId);

    if (!peerData) {
      this.createPeerConnection(participantId, roomId, false);
      peerData = this.peerConnections.get(participantId);
    }

    if (!peerData) return;

    try {
      await peerData.connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerData.connection.createAnswer();
      await peerData.connection.setLocalDescription(answer);

      socketService.emit('signal', {
        roomId,
        to: participantId,
        signal: answer,
        type: 'answer',
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(participantId: string, answer: RTCSessionDescriptionInit) {
    const peerData = this.peerConnections.get(participantId);
    if (!peerData) return;

    try {
      await peerData.connection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(participantId: string, candidate: RTCIceCandidateInit) {
    const peerData = this.peerConnections.get(participantId);
    if (!peerData) return;

    try {
      await peerData.connection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async addScreenStream(screenStream: MediaStream, participantId?: string) {
    const screenTrack = screenStream.getVideoTracks()[0];

    if (participantId) {
      const peerData = this.peerConnections.get(participantId);
      if (peerData) {
        const sender = peerData.connection
          .getSenders()
          .find((s) => s.track?.kind === 'video');

        if (sender) {
          await sender.replaceTrack(screenTrack);
        } else {
          peerData.connection.addTrack(screenTrack, screenStream);
        }
      }
    } else {
      this.peerConnections.forEach((peerData) => {
        const sender = peerData.connection
          .getSenders()
          .find((s) => s.track?.kind === 'video');

        if (sender) {
          sender.replaceTrack(screenTrack);
        } else {
          peerData.connection.addTrack(screenTrack, screenStream);
        }
      });
    }
  }

  async restoreVideoStream(participantId?: string) {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];

    if (participantId) {
      const peerData = this.peerConnections.get(participantId);
      if (peerData) {
        const sender = peerData.connection
          .getSenders()
          .find((s) => s.track?.kind === 'video');

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
    } else {
      this.peerConnections.forEach((peerData) => {
        const sender = peerData.connection
          .getSenders()
          .find((s) => s.track?.kind === 'video');

        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
    }
  }

  getPeerStream(participantId: string): MediaStream | undefined {
    return this.peerConnections.get(participantId)?.stream;
  }

  getPeerScreenStream(participantId: string): MediaStream | undefined {
    return this.peerConnections.get(participantId)?.screenStream;
  }

  removePeerConnection(participantId: string) {
    const peerData = this.peerConnections.get(participantId);
    if (peerData) {
      peerData.connection.close();
      this.peerConnections.delete(participantId);
    }
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.peerConnections.forEach((peerData) => {
      peerData.connection.close();
    });

    this.peerConnections.clear();
  }
}

export default new WebRTCService();
