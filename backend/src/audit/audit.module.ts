import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditReport } from './entities/audit-report.entity';
import { AuditRule } from './entities/audit-rule.entity';
import { AuditRuleItem } from './entities/audit-rule-item.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { Property } from '../properties/entities/property.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { RuleBasedEngine } from './rule-based.engine';
import { AuthModule } from '../auth/auth.module';
import { GeminiModule } from '../gemini/gemini.module';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditReport,
      AuditRule,
      AuditRuleItem,
      Inspection,
      Property,
    ]),
    AuthModule,
    GeminiModule,
    PdfModule,
    StorageModule,
    NotificationModule,
  ],
  controllers: [AuditController],
  providers: [AuditService, RuleBasedEngine],
  exports: [AuditService, RuleBasedEngine],
})
export class AuditModule {}
