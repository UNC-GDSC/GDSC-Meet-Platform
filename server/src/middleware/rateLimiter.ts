import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();

      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        return next();
      }

      this.store[key].count++;

      if (this.store[key].count > this.maxRequests) {
        logger.warn(`Rate limit exceeded for IP: ${key}`);
        return res.status(429).json({
          error: 'Too many requests, please try again later.',
        });
      }

      next();
    };
  }
}

export default RateLimiter;
