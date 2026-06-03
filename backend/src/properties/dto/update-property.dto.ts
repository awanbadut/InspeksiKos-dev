import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { PropertyStatus } from '../entities/property.entity';

export class UpdatePropertyDto {
  @IsString({ message: 'Nama properti harus berupa string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Alamat harus berupa string' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Deskripsi harus berupa string' })
  @IsOptional()
  description?: string;

  @IsObject({ message: 'Data klaim fasilitas harus berupa objek JSON' })
  @IsOptional()
  claim_data?: Record<string, any>;

  @IsEnum(PropertyStatus, { message: 'Status tidak valid' })
  @IsOptional()
  status?: PropertyStatus;
}
