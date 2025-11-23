# Production Deployment & Operations Guide

This guide covers advanced production deployment, monitoring, and operations for GDSC Meet Platform.

## Table of Contents

- [Production Features](#production-features)
- [Advanced Deployment](#advanced-deployment)
- [Monitoring & Observability](#monitoring--observability)
- [Security](#security)
- [Performance Tuning](#performance-tuning)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

## Production Features

### Authentication & Security
- ✅ Password-protected rooms
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation

### Advanced Room Features
- ✅ Waiting room functionality
- ✅ Host controls (kick, mute, lock)
- ✅ Room recording
- ✅ Hand raise & reactions
- ✅ Maximum participant limits

### Infrastructure
- ✅ Kubernetes deployment
- ✅ Horizontal Pod Autoscaling
- ✅ Load balancing
- ✅ Health checks
- ✅ CI/CD pipelines

## Advanced Deployment

### Kubernetes Deployment

1. **Apply configurations**
   ```bash
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   kubectl apply -f k8s/ingress.yaml
   kubectl apply -f k8s/hpa.yaml
   ```

2. **Verify deployment**
   ```bash
   kubectl get pods -l app=gdsc-meet
   kubectl get svc gdsc-meet-server gdsc-meet-client
   kubectl get ingress gdsc-meet-ingress
   ```

3. **Check logs**
   ```bash
   kubectl logs -f deployment/gdsc-meet-server
   kubectl logs -f deployment/gdsc-meet-client
   ```

### Auto-scaling Configuration

The platform includes Horizontal Pod Autoscaling (HPA):

**Server HPA:**
- Min replicas: 3
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

**Client HPA:**
- Min replicas: 2
- Max replicas: 5
- CPU threshold: 70%

## Monitoring & Observability

### Metrics

The platform exposes metrics at `/metrics` endpoint:

**Room Metrics:**
- `gdsc_meet_active_rooms` - Number of active rooms
- `gdsc_meet_total_participants` - Total participants across all rooms
- `gdsc_meet_participants_per_room` - Participants per room

**Performance Metrics:**
- `gdsc_meet_connection_duration` - WebRTC connection duration
- `gdsc_meet_message_rate` - Chat messages per second
- `gdsc_meet_signal_latency` - WebRTC signaling latency

### Prometheus Setup

1. **Install Prometheus**
   ```bash
   helm install prometheus prometheus-community/prometheus
   ```

2. **Apply monitoring config**
   ```bash
   kubectl apply -f k8s/monitoring.yaml
   ```

### Grafana Dashboards

Pre-configured dashboards include:
- Active rooms and participants
- Resource usage (CPU, Memory)
- Network throughput
- Error rates
- Connection quality

**Access Grafana:**
```bash
kubectl port-forward svc/grafana 3000:80
# Visit http://localhost:3000
```

### Logging

Logs are structured JSON format with Winston:

**Log Levels:**
- `error`: Critical errors requiring immediate attention
- `warn`: Warning conditions
- `info`: Informational messages (default in production)
- `debug`: Debug messages (development only)

**Log Aggregation:**
```bash
# Using ELK Stack
kubectl apply -f k8s/elasticsearch.yaml
kubectl apply -f k8s/logstash.yaml
kubectl apply -f k8s/kibana.yaml
```

## Security

### SSL/TLS

**With cert-manager:**
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Rate Limiting

Rate limiting is configured per IP:
- 100 requests per minute (default)
- Customizable in `RateLimiter` class

**Adjust limits:**
```typescript
// server/src/index.ts
const rateLimiter = new RateLimiter(60000, 100); // windowMs, maxRequests
```

### Password Protection

Rooms can be password-protected:
- Passwords are hashed with PBKDF2
- Salt is unique per room
- Automatic cleanup after 24 hours

## Performance Tuning

### Server Optimization

**Node.js Settings:**
```bash
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"
```

**Socket.IO:**
```typescript
// Adjust ping intervals
pingTimeout: 60000,
pingInterval: 25000,
```

### Client Optimization

**Video Quality Settings:**
```typescript
video: {
  width: { ideal: 1280, max: 1920 },
  height: { ideal: 720, max: 1080 },
  frameRate: { ideal: 30, max: 60 },
}
```

**Bandwidth Adaptation:**
- Automatic quality adjustment based on network
- Configurable in WebRTC service

### Database Optimization

For production with persistence:
- Use PostgreSQL for room metadata
- Use Redis for session management
- Connection pooling
- Query optimization

## Scaling

### Horizontal Scaling

**Scale manually:**
```bash
kubectl scale deployment gdsc-meet-server --replicas=5
kubectl scale deployment gdsc-meet-client --replicas=3
```

**Auto-scaling is configured** via HPA (see k8s/hpa.yaml)

### Load Balancing

Nginx Ingress Controller provides:
- Round-robin load balancing
- WebSocket support
- SSL termination
- Health checks

### Redis for Multi-Server

For multi-server setups, use Redis adapter:

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## CI/CD Pipeline

### GitHub Actions

Automated pipeline includes:
1. **Testing** - Run tests on every PR
2. **Building** - Build Docker images
3. **Security Scanning** - Trivy & CodeQL
4. **Deployment** - Auto-deploy to Kubernetes

**Required Secrets:**
- `DOCKER_HUB_USERNAME`
- `DOCKER_HUB_TOKEN`
- `KUBE_CONFIG`

### Manual Deployment

```bash
# Build images
docker-compose build

# Push to registry
docker push yourusername/gdsc-meet-server:latest
docker push yourusername/gdsc-meet-client:latest

# Deploy to Kubernetes
kubectl set image deployment/gdsc-meet-server \
  server=yourusername/gdsc-meet-server:latest

kubectl set image deployment/gdsc-meet-client \
  client=yourusername/gdsc-meet-client:latest
```

## Troubleshooting

### High CPU Usage

**Check resource limits:**
```bash
kubectl top pods
kubectl describe pod <pod-name>
```

**Solutions:**
- Increase resource limits
- Scale horizontally
- Optimize code

### Connection Issues

**Check WebRTC connectivity:**
```bash
# Verify STUN/TURN servers
curl -v stun:stun.l.google.com:19302
```

**Solutions:**
- Configure TURN server
- Check firewall rules
- Verify network policies

### Pod Crashes

**Check logs:**
```bash
kubectl logs -f <pod-name>
kubectl describe pod <pod-name>
```

**Common causes:**
- Out of memory (increase limits)
- Startup probe failure (adjust timeouts)
- Configuration errors

### Database Connection Issues

**Verify connectivity:**
```bash
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- psql -h postgres-service -U postgres
```

## Best Practices

### Production Checklist

- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Monitoring in place
- [ ] Backups configured
- [ ] Scaling policies set
- [ ] Logging aggregation
- [ ] Alert notifications
- [ ] Disaster recovery plan
- [ ] Security scanning enabled
- [ ] Performance testing done

### Monitoring Alerts

Configure alerts for:
- High error rates (> 1%)
- High response times (> 1s)
- Resource usage (> 80%)
- Pod failures
- Certificate expiration

### Backup Strategy

**What to backup:**
- Room configurations (if using database)
- Recordings
- User data
- Application logs

**Frequency:**
- Database: Every 6 hours
- Recordings: Real-time to cloud storage
- Logs: Retain for 30 days

## Support

For production issues:
1. Check logs: `kubectl logs deployment/gdsc-meet-server`
2. Review metrics: Grafana dashboard
3. Consult troubleshooting guide above
4. Open GitHub issue with details

---

**Production-ready ✓** - Built for scale, security, and reliability.
