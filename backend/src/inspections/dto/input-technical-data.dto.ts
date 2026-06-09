import { IsNumber, Min, IsOptional, IsObject } from 'class-validator';

export class InputTechnicalDataDto {
  @IsNumber({}, { message: 'Nilai TDS harus berupa angka' })
  @Min(0, { message: 'Nilai TDS tidak boleh negatif' })
  tds_value: number;

  @IsNumber({}, { message: 'Kecepatan internet harus berupa angka' })
  @Min(0, { message: 'Kecepatan internet tidak boleh negatif' })
  internet_speed: number;

  @IsOptional()
  @IsObject()
  inspector_data?: Record<string, any>;
}
