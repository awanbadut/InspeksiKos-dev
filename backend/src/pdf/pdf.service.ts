import { Injectable, InternalServerErrorException } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateAuditPDF(reportData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err: Error) => reject(err));

        // Design the PDF Report beautifully
        // Header Banner
        doc
          .rect(0, 0, doc.page.width, 120)
          .fill('#1e293b'); // Navy

        doc
          .fillColor('#ffffff')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('🏠 INSPEKSIKOS', 50, 40)
          .fontSize(10)
          .text('Laporan Hasil Audit Komparasi Fasilitas Kos', 50, 70);

        // Score Card in Banner
        doc
          .rect(doc.page.width - 200, 30, 150, 65)
          .stroke('#ffffff');

        doc
          .fontSize(8)
          .text('SKOR AUDIT', doc.page.width - 190, 40)
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(`${reportData.score}%`, doc.page.width - 190, 52)
          .fontSize(8)
          .font('Helvetica')
          .text(`Status: ${reportData.confidence_level}`, doc.page.width - 190, 80);

        // Spacer
        doc.moveDown(5);

        // Section 1: Detail Properti
        doc
          .fillColor('#1e293b')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('INFORMASI PROPERTI', 50, 150)
          .moveTo(50, 168)
          .lineTo(doc.page.width - 50, 168)
          .stroke('#e2e8f0');

        doc
          .fillColor('#000000')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Nama Kos:', 50, 185)
          .font('Helvetica')
          .text(reportData.property_name || 'N/A', 150, 185)
          
          .font('Helvetica-Bold')
          .text('Alamat:', 50, 205)
          .font('Helvetica')
          .text(reportData.property_address || 'N/A', 150, 205, { width: doc.page.width - 200 })
          
          .font('Helvetica-Bold')
          .text('Tanggal Audit:', 50, 240)
          .font('Helvetica')
          .text(new Date(reportData.generated_at).toLocaleString('id-ID') || 'N/A', 150, 240);

        // Section 2: Data Teknis
        doc
          .fillColor('#1e293b')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('PENGUKURAN TEKNIS LAPANGAN', 50, 275)
          .moveTo(50, 293)
          .lineTo(doc.page.width - 50, 293)
          .stroke('#e2e8f0');

        doc
          .fillColor('#000000')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Kualitas Air (TDS):', 50, 310)
          .font('Helvetica')
          .text(`${reportData.tds_value || '0'} mg/L (PPM)`, 180, 310)

          .font('Helvetica-Bold')
          .text('Kecepatan Internet:', 50, 330)
          .font('Helvetica')
          .text(`${reportData.internet_speed || '0'} Mbps`, 180, 330);

        // Section 3: Rincian Hasil Audit
        doc
          .fillColor('#1e293b')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('RINCIAN AUDIT FASILITAS', 50, 370)
          .moveTo(50, 388)
          .lineTo(doc.page.width - 50, 388)
          .stroke('#e2e8f0');

        // Draw Table Header
        let yPos = 405;
        doc
          .rect(50, yPos, doc.page.width - 100, 20)
          .fill('#f1f5f9');

        doc
          .fillColor('#1e293b')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Fasilitas', 60, yPos + 6)
          .text('Status', 220, yPos + 6)
          .text('Bobot', doc.page.width - 180, yPos + 6)
          .text('Keterangan', doc.page.width - 120, yPos + 6);

        yPos += 20;

        // Populate Table Rows
        const items = reportData.breakdown_data?.items || [];
        doc.fillColor('#000000').font('Helvetica');

        for (const item of items) {
          // If table exceeds page height, add page
          if (yPos > doc.page.height - 80) {
            doc.addPage();
            yPos = 50;
            // Redraw headers on new page
            doc
              .rect(50, yPos, doc.page.width - 100, 20)
              .fill('#f1f5f9');
            doc
              .fillColor('#1e293b')
              .fontSize(9)
              .font('Helvetica-Bold')
              .text('Fasilitas', 60, yPos + 6)
              .text('Status', 220, yPos + 6)
              .text('Bobot', doc.page.width - 180, yPos + 6)
              .text('Keterangan', doc.page.width - 120, yPos + 6);
            yPos += 25;
            doc.fillColor('#000000').font('Helvetica');
          }

          doc
            .fontSize(9)
            .text(item.facility.toUpperCase().replace('_', ' '), 60, yPos + 5)
            .font('Helvetica-Bold')
            .fillColor(item.status === 'MATCH' ? '#16a34a' : item.status === 'MISMATCH' ? '#dc2626' : '#64748b')
            .text(item.status, 220, yPos + 5)
            .font('Helvetica')
            .fillColor('#000000')
            .text(item.weight ? `${item.weight}` : item.penalty ? `-${item.penalty}` : '0', doc.page.width - 180, yPos + 5)
            .text(item.status === 'MATCH' ? 'Sesuai klaim' : item.status === 'MISMATCH' ? 'Fasilitas tidak ditemukan' : 'Tidak diklaim', doc.page.width - 120, yPos + 5);

          // Draw bottom line
          doc
            .moveTo(50, yPos + 20)
            .lineTo(doc.page.width - 50, yPos + 20)
            .stroke('#f1f5f9');

          yPos += 20;
        }

        // Footer Note
        doc
          .fillColor('#94a3b8')
          .fontSize(8)
          .text('Laporan ini digenerate secara otomatis oleh sistem InspeksiKos.', 50, doc.page.height - 40, { align: 'center' });

        doc.end();
      } catch (err) {
        reject(new InternalServerErrorException(`Gagal menghasilkan PDF: ${err.message}`));
      }
    });
  }
}
