import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MysqlModule } from './mysql/mysql.module';
import { ConfigModule } from './config/config.module';
import { DepositModule } from './deposit/deposit.module';
import { ProductModule } from './product/product.module';
import { BuyModule } from './buy/buy.module';
import { SessionModule } from './session/session.module';
import { SalesModule } from './sales/sales.module';

import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/role.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '1h' },
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    UserModule,
    AuthModule,
    MysqlModule,
    ConfigModule,
    DepositModule,
    ProductModule,
    BuyModule,
    SessionModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,

    //Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Ensures all routes are protected
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Enforces role-based access
    },
  ],
})
export class AppModule {}
