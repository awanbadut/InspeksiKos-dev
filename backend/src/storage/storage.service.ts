import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as ws from 'ws';

// Polyfill WebSocket for Node.js < 22 (required by Supabase Realtime client)
if (typeof global !== 'undefined' && !(global as any).WebSocket) {
  (global as any).WebSocket = ws;
}

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    this.bucketName = this.configService.get<string>('SUPABASE_BUCKET') || 'inspeksikos-photos';

    if (!supabaseUrl || !supabaseKey) {
      // Don't crash on start if not configured yet, but log it
      console.warn('Supabase credentials are not fully configured in environment variables');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase Storage belum terkonfigurasi');
    }

    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(uniqueFilename, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(`Gagal mengunggah file ke Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async uploadBuffer(buffer: Buffer, filename: string, mimeType: string, folder: string): Promise<string> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase Storage belum terkonfigurasi');
    }

    const path = `${folder}/${Date.now()}-${filename}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(`Gagal mengunggah buffer ke Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.supabase) {
      return;
    }
    // Extract path from full URL if a full URL is passed
    let relativePath = path;
    if (path.includes(this.bucketName)) {
      relativePath = path.split(`${this.bucketName}/`).pop() || path;
    }

    const { error } = await this.supabase.storage.from(this.bucketName).remove([relativePath]);
    if (error) {
      console.error(`Gagal menghapus file dari Supabase: ${error.message}`);
    }
  }
}
