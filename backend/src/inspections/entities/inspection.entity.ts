import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../auth/entities/user.entity';
import { InspectionPhoto } from './inspection-photo.entity';
import { AuditReport } from '../../audit/entities/audit-report.entity';

export enum InspectionStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('INSPECTIONS')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  inspection_id: string;

  @Column({ type: 'uuid' })
  property_id: string;

  @ManyToOne(() => Property, (property) => property.inspections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'uuid', nullable: true })
  inspector_id: string;

  @ManyToOne(() => User, (user) => user.inspections, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'inspector_id' })
  inspector: User;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.ASSIGNED,
  })
  status: InspectionStatus;

  @Column({ type: 'jsonb', nullable: true })
  extracted_data: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tds_value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  internet_speed: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assigned_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @OneToMany(() => InspectionPhoto, (photo) => photo.inspection)
  photos: InspectionPhoto[];

  @OneToOne(() => AuditReport, (report) => report.inspection)
  audit_report: AuditReport;
}
