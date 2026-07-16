import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthService {
  private otpMap = new Map<string, { otp: string; expires: number }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  async sendOtp(email: string): Promise<{ message: string }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpMap.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    const subject = 'Kode OTP Pendaftaran InspeksiKos';
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #1F3E5A; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">Verifikasi Akun InspeksiKos</h2>
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di <strong>InspeksiKos</strong>. Gunakan kode verifikasi (OTP) berikut untuk menyelesaikan pendaftaran akun Anda:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; color: #3B82F6; font-size: 32px; letter-spacing: 5px; font-weight: 800; font-family: monospace;">${otp}</h1>
        </div>
        <p style="font-size: 11px; color: #64748b; line-height: 1.5;">Kode verifikasi ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun demi keamanan akun Anda.</p>
        <p style="font-size: 11px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
          Tim InspeksiKos - Politeknik Negeri Padang
        </p>
      </div>
    `;

    await this.notificationService.sendEmail(email, subject, htmlContent);

    return { message: 'Kode OTP berhasil dikirim ke email Anda' };
  }

  async register(registerDto: RegisterDto, isStaff = false): Promise<{ message: string; user: Omit<User, 'password_hash'> }> {
    const { email, password, first_name, last_name, phone_number, role, otp } = registerDto;

    // Verify OTP only if not registering staff
    if (!isStaff) {
      const storedOtpData = this.otpMap.get(email);
      if (!storedOtpData || storedOtpData.otp !== otp) {
        throw new BadRequestException('Kode OTP salah atau tidak ditemukan');
      }
      if (Date.now() > storedOtpData.expires) {
        this.otpMap.delete(email);
        throw new BadRequestException('Kode OTP telah kedaluwarsa');
      }
      this.otpMap.delete(email);
    }

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
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        role: true,
        created_at: true,
      },
    });
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        role: true,
        created_at: true,
      },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Email tidak terdaftar');
    }

    // Generate random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.reset_code = resetCode;
    user.reset_code_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await this.userRepository.save(user);

    // Send email with reset code
    const subject = 'Kode Verifikasi Lupa Password - InspeksiKos';
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #003057; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Atur Ulang Kata Sandi</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun InspeksiKos Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; text-align: center;">
          <h1 style="margin: 0; color: #3b82f6; font-size: 32px; letter-spacing: 5px; font-weight: 800;">${resetCode}</h1>
          <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b;">Kode ini berlaku selama 15 menit.</p>
        </div>
        <p>Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini atau hubungi bantuan kami.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Pesan ini dikirim secara otomatis oleh sistem InspeksiKos - Politeknik Negeri Padang.
        </p>
      </div>
    `;

    const waMessage = `Halo,\n\nKode verifikasi untuk menyetel ulang kata sandi akun InspeksiKos Anda adalah: *${resetCode}*\n\nKode ini berlaku selama 15 menit. Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan pesan ini.\n\nTerima kasih,\n*Tim InspeksiKos*`;

    await Promise.all([
      this.notificationService.sendEmail(user.email, subject, emailHtml),
      user.phone_number
        ? this.notificationService.sendWhatsApp(user.phone_number, waMessage)
        : Promise.resolve(),
    ]).catch((err) => {
      console.error('Failed to send verification notifications:', err.message);
    });

    return { message: 'Kode verifikasi berhasil dikirim ke email dan WhatsApp Anda' };
  }

  async resetPassword(resetDto: any): Promise<{ message: string }> {
    const { email, code, new_password } = resetDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Email tidak terdaftar');
    }

    if (!user.reset_code || user.reset_code !== code) {
      throw new BadRequestException('Kode verifikasi salah');
    }

    if (new Date() > user.reset_code_expires_at) {
      throw new BadRequestException('Kode verifikasi telah kedaluwarsa');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    // Save user with new password and clear reset code
    user.password_hash = password_hash;
    user.reset_code = null as any;
    user.reset_code_expires_at = null as any;

    await this.userRepository.save(user);

    return { message: 'Kata sandi berhasil diatur ulang' };
  }
}
