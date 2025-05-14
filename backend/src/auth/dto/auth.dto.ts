import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateIf,
  IsOptional,
  IsBoolean,
  // Max,
  // IsArray,
} from 'class-validator';

// Define the possible roles
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

export class SignupDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(UserRole, { message: 'Role must be either "buyer" or "seller"' })
  role: UserRole;

  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ValidateIf(
    (obj: SignupDto) => obj.role === UserRole.BUYER || obj.role === undefined,
  )
  @IsNumber({}, { message: 'Deposit must be a number' })
  @Min(0, { message: 'Deposit must be at least 0' })
  deposit?: number;

  constructor() {
    // If the role is BUYER and deposit is not provided, set it to 0
    if (
      this.role === UserRole.BUYER &&
      (this.deposit === undefined || this.deposit === null)
    ) {
      this.deposit = 0;
    }
  }
}

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsBoolean()
  forceLogout?: boolean;

  @IsOptional()
  @IsBoolean()
  terminateOtherSessions?: boolean;
}

export class ForceLoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsBoolean()
  terminateOtherSessions?: boolean;
}
