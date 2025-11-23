# Deployment Guide

This guide covers various deployment options for GDSC Meet Platform.

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Production Checklist](#production-checklist)

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone and configure**
   ```bash
   git clone <repository-url>
   cd GDSC-Meet-Platform
   ```

2. **Configure environment variables**

   Edit `docker-compose.yml` to set production values:
   ```yaml
   environment:
     - NODE_ENV=production
     - CORS_ORIGIN=https://yourdomain.com
   ```

3. **Build and deploy**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

## Cloud Deployment

### AWS EC2

1. **Launch EC2 instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.medium or larger
   - Security group: Allow ports 80, 443, 3001

2. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo systemctl enable docker
   sudo usermod -aG docker ubuntu
   ```

3. **Deploy application**
   ```bash
   git clone <repository-url>
   cd GDSC-Meet-Platform
   docker-compose up -d
   ```

4. **Configure domain** (optional)
   - Point DNS to EC2 public IP
   - Set up SSL with Let's Encrypt

### Google Cloud Platform

1. **Create Compute Engine instance**
   ```bash
   gcloud compute instances create gdsc-meet \
     --machine-type=e2-medium \
     --image-family=ubuntu-2204-lts \
     --image-project=ubuntu-os-cloud \
     --tags=http-server,https-server
   ```

2. **SSH and deploy**
   ```bash
   gcloud compute ssh gdsc-meet
   # Follow Docker deployment steps
   ```

### DigitalOcean

1. **Create Droplet**
   - Ubuntu 22.04
   - 2 GB RAM / 1 vCPU minimum

2. **Deploy via SSH**
   ```bash
   ssh root@your-droplet-ip
   # Follow Docker deployment steps
   ```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster
- kubectl configured
- Helm (optional)

### Deployment Files

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gdsc-meet-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gdsc-meet-server
  template:
    metadata:
      labels:
        app: gdsc-meet-server
    spec:
      containers:
      - name: server
        image: gdsc-meet-server:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
---
apiVersion: v1
kind: Service
metadata:
  name: gdsc-meet-server
spec:
  selector:
    app: gdsc-meet-server
  ports:
  - port: 3001
    targetPort: 3001
  type: LoadBalancer
```

### Deploy

```bash
kubectl apply -f deployment.yaml
kubectl get services
```

## SSL/TLS Configuration

### Using Nginx with Let's Encrypt

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Production Checklist

### Security

- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Set strong environment variables
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use secure WebSocket (WSS)

### Performance

- [ ] Enable gzip compression
- [ ] Configure CDN (optional)
- [ ] Set up caching
- [ ] Optimize images
- [ ] Enable HTTP/2

### Monitoring

- [ ] Set up logging
- [ ] Configure error tracking (Sentry)
- [ ] Monitor server resources
- [ ] Set up uptime monitoring
- [ ] Configure alerts

### Backup

- [ ] Database backups (if applicable)
- [ ] Configuration backups
- [ ] Automated backup schedule

### Scaling

- [ ] Load balancer configuration
- [ ] Auto-scaling rules
- [ ] Database replication
- [ ] CDN integration

## Environment Variables

### Production Server

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
MAX_PARTICIPANTS_PER_ROOM=50
LOG_LEVEL=warn
```

### Production Client

```env
VITE_SERVER_URL=https://api.yourdomain.com
VITE_STUN_SERVER=stun:stun.l.google.com:19302
```

## Monitoring & Logging

### Server Logs

```bash
# Docker
docker-compose logs -f server

# Direct
tail -f server/logs/combined.log
```

### Health Check

```bash
curl http://localhost:3001/health
```

## Troubleshooting

### Container Won't Start

```bash
docker-compose logs server
docker-compose logs client
```

### High Memory Usage

- Increase container memory limits
- Check for memory leaks
- Reduce max participants

### SSL Issues

- Verify certificate paths
- Check domain DNS
- Ensure ports 80/443 are open

## Support

For deployment issues, please open an issue on GitHub with:
- Deployment method
- Error logs
- Configuration (sanitized)
