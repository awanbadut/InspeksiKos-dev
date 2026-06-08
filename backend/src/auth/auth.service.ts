import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; user: Omit<User, 'password_hash'> }> {
    const { email, password, first_name, last_name, phone_number, role } = registerDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = this.userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      phone_number,
      role: role || UserRole.MAHASISWA,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Exclude password_hash in response
    const { password_hash: _, ...userWithoutPassword } = savedUser;

    return {
      message: 'Registrasi berhasil',
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; refresh_token: string; role: string; email: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Generate tokens
    const payload = { sub: user.user_id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);
    
    // Refresh token has a different signature / payload or options
    const refresh_token = this.jwtService.sign(
      { sub: user.user_id },
      { expiresIn: '7d' }, // Refresh token valid for 7 days
    );

    return {
      access_token,
      refresh_token,
      role: user.role,
      email: user.email,
    };
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({ where: { user_id: payload.sub } });
      
      if (!user) {
        throw new UnauthorizedException('User tidak ditemukan');
      }

      // Generate new access token
      const newPayload = { sub: user.user_id, email: user.email, role: user.role };
      const access_token = this.jwtService.sign(newPayload);

      return { access_token };
    } catch (err) {
      throw new UnauthorizedException('Refresh token tidak valid atau kadaluwarsa');
    }
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new UnauthorizedException('User tidak valid');
    }
    return user;
  }

  async findInspectors(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.INSPEKTUR },
      select: ['user_id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'created_at'],
    });
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['user_id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'created_at'],
    });
  }
}
