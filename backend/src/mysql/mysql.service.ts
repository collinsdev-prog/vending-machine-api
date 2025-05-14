import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  createPool,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

@Injectable()
export class MysqlService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  onModuleInit() {
    // Use the values from the .env file
    this.pool = createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vascon_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('✅ MySQL pool created');
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('🔌 MySQL pool closed');
  }

  async query<T extends RowDataPacket[] = RowDataPacket[]>(
    sql: string,
    params: any[] = [],
  ): Promise<T> {
    const [rows] = await this.pool.execute<T>(sql, params);
    return rows;
  }

  async execute<T = ResultSetHeader>(
    sql: string,
    params: any[] = [],
  ): Promise<[T, any]> {
    return this.pool.execute(sql, params) as Promise<[T, any]>;
  }

  async getConnection() {
    if (!this.pool) throw new Error('MySQL pool is not initialized');
    return this.pool.getConnection();
  }
}
