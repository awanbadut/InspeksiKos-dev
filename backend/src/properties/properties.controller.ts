import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto, @GetUser('user_id') userId: string) {
    return this.propertiesService.create(createPropertyDto, userId);
  }

  @Get()
  findAll(@GetUser('user_id') userId: string, @GetUser('role') role: UserRole) {
    return this.propertiesService.findAllByUser(userId, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @GetUser('user_id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.propertiesService.update(id, updatePropertyDto, userId, role);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('user_id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.propertiesService.remove(id, userId, role);
  }
}
