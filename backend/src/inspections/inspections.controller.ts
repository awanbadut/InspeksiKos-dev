import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';
import { InputTechnicalDataDto } from './dto/input-technical-data.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @Roles(UserRole.MAHASISWA, UserRole.ADMIN)
  create(@Body() createInspectionDto: CreateInspectionDto, @GetUser('user_id') userId: string) {
    return this.inspectionsService.create(createInspectionDto, userId);
  }

  @Get()
  findAll(@GetUser('user_id') userId: string, @GetUser('role') role: UserRole) {
    return this.inspectionsService.findAll(userId, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inspectionsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.INSPEKTUR)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInspectionStatusDto,
    @GetUser('user_id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.inspectionsService.updateStatus(id, updateStatusDto, userId, role);
  }

  @Patch(':id/teknis')
  @Roles(UserRole.ADMIN, UserRole.INSPEKTUR)
  inputTechnical(
    @Param('id') id: string,
    @Body() technicalDto: InputTechnicalDataDto,
    @GetUser('user_id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.inspectionsService.inputTechnical(id, technicalDto, userId, role);
  }

  @Post(':id/photos')
  @Roles(UserRole.ADMIN, UserRole.INSPEKTUR)
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('room_type') roomType: string,
    @GetUser('user_id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.inspectionsService.uploadPhoto(id, file, roomType, userId, role);
  }

  @Get(':id/photos')
  findPhotos(@Param('id') id: string) {
    return this.inspectionsService.findPhotos(id);
  }
}
