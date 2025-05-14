import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ConfigService } from '../config/config.service';
import { RedisProvider } from '../config/redis.provider';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [SessionController],
  providers: [SessionService, RedisProvider, ConfigService],
  exports: [SessionService],
})
export class SessionModule {}
