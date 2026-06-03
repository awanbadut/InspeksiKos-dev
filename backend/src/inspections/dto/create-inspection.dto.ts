import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateInspectionDto {
  @IsUUID('4', { message: 'Format ID properti tidak valid' })
  @IsNotEmpty({ message: 'ID properti tidak boleh kosong' })
  property_id: string;
}
