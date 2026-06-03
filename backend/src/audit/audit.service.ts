import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditReport, ConfidenceLevel } from './entities/audit-report.entity';
import { AuditRule } from './entities/audit-rule.entity';
import { AuditRuleItem } from './entities/audit-rule-item.entity';
import { Inspection, InspectionStatus } from '../inspections/entities/inspection.entity';
import { Property } from '../properties/entities/property.entity';
import { GeminiService } from '../gemini/gemini.service';
import { RuleBasedEngine } from './rule-based.engine';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditReport)
    private reportRepository: Repository<AuditReport>,
    @InjectRepository(AuditRule)
    private ruleRepository: Repository<AuditRule>,
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private geminiService: GeminiService,
    private ruleBasedEngine: RuleBasedEngine,
    private pdfService: PdfService,
    private storageService: StorageService,
  ) {}

  async runAudit(inspectionId: string): Promise<AuditReport> {
    // 1. Fetch inspection details
    const inspection = await this.inspectionRepository.findOne({
      where: { inspection_id: inspectionId },
      relations: {
        property: true,
        photos: true,
        audit_report: true,
      },
    });

    if (!inspection) {
      throw new NotFoundException('Sesi inspeksi tidak ditemukan');
    }

    const photos = inspection.photos || [];
    if (photos.length === 0) {
      throw new BadRequestException('Gagal memproses audit: Foto aktual properti belum diunggah oleh inspektur');
    }

    if (inspection.tds_value === null || inspection.internet_speed === null) {
      throw new BadRequestException('Gagal memproses audit: Data teknis (TDS & internet speed) belum diisi');
    }

    // 2. Call Gemini AI to extract features
    const imageUrls = photos.map((p) => p.photo_url);
    const extractedData = await this.geminiService.extractFasilitas(imageUrls);

    // Save extracted JSON back to inspection
    inspection.extracted_data = extractedData;
    inspection.status = InspectionStatus.COMPLETED;
    await this.inspectionRepository.save(inspection);

    // 3. Load active audit rules
    const activeRule = await this.ruleRepository.findOne({
      where: { is_active: true },
      relations: { items: true },
    });

    let ruleItems: AuditRuleItem[] = [];
    if (activeRule) {
      ruleItems = activeRule.items;
    } else {
      // Fallback default rules if no rules are active in DB yet
      ruleItems = this.getDefaultRules();
    }

    // 4. Compare using RuleBasedEngine
    const technicalData = {
      tds_value: Number(inspection.tds_value),
      internet_speed: Number(inspection.internet_speed),
    };

    const auditResult = this.ruleBasedEngine.execute(
      inspection.property.claim_data,
      extractedData,
      technicalData,
      ruleItems,
    );

    // 5. Create or update AuditReport
    let report = inspection.audit_report;
    if (!report) {
      report = this.reportRepository.create({
        inspection_id: inspectionId,
        score: auditResult.score,
        confidence_level: auditResult.confidenceLevel,
        breakdown_data: auditResult.breakdownData,
      });
    } else {
      report.score = auditResult.score;
      report.confidence_level = auditResult.confidenceLevel;
      report.breakdown_data = auditResult.breakdownData;
    }

    report = await this.reportRepository.save(report);

    // 6. Generate Laporan PDF Scorecard
    const pdfData = {
      score: report.score,
      confidence_level: report.confidence_level,
      breakdown_data: report.breakdown_data,
      property_name: inspection.property.name,
      property_address: inspection.property.address,
      tds_value: inspection.tds_value,
      internet_speed: inspection.internet_speed,
      generated_at: report.generated_at || new Date(),
    };

    const pdfBuffer = await this.pdfService.generateAuditPDF(pdfData);

    // 7. Upload PDF to Supabase Storage
    const pdfFilename = `reports/${inspectionId}.pdf`;
    // If a PDF already exists, delete it first
    if (report.pdf_url) {
      await this.storageService.deleteFile(report.pdf_url);
    }
    
    const pdfUrl = await this.storageService.uploadBuffer(
      pdfBuffer,
      `${inspectionId}.pdf`,
      'application/pdf',
      'reports',
    );

    // Save PDF URL
    report.pdf_url = pdfUrl;
    report = await this.reportRepository.save(report);

    // 8. Update Property status to audited
    const property = inspection.property;
    property.status = 'audited' as any; // Map to PropertyStatus.AUDITED
    await this.propertyRepository.save(property);

    return report;
  }

  async getReport(inspectionId: string): Promise<AuditReport> {
    const report = await this.reportRepository.findOne({
      where: { inspection_id: inspectionId },
    });
    if (!report) {
      throw new NotFoundException('Laporan audit belum dibuat untuk sesi inspeksi ini');
    }
    return report;
  }

  private getDefaultRules(): AuditRuleItem[] {
    // Generate simple mock rules for fallback
    const items: Partial<AuditRuleItem>[] = [
      { facility_name: 'kasur', weight: 1.0, penalty: 0.5, threshold_type: 'boolean' },
      { facility_name: 'lemari', weight: 1.0, penalty: 0.5, threshold_type: 'boolean' },
      { facility_name: 'ac', weight: 2.0, penalty: 1.0, threshold_type: 'boolean' },
      { facility_name: 'wifi', weight: 1.5, penalty: 0.8, threshold_type: 'boolean' },
      { facility_name: 'kamar_mandi_dalam', weight: 2.0, penalty: 1.0, threshold_type: 'boolean' },
      { facility_name: 'kualitas_air', weight: 1.5, penalty: 0.8, threshold_type: 'numeric', threshold_value: '500' },
      { facility_name: 'kecepatan_internet', weight: 1.5, penalty: 0.8, threshold_type: 'numeric', threshold_value: '10' },
    ];
    return items.map((i, index) => {
      const item = new AuditRuleItem();
      Object.assign(item, i);
      item.item_id = `default-item-${index}`;
      return item;
    });
  }
}
