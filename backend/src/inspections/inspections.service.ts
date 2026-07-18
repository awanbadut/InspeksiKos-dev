import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import axios from 'axios';
import { Inspection, InspectionStatus } from './entities/inspection.entity';
import { InspectionPhoto } from './entities/inspection-photo.entity';
import { Property } from '../properties/entities/property.entity';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';
import { InputTechnicalDataDto } from './dto/input-technical-data.dto';
import { UserRole } from '../auth/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../auth/entities/user.entity';

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
    private notificationService: NotificationService,
  ) {}

  async create(createInspectionDto: CreateInspectionDto, userId: string): Promise<Inspection> {
    const { property_id } = createInspectionDto;

    const property = await this.propertyRepository.findOne({ where: { property_id }, relations: { user: true } });
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

    const savedInspection = await this.inspectionRepository.save(newInspection);

    // Send email notification to student
    try {
      const studentEmail = property.user?.email;
      const studentName = `${property.user?.first_name || ''} ${property.user?.last_name || ''}`.trim() || property.user?.email;
      if (studentEmail) {
        await this.notificationService.sendOrderCreatedNotification(studentEmail, studentName, property.name);
      }
    } catch (err: any) {
      console.error(`Gagal mengirim email pengajuan order: ${err.message}`);
    }

    return savedInspection;
  }

  async findAll(userId: string, role: UserRole): Promise<Inspection[]> {
    if (role === UserRole.ADMIN) {
      return this.inspectionRepository.find({
        relations: { property: true, inspector: true },
      });
    }

    if (role === UserRole.INSPEKTUR) {
      const allInspections = await this.inspectionRepository.find({
        where: [
          { inspector_id: userId },
          { inspector_id: IsNull() }
        ],
        relations: { property: true, inspector: true },
      });
      // Inspectors should only see tasks assigned to them, or available tasks that have been PAID
      return allInspections.filter((i) => 
        i.inspector_id === userId || 
        i.property?.claim_data?.payment_status === 'paid'
      );
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

    // Check if property is paid before allowing claiming (except for admin actions)
    if (role === UserRole.INSPEKTUR) {
      if (inspection.property?.claim_data?.payment_status !== 'paid') {
        throw new ForbiddenException('Tidak dapat mengklaim tugas karena pembayaran belum lunas');
      }
    }

    const oldInspectorId = inspection.inspector_id;

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

    const savedInspection = await this.inspectionRepository.save(inspection);

    // If inspector was just assigned, send email notification to student!
    if (savedInspection.inspector_id && savedInspection.inspector_id !== oldInspectorId) {
      try {
        const inspector = await this.inspectionRepository.manager.findOne(User, {
          where: { user_id: savedInspection.inspector_id }
        });
        const property = savedInspection.property;
        const studentEmail = property?.user?.email;
        const studentName = `${property?.user?.first_name || ''} ${property?.user?.last_name || ''}`.trim() || property?.user?.email;
        
        if (studentEmail && inspector) {
          const inspectorName = `${inspector.first_name || ''} ${inspector.last_name || ''}`.trim() || inspector.email;
          const inspectorPhone = inspector.phone_number || 'Tidak ada nomor telepon';
          await this.notificationService.sendInspectorAssignedNotification(
            studentEmail,
            studentName,
            property.name,
            inspectorName,
            inspectorPhone,
          );
        }
      } catch (err: any) {
        console.error(`Gagal mengirim email verifikator ditugaskan: ${err.message}`);
      }
    }

    return savedInspection;
  }

  async inputTechnical(
    inspectionId: string,
    technicalDto: InputTechnicalDataDto,
    userId: string,
    role: UserRole,
  ): Promise<Inspection> {
    const inspection = await this.findOne(inspectionId);

    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new ForbiddenException('Tidak dapat mengubah data karena sesi inspeksi sudah selesai');
    }

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

    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new ForbiddenException('Tidak dapat mengunggah foto karena sesi inspeksi sudah selesai');
    }

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

  async getPaymentToken(inspectionId: string): Promise<{ token: string; redirect_url: string; mode: 'sandbox' | 'simulator' }> {
    const inspection = await this.findOne(inspectionId);
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    
    // Check if Midtrans Server Key is configured and valid
    const isMock = !serverKey || serverKey === 'SB-Mid-server-YOUR_KEY_HERE';
    
    // Determine gross amount
    // If it's a multi-kos group comparison, check how many inspections share this comparison_id
    let grossAmount = 50000;
    const compId = inspection.property?.claim_data?.comparison_id;
    if (compId) {
      const relatedInsps = await this.inspectionRepository.find({
        where: { property: { claim_data: { comparison_id: compId } } as any },
        relations: { property: true }
      });
      grossAmount = relatedInsps.length * 45000;
    }

    if (isMock) {
      // Return a simulated redirect URL pointing to the local payment simulate route
      return {
        token: `mock_token_${Date.now()}`,
        redirect_url: `/payment/simulate?id=${inspectionId}`,
        mode: 'simulator',
      };
    }

    const property = inspection.property;
    const currentClaimData = property?.claim_data || {};

    // If we already have a cached token and it's sandbox, reuse it!
    if (currentClaimData.midtrans_token && currentClaimData.midtrans_redirect_url) {
      return {
        token: currentClaimData.midtrans_token,
        redirect_url: currentClaimData.midtrans_redirect_url,
        mode: 'sandbox',
      };
    }

    // Generate a unique Midtrans order ID to prevent "order_id already exists" errors in sandbox
    const midtransOrderId = currentClaimData.midtrans_order_id || `IPK-${inspectionId.slice(0, 8)}-${Date.now().toString().slice(-6)}`;

    // Call Midtrans Sandbox Snap API
    try {
      const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;
      const payload = {
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: grossAmount,
        },
        credit_card: {
          secure: true
        },
        customer_details: {
          first_name: inspection.property?.user?.first_name || 'Customer',
          last_name: inspection.property?.user?.last_name || '',
          email: inspection.property?.user?.email || 'customer@inspeksikos.com',
          phone: inspection.property?.user?.phone_number || '',
        }
      };

      const response = await axios.post(
        'https://app.sandbox.midtrans.com/snap/v1/transactions',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: authHeader,
          },
        },
      );

      // Save token, redirect_url, and order_id to property.claim_data
      property.claim_data = {
        ...currentClaimData,
        midtrans_order_id: midtransOrderId,
        midtrans_token: response.data.token,
        midtrans_redirect_url: response.data.redirect_url,
      };
      await this.propertyRepository.save(property);

      return {
        token: response.data.token,
        redirect_url: response.data.redirect_url,
        mode: 'sandbox',
      };
    } catch (err: any) {
      console.error('Failed to create Midtrans Snap transaction:', err.response?.data || err.message);
      // Fallback to simulator if Midtrans API call fails
      return {
        token: `mock_token_fallback_${Date.now()}`,
        redirect_url: `/payment/simulate?id=${inspectionId}`,
        mode: 'simulator',
      };
    }
  }

  async checkPaymentStatus(inspectionId: string): Promise<{ paid: boolean }> {
    const inspection = await this.findOne(inspectionId);
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isMock = !serverKey || serverKey === 'SB-Mid-server-YOUR_KEY_HERE';

    if (isMock) {
      const isPaid = inspection.property?.claim_data?.payment_status === 'paid';
      const emailSent = inspection.property?.claim_data?.email_receipt_sent === true;
      
      if (isPaid && !emailSent) {
        const property = inspection.property;
        const currentClaimData = property.claim_data || {};
        const compId = currentClaimData.comparison_id;

        if (compId) {
          const allProperties = await this.propertyRepository.find();
          const relatedProperties = allProperties.filter(p => p.claim_data?.comparison_id === compId);
          for (const p of relatedProperties) {
            p.claim_data = {
              ...p.claim_data,
              payment_status: 'paid',
              email_receipt_sent: true,
            };
            await this.propertyRepository.save(p);
          }
        } else {
          property.claim_data = {
            ...currentClaimData,
            payment_status: 'paid',
            email_receipt_sent: true,
          };
          await this.propertyRepository.save(property);
        }

        // Send payment receipt notification
        try {
          const studentEmail = property.user?.email;
          const studentName = `${property.user?.first_name || ''} ${property.user?.last_name || ''}`.trim() || property.user?.email;
          if (studentEmail) {
            await this.notificationService.sendOrderPaidNotification(studentEmail, studentName, property.name);
          }
        } catch (err: any) {
          console.error(`Gagal mengirim email verifikasi bayar: ${err.message}`);
        }

        // Notify all inspectors about the new order!
        await this.notifyInspectorsAboutNewOrder(property.name, property.address);
      }

      return {
        paid: isPaid,
      };
    }

    const midtransOrderId = inspection.property?.claim_data?.midtrans_order_id || inspectionId;

    try {
      const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;
      const response = await axios.get(
        `https://api.sandbox.midtrans.com/v2/${midtransOrderId}/status`,
        {
          headers: {
            Authorization: authHeader,
            Accept: 'application/json',
          },
        },
      );

      const status = response.data.transaction_status;
      const isPaid = status === 'settlement' || status === 'capture';
      const emailSent = inspection.property?.claim_data?.email_receipt_sent === true;

      if (isPaid && !emailSent) {
        const property = inspection.property;
        const currentClaimData = property.claim_data || {};
        const compId = currentClaimData.comparison_id;

        if (compId) {
          const allProperties = await this.propertyRepository.find();
          const relatedProperties = allProperties.filter(p => p.claim_data?.comparison_id === compId);
          for (const p of relatedProperties) {
            p.claim_data = {
              ...p.claim_data,
              payment_status: 'paid',
              email_receipt_sent: true,
            };
            await this.propertyRepository.save(p);
          }
        } else {
          property.claim_data = {
            ...currentClaimData,
            payment_status: 'paid',
            email_receipt_sent: true,
          };
          await this.propertyRepository.save(property);
        }

        // Send payment receipt notification
        try {
          const studentEmail = property.user?.email;
          const studentName = `${property.user?.first_name || ''} ${property.user?.last_name || ''}`.trim() || property.user?.email;
          if (studentEmail) {
            await this.notificationService.sendOrderPaidNotification(studentEmail, studentName, property.name);
          }
        } catch (err: any) {
          console.error(`Gagal mengirim email verifikasi bayar: ${err.message}`);
        }

        // Notify all inspectors about the new order!
        await this.notifyInspectorsAboutNewOrder(property.name, property.address);
      }

      return { paid: isPaid };
    } catch (err: any) {
      console.error('Failed to check Midtrans transaction status:', err.response?.data || err.message);
      return {
        paid: inspection.property?.claim_data?.payment_status === 'paid',
      };
    }
  }

  private async notifyInspectorsAboutNewOrder(propertyName: string, propertyAddress: string) {
    try {
      const inspectors = await this.inspectionRepository.manager.find(User, {
        where: { role: UserRole.INSPEKTUR }
      });
      
      for (const inspector of inspectors) {
        const inspectorName = `${inspector.first_name || ''} ${inspector.last_name || ''}`.trim() || inspector.email;
        await this.notificationService.sendNewOrderAvailableNotification(
          inspector.email,
          inspector.phone_number,
          inspectorName,
          propertyName,
          propertyAddress,
        );
      }
    } catch (err: any) {
      console.error(`Gagal mengirim notifikasi order baru ke para inspektur: ${err.message}`);
    }
  }
}
