import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection } from './entities/inspection.entity';
import { InspectionPhoto } from './entities/inspection-photo.entity';
import { Property } from '../properties/entities/property.entity';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inspection, InspectionPhoto, Property]),
    AuthModule,
    StorageModule,
  ],
  controllers: [InspectionsController],
  providers: [InspectionsService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
