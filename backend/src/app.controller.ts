import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('diag')
  getDiag() {
    const key = process.env.SUPABASE_ANON_KEY || '';
    const url = process.env.SUPABASE_URL || '';
    return {
      supabase_url: url,
      key_length: key.length,
      key_start: key.substring(0, 15),
      key_end: key.substring(key.length - 15),
      has_newlines: key.includes('\n') || key.includes('\r'),
      has_spaces: key.includes(' '),
    };
  }
}
