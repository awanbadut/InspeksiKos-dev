import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection } from '../inspections/entities/inspection.entity';
import { RiwayatService } from './riwayat.service';
import { RiwayatController } from './riwayat.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inspection]),
    AuthModule,
  ],
  controllers: [RiwayatController],
  providers: [RiwayatService],
  exports: [RiwayatService],
})
export class RiwayatModule {}
