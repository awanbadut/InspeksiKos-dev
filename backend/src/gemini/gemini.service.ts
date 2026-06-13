import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly apiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  private readonly MAX_RETRY = 3;

  constructor(private configService: ConfigService) {}

  async extractFasilitas(photos: { url: string; category: string }[]): Promise<Record<string, any>> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY belum terkonfigurasi');
    }

    const categoryLabels: Record<string, string> = {
      kasur: 'Kasur',
      lemari: 'Lemari',
      ac: 'Pendingin Ruangan (AC)',
      wifi: 'Router WiFi',
      kamar_mandi_dalam: 'Kamar Mandi Dalam',
      kualitas_air: 'Hasil Ukur Kualitas Air (TDS Meter)',
      kecepatan_internet: 'Hasil Speedtest Kecepatan Internet',
      umum: 'Fasilitas Umum',
    };

    let attempt = 0;
    while (attempt < this.MAX_RETRY) {
      try {
        const prompt = this.buildPrompt();

        // Convert image URLs to base64 inline_data with category context
        const photoParts = await Promise.all(
          photos.map(async (photo) => {
            try {
              const response = await axios.get(photo.url, { responseType: 'arraybuffer' });
              const base64Data = Buffer.from(response.data, 'binary').toString('base64');
              const mimeType = response.headers['content-type'] || 'image/jpeg';
              
              const label = categoryLabels[photo.category] || photo.category;
              return [
                { text: `Gambar berikut adalah foto aktual dari pengecekan fasilitas "${label}":` },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ];
            } catch (err) {
              console.error(`Gagal mendownload atau mengonversi gambar dari URL: ${photo.url}`, err.message);
              throw err;
            }
          }),
        );

        const parts = [
          { text: prompt },
          ...photoParts.flat(),
        ];

        const response = await axios.post(
          `${this.apiUrl}?key=${apiKey}`,
          { contents: [{ parts }] },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const candidate = response.data?.candidates?.[0];
        if (!candidate) {
          throw new Error('Respons Gemini tidak valid (tidak ada candidate)');
        }

        const rawText = candidate.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error('Respons Gemini tidak valid (tidak ada text)');
        }

        return this.parseResponse(rawText);
      } catch (err) {
        attempt++;
        console.warn(`Attempt ${attempt} untuk Gemini AI Vision gagal: ${err.message}`);
        if (attempt >= this.MAX_RETRY) {
          throw new InternalServerErrorException('AI Service Tidak Tersedia');
        }
        // Small delay before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new InternalServerErrorException('AI Service Tidak Tersedia');
  }

  private buildPrompt(): string {
    return `
      Analisis foto-foto properti kos berikut. Identifikasi semua fasilitas yang tersedia.
      Kembalikan HANYA dalam format JSON berikut (tanpa teks lain):
      {
        "fasilitas": {
          "kasur":              { "ada": boolean, "kondisi": "baik|cukup|buruk" },
          "lemari":             { "ada": boolean, "kondisi": "baik|cukup|buruk" },
          "ac":                 { "ada": boolean, "kondisi": "baik|cukup|buruk" },
          "kipas_angin":        { "ada": boolean },
          "kamar_mandi_dalam":  { "ada": boolean },
          "water_heater":       { "ada": boolean },
          "meja_belajar":       { "ada": boolean },
          "kursi":              { "ada": boolean },
          "wifi":               { "router_terlihat": boolean },
          "jendela":            { "ada": boolean },
          "kebersihan":         { "skor": 1-10 }
        },
        "estimasi_ukuran": "kecil|sedang|besar",
        "catatan": "catatan tambahan"
      }
    `;
  }

  async generateChatResponse(
    systemContext: string,
    userMessage: string,
    chatHistory: any[] = [],
  ): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY belum terkonfigurasi');
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: `System Context:\n${systemContext}` }],
      },
      ...chatHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${apiKey}`,
        { contents },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const candidate = response.data?.candidates?.[0];
      if (!candidate) {
        throw new Error('Respons Gemini tidak valid (tidak ada candidate)');
      }

      const rawText = candidate.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Respons Gemini tidak valid (tidak ada text)');
      }

      return rawText;
    } catch (err) {
      console.error('Chat Gemini failed:', err.message);
      throw new InternalServerErrorException('Gagal berkomunikasi dengan AI');
    }
  }

  private parseResponse(rawText: string): Record<string, any> {
    const clean = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }
}
