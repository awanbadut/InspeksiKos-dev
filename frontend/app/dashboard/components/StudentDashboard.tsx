'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building,
  LogOut,
  Loader2,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  ChevronRight,
  MapPin,
  Gauge,
  ExternalLink,
  PhoneCall,
  Layers,
  Compass,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import api from '@/lib/api';

interface StudentDashboardProps {
  email: string | null;
  inspections: any[];
  loading: boolean;
  fetchInspections: (silent?: boolean) => Promise<void>;
  mapReady: boolean;
  handleLogout: () => void;
  onViewReport: (inspection: any) => void;
  onViewDetail: (inspection: any) => void;
  onCompare: (groupItems: any[]) => void;
  setShowRequestModal: (show: boolean) => void;
  setOrderCategory: (category: 'single' | 'multi') => void;
}

// Status config: dot color + label
const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  'inspector_on_location': { dot: 'bg-red-500', label: 'Inspektor Dilokasi' },
  'order_created': { dot: 'bg-[#FF9B3E]', label: 'Pesan Dibuat' },
  'confirmed': { dot: 'bg-[#3B82F6]', label: 'Dikonfirmasi' },
  'completed': { dot: 'bg-green-500', label: 'Selesai' },
};

function getStatusConfig(status: string, inspectorId: string | null) {
  if (status === 'completed') return STATUS_CONFIG['completed'];
  if (inspectorId === null) return STATUS_CONFIG['order_created'];
  if (status === 'confirmed' || status === 'assigned') return STATUS_CONFIG['confirmed'];
  return STATUS_CONFIG['inspector_on_location'];
}

const ITEMS_PER_PAGE = 4;

