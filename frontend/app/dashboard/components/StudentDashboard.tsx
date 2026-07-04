'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  Plus,
  LogOut,
  Download,
  Gauge,
  Droplets,
  Eye,
  Loader2,
  ShieldCheck,
  Layers,
  Wifi,
  MapPin,
  ClipboardList,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Send,
  User,
  Compass,
  PhoneCall,
  ChevronDown,
  ExternalLink,
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
  onCompare: (groupItems: any[]) => void;
  setShowRequestModal: (show: boolean) => void;
  setOrderCategory: (category: 'single' | 'multi') => void;
}

export default function StudentDashboard({
  email,
  inspections,
  loading,
  fetchInspections,
  mapReady,
  handleLogout,
  onViewReport,
  onCompare,
  setShowRequestModal,
  setOrderCategory,
}: StudentDashboardProps) {
  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'home' | 'riwayat' | 'bantuan'>('home');
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua Wilayah');
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);

  // Auto-swipe banner timer for mobile view (every 4s)
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(bannerTimer);
  }, []);

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
          const conf = insp.audit_report?.confidence_level || 'UNKNOWN';

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

  // Compute dynamic stats matching figma mockup
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
      lokasiAvg += 90; // Default mockup locations are verified

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

  // Filter inspections for region selector
  const displayedInspections = inspections.filter((insp: any) => {
    if (selectedRegion === 'Semua Wilayah') return true;
    const address = (insp.property?.address || '').toLowerCase();
    const regionWord = selectedRegion.split(' ')[0].toLowerCase();
    return address.includes(regionWord);
  });

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

  return (
    <div className="min-h-screen bg-[#F0F9FF] font-sans text-slate-800 pb-12">
      {/* DESKTOP & LAPTOP CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-6">
        
        {/* Navbar */}
        <header className="w-full bg-[#D2E9FE] rounded-[18px] px-6 py-4 flex items-center justify-between border border-blue-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-extrabold tracking-tight text-[#052746]">inspeksikos</span>
            </Link>
            <span className="text-[9px] px-2 py-0.5 bg-white text-[#052746] border border-blue-300 font-extrabold rounded-md uppercase tracking-wider font-mono">
              mahasiswa
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#052746] rounded-xl">
              <User className="h-4 w-4 text-[#223B55]" />
              <span className="text-xs font-bold text-[#223B55] font-mono">
                {email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-50 text-[#B41E1D] border border-[#B41E1D] rounded-xl hover:bg-red-100/50 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Welcome Banner Card */}
        <section className="w-full bg-[#298EEE] rounded-[18px] border border-blue-200/30 overflow-hidden relative p-8 md:p-12 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-white">
              Selamat Datang, {email?.split('@')[0]}!
            </h1>
            <p className="text-sm md:text-base text-white/90 max-w-2xl leading-relaxed">
              Kelola pengajuan verifikasi properti kos Anda di Kota Padang untuk memvalidasi fasilitas iklan secara transparan.
            </p>
          </div>
          <button
            onClick={() => {
              setOrderCategory('single');
              setShowRequestModal(true);
            }}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#333333] font-extrabold text-sm md:text-base px-6 py-4 rounded-[30px] transition-all cursor-pointer shadow-md transform hover:scale-[1.02]"
          >
            <span>Ajukan Inspeksi</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </section>

        {/* Dashboard Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Berjalan */}
          <div className="bg-[#70B4F4] rounded-2xl p-5 border border-blue-300 flex items-center gap-4 shadow-sm">
            <div className="h-16 w-16 bg-[#B8CDE3] rounded-full flex items-center justify-center">
              <ClipboardList className="h-8 w-8 text-[#094074]" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Berjalan</span>
              <span className="text-3xl font-black text-slate-800 block">{berjalanCount} Order</span>
            </div>
          </div>
          {/* Card 2: Selesai */}
          <div className="bg-[#FFB554] rounded-2xl p-5 border border-orange-200 flex items-center gap-4 shadow-sm">
            <div className="h-16 w-16 bg-[#FFDAAA] rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-[#8C4F00]" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Selesai</span>
              <span className="text-3xl font-black text-slate-800 block">{selesaiCount} Order</span>
            </div>
          </div>
          {/* Card 3: Loyalitas */}
          <div className="bg-[#FFDD4A] rounded-2xl p-5 border border-yellow-300 flex items-center gap-4 shadow-sm">
            <div className="h-16 w-16 bg-[#FFEEA4] rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-[#FFD20D]" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Loyalitas</span>
              <span className="text-3xl font-black text-slate-800 block">{loyalitasLevel}</span>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Inspections list and Map) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Map (Optional display if completed items have location) */}
            {hasCompletedLocations && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left">
                <h3 className="text-sm font-extrabold text-[#052746] mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#298EEE]" />
                  Peta Sebaran Kos Terverifikasi
                </h3>
                <div
                  id="all-properties-map-container"
                  className="w-full h-64 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50"
                  style={{ minHeight: '260px' }}
                />
              </div>
            )}

            {/* Comparison Groups banner */}
            {validComparisonGroups.length > 0 && (
              <div className="bg-[#D2E9FE]/30 border border-blue-200 rounded-3xl p-6 text-left shadow-sm">
                <h3 className="text-xs font-bold text-[#052746] mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[#298EEE]" />
                  Hasil Perbandingan Paket Komparasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validComparisonGroups.map(group => {
                    const names = group.items.map(i => i.property.name).join(' vs ');
                    return (
                      <div key={group.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-800 truncate">{names}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{group.items.length} Kos dibandingkan</p>
                        </div>
                        <button
                          onClick={() => onCompare(group.items)}
                          className="px-3.5 py-1.5 bg-[#052746] hover:bg-[#003057] text-white font-bold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Bandingkan
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inspections List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-sm font-extrabold text-[#052746] uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#298EEE]" />
                  Daftar Permintaan Inspeksi
                </h3>
                
                {/* Region filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-255 rounded-xl px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#298EEE] cursor-pointer"
                  >
                    <option value="Semua Wilayah">📍 Semua Wilayah</option>
                    <option value="Limau Manis (Unand)">📍 Limau Manis</option>
                    <option value="Air Tawar (UNP)">📍 Air Tawar</option>
                    <option value="Lolong Belanti">📍 Lolong Belanti</option>
                    <option value="Ulu Gadut">📍 Ulu Gadut</option>
                    <option value="By Pass Padang">📍 By Pass</option>
                  </select>

                  <button
                    onClick={() => fetchInspections(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl border border-slate-255 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-6 w-6 text-[#298EEE] animate-spin" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sinkronisasi data...</span>
                </div>
              ) : displayedInspections.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-500 mb-1">Belum Ada Pengajuan Kos</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Kos yang Anda daftarkan untuk diinspeksi akan muncul di sini. Klik "Ajukan Inspeksi" untuk memulai.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedInspections.map((insp: any) => {
                    const isUnassigned = insp.inspector_id === null;
                    const packageLabel = insp.property?.claim_data?.comparison_id ? 'Komparasi' : 'Single';
                    const photoUrl = insp.photos?.[0]?.photo_url || '/logo.webp';
                    
                    return (
                      <div
                        key={insp.inspection_id}
                        className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img src={photoUrl} alt="Kos" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-[#052746]">
                              {insp.property?.name || 'Kos Baru'}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px] md:max-w-[250px]">{insp.property?.address}</span>
                            </p>
                          </div>
                        </div>

                        {/* Package & Date info */}
                        <div className="flex gap-8 text-left">
                          <div>
                            <span className="text-[9px] font-bold text-slate-450 tracking-wider uppercase block">Paket</span>
                            <span className="text-xs font-extrabold text-slate-700 block">{packageLabel}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-450 tracking-wider uppercase block">Tanggal</span>
                            <span className="text-xs font-extrabold text-slate-700 block">
                              {new Date(insp.assigned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Status badge & detail action */}
                        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
                          {isUnassigned ? (
                            <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide">
                              Mencari Verifikator
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide ${
                                insp.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-blue-50 text-[#094074] border border-blue-200'
                              }`}
                            >
                              {insp.status === 'completed' ? 'Audit Selesai' : 'Inspektur Dilokasi'}
                            </span>
                          )}

                          <button
                            onClick={() => {
                              if (insp.status === 'completed') {
                                onViewReport(insp);
                              } else {
                                alert(`Sesi inspeksi sedang berlangsung di lokasi. Silakan tunggu laporan audit selesai diunggah.`);
                              }
                            }}
                            className="px-4 py-2 text-xs font-extrabold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Compliance Stats & Bento promotion boxes) */}
          <div className="space-y-6">
            
            {/* Compliance Graph */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#052746] uppercase tracking-wider flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-[#298EEE]" />
                  Statistik Kepatuhan Properti
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Rata-rata akreditasi dari kos milik Anda di Kota Padang
                </p>
              </div>

              {/* Bar Chart Container */}
              <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 mt-6 flex flex-col gap-6">
                <div className="flex justify-between items-end h-56 pt-6 pb-2 px-2 border-b border-slate-100 gap-2">
                  {/* Kebersihan Bar */}
                  <div className="flex flex-col items-center justify-end h-full flex-1 gap-2">
                    <span className="text-[10px] font-bold text-slate-700">{kebersihanAvg}%</span>
                    <div className="w-full bg-slate-50 rounded-t-lg h-full flex items-end">
                      <div className="w-full bg-[#052746] rounded-t-md transition-all duration-700" style={{ height: `${kebersihanAvg}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-[#43474E] text-center leading-tight">BERSIH</span>
                  </div>

                  {/* Keamanan Bar */}
                  <div className="flex flex-col items-center justify-end h-full flex-1 gap-2">
                    <span className="text-[10px] font-bold text-slate-700">{keamananAvg}%</span>
                    <div className="w-full bg-slate-50 rounded-t-lg h-full flex items-end">
                      <div className="w-full bg-[#298EEE] rounded-t-md transition-all duration-700" style={{ height: `${keamananAvg}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-[#43474E] text-center leading-tight">AMAN</span>
                  </div>

                  {/* Fasilitas Bar */}
                  <div className="flex flex-col items-center justify-end h-full flex-1 gap-2">
                    <span className="text-[10px] font-bold text-slate-700">{fasilitasAvg}%</span>
                    <div className="w-full bg-slate-50 rounded-t-lg h-full flex items-end">
                      <div className="w-full bg-[#1ACDFF] rounded-t-md transition-all duration-700" style={{ height: `${fasilitasAvg}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-[#43474E] text-center leading-tight">FASILITAS</span>
                  </div>

                  {/* Lokasi Bar */}
                  <div className="flex flex-col items-center justify-end h-full flex-1 gap-2">
                    <span className="text-[10px] font-bold text-slate-700">{lokasiAvg}%</span>
                    <div className="w-full bg-slate-50 rounded-t-lg h-full flex items-end">
                      <div className="w-full bg-[#052746] rounded-t-md transition-all duration-700" style={{ height: `${lokasiAvg}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-[#43474E] text-center leading-tight">LOKASI</span>
                  </div>

                  {/* Legalitas Bar */}
                  <div className="flex flex-col items-center justify-end h-full flex-1 gap-2">
                    <span className="text-[10px] font-bold text-slate-700">{legalitasAvg}%</span>
                    <div className="w-full bg-slate-50 rounded-t-lg h-full flex items-end">
                      <div className="w-full bg-[#298EEE] rounded-t-md transition-all duration-700" style={{ height: `${legalitasAvg}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-[#43474E] text-center leading-tight">LEGAL</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 bg-[#052746] rounded-sm" />
                      <span>Utama</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 bg-[#298EEE] rounded-sm" />
                      <span>Pendukung</span>
                    </div>
                  </div>
                  <span className="italic font-mono text-[9px] text-slate-400">*Diperbarui otomatis</span>
                </div>
              </div>
            </div>

            {/* Upgrade Bento Box */}
            <div className="bg-[#052746] rounded-[32px] p-8 border border-blue-900/50 shadow-md relative overflow-hidden text-left flex flex-col justify-between min-h-[300px]">
              <div className="absolute inset-0 bg-[#298EEE]/10 pointer-events-none blur-3xl rounded-full translate-x-20 translate-y-20" />
              <div className="space-y-4 relative z-10">
                <span className="text-[10px] font-extrabold px-3 py-1 bg-[#298EEE] text-white rounded-full uppercase tracking-wider block w-fit">TERVERIFIKASI</span>
                <h4 className="text-2xl font-black text-white leading-tight">
                  Dapatkan Laporan<br />Super Lengkap
                </h4>
                <p className="text-xs text-blue-200 font-medium">
                  Upgrade ke Paket Komparasi untuk membandingkan 3 kos sekaligus secara langsung di dashboard Anda.
                </p>
              </div>
              <button
                onClick={() => {
                  setOrderCategory('multi');
                  setShowRequestModal(true);
                }}
                className="mt-6 flex items-center gap-2 bg-white hover:bg-slate-50 text-[#052746] font-extrabold text-xs px-5 py-3.5 rounded-xl transition-all cursor-pointer shadow-md relative z-10 w-fit self-start"
              >
                <span>Upgrade Sekarang</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {/* Help Bento Box */}
            <div className="bg-[#B8CDE3] rounded-[32px] p-8 border border-blue-200/80 shadow-md text-left flex flex-col justify-between min-h-[300px]">
              <div className="space-y-4">
                <h4 className="text-3xl font-black text-[#052746] leading-tight">
                  Butuh Bantuan?
                </h4>
                <p className="text-xs text-[#2F5276] font-medium leading-relaxed">
                  Hubungi Customer Service kami jika Anda mengalami kendala pada pesanan atau butuh konsultasi pemilihan paket verifikasi kos.
                </p>
              </div>
              <a
                href="https://wa.me/6281234567890?text=Halo%20InspeksiKos,%20saya%20butuh%20bantuan%20terkait%20pesanan%20inspeksi%20saya."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center gap-2 bg-[#1D9E75] hover:bg-[#158260] text-white font-extrabold text-xs px-5 py-3.5 rounded-xl transition-all cursor-pointer shadow-md w-fit self-start"
              >
                {/* Whatsapp Icon representation */}
                <PhoneCall className="h-4 w-4" />
                <span>Hubungi Whatsapp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
