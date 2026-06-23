'use client';

import { Sparkles } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComparisonGroup: any[];
}

export default function ComparisonModal({
  isOpen,
  onClose,
  selectedComparisonGroup,
}: ComparisonModalProps) {
  if (!isOpen || selectedComparisonGroup.length < 2) return null;

  const sorted = [...selectedComparisonGroup].sort(
    (a, b) => Number(b.audit_report?.score || 0) - Number(a.audit_report?.score || 0)
  );
  const bestKos = sorted[0];

  const allKeys = new Set<string>();
  selectedComparisonGroup.forEach((insp) => {
    const claimFas = insp.property?.claim_data?.fasilitas || {};
    Object.keys(claimFas).forEach((k) => {
      if (k !== 'kualitas_air' && k !== 'kecepatan_internet' && claimFas[k]?.ada !== undefined) {
        allKeys.add(k);
      }
    });
  });

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              Hasil Analisis Komparatif Properti Kos
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-medium">
              Perbandingan data iklan vs hasil verifikasi lapangan (TDS air, Wifi speed, fasilitas) bersertifikasi AI.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-850 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Smart Recommendation Card */}
        {bestKos && bestKos.property && (
          <div className="mb-6 p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl relative overflow-hidden text-left text-slate-800">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-extrabold px-3 py-1 uppercase rounded-bl-lg tracking-wider">
              Rekomendasi Terbaik
            </div>
            <h4 className="text-xs font-bold text-indigo-305 flex items-center gap-1.5 mb-1">
              🌟 Pilihan Utama: {bestKos.property.name}
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Berdasarkan verifikasi lapangan, properti ini memiliki tingkat akreditasi tertinggi sebesar{' '}
              <strong className="text-emerald-600 font-extrabold">{bestKos.audit_report?.score}%</strong>{' '}
              dengan kualitas air bersih ({bestKos.tds_value} ppm) dan kecepatan internet ({bestKos.internet_speed} Mbps) yang paling unggul.
            </p>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/50 shadow-inner text-slate-800">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="p-3 w-1/4">Parameter</th>
                {selectedComparisonGroup.map((insp) => (
                  <th key={insp.inspection_id} className="p-3 text-center border-l border-slate-200/60 font-black text-slate-700">
                    {insp.property?.name || 'Properti Kos'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {/* Score */}
              <tr>
                <td className="p-3 font-semibold text-slate-600">Skor Akreditasi</td>
                {selectedComparisonGroup.map((insp) => (
                  <td key={insp.inspection_id} className="p-3 text-center border-l border-slate-200/60">
                    <span className="font-extrabold text-xs text-blue-600">
                      {insp.audit_report?.score}%
                    </span>
                  </td>
                ))}
              </tr>
              {/* Validity status */}
              <tr>
                <td className="p-3 font-semibold text-slate-600">Status Validitas</td>
                {selectedComparisonGroup.map((insp) => (
                  <td key={insp.inspection_id} className="p-3 text-center border-l border-slate-200/60">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      insp.audit_report?.confidence_level === 'VALID'
                        ? 'bg-emerald-50 text-emerald-805 border border-emerald-200'
                        : insp.audit_report?.confidence_level === 'PARTIAL_VALID'
                        ? 'bg-blue-50 text-blue-805 border border-blue-200 animate-pulse'
                        : 'bg-rose-50 text-rose-805 border border-rose-200'
                    }`}>
                      {insp.audit_report?.confidence_level === 'VALID'
                        ? 'SANGAT SESUAI'
                        : insp.audit_report?.confidence_level === 'PARTIAL_VALID'
                        ? 'CUKUP SESUAI'
                        : 'TIDAK SESUAI'}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Water TDS */}
              <tr>
                <td className="p-3 font-semibold text-slate-600">Kualitas Air (TDS)</td>
                {selectedComparisonGroup.map((insp) => (
                  <td key={insp.inspection_id} className="p-3 text-center border-l border-slate-200/60 font-mono text-slate-700">
                    {insp.tds_value} ppm
                    <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                      {Number(insp.tds_value) <= 300 ? '🟢 Sangat Baik' : Number(insp.tds_value) <= 500 ? '🟡 Layak' : '🔴 Buruk'}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Internet Speed */}
              <tr>
                <td className="p-3 font-semibold text-slate-600">Kecepatan WiFi</td>
                {selectedComparisonGroup.map((insp) => (
                  <td key={insp.inspection_id} className="p-3 text-center border-l border-slate-200/60 font-mono text-slate-700">
                    {insp.internet_speed} Mbps
                    <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                      {Number(insp.internet_speed) >= 20 ? '🟢 Cepat' : Number(insp.internet_speed) >= 10 ? '🟡 Cukup' : '🔴 Lambat'}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Address */}
              <tr>
                <td className="p-3 font-semibold text-slate-600">Alamat Properti</td>
                {selectedComparisonGroup.map((insp) => (
                  <td key={insp.inspection_id} className="p-3 border-l border-slate-200/60 text-slate-500 max-w-[200px] leading-relaxed">
                    {insp.property?.address}
                  </td>
                ))}
              </tr>
              {Array.from(allKeys).map((facilityKey) => {
                return (
                  <tr key={facilityKey}>
                    <td className="p-3 font-semibold text-slate-600 capitalize">
                      Fasilitas {facilityKey.replace(/_/g, ' ')}
                    </td>
                    {selectedComparisonGroup.map((insp) => {
                      const claim = insp.property?.claim_data?.fasilitas?.[facilityKey]?.ada;
                      const actual = insp.inspector_data?.fasilitas?.[facilityKey]?.ada ?? claim;
                      return (
                        <td key={insp.inspection_id} className="p-3 text-center border-l border-slate-200/60">
                          {claim === undefined ? (
                            <span className="text-slate-400 font-mono text-[8px] uppercase">TDK DIKLAIM</span>
                          ) : actual ? (
                            <span className="text-emerald-600 font-bold">✔ Ada</span>
                          ) : (
                            <span className="text-rose-605 font-bold">✖ Tidak Ada</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
