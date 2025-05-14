import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
// import * as fs from 'fs';

dotenv.config();

@Injectable()
export class ConfigService {
  get(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`${key} is not defined in the environment variables`);
    }
    return value;
  }

  // Add the getOrDefault method used in AuthModule
  getOrDefault<T = string>(key: string, defaultValue: T): T {
    const value = process.env[key];
    if (!value) {
      return defaultValue;
    }
    // If the default is a number or boolean, convert the string value accordingly
    if (typeof defaultValue === 'number') {
      return Number(value) as unknown as T;
    }
    if (typeof defaultValue === 'boolean') {
      return (value.toLowerCase() === 'true') as unknown as T;
    }
    return value as unknown as T;
  }

  // Get typed values with defaults
  getNumber(key: string, defaultValue?: number): number {
    const value = this.getOrDefault(key, defaultValue?.toString());
    if (value === undefined) {
      throw new Error(`${key} is not defined in the environment variables`);
    }
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new Error(`${key} is not a valid number`);
    }
    return parsedValue;
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.getOrDefault(key, defaultValue?.toString());
    if (value === undefined) {
      throw new Error(`${key} is not defined in the environment variables`);
    }
    return value.toLowerCase() === 'true';
  }

  // Helper methods for common config values
  getDatabaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  getPort(): number {
    return this.getNumber('PORT', 3000);
  }

  getNodeEnv(): string {
    return this.getOrDefault('NODE_ENV', 'development');
  }

  // Check if we're in production
  isProduction(): boolean {
    return this.getNodeEnv() === 'production';
  }

  // Get JWT configuration
  getJwtSecret(): string {
    return this.getOrDefault('JWT_SECRET', 'FALLBACK_SECRET');
  }

  getJwtExpiresIn(): string {
    return this.getOrDefault('JWT_EXPIRES_IN', '1h');
  }
}
