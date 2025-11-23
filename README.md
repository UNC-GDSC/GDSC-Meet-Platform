# GDSC Meet Platform

> Open-source video conferencing platform built with WebRTC, React, and Node.js

A fully production-ready, collaborative video conferencing platform similar to Google Meet, featuring HD video/audio, screen sharing, real-time chat, and more.

## ✨ Features

### Core Functionality
- 🎥 **HD Video & Audio** - High-quality peer-to-peer video calls
- 🖥️ **Screen Sharing** - Share your screen with participants
- 💬 **Real-time Chat** - Text messaging during calls
- 👥 **Multi-participant Support** - Up to 50 participants per room
- 🔒 **Secure WebRTC** - Peer-to-peer encrypted connections
- 🎬 **Meeting Recording** - Record meetings for later playback
- ✋ **Reactions & Hand Raise** - Express yourself during calls

### Advanced Room Features
- 🔐 **Password Protection** - Secure rooms with passwords
- 🚪 **Waiting Room** - Control who joins your meeting
- 👑 **Host Controls** - Kick, mute, lock room, end meeting
- 🔇 **Mute All** - Host can mute all participants
- 🔒 **Room Locking** - Prevent new participants from joining

### User Experience
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful, intuitive interface
- 🔔 **Connection Quality Monitoring** - Real-time connection status
- 🎭 **Participant Management** - See all participants and their status
- 🚀 **Quick Join** - Simple room creation and joining
- ⚡ **Error Boundaries** - Graceful error handling

### Enterprise Features
- 🏗️ **Kubernetes Ready** - Full K8s deployment configs
- 📊 **Monitoring & Metrics** - Prometheus & Grafana integration
- 🔄 **Auto-scaling** - Horizontal Pod Autoscaling
- 🛡️ **Rate Limiting** - Protection against abuse
- 🔐 **Security Hardening** - Helmet.js, CORS, input validation
- 🔍 **Logging** - Structured logging with Winston
- 🚀 **CI/CD Pipeline** - GitHub Actions automation
- 🧪 **Testing** - Comprehensive test suite
- 📈 **Production Monitoring** - Health checks and observability

## 🏗️ Architecture

```
GDSC-Meet-Platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # WebRTC & Socket.IO services
│   │   ├── store/         # Zustand state management
│   │   └── types/         # TypeScript definitions
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── handlers/      # Socket event handlers
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utilities & helpers
│   └── package.json
│
├── docker-compose.yml     # Docker orchestration
├── Dockerfile.client      # Client Docker image
└── Dockerfile.server      # Server Docker image
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GDSC-Meet-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Server (`.env` in `server/`):
   ```env
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   MAX_PARTICIPANTS_PER_ROOM=50
   LOG_LEVEL=info
   ```

   Client (`.env` in `client/`):
   ```env
   VITE_SERVER_URL=http://localhost:3001
   VITE_STUN_SERVER=stun:stun.l.google.com:19302
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Client: http://localhost:5173
   - Server: http://localhost:3001

### Production Deployment

#### Using Docker Compose (Recommended)

1. **Build and run**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost
   - Backend: http://localhost:3001

#### Manual Deployment

**Server:**
```bash
cd server
npm install
npm run build
npm start
```

**Client:**
```bash
cd client
npm install
npm run build
npm run preview
```

## 📖 Usage Guide

### Creating a Room

1. Open the application
2. Click "Create Room"
3. Enter room name and your name
4. Click "Create Room" button
5. Share the Room ID with participants

### Joining a Room

1. Open the application
2. Click "Join Room"
3. Enter the Room ID and your name
4. Click "Join Room" button

### During a Call

- **Mute/Unmute**: Toggle microphone
- **Camera On/Off**: Toggle video
- **Share Screen**: Share your screen
- **Chat**: Open/close chat panel
- **Participants**: View all participants
- **Leave**: Exit the call

## 🔧 Configuration

### Server Configuration

Located in `server/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| CORS_ORIGIN | Allowed origin | http://localhost:5173 |
| MAX_PARTICIPANTS_PER_ROOM | Max participants | 50 |
| LOG_LEVEL | Logging level | info |

### Client Configuration

Located in `client/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_SERVER_URL | Backend URL | http://localhost:3001 |
| VITE_STUN_SERVER | STUN server | stun:stun.l.google.com:19302 |

### TURN Server (Optional)

For better connectivity across different networks, configure a TURN server in `client/src/services/webrtc.ts`:

```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'username',
    credential: 'password'
  }
]
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Video/audio streaming

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **TypeScript** - Type safety
- **Winston** - Logging
- **Helmet** - Security

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Web server (production)

## 📊 Performance Optimization

- **WebRTC Optimization**: Configured for optimal video quality
- **Compression**: Gzip compression enabled
- **Caching**: Static asset caching
- **Code Splitting**: Vite automatic code splitting
- **Lazy Loading**: Components loaded on demand

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin protection
- **Input Validation**: Server-side validation
- **WebRTC Encryption**: DTLS-SRTP encryption
- **Secure WebSocket**: WSS in production

## 🧪 Testing

Run tests:
```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

## 📈 Scaling

### Horizontal Scaling

For production, consider:
- Load balancer (nginx, HAProxy)
- Multiple server instances
- Redis for session management
- Dedicated TURN servers

### Recommended Infrastructure

- **Small (1-10 concurrent rooms)**: Single server
- **Medium (10-50 rooms)**: 2-3 servers + load balancer
- **Large (50+ rooms)**: Kubernetes cluster + Redis

## 🐛 Troubleshooting

### Camera/Microphone Not Working

- Check browser permissions
- Ensure HTTPS in production
- Verify no other app is using the devices

### Connection Issues

- Check firewall settings
- Configure TURN server
- Verify network allows WebRTC traffic

### High Latency

- Use geographically closer STUN/TURN servers
- Check network bandwidth
- Reduce video quality settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- WebRTC community
- Socket.IO team
- React team
- Open source contributors

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting guide

---

Built with ❤️ by GDSC
