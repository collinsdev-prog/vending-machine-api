import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, ForceLoginDto } from './dto/auth.dto';
import { User as GetUser } from '../user/user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionGuard } from '../session/session.guard';
import { Public } from './public.decorator';
import { Request } from 'express';

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Public() // Apply the @Public() decorator, excluding it from jwtauthguard
  signup(@Body() dto: SignupDto, @Req() req: Request) {
    return this.authService.signup(dto, req);
  }

  @Post('login')
  @Public() // Apply the @Public() decorator, excluding it from jwtauthguard
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  @Post('force-login')
  @Public()
  async forceLogin(@Body() dto: ForceLoginDto, @Req() req: Request) {
    const terminateOtherSessions = dto.terminateOtherSessions ?? false;
    return this.authService.forceLogin(dto, req, terminateOtherSessions);
  }

  @UseGuards(JwtAuthGuard, SessionGuard)
  @Get('user')
  async getUser(@GetUser() user: PublicUser) {
    // The @User() decorator will extract the user data from the request (the JWT payload)
    return this.authService.getCurrentUser(user.id);
  }

  @Post('logout/all')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logoutAll(@GetUser() user: PublicUser) {
    const count = await this.authService.logoutAll(user.id);
    return {
      message: `${count} session(s) terminated`,
    };
  }

  //testing
  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  testAuth(@GetUser() user: PublicUser) {
    return {
      message: 'Auth is working',
      userId: user.id,
      userDetails: user,
    };
  }
}
