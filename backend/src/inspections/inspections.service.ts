import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Inspection, InspectionStatus } from './entities/inspection.entity';
import { InspectionPhoto } from './entities/inspection-photo.entity';
import { Property } from '../properties/entities/property.entity';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';
import { InputTechnicalDataDto } from './dto/input-technical-data.dto';
import { UserRole } from '../auth/entities/user.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(InspectionPhoto)
    private photoRepository: Repository<InspectionPhoto>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private storageService: StorageService,
  ) {}

  async create(createInspectionDto: CreateInspectionDto, userId: string): Promise<Inspection> {
    const { property_id } = createInspectionDto;

    // Check if property exists
    const property = await this.propertyRepository.findOne({ where: { property_id } });
    if (!property) {
      throw new NotFoundException('Properti tidak ditemukan');
    }

    // Verify ownership
    if (property.user_id !== userId) {
      throw new ForbiddenException('Hanya pemilik properti yang dapat meminta inspeksi');
    }

    const newInspection = this.inspectionRepository.create({
      property_id,
      status: InspectionStatus.ASSIGNED,
    });

    return this.inspectionRepository.save(newInspection);
  }

  async findAll(userId: string, role: UserRole): Promise<Inspection[]> {
    if (role === UserRole.ADMIN) {
      return this.inspectionRepository.find({
        relations: { property: true, inspector: true },
      });
    }

    if (role === UserRole.INSPEKTUR) {
      return this.inspectionRepository.find({
        where: [
          { inspector_id: userId },
          { inspector_id: IsNull() }
        ],
        relations: { property: true, inspector: true },
      });
    }

    // For Mahasiswa: find inspections of their properties
    return this.inspectionRepository.find({
      where: { property: { user_id: userId } },
      relations: { property: true, inspector: true },
    });
  }

  async findOne(inspectionId: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { inspection_id: inspectionId },
      relations: {
        property: { user: true },
        inspector: true,
        photos: true,
        audit_report: true,
      },
    });

    if (!inspection) {
      throw new NotFoundException('Sesi inspeksi tidak ditemukan');
    }

    return inspection;
  }

  async updateStatus(
    inspectionId: string,
    updateStatusDto: UpdateInspectionStatusDto,
    userId: string,
    role: UserRole,
  ): Promise<Inspection> {
    const inspection = await this.findOne(inspectionId);
    const { status, inspector_id } = updateStatusDto;

    if (status) {
      inspection.status = status;
      if (status === InspectionStatus.COMPLETED) {
        inspection.completed_at = new Date();
      }
    }

    if (role === UserRole.INSPEKTUR) {
      inspection.inspector_id = userId;
    } else if (role === UserRole.ADMIN && inspector_id) {
      inspection.inspector_id = inspector_id;
    }

    return this.inspectionRepository.save(inspection);
  }

  async inputTechnical(
    inspectionId: string,
    technicalDto: InputTechnicalDataDto,
    userId: string,
    role: UserRole,
  ): Promise<Inspection> {
    const inspection = await this.findOne(inspectionId);

    // Verify permission: only the assigned inspector or admin can input data
    if (inspection.inspector_id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Anda tidak bertugas untuk menginspeksi properti ini');
    }

    Object.assign(inspection, technicalDto);
    return this.inspectionRepository.save(inspection);
  }

  async uploadPhoto(
    inspectionId: string,
    file: Express.Multer.File,
    roomType: string,
    userId: string,
    role: UserRole,
  ): Promise<InspectionPhoto> {
    if (!file) {
      throw new BadRequestException('File foto tidak boleh kosong');
    }

    const inspection = await this.findOne(inspectionId);

    // Verify permission
    if (inspection.inspector_id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengunggah foto untuk inspeksi ini');
    }

    // Check if there is already a photo for this room_type/checkpoint in the inspection
    const existingPhoto = await this.photoRepository.findOne({
      where: { inspection_id: inspectionId, room_type: roomType },
    });

    if (existingPhoto) {
      // Delete old file from Supabase
      try {
        await this.storageService.deleteFile(existingPhoto.photo_url);
      } catch (err) {
        console.error('Gagal menghapus file lama di Supabase:', err.message);
      }
      // Remove database entry
      await this.photoRepository.remove(existingPhoto);
    }

    // Upload to Supabase Storage
    const folder = `inspections/${inspectionId}`;
    const photoUrl = await this.storageService.uploadFile(file, folder);

    // Save metadata
    const photo = this.photoRepository.create({
      inspection_id: inspectionId,
      photo_url: photoUrl,
      room_type: roomType,
    });

    return this.photoRepository.save(photo);
  }

  async findPhotos(inspectionId: string): Promise<InspectionPhoto[]> {
    // Verify inspection exists
    await this.findOne(inspectionId);
    return this.photoRepository.find({ where: { inspection_id: inspectionId } });
  }
}
