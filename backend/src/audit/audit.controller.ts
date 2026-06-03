import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post(':inspection_id/run')
  async runAudit(@Param('inspection_id') inspectionId: string) {
    return this.auditService.runAudit(inspectionId);
  }

  @Get(':inspection_id/report')
  async getReport(@Param('inspection_id') inspectionId: string) {
    return this.auditService.getReport(inspectionId);
  }

  @Get(':inspection_id/pdf')
  async getPdfUrl(@Param('inspection_id') inspectionId: string) {
    const report = await this.auditService.getReport(inspectionId);
    return { pdf_url: report.pdf_url };
  }
}
