import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StaffService } from './staff.service';
import { UploadService } from '../upload/upload.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

const MAX_PHOTOS_PER_STAFF = 5;

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  // Accepts multipart/form-data: text fields (name, roles) plus zero or
  // more "photos" file parts. Each photo is content-type checked and
  // virus-scanned before it's ever written to disk; only clean files are
  // saved, and only their paths go in the DB.
  //
  // TODO: remove this endpoint before production (staff will be managed
  // some other way then) — see /booking work notes.
  @Post()
  async createStaff(@Req() req: FastifyRequest) {
    if (!req.isMultipart()) {
      throw new BadRequestException(
        'Expected multipart/form-data (fields: name, roles, and optional photo files)',
      );
    }

    const fields: Record<string, string | string[]> = {};
    const photoPaths: string[] = [];

    for await (const part of req.parts()) {
      if (part.type === 'file') {
        if (part.fieldname !== 'photos') {
          await part.toBuffer();
          continue;
        }
        if (photoPaths.length >= MAX_PHOTOS_PER_STAFF) {
          throw new BadRequestException(
            `A staff member can have at most ${MAX_PHOTOS_PER_STAFF} photos`,
          );
        }
        const savedPath = await this.uploadService.saveImage(part, 'staff');
        photoPaths.push(savedPath);
      } else {
        const existing = fields[part.fieldname];
        if (existing !== undefined) {
          fields[part.fieldname] = Array.isArray(existing)
            ? [...existing, part.value as string]
            : [existing, part.value as string];
        } else {
          fields[part.fieldname] = part.value as string;
        }
      }
    }

    const dto = plainToInstance(CreateStaffDto, {
      name: fields.name,
      roles:
        typeof fields.roles === 'string'
          ? fields.roles.split(',').map((r) => r.trim())
          : fields.roles,
      email: fields.email as string,
      description: fields.description as string,
    });
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.staffService.addWorker(dto, photoPaths);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string) {
    return this.staffService.removeWorker(id);
  }

  // TODO: remove before production, same as createStaff above.
  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }
}
