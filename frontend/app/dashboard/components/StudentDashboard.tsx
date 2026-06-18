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

const faqs = [
  {
    q: "Bagaimana cara kerja verifikasi air bersih?",
    a: "Setiap inspektur dibekali dengan alat ukur kebersihan air terkalibrasi. Mereka mengambil sampel air langsung dari keran kamar mandi kosan untuk mengukur kandungan zat padat terlarut secara presisi demi memastikan kelayakan air mandi."
  },
  {
    q: "Berapa lama proses inspeksi dari awal pemesanan?",
    a: "Setelah pemesanan dan pembayaran via QRIS selesai, sistem on-demand akan langsung mencocokkan verifikator terdekat dalam 15-30 menit. Laporan lengkap berformat PDF siap diunduh di dashboard dalam 2-3 jam setelah audit lapangan."
  },
  {
    q: "Apakah laporan kecocokan fasilitas ini terpercaya?",
    a: "Laporan audit bersifat independen berbasis fakta lapangan yang dilengkapi dokumentasi foto, koordinat lokasi GPS, pengujian alat ukur langsung, dan validasi visual bertenaga kecerdasan buatan (AI)."
  },
  {
    q: "Bagaimana jika pemilik kos tidak mengizinkan masuk?",
    a: "Verifikator dilatih secara persuasif untuk meminta izin kunjungan. Jika kunjungan ditolak sepenuhnya oleh pengelola kos, kami akan membatalkan pesanan secara otomatis dan dana Anda akan dikembalikan 100% tanpa potongan."
  }
];

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
  // Mobile App Layout States
  const [mobileTab, setMobileTab] = useState<'home' | 'layanan' | 'riwayat' | 'bantuan' | 'akun'>('home');
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua Wilayah');
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);
  const [showMobileChatModal, setShowMobileChatModal] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Chatbot states
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Auto-swipe banner timer for mobile view (every 4s)
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(bannerTimer);
  }, []);

  // Interactive All-Audited-Properties Map for Students
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

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
              <h5 style="margin: 0 0 3px 0; font-size: 11px; font-weight: 850; color: #0f172a;">${insp.property.name}</h5>
              <p style="margin: 0 0 6px 0; font-size: 9px; color: #64748b; line-height: 1.3;">${insp.property.address}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 9px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 1px 4px; border-radius: 4px; border: 1px solid #bfdbfe;">
                  Skor: ${score}%
                </span>
                <span style="font-size: 8px; font-weight: 700; color: #475569; text-transform: uppercase;">
                  ${conf.replace(/_/g, ' ')}
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

  // General QA Chatbot message handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMsg = { role: 'user', parts: [{ text: chatMessage }] };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    const msgToSend = chatMessage.toLowerCase();
    setChatMessage('');
    setChatLoading(true);

    setTimeout(() => {
      let reply = "Saya adalah AI Asisten InspeksiKos. Saya siap membantu Anda mencari kosan terbaik di Kota Padang! Silakan pilih salah satu menu layanan kami seperti Inspeksi Tunggal atau Inspeksi Grup.";
      if (msgToSend.includes('air') || msgToSend.includes('tds')) {
        reply = "Untuk uji kebersihan air, verifikator kami menguji TDS (Total Dissolved Solids) air kamar mandi. Nilai di bawah 300 ppm dikategorikan sangat bersih & higienis untuk mandi harian sesuai standar Kementerian Kesehatan.";
      } else if (msgToSend.includes('wifi') || msgToSend.includes('internet') || msgToSend.includes('speed') || msgToSend.includes('jaringan')) {
        reply = "Uji kecepatan internet dilakukan langsung di dalam kamar kos menggunakan speedtest. Kami memverifikasi kecepatan download & upload riil untuk menjamin kelancaran kuliah online dan streaming video.";
      } else if (msgToSend.includes('biaya') || msgToSend.includes('harga') || msgToSend.includes('bayar') || msgToSend.includes('tarif')) {
        reply = "Layanan Inspeksi Tunggal berbiaya Rp 50.000 (1 properti), sedangkan Inspeksi Grup berbiaya Rp 45.000 per properti (hingga 5 properti). Pembayaran terintegrasi Midtrans menggunakan QRIS atau transfer bank.";
      } else if (msgToSend.includes('cara') || msgToSend.includes('bagaimana') || msgToSend.includes('kerja')) {
        reply = "Caranya sangat mudah! 1) Klik 'Ajukan Inspeksi', 2) Isi alamat & detail kosan, 3) Lakukan pembayaran via QRIS, 4) Inspektur kami akan datang langsung ke lokasi dan mengunggah laporan hasil verifikasi lapangan.";
      } else if (msgToSend.includes('padang') || msgToSend.includes('lokasi') || msgToSend.includes('wilayah') || msgToSend.includes('kampus')) {
        reply = "Saat ini kami melayani verifikasi kos-kosan di sekitar kampus-kampus Kota Padang, termasuk daerah Limau Manis (Unand), Air Tawar (UNP), Lolong Belanti, Ulu Gadut, dan By Pass Padang.";
      } else if (msgToSend.includes('halo') || msgToSend.includes('hi') || msgToSend.includes('hei') || msgToSend.includes('p')) {
        reply = "Halo! Saya adalah AI Asisten InspeksiKos. Ada yang bisa saya bantu mengenai fasilitas kosan di Padang?";
      }
      
      const modelMsg = { role: 'model', parts: [{ text: reply }] };
      setChatHistory([...newHistory, modelMsg]);
      setChatLoading(false);
    }, 800);
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  // Helper Computations
  const auditedInspections = inspections.filter(i => i.status === 'completed' && i.audit_report);
  const totalAudited = auditedInspections.length;
  
  const validCount = auditedInspections.filter(i => i.audit_report.confidence_level === 'VALID').length;
  const partialCount = auditedInspections.filter(i => i.audit_report.confidence_level === 'PARTIAL_VALID').length;
  const fraudCount = auditedInspections.filter(i => i.audit_report.confidence_level === 'FATAL_FRAUD').length;

  const validPct = totalAudited > 0 ? (validCount / totalAudited) * 100 : 0;
  const partialPct = totalAudited > 0 ? (partialCount / totalAudited) * 100 : 0;
  const fraudPct = totalAudited > 0 ? (fraudCount / totalAudited) * 100 : 0;

  const avgTds = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.tds_value || 0), 0) / totalAudited 
    : 0;
  const avgSpeed = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.internet_speed || 0), 0) / totalAudited 
    : 0;
  const avgScore = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.audit_report.score || 0), 0) / totalAudited 
    : 0;

  const displayedInspections = inspections.filter((insp: any) => {
    if (selectedRegion === 'Semua Wilayah') return true;
    const address = (insp.property?.address || '').toLowerCase();
    const regionWord = selectedRegion.split(' ')[0].toLowerCase();
    return address.includes(regionWord);
  });

  const mahasiswaCompleted = inspections.filter(i => i.status === 'completed');
  const comparisonGroups: Record<string, any[]> = {};
  mahasiswaCompleted.forEach(insp => {
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
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col flex-1">
        {/* Navbar */}
        <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <img src="/logo.webp" alt="InspeksiKos Logo" className="h-14 w-auto object-contain" />
              </Link>
              <span className="text-[9px] px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-extrabold rounded-md uppercase tracking-wider font-mono">
                mahasiswa
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hidden md:flex">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-700 font-mono">
                  {email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-sm font-mono"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Welcome banner */}
        <div className="relative bg-slate-100 border-b border-slate-200/60 py-10 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold bg-blue-950/50 px-2 py-1 rounded border border-blue-900/55 block w-fit mb-2">Panel Dasbor Utama</span>
              <h1 className="text-2xl md:text-3xl font-black mb-1 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent text-slate-800 text-left">
                Selamat Datang, {email?.split('@')[0]}!
              </h1>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed text-left">
                Kelola pengajuan verifikasi properti kos Anda di Kota Padang untuk memvalidasi fasilitas iklan secara transparan.
              </p>
            </div>
            <button
              onClick={() => {
                setOrderCategory('single');
                setShowRequestModal(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase px-5 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              Ajukan Inspeksi
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-400 font-mono">&gt; Memuat database...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Col (2 cols wide on desktop) - Map and Inspections List */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Interactive Leaflet Map for Student browsing */}
                {hasCompletedLocations && (
                  <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center gap-2">
                      <Compass className="h-4 w-4 text-blue-500 animate-spin" style={{ animationDuration: '8s' }} />
                      Peta Sebaran Kos Terakreditasi di Kota Padang
                    </h2>
                    <div
                      id="all-properties-map-container"
                      className="w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-gray-950 border border-slate-200 z-10"
                      style={{ minHeight: '280px' }}
                    />
                  </div>
                )}

                {validComparisonGroups.length > 0 && (
                  <div className="bg-white/75 border border-indigo-900/35 rounded-2xl p-5 shadow-2xl backdrop-blur-md mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2 text-left">
                      <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                      Analisis Perbandingan Multi-Kos Anda
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {validComparisonGroups.map((group) => {
                        const names = group.items.map(i => i.property.name).join(' vs ');
                        return (
                          <div key={group.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                            <div className="space-y-1 min-w-0 text-left">
                              <p className="text-xs font-extrabold text-slate-800 truncate">{names}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Membandingkan {group.items.length} properti kos</p>
                            </div>
                            <button
                              onClick={() => onCompare(group.items)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-[9px] rounded-lg tracking-wider uppercase shrink-0 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                            >
                              Bandingkan
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-500" />
                      Daftar Permintaan Inspeksi ({displayedInspections.length})
                    </h2>
                    <button
                      onClick={() => fetchInspections(false)}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 border border-slate-200 hover:border-slate-200 transition-all self-end sm:self-auto cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {displayedInspections.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-bold text-slate-500 mb-1">Belum Ada Sesi Inspeksi</p>
                      <p className="text-[10px] text-slate-450 max-w-xs mx-auto leading-relaxed">
                        Ajukan inspeksi kos pertama Anda dengan mengklik tombol "Ajukan Inspeksi" di pojok kanan atas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedInspections.map((insp: any) => {
                        const isUnassigned = insp.inspector_id === null;
                        return (
                          <div
                            key={insp.inspection_id}
                            className="p-4 rounded-xl border border-slate-200/85 bg-slate-50/60 hover:border-slate-200/80 transition-all text-left"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-800">
                                    {insp.property?.name || 'Properti Tanpa Nama'}
                                  </span>
                                  {isUnassigned ? (
                                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-50 text-amber-708 border border-amber-200 animate-pulse">
                                      Mencari Verifikator
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                        insp.status === 'completed'
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-250'
                                          : insp.status === 'in_progress'
                                          ? 'bg-blue-50 text-blue-800 border border-blue-250 animate-pulse'
                                          : 'bg-amber-50 text-amber-800 border border-amber-250'
                                      }`}
                                    >
                                      {insp.status === 'completed'
                                        ? 'Selesai'
                                        : insp.status === 'in_progress'
                                        ? 'Proses'
                                        : 'Ditugaskan'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-slate-400" />
                                  {insp.property?.address}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[9px] text-slate-400 font-mono pt-1">
                                  <span>
                                    Tgl: {new Date(insp.assigned_at).toLocaleDateString('id-ID')}
                                  </span>
                                  {insp.inspector && (
                                    <span>
                                      Verifikator: {insp.inspector.first_name} {insp.inspector.last_name}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                {insp.status === 'completed' && (
                                  <button
                                    onClick={() => onViewReport(insp)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer shadow-sm"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Scorecard
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col - Analytics */}
              <div className="space-y-6">
                <div className="bg-white/70 border border-slate-200/85 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 text-left">
                      <Gauge className="h-4 w-4 text-blue-500" />
                      Statistik Kepatuhan Properti
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 text-left">
                      Analisis kos terinspeksi milik Anda di Kota Padang
                    </p>
                  </div>

                  {totalAudited === 0 ? (
                    <div className="text-center py-8">
                      <Building className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-[10px] font-bold text-slate-500">Belum Ada Data Audit</h4>
                      <p className="text-[9px] text-slate-400 max-w-[180px] mx-auto mt-1 leading-relaxed">
                        Setelah inspektur menyelesaikan audit lapangan, grafik data kualitas kos Anda akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Donut Chart - Avg Score */}
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                          SKOR VALIDITAS RATA-RATA
                        </span>
                        <div className="relative flex items-center justify-center h-28 w-28">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-200"
                              strokeWidth="3"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-blue-600 transition-all duration-500"
                              strokeDasharray={`${avgScore.toFixed(1)}, 100`}
                              strokeWidth="3"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center text-slate-800">
                            <span className="text-xl font-black">{avgScore.toFixed(0)}%</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase font-mono tracking-wide">Skor</span>
                          </div>
                        </div>
                      </div>

                      {/* Confidence Level Progress Bars */}
                      <div className="space-y-3.5 p-4 bg-slate-50/50 rounded-xl border border-slate-200 text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono border-b border-slate-200 pb-1.5">
                          STATUS KEPATUHAN KOS
                        </span>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              VALID ({validCount})
                            </span>
                            <span>{validPct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${validPct}%` }} />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              PARTIAL VALID ({partialCount})
                            </span>
                            <span>{partialPct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-50 h-full rounded-full transition-all duration-500" style={{ width: `${partialPct}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              FATAL FRAUD ({fraudCount})
                            </span>
                            <span>{fraudPct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${fraudPct}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Tech Average Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-slate-800">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                          <span className="text-[8px] font-bold text-blue-600 block mb-1 uppercase font-mono tracking-wider">Rata-Rata TDS</span>
                          <span className="text-sm font-black">{avgTds.toFixed(0)} ppm</span>
                          <span className="text-[8px] text-slate-400 block mt-1 font-mono">{avgTds <= 300 ? 'Air Bersih' : 'Kualitas Rendah'}</span>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                          <span className="text-[8px] font-bold text-amber-600 block mb-1 uppercase font-mono tracking-wider">Rata WiFi</span>
                          <span className="text-sm font-black">{avgSpeed.toFixed(0)} Mbps</span>
                          <span className="text-[8px] text-slate-400 block mt-1 font-mono">{avgSpeed >= 15 ? 'Internet Cepat' : 'Internet Slow'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE VIEWPORT LAYOUT */}
      <div className="block md:hidden flex-1 flex flex-col min-h-screen bg-slate-50 relative pb-20">
        
        {/* Mobile Top App Bar */}
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <img src="/logo.webp" alt="InspeksiKos Logo" className="h-10 w-auto object-contain" />
            </Link>
            <span className="text-[8px] px-1.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-extrabold rounded-md uppercase tracking-wider font-mono">
              mahasiswa
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Region Selector */}
            {mobileTab === 'home' && (
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Semua Wilayah">📍 Semua Wilayah</option>
                  <option value="Limau Manis (Unand)">📍 Limau Manis</option>
                  <option value="Air Tawar (UNP)">📍 Air Tawar</option>
                  <option value="Lolong Belanti">📍 Lolong Belanti</option>
                  <option value="Ulu Gadut">📍 Ulu Gadut</option>
                  <option value="By Pass Padang">📍 By Pass</option>
                </select>
              </div>
            )}

            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-[#003057] text-white flex items-center justify-center font-bold text-xs shadow-md border border-slate-200 uppercase">
              {email ? email.substring(0, 2).toUpperCase() : 'US'}
            </div>
          </div>
        </header>

        {/* Mobile Main Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-400 font-mono">Memuat Dasbor...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: BERANDA (HOME) */}
              {mobileTab === 'home' && (
                <div className="space-y-5 text-slate-800">
                  {/* Hero Banner Auto-swiping Carousel */}
                  <div className="w-full h-32 rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-[#003057] to-[#0f766e]">
                    <div className="absolute inset-0 bg-black/15 pointer-events-none z-10" />
                    
                    {/* Slide 0 */}
                    <div className={`absolute inset-0 p-5 flex flex-col justify-between text-white transition-opacity duration-500 ${activeBannerIndex === 0 ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] bg-teal-500 text-white font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold">Uji TDS Air Mandi</span>
                        <h3 className="text-xs font-black leading-tight text-white font-sans">Pastikan air kamar mandi kosan bersih & bebas bakteri!</h3>
                      </div>
                      <p className="text-[9px] text-teal-100 font-medium text-left">Inspektur kami mengukur kadar air keran secara presisi.</p>
                    </div>

                    {/* Slide 1 */}
                    <div className={`absolute inset-0 p-5 flex flex-col justify-between text-white transition-opacity duration-500 ${activeBannerIndex === 1 ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] bg-amber-500 text-white font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold">Speedtest Wifi Riil</span>
                        <h3 className="text-xs font-black leading-tight text-white font-sans">WiFi lemot? Ketahui bandwidth asli di dalam kamar.</h3>
                      </div>
                      <p className="text-[9px] text-amber-100 font-medium text-left">Uji kecepatan unduh & unggah sebelum membayar sewa.</p>
                    </div>

                    {/* Slide 2 */}
                    <div className={`absolute inset-0 p-5 flex flex-col justify-between text-white transition-opacity duration-500 ${activeBannerIndex === 2 ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}>
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] bg-blue-500 text-white font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold">Inspeksi Grup Komparatif</span>
                        <h3 className="text-xs font-black leading-tight text-white font-sans">Pilih hingga 5 kosan, bandingkan dalam satu tabel AI.</h3>
                      </div>
                      <p className="text-[9px] text-blue-100 font-medium text-left">Sangat hemat biaya daripada survei satu per satu.</p>
                    </div>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 right-4 flex gap-1.5 z-30">
                      {[0, 1, 2].map((idx) => (
                        <span key={idx} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${activeBannerIndex === idx ? 'bg-white w-3.5' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Grid */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3.5 font-mono">Layanan Cepat</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => {
                          setOrderCategory('single');
                          setShowRequestModal(true);
                        }}
                        className="flex flex-col items-center text-center focus:outline-none cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-inner hover:scale-[1.03] transition-transform">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 mt-2 leading-tight">Single Kos</span>
                      </button>

                      <button
                        onClick={() => {
                          setOrderCategory('multi');
                          setShowRequestModal(true);
                        }}
                        className="flex flex-col items-center text-center focus:outline-none cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shadow-inner hover:scale-[1.03] transition-transform">
                          <Layers className="h-5 w-5 text-teal-600" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 mt-2 leading-tight">Grup Kos</span>
                      </button>

                      <button
                        onClick={() => {
                          alert("Keunggulan Pengukuran TDS Air: Parameter air layak pakai adalah di bawah 500 ppm sesuai standar Kemenkes. Verifikator kami menggunakan alat ukur TDS terkalibrasi.");
                        }}
                        className="flex flex-col items-center text-center focus:outline-none cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-inner hover:scale-[1.03] transition-transform">
                          <Droplets className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 mt-2 leading-tight">Uji Air TDS</span>
                      </button>

                      <button
                        onClick={() => {
                          alert("Pengujian Banding Wifi: Inspektur menjalankan speedtest langsung di dalam kamar kos untuk mengukur Download, Upload, dan Latency (ping) demi jaminan kelancaran belajar & streaming.");
                        }}
                        className="flex flex-col items-center text-center focus:outline-none cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner hover:scale-[1.03] transition-transform">
                          <Wifi className="h-5 w-5 text-amber-655" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 mt-2 leading-tight">Speedtest</span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-Kos comparison card alert */}
                  {validComparisonGroups.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 shadow-sm relative overflow-hidden text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[8px] bg-indigo-600 text-white font-mono uppercase tracking-wider px-2 py-0.5 rounded font-black">Group Comparison</span>
                          <h4 className="text-xs font-black text-indigo-950">Analisis Perbandingan Kos Tersedia!</h4>
                          <p className="text-[9px] text-indigo-700 leading-relaxed max-w-[35ch]">Sistem mendeteksi ada sesi inspeksi grup yang siap dibandingkan.</p>
                        </div>
                        <button
                          onClick={() => onCompare(validComparisonGroups[0].items)}
                          className="px-3 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                        >
                          Bandingkan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Real-time Order list header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
                      Status Permintaan ({displayedInspections.length})
                    </h3>
                    <button
                      onClick={() => fetchInspections(true)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Real-time Order list items */}
                  {displayedInspections.length === 0 ? (
                    <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl p-6">
                      <Building className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500 mb-1">Belum Ada Sesi Inspeksi</p>
                      <p className="text-[9px] text-slate-400 max-w-xs mx-auto">
                        Silakan pesan inspeksi kosan Anda dengan menekan tombol Single Kos atau Grup Kos di atas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {displayedInspections.map((insp: any) => {
                        const statusColors: Record<string, string> = {
                          pending_payment: 'bg-amber-50 text-amber-800 border-amber-200',
                          pending: 'bg-blue-50 text-blue-800 border-blue-200',
                          accepted: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                          completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
                        };

                        const statusLabels: Record<string, string> = {
                          pending_payment: 'Menunggu Pembayaran',
                          pending: 'Mencari Verifikator',
                          accepted: 'Verifikator Menuju Lokasi',
                          completed: 'Audit Selesai',
                          cancelled: 'Dibatalkan',
                        };

                        const hasReport = insp.status === 'completed' && insp.audit_report;

                        return (
                          <div key={insp.inspection_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left">
                            <div className="flex items-center justify-between gap-3 mb-2.5">
                              <span className="text-[8px] font-mono text-slate-400 font-semibold truncate max-w-[150px]">
                                ID: #{insp.inspection_id.substring(0, 8).toUpperCase()}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider font-mono ${statusColors[insp.status] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                {statusLabels[insp.status] || insp.status}
                              </span>
                            </div>

                            <div className="space-y-1.5 mb-3.5">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{insp.property?.name || 'Properti Kos'}</h4>
                              <p className="text-[10px] text-slate-500 leading-normal flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{insp.property?.address || 'Padang, Sumatra Barat'}</span>
                              </p>
                            </div>

                            {/* Action buttons */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                              {insp.status === 'pending_payment' ? (
                                <>
                                  <span className="text-[9px] font-black text-rose-600 font-mono">Rp 50.000 (Belum Bayar)</span>
                                  <button
                                    onClick={() => {
                                      if (insp.property?.claim_data?.payment_token) {
                                        const simUrl = `/payment/simulate?token=${insp.property.claim_data.payment_token}&id=${insp.inspection_id}`;
                                        window.location.href = simUrl;
                                      } else {
                                        alert("Pembayaran token tidak ditemukan. Mohon cek riwayat untuk simulasi.");
                                      }
                                    }}
                                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                                  >
                                    Bayar Sekarang
                                  </button>
                                </>
                              ) : hasReport ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-black font-mono">
                                      Skor: {insp.audit_report?.score}%
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 font-mono uppercase">
                                      {insp.audit_report?.confidence_level}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => onViewReport(insp)}
                                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                                  >
                                    Lihat Hasil Audit
                                  </button>
                                </>
                              ) : (
                                <div className="w-full bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[9px] font-semibold text-slate-550">Inspeksi sedang diproses</span>
                                  </div>
                                  <span className="text-[8px] font-mono text-slate-400">Verifikator aktif</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LAYANAN (SERVICES) */}
              {mobileTab === 'layanan' && (
                <div className="space-y-5 text-left text-slate-800">
                  <div className="text-center space-y-1.5 py-2">
                    <span className="text-[8px] bg-teal-500 text-white font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">Kategori Layanan</span>
                    <h3 className="text-base font-black text-slate-900">Bebas Manipulasi Fasilitas Iklan Kos</h3>
                    <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                      Sistem pembayaran secure terintegrasi secure gateway Midtrans. Dana 100% aman.
                    </p>
                  </div>

                  {/* Single Audit card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[8px] font-black uppercase font-mono tracking-wider">
                        Personal Audit
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">1 Properti</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#003057]">Inspeksi Tunggal</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Layanan verifikasi 5+ parameter fasilitas utama untuk satu properti pilihan Anda.
                      </p>
                    </div>
                    <div className="text-xl font-mono font-black text-[#003057] py-2 border-t border-b border-slate-100 flex items-baseline gap-1">
                      Rp 50.000 <span className="text-[9px] text-slate-400 font-normal uppercase font-sans">/ properti</span>
                    </div>
                    <ul className="space-y-2 text-[10px] text-slate-600">
                      <li className="flex items-center gap-2">✅ Uji kebersihan air keran mandi</li>
                      <li className="flex items-center gap-2">✅ Uji bandwidth WiFi (speedtest)</li>
                      <li className="flex items-center gap-2">✅ Pencocokan foto AC, lemari, kasur</li>
                      <li className="flex items-center gap-2">✅ Laporan PDF & Chatbot AI</li>
                    </ul>
                    <button
                      onClick={() => {
                        setOrderCategory('single');
                        setShowRequestModal(true);
                      }}
                      className="w-full py-2.5 bg-[#003057] hover:bg-[#001e38] text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                    >
                      Pilih Layanan
                    </button>
                  </div>

                  {/* Group Audit card */}
                  <div className="bg-white border-2 border-teal-600 rounded-2xl p-5 shadow-md space-y-4 relative">
                    <div className="absolute -top-3 right-4 px-2 py-0.5 bg-teal-600 text-[7px] font-black uppercase tracking-wider rounded text-white font-mono shadow-sm">
                      Paling Hemat
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[8px] font-black uppercase font-mono tracking-wider">
                        Comparison Group
                      </span>
                      <span className="text-[9px] font-bold text-teal-600 font-mono">Hingga 5 Properti</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#003057]">Inspeksi Grup</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Bandingkan hingga 5 kosan sekaligus untuk melihat ranking terunggul. Cocok bagi perantau.
                      </p>
                    </div>
                    <div className="text-xl font-mono font-black text-[#003057] py-2 border-t border-b border-slate-100 flex items-baseline gap-1">
                      Rp 45.000 <span className="text-[9px] text-slate-400 font-normal uppercase font-sans">/ properti</span>
                    </div>
                    <ul className="space-y-2 text-[10px] text-slate-600">
                      <li className="flex items-center gap-2">✅ Uji air mandi + internet di tiap kosan</li>
                      <li className="flex items-center gap-2">✅ Tabel perbandingan skor & nominal sewa</li>
                      <li className="flex items-center gap-2">✅ Peta sebaran titik multi-lokasi</li>
                      <li className="flex items-center gap-2">✅ Rekomendasi asisten AI otomatis</li>
                    </ul>
                    <button
                      onClick={() => {
                        setOrderCategory('multi');
                        setShowRequestModal(true);
                      }}
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      Pilih Layanan
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: RIWAYAT (HISTORY) */}
              {mobileTab === 'riwayat' && (
                <div className="space-y-4 text-left text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
                      Riwayat Audit & Sesi Inspeksi
                    </h3>
                  </div>

                  {displayedInspections.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
                      <Building className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500 mb-1">Belum Ada Riwayat Sesi</p>
                      <p className="text-[9px] text-slate-400">Transaksi atau audit Anda akan terdaftar di halaman ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedInspections.map((insp: any) => {
                        const isCompleted = insp.status === 'completed';
                        return (
                          <div
                            key={insp.inspection_id}
                            className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between gap-3 text-left"
                          >
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{insp.property?.name || 'Properti Kos'}</h4>
                              <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">#{insp.inspection_id.substring(0, 8).toUpperCase()}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase font-mono border ${
                                  isCompleted ? 'bg-emerald-50 text-emerald-750 border-emerald-200' : 'bg-amber-50 text-amber-750 border-amber-200'
                                }`}>
                                  {isCompleted ? 'Completed' : insp.status}
                                </span>
                                {isCompleted && (
                                  <span className="text-[9px] font-black text-blue-600 font-mono">
                                    Skor: {insp.audit_report?.score}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              {isCompleted ? (
                                <button
                                  onClick={() => onViewReport(insp)}
                                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[9px] border border-slate-200 rounded-lg shadow-sm cursor-pointer"
                                >
                                  Detail
                                </button>
                              ) : (
                                <button
                                  onClick={() => fetchInspections(true)}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-200 rounded-lg animate-pulse cursor-pointer"
                                >
                                  Cek
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BANTUAN (HELP) */}
              {mobileTab === 'bantuan' && (
                <div className="space-y-5 text-left text-slate-800">
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md space-y-3.5 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-white/10 rounded-full blur-[40px] pointer-events-none" />
                    <div className="space-y-1 relative z-10">
                      <span className="text-[8px] bg-blue-600 text-white font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">Asisten AI Chatbot</span>
                      <h4 className="text-sm font-black text-white">Butuh Konsultasi Kilat Mengenai Audit?</h4>
                      <p className="text-[10px] text-blue-100 leading-relaxed">
                        Tanyakan tingkat kelayakan kos, standard air TDS, wifi lambat, dll. AI kami siap menjawab!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMobileChatModal(true);
                        if (chatHistory.length === 0) {
                          setChatHistory([
                            {
                              role: 'model',
                              parts: [
                                {
                                  text: "Halo! Saya adalah AI Asisten InspeksiKos. Saya siap membantu Anda mencari kosan terbaik di Kota Padang! Apakah ada yang ingin Anda tanyakan mengenai air TDS, kecepatan internet, atau biaya inspeksi?"
                                }
                              ]
                            }
                          ]);
                        }
                      }}
                      className="relative z-10 w-full py-2 bg-white hover:bg-slate-50 text-blue-900 font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      💬 Buka Tanya AI Assistant
                    </button>
                  </div>

                  {/* FAQ Accordion */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 pl-1">Pertanyaan Umum (FAQ)</h3>
                    {faqs.map((faq, idx) => {
                      const isOpen = activeFaq === idx;
                      return (
                        <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[10px] uppercase tracking-wide text-[#003057] hover:bg-slate-50 transition-all focus:outline-none cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 pt-1.5 text-[10px] text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* WhatsApp Support CTA */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">Hubungi CS InspeksiKos</h4>
                      <p className="text-[9px] text-slate-405">Verifikator / Mahasiswa Support di Padang.</p>
                    </div>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      <PhoneCall className="h-3 w-3" /> WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 5: AKUN (ACCOUNT) */}
              {mobileTab === 'akun' && (
                <div className="space-y-5 text-left text-slate-800">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-black text-sm uppercase shadow">
                      {email ? email.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{email}</h4>
                      <div className="flex gap-2 items-center">
                        <span className="text-[8px] px-1.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-extrabold rounded uppercase tracking-wider font-mono">
                          mahasiswa
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold font-mono">ID Mahasiswa aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Action menu items */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <span className="text-[10px] font-bold uppercase tracking-wide">Data Profil Mahasiswa</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <span className="text-[10px] font-bold uppercase tracking-wide">Pengaturan Notifikasi</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <span className="text-[10px] font-bold uppercase tracking-wide">Buku Petunjuk Aplikasi</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div
                      onClick={handleLogout}
                      className="px-4 py-3.5 flex items-center justify-between text-rose-600 hover:bg-rose-50 cursor-pointer active:scale-[0.99] transition-all"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono">
                        <LogOut className="h-3.5 w-3.5" /> Keluar dari Dasbor
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-rose-450" />
                    </div>
                  </div>

                  {/* Version footer label */}
                  <p className="text-center text-[9px] text-slate-400 font-mono">InspeksiKos v1.2.0-Mobile. Kota Padang.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Bottom Tab Navigation Bar */}
        <nav className="w-full h-16 bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around shadow-lg px-2">
          <button
            onClick={() => setMobileTab('home')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'home' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Beranda</span>
          </button>

          <button
            onClick={() => setMobileTab('layanan')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'layanan' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Layers className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Layanan</span>
          </button>

          <button
            onClick={() => setMobileTab('riwayat')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'riwayat' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Riwayat</span>
          </button>

          <button
            onClick={() => setMobileTab('bantuan')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'bantuan' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Compass className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Bantuan</span>
          </button>

          <button
            onClick={() => setMobileTab('akun')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'akun' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Akun</span>
          </button>
        </nav>
      </div>

      {/* Floating AI Chatbot Modal for General Mobile Consultation */}
      {showMobileChatModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm block md:hidden">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl relative border border-slate-200 flex flex-col h-[70vh]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3 text-slate-800">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-blue-900">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>Asisten AI InspeksiKos</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowMobileChatModal(false);
                }}
                className="text-slate-500 hover:text-slate-800 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto space-y-3 p-1 mb-3 text-[10px] leading-relaxed scrollbar-none">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-sans">
                  <Sparkles className="h-6 w-6 text-blue-400 mx-auto mb-2 animate-bounce" />
                  <p>Halo! Saya adalah AI Asisten InspeksiKos.</p>
                  <p className="mt-1">Tanyakan kelayakan kos, baku mutu air TDS, atau kecepatan wifi kamar mandi.</p>
                </div>
              ) : (
                chatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-2.5 ${
                        chat.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none shadow'
                          : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line font-sans">{chat.parts[0].text}</p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-500 border border-slate-200 rounded-xl rounded-tl-none p-2.5 flex items-center gap-1.5 font-mono text-[9px]">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    <span>AI sedang berpikir...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input form */}
            <form
              onSubmit={handleSendChatMessage}
              className="border-t border-slate-200 pt-2 flex gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatMessage.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[9px] rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
