import {
  ConflictException,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: string;
  deposit?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationResponse {
  message: string;
  user: Omit<UserRecord, 'password'>;
}

@Injectable()
export class UserService {
  constructor(private mysql: MysqlService) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const rows = await this.mysql.query<RowDataPacket[]>(
      'SELECT id, username, email, password, role, deposit FROM `users` WHERE email = ? LIMIT 1',
      [email],
    );
    return (rows as UserRecord[])[0] || null;
  }

  async findById(id: number): Promise<Omit<UserRecord, 'password'> | null> {
    const numericId = Number(id);

    if (isNaN(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    const rows = await this.mysql.query<RowDataPacket[]>(
      'SELECT id, username, email, role, deposit, createdAt, updatedAt FROM `users` WHERE id = ? LIMIT 1',
      [numericId],
    );

    return (rows as Omit<UserRecord, 'password'>[])[0] || null;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const rows = await this.mysql.query<RowDataPacket[]>(
      'SELECT id, username, email, password, role, deposit FROM `users` WHERE username = ? LIMIT 1',
      [username],
    );
    return (rows as UserRecord[])[0] || null;
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    role: string;
    deposit?: number;
  }): Promise<UserCreationResponse> {
    const { username, email, password, role, deposit } = data;

    // Check for existing email
    const emailExists = await this.findByEmail(email);
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Check for existing username
    const usernameExists = await this.findByUsername(username);
    if (usernameExists) {
      throw new ConflictException('Username already exists');
    }

    // Validate deposit based on role
    let finalDeposit = 0; // Default deposit is 0
    if (deposit !== undefined) {
      if (role !== 'buyer') {
        throw new ForbiddenException('Only buyers can have deposits');
      }
      // For buyers, we can set the deposit
      finalDeposit = deposit;
    }

    // Always include deposit in the query, but set it based on role
    const query =
      'INSERT INTO `users` (username, email, password, role, deposit) VALUES (?, ?, ?, ?, ?)';
    const values = [username, email, password, role, finalDeposit];

    const [meta] = await this.mysql.execute<ResultSetHeader>(query, values);
    const insertId = meta.insertId;

    const rows = await this.mysql.query<RowDataPacket[]>(
      'SELECT id, username, email, role, deposit, createdAt, updatedAt FROM `users` WHERE id = ?',
      [insertId],
    );
    const user = (rows as Omit<UserRecord, 'password'>[])[0];

    return {
      message: `User created successfully with username: ${user.username}`,
      user,
    };
  }
}
