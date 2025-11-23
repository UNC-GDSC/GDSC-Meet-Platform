# Quick Start Guide

Get GDSC Meet Platform running in 5 minutes!

## 🚀 Super Quick Start (Using Docker)

**Prerequisites:** Docker and Docker Compose installed

```bash
# 1. Clone the repository
git clone <repository-url>
cd GDSC-Meet-Platform

# 2. Start everything
docker-compose up -d

# 3. Open in browser
# Visit http://localhost
```

That's it! 🎉

## 💻 Development Setup (Without Docker)

**Prerequisites:** Node.js 18+ and npm installed

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd GDSC-Meet-Platform

# Install all dependencies
npm install
```

### Step 2: Start Development Servers

```bash
# Start both client and server
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### Step 3: Use the Application

1. Open http://localhost:5173 in your browser
2. Click "Create Room"
3. Enter a room name and your name
4. Click "Create Room"
5. Share the Room ID with others to join

## 🧪 Testing the Platform

### Test Locally

1. Open the app in **two different browser windows**
2. Create a room in the first window
3. Copy the Room ID
4. Join the room in the second window using the Room ID
5. You should see yourself in both windows!

### Test Features

- ✅ Toggle microphone on/off
- ✅ Toggle camera on/off
- ✅ Share your screen
- ✅ Send chat messages
- ✅ View participants list

## 🔧 Configuration

### Default Configuration

The platform works out of the box with these defaults:
- Server: http://localhost:3001
- Client: http://localhost:5173
- STUN Server: stun.l.google.com:19302

### Custom Configuration

#### Server Configuration

Edit `server/.env`:
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
MAX_PARTICIPANTS_PER_ROOM=50
```

#### Client Configuration

Edit `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3001
VITE_STUN_SERVER=stun:stun.l.google.com:19302
```

## 📱 Mobile Testing

1. Find your local IP address
   ```bash
   # macOS/Linux
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

2. Update `server/.env`:
   ```env
   CORS_ORIGIN=http://YOUR_IP:5173
   ```

3. Update `client/.env`:
   ```env
   VITE_SERVER_URL=http://YOUR_IP:3001
   ```

4. Restart the servers

5. Open `http://YOUR_IP:5173` on your mobile device

## 🐛 Common Issues

### Camera/Microphone Not Working

**Problem:** Browser can't access camera/microphone

**Solution:**
- Grant browser permissions when prompted
- Check no other app is using the devices
- For Chrome: `chrome://settings/content/camera`

### Connection Failed

**Problem:** Can't connect to server

**Solution:**
- Verify server is running: http://localhost:3001/health
- Check firewall settings
- Ensure correct CORS_ORIGIN in server/.env

### Port Already in Use

**Problem:** `Port 3001 is already in use`

**Solution:**
```bash
# Kill process on port (macOS/Linux)
lsof -ti:3001 | xargs kill

# Or change port in server/.env
PORT=3002
```

### WebRTC Connection Timeout

**Problem:** Can't establish peer connection

**Solution:**
- Configure a TURN server (see README.md)
- Check network/firewall settings
- Try different network

## 📖 Next Steps

### Learn More

- [Full Documentation](README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guide](CONTRIBUTING.md)

### Explore Features

- Real-time video and audio
- Screen sharing
- Chat functionality
- Participant management
- Connection quality monitoring

### Customize

- Add your branding
- Modify UI colors
- Add new features
- Integrate with your backend

## 🆘 Need Help?

1. Check [README.md](README.md) for detailed docs
2. Review [Common Issues](#common-issues) above
3. Open an issue on GitHub
4. Check existing issues/discussions

## 🎯 Production Deployment

Ready to deploy? See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Docker deployment
- Cloud deployment (AWS, GCP, etc.)
- SSL/HTTPS setup
- Domain configuration
- Scaling strategies

---

**Congratulations!** 🎉 You now have a fully functional video conferencing platform running locally!

Enjoy exploring and building with GDSC Meet Platform! 🚀
