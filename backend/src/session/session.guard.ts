import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from './session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  private readonly logger = new Logger(SessionGuard.name);

  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: number; role: string } | undefined;

    // Check if the route requires session validation to be skipped
    const route = context.getHandler();
    const isSessionValidationSkipped = route.name === 'getActiveSessions'; // Skip session validation for `GET /sessions` only
    if (isSessionValidationSkipped) {
      return true; // Skip session validation for `GET /sessions`
    }

    if (!user) {
      this.logger.warn('Missing user in request');
      throw new UnauthorizedException('Authentication required');
    }

    const sessionIdHeader =
      request.headers['session-id'] || request.headers['x-session-id'];
    const deviceIdHeader =
      request.headers['device-id'] || request.headers['x-device-id'];

    if (!sessionIdHeader || Array.isArray(sessionIdHeader)) {
      this.logger.warn(`Missing or invalid session-id for user ${user.id}`);
      throw new UnauthorizedException('Valid session ID is required');
    }

    if (!deviceIdHeader || Array.isArray(deviceIdHeader)) {
      this.logger.warn(`Missing or invalid device-id for user ${user.id}`);
      throw new UnauthorizedException('Valid device ID is required');
    }

    const sessionId = sessionIdHeader.toString();
    const deviceId = deviceIdHeader.toString();

    try {
      const sessionData = await this.sessionService.getUserSession(
        user.id,
        deviceId,
      );

      // If no session data exists
      if (!sessionData) {
        this.logger.warn(
          `No session found for user ${user.id} on device ${deviceId}`,
        );
        throw new UnauthorizedException('Session not found or expired');
      }

      // Validate if the session IDs match
      if (sessionData.sessionId !== sessionId) {
        this.logger.warn(
          `Session mismatch for user ${user.id} on device ${deviceId}`,
        );
        throw new UnauthorizedException('Session is invalid or expired');
      }

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      this.logger.error(
        `Session validation failed for user ${user.id}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new UnauthorizedException('Session validation failed');
    }
  }
}