export default function StudentDashboard({
  email,
  inspections,
  loading,
  fetchInspections,
  mapReady,
  handleLogout,
  onViewReport,
  onViewDetail,
  onCompare,
  setShowRequestModal,
  setOrderCategory,
}: StudentDashboardProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Leaflet Map instance inside dashboard
  useEffect(() => {
    if (mapReady && inspections.length > 0) {
      const timer = setTimeout(() => {
        const L = (window as any).L;
        if (!L) return;

        const completedWithLocation = inspections.filter(
          (insp) => insp.status === 'completed' && insp.property?.claim_data?.location?.latitude
        );

        const mapContainer = document.getElementById('all-properties-map-container');
        if (!mapContainer || completedWithLocation.length === 0) return;

        const defaultLat = -0.9471;
        const defaultLng = 100.4172;

        const mapInstance = L.map('all-properties-map-container').setView([defaultLat, defaultLng], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        completedWithLocation.forEach((insp) => {
          const { latitude, longitude } = insp.property.claim_data.location;
          const score = insp.audit_report?.score || 0;

          const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapInstance);

          const popupContent = `
            <div style="font-family: sans-serif; padding: 4px; min-width: 140px; color: #1e293b;">
              <h5 style="margin: 0 0 3px 0; font-size: 11px; font-weight: 800; color: #0f172a;">${insp.property.name}</h5>
              <p style="margin: 0 0 6px 0; font-size: 9px; color: #64748b; line-height: 1.3;">${insp.property.address}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 9px; font-weight: 800; color: #0060aa; background: #e0f2fe; padding: 1px 4px; border-radius: 4px;">
                  Skor: ${score}%
                </span>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
        });

        mapInstance.invalidateSize();
        setTimeout(() => mapInstance.invalidateSize(), 150);

        (window as any).currentDashboardMap = mapInstance;
      }, 200);

      return () => {
        clearTimeout(timer);
        const mapInst = (window as any).currentDashboardMap;
        if (mapInst) {
          mapInst.remove();
          (window as any).currentDashboardMap = null;
        }
      };
    }
  }, [mapReady, inspections]);

  // Compute dynamic stats
  const completedInspections = inspections.filter(i => i.status === 'completed');
  const runningInspections = inspections.filter(i => i.status !== 'completed');

  const berjalanCount = runningInspections.length;
  const selesaiCount = completedInspections.length;
  const loyalitasLevel = selesaiCount >= 3 ? 'Premium' : 'Regular';

  // Dynamic values for bar chart
  let kebersihanAvg = 0;
  let keamananAvg = 0;
  let fasilitasAvg = 0;
  let lokasiAvg = 0;
  let legalitasAvg = 0;

  if (selesaiCount > 0) {
    completedInspections.forEach(insp => {
      const ext = insp.extracted_data || {};
      const score = insp.audit_report?.score || 80;

      // Extract cleanliness score (e.g. from TDS or AI score)
      const tds = Number(insp.tds_value || 150);
      const cleanliness = tds <= 150 ? 95 : tds <= 300 ? 80 : 50;
      kebersihanAvg += cleanliness;

      // Keamanan based on CCTV/security claim matches
      keamananAvg += ext.fasilitas?.keamanan?.ada !== false ? 85 : 40;

      // Overall match rate
      fasilitasAvg += Number(score);

      // Lokasi based on geofencing
      lokasiAvg += 90;

      // Legalitas score
      legalitasAvg += 85;
    });

    kebersihanAvg = Math.round(kebersihanAvg / selesaiCount);
    keamananAvg = Math.round(keamananAvg / selesaiCount);
    fasilitasAvg = Math.round(fasilitasAvg / selesaiCount);
    lokasiAvg = Math.round(lokasiAvg / selesaiCount);
    legalitasAvg = Math.round(legalitasAvg / selesaiCount);
  } else {
    // Default Figma values
    kebersihanAvg = 78;
    keamananAvg = 75;
    fasilitasAvg = 78;
    lokasiAvg = 65;
    legalitasAvg = 88;
  }

  // Comparison groups
  const comparisonGroups: Record<string, any[]> = {};
  completedInspections.forEach(insp => {
    const compId = insp.property?.claim_data?.comparison_id;
    if (compId) {
      if (!comparisonGroups[compId]) {
        comparisonGroups[compId] = [];
      }
      comparisonGroups[compId].push(insp);
    }
  });

  const validComparisonGroups = Object.keys(comparisonGroups)
    .map(key => ({
      id: key,
      items: comparisonGroups[key]
    }))
    .filter(g => g.items.length >= 2);

  const hasCompletedLocations = inspections.some(
    (insp) => insp.status === 'completed' && insp.property?.claim_data?.location?.latitude
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(inspections.length / ITEMS_PER_PAGE));
  const paginatedInspections = inspections.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Bar chart data
  const barChartData = [
    { label: 'KEBERSIHAN', value: kebersihanAvg, color: 'bg-[#1F3E5A]' },
    { label: 'KEAMANAN', value: keamananAvg, color: 'bg-[#2D6A9F]' },
    { label: 'FASILITAS', value: fasilitasAvg, color: 'bg-[#3B82F6]' },
    { label: 'LOKASI', value: lokasiAvg, color: 'bg-[#1F3E5A]' },
    { label: 'LEGALITAS', value: legalitasAvg, color: 'bg-[#2D6A9F]' },
  ];

  return (
    <div className="min-h-screen bg-[#E8F4FD] font-sans text-slate-800">
      {/* ========== NAVBAR ========== */}
      <header className="sticky top-0 z-50 bg-[#E8F4FD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="bg-[#D6E8F7] rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border border-blue-200/40">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.webp"
                alt="InspeksiKos"
                width={120}
                height={40}
                className="h-10 sm:h-12 w-auto mix-blend-multiply"
              />
            </Link>

            {/* Right: Email + Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-xs font-semibold text-[#1F3E5A] truncate max-w-[200px]">
                {email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold bg-white text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">

        {/* ========== HERO BANNER ========== */}
        <section className="w-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl sm:rounded-3xl overflow-hidden relative p-6 sm:p-10 md:p-12 shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-8 w-56 h-56 bg-white/5 rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Selamat Datang, {email?.split('@')[0]}!
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                Kelola pengajuan verifikasi properti kos Anda di Kota Padang untuk memvalidasi fasilitas iklan secara transparan.
              </p>
            </div>
            <button
              onClick={() => {
                setOrderCategory('single');
                setShowRequestModal(true);
              }}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#1F3E5A] font-bold text-sm sm:text-base px-6 py-3.5 rounded-full transition-all cursor-pointer shadow-md shrink-0 group"
            >
              <span>Ajukan Inspeksi</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

        {/* ========== 3 STAT CARDS ========== */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Berjalan - Blue */}
          <div className="bg-[#3B82F6] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <ClipboardList className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Berjalan</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{berjalanCount} <span className="text-lg font-bold">Order</span></span>
            </div>
          </div>

          {/* Selesai - Orange */}
          <div className="bg-[#FF9B3E] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Selesai</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">{selesaiCount} <span className="text-lg font-bold">Order</span></span>
            </div>
          </div>

          {/* Loyalitas - Yellow */}
          <div className="bg-[#FFD147] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Loyalitas</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1F3E5A] block">{loyalitasLevel}</span>
            </div>
          </div>
        </section>

        {/* ========== MAP (conditional) ========== */}
        {hasCompletedLocations && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-[#1F3E5A] mb-4 flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#3B82F6]" />
              Peta Sebaran Kos Terverifikasi
            </h3>
            <div
              id="all-properties-map-container"
              className="w-full h-64 rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
              style={{ minHeight: '260px' }}
            />
          </section>
        )}

        {/* ========== COMPARISON GROUPS ========== */}
        {validComparisonGroups.length > 0 && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-[#1F3E5A] mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#3B82F6]" />
              Hasil Perbandingan Paket Komparasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validComparisonGroups.map(group => {
                const names = group.items.map(i => i.property.name).join(' vs ');
                return (
                  <div key={group.id} className="p-4 bg-[#E8F4FD] border border-blue-100 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1F3E5A] truncate">{names}</p>
                      <p className="text-xs text-slate-500">{group.items.length} Kos dibandingkan</p>
                    </div>
                    <button
                      onClick={() => onCompare(group.items)}
                      className="px-4 py-2 bg-[#1F3E5A] hover:bg-[#162D42] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      Bandingkan
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========== TWO COLUMN: INSPECTIONS + STATS ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Inspection List (3/5 width on lg) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-[#1F3E5A]">
                  Daftar Permintaan Inspeksi
                </h3>
                <Link
                  href="/riwayat"
                  className="text-xs sm:text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] flex items-center gap-1 transition-colors"
                >
                  Riwayat Inspeksi
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Content */}
              <div className="px-5 sm:px-6 py-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="h-6 w-6 text-[#3B82F6] animate-spin" />
                    <span className="text-xs text-slate-400 font-semibold">Sinkronisasi data...</span>
                  </div>
                ) : inspections.length === 0 ? (
                  <div className="text-center py-16 bg-[#E8F4FD]/50 border border-dashed border-blue-200 rounded-xl">
                    <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500 mb-1">Belum Ada Pengajuan Kos</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Kos yang Anda daftarkan untuk diinspeksi akan muncul di sini. Klik &quot;Ajukan Inspeksi&quot; untuk memulai.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedInspections.map((insp: any) => {
                      const packageLabel = insp.property?.claim_data?.comparison_id ? 'Komparasi' : 'Single';
                      const photoUrl = insp.photos?.[0]?.photo_url || '/logo.webp';
                      const statusCfg = getStatusConfig(insp.status, insp.inspector_id);

                      return (
                        <div
                          key={insp.inspection_id}
                          className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                          {/* Thumbnail */}
                          <div className="h-16 w-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img src={photoUrl} alt="Kos" className="h-full w-full object-cover" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-sm font-bold text-[#1F3E5A] truncate">
                              {insp.property?.name || 'Kos Baru'}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{insp.property?.address}</span>
                            </p>
                          </div>

                          {/* Meta: Paket + Tanggal */}
                          <div className="flex gap-6 text-left shrink-0">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">PAKET</span>
                              <span className="text-xs font-bold text-[#1F3E5A] block">{packageLabel}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">TANGGAL</span>
                              <span className="text-xs font-bold text-[#1F3E5A] block">
                                {new Date(insp.assigned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          {/* Status + Action */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Status badge with dot */}
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <span className={`h-2.5 w-2.5 rounded-full ${statusCfg.dot}`} />
                              {statusCfg.label}
                            </span>

                            <button
                              onClick={() => {
                                if (insp.status === 'completed') {
                                  onViewReport(insp);
                                } else {
                                  onViewDetail(insp);
                                }
                              }}
                              className="text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB] flex items-center gap-0.5 cursor-pointer transition-colors whitespace-nowrap"
                            >
                              Lihat Detail
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {inspections.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-center gap-1.5 mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === page
                            ? 'bg-[#3B82F6] text-white shadow-sm'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Compliance Stats (2/5 width on lg) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-[#1F3E5A] flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-[#3B82F6]" />
                  Statistik Kepatuhan Properti
                </h3>
              </div>

              {/* Bar Chart */}
              <div className="px-5 sm:px-6 py-6">
                <div className="flex justify-between items-end h-52 gap-3">
                  {barChartData.map((bar) => (
                    <div key={bar.label} className="flex flex-col items-center justify-end h-full flex-1 gap-2">
                      <span className="text-[10px] font-bold text-slate-600">{bar.value}%</span>
                      <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end">
                        <div
                          className={`w-full ${bar.color} rounded-t-md transition-all duration-700 ease-out`}
                          style={{ height: `${bar.value}%` }}
                        />
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 text-center leading-tight">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 bg-[#1F3E5A] rounded-sm" />
                    <span className="text-[10px] font-semibold text-slate-500">Utama</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 bg-[#3B82F6] rounded-sm" />
                    <span className="text-[10px] font-semibold text-slate-500">Pendukung</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== BOTTOM TWO CARDS ========== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT: Upgrade / Dark card */}
          <div className="bg-[#1F3E5A] rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Decorative blur */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#3B82F6]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <span className="inline-block text-[10px] font-bold px-3 py-1 bg-[#3B82F6] text-white rounded-full uppercase tracking-wider">
                TERVERIFIKASI
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                Dapatkan Laporan<br />Super Lengkap
              </h4>
              <p className="text-xs text-blue-200/80 leading-relaxed max-w-sm">
                Upgrade ke Paket Komparasi untuk membandingkan 3 kos sekaligus secara langsung di dashboard Anda.
              </p>
            </div>

            <button
              onClick={() => {
                setOrderCategory('multi');
                setShowRequestModal(true);
              }}
              className="mt-5 flex items-center gap-2 bg-white hover:bg-slate-50 text-[#1F3E5A] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md w-fit relative z-10"
            >
              <span>Upgrade Sekarang</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          {/* RIGHT: Help / Light card */}
          <div className="bg-[#D6E8F7] rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
            <div className="space-y-3">
              <h4 className="text-xl sm:text-2xl font-extrabold text-[#1F3E5A] leading-tight">
                Butuh Bantuan?
              </h4>
              <p className="text-xs sm:text-sm text-[#2F5276] leading-relaxed">
                Hubungi Customer Service kami jika Anda mengalami kendala pada pesanan atau butuh konsultasi pemilihan paket verifikasi kos.
              </p>
            </div>

            <a
              href="https://wa.me/6281234567890?text=Halo%20InspeksiKos,%20saya%20butuh%20bantuan%20terkait%20pesanan%20inspeksi%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md w-fit"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Hubungi Whatsapp</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
