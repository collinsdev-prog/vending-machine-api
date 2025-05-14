import {
  Controller,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';
import { Request } from 'express';

@Controller('sessions')
@UseGuards(SessionGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // GET /sessions - Get all active sessions for the logged-in user
  @Get()
  async getActiveSessions(@Req() req: Request) {
    const user = req.user as { id: number };

    // Get all session data for the user
    const sessions = await this.sessionService.getAllUserSessions(user.id);

    // Map through the sessions and format the data as needed
    const sessionDataList = sessions.map(session => ({
      deviceId: session.sessionId,
      sessionId: session.sessionId,
      ip: session.ip,
      userAgent: session.userAgent,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      location: session.location ?? null,
    }));

    return {
      userId: user.id,
      activeSessions: sessionDataList,
    };
  }

  // DELETE /sessions/:deviceId - Terminate session by deviceId
  @Delete(':deviceId')
  async terminateSession(
    @Req() req: Request,
    @Param('deviceId') deviceId: string,
  ) {
    const user = req.user as { id: number };

    const existingSession = await this.sessionService.getUserSession(
      user.id,
      deviceId,
    );
    if (!existingSession) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    await this.sessionService.terminateSession(user.id, deviceId);
    return { message: `Session on device ${deviceId} terminated.`, deviceId };
  }

  // DELETE /sessions - Terminate all sessions
  @Delete()
  async terminateAllSessions(@Req() req: Request) {
    const user = req.user as { id: number };
    const deletedCount = await this.sessionService.terminateAllUserSessions(
      user.id,
    );
    return { message: `Terminated ${deletedCount} sessions.` };
  }
}
