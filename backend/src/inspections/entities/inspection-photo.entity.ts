import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inspection } from './inspection.entity';

@Entity('INSPECTION_PHOTOS')
export class InspectionPhoto {
  @PrimaryGeneratedColumn('uuid')
  photo_id: string;

  @Column({ type: 'uuid' })
  inspection_id: string;

  @ManyToOne(() => Inspection, (inspection) => inspection.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection;

  @Column({ type: 'text' })
  photo_url: string;

  @Column({ type: 'varchar', length: 100 })
  room_type: string;

  @CreateDateColumn({ type: 'timestamp' })
  uploaded_at: Date;
}
