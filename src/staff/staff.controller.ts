import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Post()
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.addWorker(createStaffDto);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string) {
    return this.staffService.removeWorker(id);
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() UpdateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, UpdateStaffDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }
}
