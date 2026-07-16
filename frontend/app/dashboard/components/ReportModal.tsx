'use client';

import { useState } from 'react';
import { Download, ClipboardList, Gauge, Sparkles, Send, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: any;
}

export default function ReportModal({ isOpen, onClose, inspection }: ReportModalProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  if (!isOpen || !inspection || !inspection.audit_report) return null;

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMsg = { role: 'user', parts: [{ text: chatMessage }] };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    const msgToSend = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    try {
      const res = await api.post(`/audit/${inspection.inspection_id}/chat`, {
        message: msgToSend,
        history: chatHistory,
      });

      const modelMsg = { role: 'model', parts: [{ text: res.data.reply }] };
      setChatHistory([...newHistory, modelMsg]);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const initChat = () => {
    setShowChat(!showChat);
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          role: 'model',
          parts: [
            {
              text: `Halo! Saya adalah AI Asisten InspeksiKos. Saya telah meninjau hasil audit untuk "${inspection.property?.name}". Apakah ada yang ingin Anda tanyakan mengenai tingkat validitas, kecepatan internet, atau kualitas air di kos ini?`
            }
          ]
        }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-slate-800 text-left">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#003057]">
              Laporan Audit Scorecard
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              {inspection.property?.name} — {inspection.property?.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Main Score Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Skor Validitas
            </span>
            <span className="text-3xl font-black text-[#003057] mt-1 font-mono">
              {inspection.audit_report.score}%
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Tingkat Kepercayaan
            </span>
            <span
              className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mt-2 border ${
                inspection.audit_report.confidence_level === 'VALID'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : inspection.audit_report.confidence_level === 'PARTIAL_VALID'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {inspection.audit_report.confidence_level === 'VALID'
                ? 'SANGAT SESUAI'
                : inspection.audit_report.confidence_level === 'PARTIAL_VALID'
                ? 'CUKUP SESUAI'
                : 'TIDAK SESUAI'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Laporan Resmi PDF
            </span>
            {inspection.audit_report.pdf_url ? (
              <a
                href={inspection.audit_report.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#0f766e] hover:underline"
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
            ) : (
              <span className="text-[10px] text-slate-500 mt-2 font-mono">
                Belum Tersedia
              </span>
            )}
          </div>
        </div>

        {/* Comparison Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4 text-[#0f766e]" />
            Kecocokan Fasilitas Lapangan (Verifikasi Lapangan)
          </h4>

          {/* Match/Mismatch grid */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {inspection.audit_report.breakdown_data?.items?.map((item: any, i: number) => {
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-200"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold capitalize text-slate-700">
                      {item.facility.replace(/_/g, ' ')}
                    </span>
                    {item.status !== 'NEUTRAL' && (
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        Iklan: <span className="font-semibold text-slate-500">{item.claimed}</span> &middot; Lapangan: <span className="font-semibold text-slate-605">{item.actual}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'MATCH' && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-805 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 tracking-wider">
                        ✓ SESUAI
                      </span>
                    )}
                    {item.status === 'MISMATCH' && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-805 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 tracking-wider">
                        ✗ TIDAK SESUAI
                      </span>
                    )}
                    {item.status === 'NEUTRAL' && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-550 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 tracking-wider">
                        TIDAK DIKLAIM
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical breakdown */}
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 pt-2 flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-[#0f766e]" />
            Data Teknis Pengukuran
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 block mb-1 font-mono uppercase tracking-wider">
                TDS Air Aktual
              </span>
              <span className="text-base font-black text-slate-800">
                {inspection.tds_value} ppm
              </span>
              <span className="text-[8px] text-slate-400 block mt-1 font-mono">
                Klaim Maks: {inspection.property?.claim_data?.fasilitas?.kualitas_air?.nilai || 500} ppm
              </span>
            </div>
            <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 block mb-1 font-mono uppercase tracking-wider">
                Speed Internet
              </span>
              <span className="text-base font-black text-slate-800">
                {inspection.internet_speed} Mbps
              </span>
              <span className="text-[8px] text-slate-400 block mt-1 font-mono">
                Klaim Min: {inspection.property?.claim_data?.fasilitas?.kecepatan_internet?.nilai || 10} Mbps
              </span>
            </div>
          </div>
        </div>

        {/* Note Section instead of AI Chatbot */}
        <div className="border-t border-slate-200 pt-4 mt-6">
          <div className="p-4 bg-[#F0F7FD] border border-[#D0E5F5] rounded-2xl text-[11px] leading-relaxed text-[#1F3E5A]">
            <strong>💡 Catatan Verifikasi:</strong> Seluruh data di atas diverifikasi langsung oleh inspektur kami di lapangan melalui bukti foto ter-watermark GPS, pengukuran speedtest koneksi internet secara langsung dari dalam kamar, serta pengujian kadar zat padat terlarut (TDS) air mandi menggunakan alat ukur terkalibrasi.
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#001e38] hover:to-[#115e59] text-white font-bold rounded-full text-xs transition-all cursor-pointer uppercase tracking-wider grab-btn-transition active:scale-[0.95] hover:scale-[1.02]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
