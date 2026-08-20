import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from '../schemas/staff.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto'; // Make sure to create this DTO

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
  ) {}

  findAll() {
    try {
      const staffMembers = this.staffModel.find();
      return staffMembers;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to find staff member');
    }
  }

  findOne(id: string) {
    try {
      const staffMember = this.staffModel.findById(id);
      return staffMember;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to find staff member');
    }
  }

  async addWorker(
    createStaffDto: CreateStaffDto,
    photoPaths: string[] = [],
  ): Promise<Staff> {
    try {
      const newStaff = new this.staffModel({
        ...createStaffDto,
        photos: photoPaths,
      });
      return await newStaff.save();
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to create staff member');
    }
  }

  async removeWorker(id: string) {
    try {
      const staff = await this.staffModel.findByIdAndDelete(id);
      return staff;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to remove staff member');
    }
  }

  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    try {
      const updatedStaff = await this.staffModel.findOneAndUpdate(
        { _id: id },
        { $set: updateStaffDto },
        { new: true, runValidators: true },
      );

      if (!updatedStaff) {
        throw new NotFoundException(`Staff member with ID ${id} not found`);
      }

      return updatedStaff;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      console.error(err);
      throw new InternalServerErrorException('Failed to update staff member');
    }
  }
}
