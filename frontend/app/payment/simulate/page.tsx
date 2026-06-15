'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

function PaymentSimulateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inspectionId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inspection, setInspection] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [wallet, setWallet] = useState('gopay');

  useEffect(() => {
    if (!inspectionId) {
      setError('ID Inspeksi tidak ditemukan di parameter URL');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await api.get(`/inspections/${inspectionId}`);
        setInspection(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat detail transaksi inspeksi');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [inspectionId]);

  const handlePay = async () => {
    if (!inspection) return;
    setPaying(true);
    try {
      const property = inspection.property;
      const currentClaimData = property?.claim_data || {};
      
      // Update payment_status to 'paid'
      const updatedClaimData = {
        ...currentClaimData,
        payment_status: 'paid',
      };

      await api.patch(`/properties/${property.property_id}`, {
        claim_data: updatedClaimData,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memproses simulasi pembayaran');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-mono">Memproses Invoice Simulasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 md:p-8 relative selection:bg-teal-500/20 selection:text-teal-900">
      {/* Decorative background glow spots */}
      <div className="absolute top-10 left-[10%] w-[350px] h-[350px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-brand-teal to-accent-bright" />
        
        {success ? (
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600 shadow-md">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-sm font-extrabold text-primary uppercase tracking-wider">Simulasi Pembayaran Berhasil!</h2>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Pembayaran untuk properti <span className="text-slate-800 font-extrabold">{inspection.property?.name}</span> telah berhasil diverifikasi oleh sistem.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-left text-[9px] font-mono text-slate-500 shadow-inner">
              <div>No. Transaksi: {inspection.inspection_id}</div>
              <div>Status: LUNAS (PAID)</div>
              <div>Metode: Simulasi QRIS ({wallet.toUpperCase()})</div>
            </div>
            <p className="text-[9px] text-slate-400">
              Silakan kembali ke tab utama browser Anda. Dasbor pesanan Anda akan otomatis melanjutkan proses pencarian inspektur.
            </p>
            <button
              onClick={() => window.close()}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider border border-slate-200 transition-all cursor-pointer active:scale-[0.98]"
            >
              Tutup Tab Ini
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-teal" />
                Secure Sandbox Simulator
              </div>
              <h2 className="text-base font-extrabold text-primary uppercase tracking-wider mt-2">InspeksiKos Payment Simulator</h2>
              <p className="text-[9px] text-slate-400">Selesaikan transaksi simulasi QRIS Anda di bawah ini.</p>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-center font-extrabold font-mono">
                ⚠️ {error}
              </div>
            )}

            {inspection && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-inner">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Informasi Tagihan</div>
                  <div className="text-xs space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Properti Kos:</span>
                      <span className="text-slate-800 font-bold">{inspection.property?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Alamat:</span>
                      <span className="text-slate-600 text-right max-w-[180px] truncate">{inspection.property?.address}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2 font-extrabold text-sm">
                      <span className="text-slate-700">Total Nominal:</span>
                      <span className="text-teal-700">
                        {inspection.property?.claim_data?.comparison_id
                          ? 'Nominal Sesuai Grup'
                          : 'Rp 50.000'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Pilih Metode Simulasi</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['gopay', 'ovo', 'dana'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setWallet(method)}
                        className={`py-2 px-3 rounded-xl border text-[10px] font-bold capitalize transition-all flex flex-col items-center justify-center gap-1.5 ${
                          wallet === method
                            ? 'border-brand-teal bg-teal-50/50 text-teal-800 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Wallet className="h-4 w-4" />
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent-light hover:from-primary hover:to-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    {paying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Proses Bayar Sekarang
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSimulatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-mono">Memuat Sandbox...</p>
      </div>
    }>
      <PaymentSimulateContent />
    </Suspense>
  );
}
