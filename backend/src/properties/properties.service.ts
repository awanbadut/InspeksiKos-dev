import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UserRole } from '../auth/entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, userId: string): Promise<Property> {
    const newProperty = this.propertyRepository.create({
      ...createPropertyDto,
      user_id: userId,
      status: PropertyStatus.PENDING,
    });
    return this.propertyRepository.save(newProperty);
  }

  async findAllByUser(userId: string, userRole: UserRole): Promise<Property[]> {
    if (userRole === UserRole.ADMIN) {
      return this.propertyRepository.find({ relations: { user: true } });
    }
    return this.propertyRepository.find({ where: { user_id: userId } });
  }

  async findOne(propertyId: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { property_id: propertyId },
      relations: { user: true, inspections: true },
    });
    if (!property) {
      throw new NotFoundException('Properti tidak ditemukan');
    }
    return property;
  }

  async update(
    propertyId: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Property> {
    const property = await this.findOne(propertyId);

    // Verify ownership or admin privileges
    if (property.user_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengubah properti ini');
    }

    // Merge changes
    Object.assign(property, updatePropertyDto);
    return this.propertyRepository.save(property);
  }

  async remove(propertyId: string, userId: string, userRole: UserRole): Promise<{ message: string }> {
    const property = await this.findOne(propertyId);

    // Verify ownership or admin privileges
    if (property.user_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk menghapus properti ini');
    }

    await this.propertyRepository.remove(property);
    return { message: 'Properti berhasil dihapus' };
  }
}
