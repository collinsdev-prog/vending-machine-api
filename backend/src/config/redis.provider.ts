import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from './config.service';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    // Get Redis configuration from config service
    const host = configService.get('REDIS_HOST') || 'localhost';
    const port = parseInt(configService.get('REDIS_PORT') || '6379', 10);

    // Create and return Redis client
    return new Redis({
      host,
      port,
      // Add any additional Redis configuration options here
      // For example, if you need a password:
      // password: configService.get('REDIS_PASSWORD'),
      // or if you want to use a specific database:
      // db: parseInt(configService.get('REDIS_DB') || '0', 10),
      // for this project, i did not use it 😁
    });
  },
  inject: [ConfigService],
};
