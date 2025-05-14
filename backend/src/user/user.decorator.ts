import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PublicUser } from '../auth/auth.controller';

export const User = createParamDecorator(
  (data: keyof PublicUser | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as PublicUser | undefined;

    if (!user) {
      throw new Error(
        'User not found in request. Make sure JwtAuthGuard is applied.',
      );
    }

    return data ? user[data] : user;
  },
);
// This decorator extracts the user information from the request object.
