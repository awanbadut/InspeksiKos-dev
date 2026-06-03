import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal harus 6 karakter' })
  password: string;

  @IsEnum(UserRole, { message: 'Role harus berupa mahasiswa, inspektur, atau admin' })
  @IsOptional()
  role?: UserRole;
}
