import { Injectable } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import { extname, join, sep } from 'path';
import { mkdir, writeFile } from 'fs/promises';

@Injectable()
export class UploadService {
  private readonly uploadRoot =
    process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

  /**
   * Saves an uploaded file as-is, no validation or scanning.
   * Returns the path to store in the DB (relative to the upload root).
   */
  async saveImage(part: MultipartFile, subfolder: string): Promise<string> {
    const buffer = await part.toBuffer();

    const dir = join(this.uploadRoot, subfolder);
    await mkdir(dir, { recursive: true });

    const safeName = `${randomUUID()}${extname(part.filename)}`;
    await writeFile(join(dir, safeName), buffer);

    // Store with forward slashes regardless of host OS.
    return [subfolder, safeName].join('/').split(sep).join('/');
  }
}
