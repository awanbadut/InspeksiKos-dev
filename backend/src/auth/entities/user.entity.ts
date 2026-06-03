import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Inspection } from '../../inspections/entities/inspection.entity';
import { AuditRule } from '../../audit/entities/audit-rule.entity';

export enum UserRole {
  MAHASISWA = 'mahasiswa',
  INSPEKTUR = 'inspektur',
  ADMIN = 'admin',
}

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MAHASISWA,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Property, (property) => property.user)
  properties: Property[];

  @OneToMany(() => Inspection, (inspection) => inspection.inspector)
  inspections: Inspection[];

  @OneToMany(() => AuditRule, (auditRule) => auditRule.created_by)
  created_rules: AuditRule[];
}
