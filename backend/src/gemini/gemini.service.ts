import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly fallbackModels = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-3-flash',
  ];

  private currentKeyIndex = 0;

  constructor(private configService: ConfigService) {}

  private getApiKeys(): string[] {
    const keysStr = this.configService.get<string>('GEMINI_API_KEYS');
    if (keysStr) {
      const keys = keysStr.split(',').map((k) => k.trim()).filter(Boolean);
      if (keys.length > 0) return keys;
    }
    const singleKey = this.configService.get<string>('GEMINI_API_KEY');
    if (singleKey) {
      return [singleKey];
    }
    throw new InternalServerErrorException('GEMINI_API_KEY belum terkonfigurasi');
  }

  async extractFasilitas(photos: { url: string; category: string }[]): Promise<Record<string, any>> {
    const apiKeys = this.getApiKeys();

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
        } catch (err: any) {
          console.error(`Gagal mendownload foto dari URL ${photo.url}:`, err.message);
          throw err;
        }
      }),
    );

    const parts = [
      { text: prompt },
      ...photoParts.flat(),
    ];

    let lastError: any = null;

    // Round-Robin API Key & Multi-Model Fallback Rotation
    for (const modelName of this.fallbackModels) {
      const startKeyIdx = this.currentKeyIndex;
      for (let i = 0; i < apiKeys.length; i++) {
        const keyIdx = (startKeyIdx + i) % apiKeys.length;
        const apiKey = apiKeys[keyIdx];

        try {
          console.log(`[Gemini AI] Memproses AI Vision -> Model: ${modelName} | Key #${keyIdx + 1}/${apiKeys.length}`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await axios.post(
            url,
            { contents: [{ parts }] },
            { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
          );

          const candidate = response.data?.candidates?.[0];
          if (!candidate) {
            throw new Error(`Respons dari model ${modelName} tidak berisi candidate`);
          }

          const rawText = candidate.content?.parts?.[0]?.text;
          if (!rawText) {
            throw new Error(`Respons dari model ${modelName} tidak berisi text`);
          }

          // Advance round-robin pointer for next incoming request
          this.currentKeyIndex = (keyIdx + 1) % apiKeys.length;
          console.log(`[Gemini AI] Sukses diproses -> Model: ${modelName} | Key #${keyIdx + 1}`);
          return this.parseResponse(rawText);
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini AI Fallback] Model ${modelName} + Key #${keyIdx + 1} gagal: ${err.response?.data?.error?.message || err.message}. Mencoba alternatif...`);
        }
      }
    }

    console.error('Semua fallback model & API keys Gemini AI gagal:', lastError?.message);
    throw new InternalServerErrorException('AI Service Tidak Tersedia (Semua model/key kuota habis)');
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
    const apiKeys = this.getApiKeys();

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

    let lastError: any = null;

    for (const modelName of this.fallbackModels) {
      const startKeyIdx = this.currentKeyIndex;
      for (let i = 0; i < apiKeys.length; i++) {
        const keyIdx = (startKeyIdx + i) % apiKeys.length;
        const apiKey = apiKeys[keyIdx];

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await axios.post(
            url,
            { contents },
            { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
          );

          const candidate = response.data?.candidates?.[0];
          if (!candidate) {
            throw new Error(`Respons Chat dari model ${modelName} tidak valid`);
          }

          const rawText = candidate.content?.parts?.[0]?.text;
          if (!rawText) {
            throw new Error(`Respons Chat dari model ${modelName} tidak berisi text`);
          }

          this.currentKeyIndex = (keyIdx + 1) % apiKeys.length;
          return rawText;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Chat Fallback] Model ${modelName} + Key #${keyIdx + 1} gagal: ${err.message}. Mencoba alternatif...`);
        }
      }
    }

    console.error('Chat Gemini semua model/keys gagal:', lastError?.message);
    throw new InternalServerErrorException('Gagal berkomunikasi dengan AI');
  }

  private parseResponse(rawText: string): Record<string, any> {
    const clean = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }
}
