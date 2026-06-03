import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePropertyDto {
  @IsString({ message: 'Nama properti harus berupa string' })
  @IsNotEmpty({ message: 'Nama properti tidak boleh kosong' })
  name: string;

  @IsString({ message: 'Alamat harus berupa string' })
  @IsNotEmpty({ message: 'Alamat tidak boleh kosong' })
  address: string;

  @IsString({ message: 'Deskripsi harus berupa string' })
  @IsOptional()
  description?: string;

  @IsObject({ message: 'Data klaim fasilitas harus berupa objek JSON' })
  @IsNotEmpty({ message: 'Data klaim fasilitas tidak boleh kosong' })
  claim_data: Record<string, any>;
}
