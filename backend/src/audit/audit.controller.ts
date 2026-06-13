import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('rules')
  async getActiveRule() {
    return this.auditService.getActiveRule();
  }

  @Post('rules')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async saveActiveRule(@Body('items') items: any[], @GetUser('user_id') userId: string) {
    return this.auditService.saveActiveRule(items, userId);
  }

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

  @Post(':inspection_id/chat')
  async chatAboutReport(
    @Param('inspection_id') inspectionId: string,
    @Body('message') message: string,
    @Body('history') history?: any[],
  ) {
    const reply = await this.auditService.chatAboutReport(inspectionId, message, history || []);
    return { reply };
  }
}
