import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, LoginDto, ForceLoginDto } from './dto/auth.dto';
import { UserRole } from './dto/auth.dto';
import { SessionService } from '../session/session.service';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private sessionService: SessionService,
  ) {}

  // User signup method
  async signup(dto: SignupDto, req?: Request) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const role = dto.role || 'buyer';

    if (dto.deposit !== undefined && role !== UserRole.BUYER) {
      throw new BadRequestException('Only buyers can have deposits');
    }

    const userCreationResponse = await this.userService.createUser({
      email: dto.email,
      password: hashed,
      role: role,
      username: dto.username,
      deposit: role === UserRole.BUYER ? dto.deposit : undefined,
    });

    const user = userCreationResponse.user;

    const token = this.signToken(
      user.id,
      user.email,
      user.role,
      user.username,
      user.deposit || 0,
    );

    // Device ID and session metadata
    const deviceId = uuidv4();
    const ip = req?.ip || req?.socket?.remoteAddress || 'unknown';
    const userAgent = req?.headers['user-agent'] || 'unknown';

    const sessionId = await this.sessionService.createDeviceSession(
      user.id,
      deviceId,
      {
        ip,
        userAgent,
        loginTime: new Date(),
      },
    );

    return {
      message: userCreationResponse.message,
      access_token: token,
      session_id: sessionId,
      device_id: deviceId,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        deposit: user.deposit || 0,
      },
    };
  }

  // User login method with active session check
  async login(dto: LoginDto, req: Request) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check for existing active sessions
    const existingSessions = await this.sessionService.getAllUserSessions(
      user.id,
    );

    if (existingSessions.length > 0) {
      return {
        message: 'There are active sessions on this account.',
        active_sessions: existingSessions.map(s => ({
          sessionId: s.sessionId,
          ip: s.ip,
          userAgent: s.userAgent,
          loginTime: s.loginTime,
          lastActivity: s.lastActivity,
        })),
        decision_required: true,
        options: {
          forceLoginWithTerminate: true,
          forceLoginWithoutTerminate: true,
        },
      };
    }

    // If no active sessions, proceed normally (rare case)
    const access_token = this.signToken(
      user.id,
      user.email,
      user.role,
      user.username,
      user.deposit || 0,
    );

    const deviceId = uuidv4();
    const ip = req.ip || req?.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const sessionId = await this.sessionService.createDeviceSession(
      user.id,
      deviceId,
      {
        ip,
        userAgent,
        loginTime: new Date(),
      },
    );

    return {
      message: 'Login successful. No other active sessions found.',
      access_token,
      session_id: sessionId,
      device_id: deviceId,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        deposit: user.deposit || 0,
      },
    };
  }

  // Force login even if there are active sessions
  async forceLogin(
    dto: ForceLoginDto,
    req: Request,
    terminateOtherSessions: boolean = false,
  ) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Terminate other sessions if required
    if (terminateOtherSessions) {
      await this.sessionService.terminateAllUserSessions(user.id);
    }

    const access_token = this.signToken(
      user.id,
      user.email,
      user.role,
      user.username,
      user.deposit || 0,
    );

    const deviceId = uuidv4();
    const ip = req.ip || req?.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const sessionId = await this.sessionService.createDeviceSession(
      user.id,
      deviceId,
      {
        ip,
        userAgent,
        loginTime: new Date(),
      },
    );

    return {
      message: terminateOtherSessions
        ? 'Force login successful. All other sessions terminated.'
        : 'Force login successful. Other sessions remain active.',
      access_token,
      session_id: sessionId,
      device_id: deviceId,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        deposit: user.deposit || 0,
      },
    };
  }

  // Get the current user details
  async getCurrentUser(userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // Logout from all devices
  async logoutAll(userId: number): Promise<number> {
    return this.sessionService.terminateAllUserSessions(userId);
  }

  // Generate JWT token
  private signToken(
    userId: number,
    email: string,
    role: string,
    username: string,
    deposit: number,
  ) {
    const payload = { id: userId, email, role, username, deposit };
    return this.jwt.sign(payload, { expiresIn: '1h' });
  }
}
