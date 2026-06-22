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
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditReport)
    private reportRepository: Repository<AuditReport>,
    @InjectRepository(AuditRule)
    private ruleRepository: Repository<AuditRule>,
    @InjectRepository(AuditRuleItem)
    private ruleItemRepository: Repository<AuditRuleItem>,
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private geminiService: GeminiService,
    private ruleBasedEngine: RuleBasedEngine,
    private pdfService: PdfService,
    private storageService: StorageService,
    private notificationService: NotificationService,
  ) {}

  async getActiveRule(): Promise<AuditRule & { items: AuditRuleItem[] }> {
    const activeRule = await this.ruleRepository.findOne({
      where: { is_active: true },
      relations: { items: true },
    });

    if (activeRule) {
      return activeRule;
    }

    // Fallback: create mock default rule in-memory
    const defaultRule = new AuditRule();
    defaultRule.rule_id = 'default-rule-id';
    defaultRule.name = 'Aturan Default Platform';
    defaultRule.version = '1.0';
    defaultRule.is_active = true;
    defaultRule.items = this.getDefaultRules();
    return defaultRule as any;
  }

  async saveActiveRule(itemsDto: any[], userId: string): Promise<AuditRule> {
    // 1. Deactivate existing rules
    await this.ruleRepository.update({ is_active: true }, { is_active: false });

    // 2. Create new active rule
    const newRule = this.ruleRepository.create({
      name: 'Aturan Kustom Platform',
      version: `1.${Date.now().toString().slice(-4)}`,
      is_active: true,
      created_by_id: userId,
    });
    const savedRule = await this.ruleRepository.save(newRule);

    // 3. Create items
    const newItems = itemsDto.map((item) => {
      const ruleItem = new AuditRuleItem();
      ruleItem.rule_id = savedRule.rule_id;
      ruleItem.facility_name = item.facility_name;
      ruleItem.weight = Number(item.weight);
      ruleItem.penalty = Number(item.penalty);
      ruleItem.threshold_type = item.threshold_type;
      ruleItem.threshold_value = item.threshold_value ? String(item.threshold_value) : null as any;
      return ruleItem;
    });
    await this.ruleItemRepository.save(newItems);

    const rule = await this.ruleRepository.findOne({
      where: { rule_id: savedRule.rule_id },
      relations: { items: true },
    });

    if (!rule) {
      throw new Error('Gagal memuat aturan kustom yang baru dibuat');
    }

    return rule;
  }

  async runAudit(inspectionId: string): Promise<AuditReport> {
    // 1. Fetch inspection details
    const inspection = await this.inspectionRepository.findOne({
      where: { inspection_id: inspectionId },
      relations: {
        property: {
          user: true,
        },
        photos: true,
        audit_report: true,
      },
    });

    if (!inspection) {
      throw new NotFoundException('Sesi inspeksi tidak ditemukan');
    }

    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new BadRequestException('Sesi inspeksi ini sudah selesai di-audit dan tidak dapat diubah.');
    }

    const photos = inspection.photos || [];
    if (photos.length === 0) {
      throw new BadRequestException('Gagal memproses audit: Foto aktual properti belum diunggah oleh inspektur');
    }

    if (inspection.tds_value === null || inspection.internet_speed === null) {
      throw new BadRequestException('Gagal memproses audit: Data teknis (TDS & internet speed) belum diisi');
    }

    // 2. Call Gemini AI to extract features
    const photoData = photos
      .filter((p) => !p.room_type.endsWith('_video'))
      .map((p) => ({ url: p.photo_url, category: p.room_type }));
    const extractedData = await this.geminiService.extractFasilitas(photoData);

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
      inspection.inspector_data,
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

    // 9. Send email and WhatsApp notification to the user/student
    const user = inspection.property?.user;
    if (user) {
      const userEmail = user.email;
      const userPhone = user.phone_number || '';
      const userName = user.first_name || user.email.split('@')[0];
      const propertyName = inspection.property.name;
      const score = report.score;
      const pdfUrl = report.pdf_url;

      this.notificationService
        .sendAuditCompletionNotification(
          userEmail,
          userPhone,
          userName,
          propertyName,
          score,
          pdfUrl,
        )
        .catch((err) =>
          console.error('Failed to send audit completion notification:', err.message),
        );
    }

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

  async chatAboutReport(
    inspectionId: string,
    userMessage: string,
    chatHistory: any[] = [],
  ): Promise<string> {
    const inspection = await this.inspectionRepository.findOne({
      where: { inspection_id: inspectionId },
      relations: { property: true, audit_report: true },
    });

    if (!inspection) {
      throw new NotFoundException('Sesi inspeksi tidak ditemukan');
    }

    const report = inspection.audit_report;
    if (!report) {
      throw new BadRequestException('Laporan audit belum dibuat untuk sesi inspeksi ini');
    }

    const systemContext = `
      Anda adalah "InspeksiKos AI Assistant", konsultan properti kos untuk Politeknik Negeri Padang.
      Tugas Anda adalah membantu mahasiswa/pengguna memahami laporan audit properti kos.
      
      Berikut adalah detail laporan audit properti kos saat ini:
      - Nama Properti: ${inspection.property.name}
      - Alamat Properti: ${inspection.property.address}
      - Deskripsi: ${inspection.property.description || 'N/A'}
      - Skor Audit: ${report.score}%
      - Tingkat Validitas (Confidence Level): ${report.confidence_level}
      - Nilai TDS Air: ${inspection.tds_value || '0'} mg/L (PPM)
      - Kecepatan Internet Speedtest: ${inspection.internet_speed || '0'} Mbps
      - Rincian Evaluasi Fasilitas (JSON):
      ${JSON.stringify(report.breakdown_data)}
      
      Aturan Penilaian Air (TDS):
      - TDS <= 150 mg/L: Sangat Bersih / Layak Konsumsi
      - TDS <= 300 mg/L: Bersih / Layak Mandi & Sanitasi
      - TDS > 500 mg/L: Kualitas Buruk / Tercemar / Tidak Layak Pakai

      Aturan Penilaian Internet:
      - Internet >= 20 Mbps: Sangat Cepat (Sangat lancar untuk Zoom/Kuliah TRPL)
      - Internet >= 10 Mbps: Cukup Cepat (Lancar untuk browsing/sosmed)
      - Internet < 10 Mbps: Lambat (Bisa buffering)

      Harap jawab semua pertanyaan pengguna dengan ramah dalam bahasa Indonesia, berikan saran praktis berdasarkan data di atas.
    `;

    return this.geminiService.generateChatResponse(systemContext, userMessage, chatHistory);
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
