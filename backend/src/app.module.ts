import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import Entities
import { User } from './auth/entities/user.entity';
import { Property } from './properties/entities/property.entity';
import { Inspection } from './inspections/entities/inspection.entity';
import { InspectionPhoto } from './inspections/entities/inspection-photo.entity';
import { AuditReport } from './audit/entities/audit-report.entity';
import { AuditRule } from './audit/entities/audit-rule.entity';
import { AuditRuleItem } from './audit/entities/audit-rule-item.entity';

import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { InspectionsModule } from './inspections/inspections.module';
import { StorageModule } from './storage/storage.module';
import { AuditModule } from './audit/audit.module';
import { GeminiModule } from './gemini/gemini.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          User,
          Property,
          Inspection,
          InspectionPhoto,
          AuditReport,
          AuditRule,
          AuditRuleItem,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Only sync in development
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    PropertiesModule,
    InspectionsModule,
    StorageModule,
    AuditModule,
    GeminiModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
