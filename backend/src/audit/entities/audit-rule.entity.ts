import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { AuditRuleItem } from './audit-rule-item.entity';

@Entity('AUDIT_RULES')
export class AuditRule {
  @PrimaryGeneratedColumn('uuid')
  rule_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @ManyToOne(() => User, (user) => user.created_rules, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => AuditRuleItem, (item) => item.audit_rule)
  items: AuditRuleItem[];
}
