import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditRule } from './audit-rule.entity';

@Entity('AUDIT_RULE_ITEMS')
export class AuditRuleItem {
  @PrimaryGeneratedColumn('uuid')
  item_id: string;

  @Column({ type: 'uuid' })
  rule_id: string;

  @ManyToOne(() => AuditRule, (rule) => rule.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  audit_rule: AuditRule;

  @Column({ type: 'varchar', length: 100 })
  facility_name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  penalty: number;

  @Column({ type: 'varchar', length: 50 })
  threshold_type: string; // e.g., 'boolean', 'range', 'numeric'

  @Column({ type: 'text', nullable: true })
  threshold_value: string;
}
