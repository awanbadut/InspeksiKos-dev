import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT') || 587;
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Nodemailer SMTP transporter initialized');
    } else {
      this.logger.warn('Nodemailer SMTP credentials are not fully configured in environment variables. Falling back to mock logger.');
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    if (!this.transporter) {
      this.logger.log(`[MOCK EMAIL] TO: ${to} | SUBJECT: ${subject}`);
      this.logger.log(`[MOCK EMAIL CONTENT]:\n${htmlContent}`);
      return;
    }

    try {
      const from = this.configService.get<string>('MAIL_FROM') || '"InspeksiKos" <noreply@inspeksikos.id>';
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
      });
      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendWhatsApp(phone: string, message: string) {
    const token = this.configService.get<string>('FONNTE_TOKEN');
    
    // Normalize Indonesian phone numbers: e.g., 0812... -> 62812...
    let formattedPhone = phone || '';
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    if (!token) {
      this.logger.log(`[MOCK WHATSAPP] TO: ${formattedPhone} | MESSAGE:\n${message}`);
      return;
    }

    try {
      const response = await axios.post(
        'https://api.fonnte.com/send',
        {
          target: formattedPhone,
          message: message,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (response.data.status === true) {
        this.logger.log(`WhatsApp message successfully sent to ${formattedPhone}`);
      } else {
        this.logger.error(`Fonnte API error sending WhatsApp to ${formattedPhone}: ${response.data.reason || 'Unknown error'}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send WhatsApp to ${formattedPhone}: ${error.response?.data || error.message}`);
    }
  }

  async sendAuditCompletionNotification(
    userEmail: string,
    userPhone: string,
    userName: string,
    propertyName: string,
    score: number,
    pdfUrl: string,
  ) {
    const subject = `Laporan Scorecard InspeksiKos - ${propertyName}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #003057; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Hasil Audit Properti Kos Anda</h2>
        <p>Halo, <strong>${userName}</strong>,</p>
        <p>Kami telah selesai melakukan audit lapangan dan pengujian kelayakan menggunakan AI Vision untuk properti kos: <strong>${propertyName}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #64748b;">Skor Audit InspeksiKos:</p>
          <h1 style="margin: 5px 0 0 0; color: #10b981; font-size: 38px; font-weight: 800;">${score}%</h1>
        </div>
        <p>Anda dapat mengunduh berkas Laporan Scorecard PDF lengkap untuk melihat detail analisis fasilitas, kualitas air (TDS), dan kecepatan internet di link berikut:</p>
        <p style="margin: 25px 0; text-align: center;">
          <a href="${pdfUrl}" target="_blank" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Unduh Laporan PDF (Scorecard)</a>
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Laporan ini diterbitkan secara otomatis oleh sistem InspeksiKos - Politeknik Negeri Padang.
        </p>
      </div>
    `;

    const waMessage = `Halo *${userName}*,\n\nLaporan audit AI & pengujian lapangan untuk properti kos *${propertyName}* telah selesai diproses!\n\n*Skor Kelayakan:* ${score}%\n\nSilakan unduh laporan lengkap (PDF Scorecard) Anda pada tautan berikut:\n${pdfUrl}\n\nTerima kasih,\n*Tim InspeksiKos*`;

    try {
      await Promise.all([
        this.sendEmail(userEmail, subject, emailHtml),
        this.sendWhatsApp(userPhone, waMessage),
      ]);
    } catch (err) {
      this.logger.error(`Error executing notification trigger: ${err.message}`);
    }
  }

  async sendOrderCreatedNotification(userEmail: string, userName: string, propertyName: string) {
    const subject = `Permintaan Inspeksi Baru Dibuat - ${propertyName}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #003057; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Pengajuan Inspeksi Kos</h2>
        <p>Halo, <strong>${userName}</strong>,</p>
        <p>Pengajuan inspeksi baru Anda untuk properti <strong>${propertyName}</strong> telah berhasil dibuat di sistem kami.</p>
        <p>Silakan lakukan pembayaran agar tim verifikator lapangan kami dapat segera ditugaskan untuk melakukan audit fasilitas kos Anda.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          InspeksiKos - Layanan Audit Kos Terpercaya.
        </p>
      </div>
    `;
    await this.sendEmail(userEmail, subject, emailHtml);
  }

  async sendOrderPaidNotification(userEmail: string, userName: string, propertyName: string) {
    const subject = `Pembayaran Diterima - ${propertyName}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #10b981; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Pembayaran Berhasil!</h2>
        <p>Halo, <strong>${userName}</strong>,</p>
        <p>Pembayaran untuk inspeksi properti <strong>${propertyName}</strong> telah kami terima dan diverifikasi secara otomatis.</p>
        <p>Sistem saat ini sedang mencari verifikator lapangan terdekat untuk melakukan kunjungan audit fisik. Anda akan menerima notifikasi email berikutnya segera setelah verifikator ditemukan.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          InspeksiKos - Layanan Audit Kos Terpercaya.
        </p>
      </div>
    `;
    await this.sendEmail(userEmail, subject, emailHtml);
  }

  async sendInspectorAssignedNotification(
    userEmail: string,
    userName: string,
    propertyName: string,
    inspectorName: string,
    inspectorPhone: string,
  ) {
    const subject = `Verifikator Ditugaskan - ${propertyName}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #003057; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Verifikator Ditemukan!</h2>
        <p>Halo, <strong>${userName}</strong>,</p>
        <p>Kabar baik! Mitra verifikator kami telah ditugaskan untuk melakukan audit pada properti kos Anda: <strong>${propertyName}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #003057;">Profil Verifikator Lapangan:</p>
          <p style="margin: 3px 0; font-size: 12px;">Nama: <strong>${inspectorName}</strong></p>
          <p style="margin: 3px 0; font-size: 12px;">No. Telepon/WA: <strong>${inspectorPhone}</strong></p>
        </div>
        <p>Verifikator kami akan segera melakukan survei fisik langsung ke lokasi kos Anda sesuai jadwal. Pastikan ada perwakilan di lokasi untuk memudahkan akses verifikasi.</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          InspeksiKos - Layanan Audit Kos Terpercaya.
        </p>
      </div>
    `;
    await this.sendEmail(userEmail, subject, emailHtml);
  }
}
