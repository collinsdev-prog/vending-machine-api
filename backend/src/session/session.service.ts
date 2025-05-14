import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

interface SessionMeta {
  ip: string;
  userAgent: string;
  loginTime: Date;
  location?: string;
}

interface SessionData {
  sessionId: string;
  ip: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  location?: string;
}

@Injectable()
export class SessionService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  private generateSessionId(): string {
    return uuidv4();
  }

  // Create a device-specific session
  async createDeviceSession(
    userId: number,
    deviceId: string,
    metadata: SessionMeta,
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const key = `user_session:${userId}:${deviceId}`;

    const sessionData: SessionData = {
      sessionId,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
      loginTime: metadata.loginTime.toISOString(),
      lastActivity: new Date().toISOString(),
      location: metadata.location,
    };

    await this.redisClient.set(key, JSON.stringify(sessionData), 'EX', 3600);
    return sessionId;
  }

  // Validate a specific session
  async validateSession(
    userId: number,
    deviceId: string,
    sessionId: string,
  ): Promise<boolean> {
    const key = `user_session:${userId}:${deviceId}`;
    const sessionData = await this.redisClient.get(key);
    if (!sessionData) return false;

    try {
      const parsed = JSON.parse(sessionData) as SessionData;
      return parsed.sessionId === sessionId;
    } catch {
      return false;
    }
  }

  // Retrieve a specific session
  async getUserSession(
    userId: number,
    deviceId: string,
  ): Promise<SessionData | null> {
    const key = `user_session:${userId}:${deviceId}`;
    const session = await this.redisClient.get(key);
    return session ? (JSON.parse(session) as SessionData) : null;
  }

  // Get all active session keys for a user
  async getAllUserSessions(userId: number): Promise<SessionData[]> {
    const pattern = `user_session:${userId}:*`;
    const keys = await this.redisClient.keys(pattern);

    const sessions = await Promise.all(
      keys.map(async key => {
        const session = await this.redisClient.get(key);
        return session ? (JSON.parse(session) as SessionData) : null;
      }),
    );

    return sessions.filter(session => session !== null);
  }

  // Terminate a specific session for a user
  async terminateSession(userId: number, deviceId: string): Promise<number> {
    const key = `user_session:${userId}:${deviceId}`;
    return this.redisClient.del(key);
  }

  // Terminate all sessions for a user across all devices
  async terminateAllUserSessions(userId: number): Promise<number> {
    const pattern = `user_session:${userId}:*`;
    const keys = await this.redisClient.keys(pattern);
    return keys.length > 0 ? this.redisClient.del(...keys) : 0;
  }
}
