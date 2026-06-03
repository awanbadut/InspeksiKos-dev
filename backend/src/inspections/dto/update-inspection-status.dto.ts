import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { InspectionStatus } from '../entities/inspection.entity';

export class UpdateInspectionStatusDto {
  @IsEnum(InspectionStatus, { message: 'Status tidak valid' })
  status: InspectionStatus;

  @IsUUID('4', { message: 'Format ID inspektur tidak valid' })
  @IsOptional()
  inspector_id?: string;
}
