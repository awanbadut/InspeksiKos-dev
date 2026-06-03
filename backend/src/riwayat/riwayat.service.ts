import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Inspection, InspectionStatus } from '../inspections/entities/inspection.entity';
import { UserRole } from '../auth/entities/user.entity';

@Injectable()
export class RiwayatService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
  ) {}

  async getRiwayat(
    userId: string,
    role: UserRole,
    date?: string,
    month?: string,
  ): Promise<Inspection[]> {
    const queryBuilder = this.inspectionRepository.createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.property', 'property')
      .leftJoinAndSelect('inspection.inspector', 'inspector')
      .leftJoinAndSelect('inspection.audit_report', 'audit_report')
      .orderBy('inspection.assigned_at', 'DESC');

    // Filter by User Role
    if (role === UserRole.MAHASISWA) {
      queryBuilder.andWhere('property.user_id = :userId', { userId });
    } else if (role === UserRole.INSPEKTUR) {
      queryBuilder.andWhere('inspection.inspector_id = :userId', { userId });
    }
    // Admin sees all, no role filter

    // Only show completed or audited inspections in history
    queryBuilder.andWhere('inspection.status = :status', { status: InspectionStatus.COMPLETED });

    // Filter by Date (YYYY-MM-DD)
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      queryBuilder.andWhere('inspection.completed_at BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    // Filter by Month (YYYY-MM)
    if (month && !date) {
      const [year, m] = month.split('-').map(Number);
      // Month in JS Date is 0-indexed
      const startOfMonth = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));
      queryBuilder.andWhere('inspection.completed_at BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      });
    }

    return queryBuilder.getMany();
  }
}
