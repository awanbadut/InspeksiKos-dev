'use client';

import { X, CheckCircle2, Clock, Calendar, MapPin, ShieldCheck } from 'lucide-react';

interface DetailKosModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: any;
}

export default function DetailKosModal({ isOpen, onClose, inspection }: DetailKosModalProps) {
  if (!isOpen || !inspection) return null;

  const property = inspection.property || {};
  const claimData = property.claim_data || {};
  const claimFasilitas = claimData.fasilitas || {};

  // Parse standard & custom checklists
  const standardKeys = ['kasur', 'lemari', 'ac', 'wifi', 'kamar_mandi_dalam', 'kualitas_air', 'kecepatan_internet'];
  const priorityList = Object.keys(claimFasilitas)
    .filter((key) => standardKeys.includes(key) && claimFasilitas[key]?.ada === true)
    .map((key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

  const customList = Object.keys(claimFasilitas)
    .filter((key) => !standardKeys.includes(key) && claimFasilitas[key]?.ada === true)
    .map((key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

  // Pricing breakdown based on plan
  const isComparison = !!claimData.comparison_id;
  const packageLabel = isComparison ? 'Komparasi (Group Audit)' : 'Premium Inspection Plan';
  
  const basePrice = isComparison ? 45000 : 50000;
  const tax = Math.round(basePrice * 0.11);
  const adminFee = isComparison ? 2500 : 5000;
  const totalPrice = basePrice + tax + adminFee;

  const formattedBase = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(basePrice);
  const formattedTax = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(tax);
  const formattedAdmin = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(adminFee);
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPrice);

  // Parse date
  const dateStr = inspection.assigned_at || inspection.created_at;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) + ' • 10:00 WIB'
    : 'Menunggu Penjadwalan';

  // Status mapping for timeline
  const status = inspection.status;
  const isStep1Active = true; // Permintaan Dibuat is always done if order exists
  const isStep2Active = status === 'assigned' || status === 'confirmed' || status === 'in_progress' || status === 'completed';
  const isStep3Active = status === 'in_progress' || status === 'completed';
  const isStep4Active = status === 'completed';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-slate-800 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <h3 className="text-lg font-bold text-[#1F3E5A]">Detail Kos</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Kos info & Checklists (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Kos Profile Summary */}
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm">
                <img
                  src={inspection.photos?.[0]?.photo_url || '/logo.webp'}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-extrabold text-[#1F3E5A] truncate">{property.name || 'Nama Kos'}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{property.address || 'Alamat Kos'}</span>
                </p>
              </div>
            </div>

            {/* Plan and Schedule details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#E8F4FD]/50 p-4 border border-blue-100/50 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paket Inspeksi</span>
                <span className="text-xs font-bold text-[#1F3E5A] flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="h-4 w-4 text-[#3B82F6] shrink-0" />
                  {packageLabel}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jadwal Audit</span>
                <span className="text-xs font-bold text-[#1F3E5A] flex items-center gap-1.5 mt-1">
                  <Calendar className="h-4 w-4 text-[#3B82F6] shrink-0" />
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Checklist Prioritas */}
            <div className="space-y-2">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Checklist Prioritas</h5>
              <div className="flex flex-wrap gap-2">
                {priorityList.length > 0 ? (
                  priorityList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1F3E5A] text-white text-[11px] font-semibold rounded-full shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Tidak ada checklist prioritas utama dipilih</span>
                )}
              </div>
            </div>

            {/* Custom Checklist */}
            <div className="space-y-2">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Custom Checklist</h5>
              <div className="flex flex-wrap gap-2">
                {customList.length > 0 ? (
                  customList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#EAF7FF] text-[#1F3E5A] border border-blue-200/50 text-[11px] font-semibold rounded-full"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3B82F6]" />
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Tidak ada fasilitas kustom ditambahkan</span>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: Order status & Payment (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-slate-100 lg:pl-6">
            
            {/* Status Pesanan Timeline */}
            <div className="space-y-4">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Status Pesanan</h5>
              
              <div className="relative pl-6 space-y-5 border-l border-slate-200 ml-3">
                {/* Step 1 */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 rounded-full p-0.5 bg-white border ${isStep1Active ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300'}`}>
                    <CheckCircle2 className="h-4 w-4 fill-white text-emerald-500" />
                  </span>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${isStep1Active ? 'text-[#1F3E5A]' : 'text-slate-400'}`}>Permintaan Dibuat</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Order verifikasi berhasil dikirim</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 rounded-full p-0.5 bg-white border ${isStep2Active ? 'border-emerald-500 text-emerald-500' : 'border-slate-350 text-slate-300'}`}>
                    {isStep2Active ? <CheckCircle2 className="h-4 w-4 fill-white text-emerald-500" /> : <Clock className="h-4 w-4" />}
                  </span>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${isStep2Active ? 'text-[#1F3E5A]' : 'text-slate-400'}`}>Dijadwalkan</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Inspektur terdekat ditugaskan</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 rounded-full p-0.5 bg-white border ${isStep3Active ? 'border-emerald-500 text-emerald-500' : 'border-slate-350 text-slate-300'}`}>
                    {isStep3Active ? <CheckCircle2 className="h-4 w-4 fill-white text-emerald-500" /> : <Clock className="h-4 w-4" />}
                  </span>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${isStep3Active ? 'text-[#1F3E5A]' : 'text-slate-400'}`}>Inspeksi Lapangan</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Survei fasilitas sedang berjalan</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 rounded-full p-0.5 bg-white border ${isStep4Active ? 'border-emerald-500 text-emerald-500' : 'border-slate-350 text-slate-300'}`}>
                    {isStep4Active ? <CheckCircle2 className="h-4 w-4 fill-white text-emerald-500" /> : <Clock className="h-4 w-4" />}
                  </span>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${isStep4Active ? 'text-[#1F3E5A]' : 'text-slate-400'}`}>Selesai</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Laporan audit AI diterbitkan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pembayaran Breakdown */}
            <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2 flex justify-between items-center">
                <span>Pembayaran</span>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 text-[9px] font-black rounded-md border border-emerald-300 font-mono tracking-wider">LUNAS</span>
              </h5>
              
              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Biaya Inspeksi</span>
                  <span className="font-semibold text-slate-800">{formattedBase}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (11%)</span>
                  <span className="font-semibold text-slate-800">{formattedTax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Admin</span>
                  <span className="font-semibold text-slate-800">{formattedAdmin}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-sm text-[#1F3E5A]">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="flex justify-end border-t border-slate-100 pt-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1F3E5A] hover:bg-[#162D42] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
