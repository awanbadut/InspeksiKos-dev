import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RiwayatService } from './riwayat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('riwayat')
@UseGuards(JwtAuthGuard)
export class RiwayatController {
  constructor(private readonly riwayatService: RiwayatService) {}

  @Get()
  async getRiwayat(
    @GetUser('user_id') userId: string,
    @GetUser('role') role: UserRole,
    @Query('date') date?: string,
    @Query('month') month?: string,
  ) {
    return this.riwayatService.getRiwayat(userId, role, date, month);
  }
}
