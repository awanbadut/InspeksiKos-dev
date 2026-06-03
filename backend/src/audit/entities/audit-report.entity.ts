import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection } from '../../inspections/entities/inspection.entity';

export enum ConfidenceLevel {
  VALID = 'VALID',
  PARTIAL_VALID = 'PARTIAL_VALID',
  FATAL_FRAUD = 'FATAL_FRAUD',
}

@Entity('AUDIT_REPORTS')
export class AuditReport {
  @PrimaryGeneratedColumn('uuid')
  report_id: string;

  @Column({ type: 'uuid', unique: true })
  inspection_id: string;

  @OneToOne(() => Inspection, (inspection) => inspection.audit_report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({
    type: 'enum',
    enum: ConfidenceLevel,
  })
  confidence_level: ConfidenceLevel;

  @Column({ type: 'jsonb' })
  breakdown_data: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  pdf_url: string;

  @CreateDateColumn({ type: 'timestamp' })
  generated_at: Date;
}
