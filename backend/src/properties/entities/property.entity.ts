import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Inspection } from '../../inspections/entities/inspection.entity';

export enum PropertyStatus {
  PENDING = 'pending',
  INSPECTED = 'inspected',
  AUDITED = 'audited',
}

@Entity('PROPERTIES')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  property_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  claim_data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.PENDING,
  })
  status: PropertyStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => Inspection, (inspection) => inspection.property)
  inspections: Inspection[];
}
