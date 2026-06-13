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
      <div className="min-h-screen bg-[#080c14] text-gray-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-xs text-gray-400 font-mono">Memproses Invoice Simulasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-gray-100 flex flex-col items-center justify-center p-4 md:p-8 relative selection:bg-blue-600/30 selection:text-blue-200">
      {/* Glow effects */}
      <div className="absolute top-10 left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0c1220]/75 border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
        
        {success ? (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl text-emerald-400 shadow-lg shadow-emerald-950/20">
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Simulasi Pembayaran Berhasil!</h2>
              <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mx-auto">
                Pembayaran untuk properti <span className="text-gray-200 font-semibold">{inspection.property?.name}</span> telah berhasil diverifikasi oleh sistem.
              </p>
            </div>
            <div className="p-4 bg-[#080c14]/80 border border-gray-850 rounded-xl space-y-1.5 text-left text-[9px] font-mono text-gray-400">
              <div>No. Transaksi: {inspection.inspection_id}</div>
              <div>Status: LUNAS (PAID)</div>
              <div>Metode: Simulasi QRIS ({wallet.toUpperCase()})</div>
            </div>
            <p className="text-[9px] text-gray-500">
              Silakan kembali ke tab utama browser Anda. Dasbor pesanan Anda akan otomatis melanjutkan proses pencarian inspektur.
            </p>
            <button
              onClick={() => window.close()}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Tutup Tab Ini
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] font-extrabold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Sandbox Simulator
              </div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mt-2">InspeksiKos Payment Simulator</h2>
              <p className="text-[9px] text-gray-500">Selesaikan transaksi simulasi QRIS Anda di bawah ini.</p>
            </div>

            {error && (
              <div className="p-3 text-xs text-red-400 bg-red-955/20 border border-red-900/30 rounded-xl text-center font-bold">
                ⚠️ {error}
              </div>
            )}

            {inspection && (
              <div className="space-y-4">
                <div className="p-4 bg-[#090d16]/80 border border-gray-850 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Informasi Pembayaran</div>
                  <div className="text-xs space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Properti Kos:</span>
                      <span className="text-white font-bold">{inspection.property?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Alamat:</span>
                      <span className="text-gray-300 text-right max-w-[180px] truncate">{inspection.property?.address}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-800/80 pt-2 mt-2 font-extrabold text-sm">
                      <span className="text-gray-300">Total Nominal:</span>
                      <span className="text-emerald-400">
                        {inspection.property?.claim_data?.comparison_id
                          ? 'Nominal Sesuai Grup'
                          : 'Rp 50.000'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Pilih Metode Simulasi</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['gopay', 'ovo', 'dana'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setWallet(method)}
                        className={`py-2 px-3 rounded-xl border text-[10px] font-bold capitalize transition-all flex flex-col items-center justify-center gap-1.5 ${
                          wallet === method
                            ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400'
                            : 'border-gray-800 bg-[#0e1626] text-gray-400 hover:text-white'
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
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="min-h-screen bg-[#080c14] text-gray-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-xs text-gray-400 font-mono">Memuat Sandbox...</p>
      </div>
    }>
      <PaymentSimulateContent />
    </Suspense>
  );
}
