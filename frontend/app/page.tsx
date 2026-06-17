// Reading this as: High-growth prop-tech landing page for college students and landlords, with a clean B2B2C startup visual language. Optimized with a dual-layout system: a premium desktop marketing page and a mobile-first app shell for mobile users to match the Gojek/Shopee class native experience.
// DESIGN_VARIANCE: 8 | MOTION_INTENSITY: 6 | VISUAL_DENSITY: 4

"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckSquare, 
  ClipboardList, 
  Zap, 
  ArrowRight, 
  Cpu, 
  Star,
  Download,
  ChevronDown,
  Menu,
  X,
  Search,
  PhoneCall
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeUni, setActiveUni] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const universities = [
    {
      name: "Politeknik Negeri Padang",
      short: "PNP",
      logoColor: "text-amber-600 bg-white border-slate-200",
      accent: "#f59e0b",
      verifiedCount: "480+",
      inspectors: "8 Verifikator",
      initials: "PNP",
      logoFile: "logo-pnp.png"
    },
    {
      name: "Universitas Andalas",
      short: "UNAND",
      logoColor: "text-emerald-700 bg-white border-slate-200",
      accent: "#047857",
      verifiedCount: "620+",
      inspectors: "12 Verifikator",
      initials: "UNAND",
      logoFile: "logo-unand.svg"
    },
    {
      name: "Universitas Negeri Padang",
      short: "UNP",
      logoColor: "text-blue-700 bg-white border-slate-200",
      accent: "#1d4ed8",
      verifiedCount: "580+",
      inspectors: "10 Verifikator",
      initials: "UNP",
      logoFile: "logo-unp.jpg"
    },
    {
      name: "UIN Imam Bonjol",
      short: "UIN IB",
      logoColor: "text-teal-700 bg-white border-slate-200",
      accent: "#0f766e",
      verifiedCount: "350+",
      inspectors: "6 Verifikator",
      initials: "UIN",
      logoFile: "logo-uinib.png"
    },
    {
      name: "Universitas Bung Hatta",
      short: "UBH",
      logoColor: "text-rose-700 bg-white border-slate-200",
      accent: "#be123c",
      verifiedCount: "290+",
      inspectors: "5 Verifikator",
      initials: "UBH",
      logoFile: "logo-ubh.png"
    },
    {
      name: "UPI YPTK Padang",
      short: "UPI YPTK",
      logoColor: "text-indigo-700 bg-white border-slate-200",
      accent: "#4338ca",
      verifiedCount: "410+",
      inspectors: "7 Verifikator",
      initials: "UPI",
      logoFile: "logo-upiyptk.jpg"
    },
    {
      name: "Universitas Baiturrahmah",
      short: "UNBRAH",
      logoColor: "text-sky-700 bg-white border-slate-200",
      accent: "#0284c7",
      verifiedCount: "180+",
      inspectors: "4 Verifikator",
      initials: "UNBRAH",
      logoFile: "logo-unbrah.png"
    },
    {
      name: "Poltekkes Kemenkes Padang",
      short: "POLTEKKES",
      logoColor: "text-teal-600 bg-white border-slate-200",
      accent: "#0d9488",
      verifiedCount: "210+",
      inspectors: "5 Verifikator",
      initials: "POLTEKKES",
      logoFile: "logo-poltekkes.png"
    }
  ];

  const handleUniChange = (index: number) => {
    if (index === activeUni || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveUni(index);
      setIsTransitioning(false);
    }, 250);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveUni((prev) => (prev + 1) % universities.length);
        setIsTransitioning(false);
      }, 250);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="relative min-h-screen bg-slate-50 text-[#0f172a] overflow-hidden font-sans selection:bg-teal-500/20 selection:text-[#003057]">
      
      {/* ========================================================================= */}
      {/* 1. RESPONSIVE LANDING PAGE */}
      {/* ========================================================================= */}
      <div className="w-full">
        
        {/* Background Soft Color Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00305703_1px,transparent_1px),linear-gradient(to_bottom,#00305703_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Navigation Bar - Cap 72px */}
        <header className="w-full h-18 border-b border-slate-200/60 bg-white/75 backdrop-blur-md sticky top-0 z-30 transition-all">
          <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <img 
                src="/logo.webp" 
                alt="InspeksiKos Logo" 
                className="h-16 w-auto object-contain hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" 
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <a href="#fitur" className="hover:text-[#003057] transition-all">Cara Kerja</a>
              <a href="#bento" className="hover:text-[#003057] transition-all">Keunggulan</a>
              <a href="#harga" className="hover:text-[#003057] transition-all">Kategori Layanan</a>
              <a href="#faq" className="hover:text-[#003057] transition-all">FAQ</a>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-[#003057] transition-all active:scale-[0.98]">
                Masuk
              </Link>
              <Link href="/register" className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider bg-[#003057] hover:bg-[#001e38] text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] active:translate-y-[1px]">
                Mulai Audit
              </Link>
            </div>

            {/* Mobile Navigation Toggle Button */}
            <div className="flex md:hidden items-center gap-3">
              <Link href="/login" className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-[#003057]">
                Masuk
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-[#003057] focus:outline-none focus:ring-1 focus:ring-slate-200 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 space-y-4 shadow-lg absolute top-18 left-0 right-0 z-20 animate-in slide-in-from-top duration-200">
              <nav className="flex flex-col gap-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <a
                  href="#fitur"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#003057] transition-all py-1 border-b border-slate-100"
                >
                  Cara Kerja
                </a>
                <a
                  href="#bento"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#003057] transition-all py-1 border-b border-slate-100"
                >
                  Keunggulan
                </a>
                <a
                  href="#harga"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#003057] transition-all py-1 border-b border-slate-100"
                >
                  Kategori Layanan
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#003057] transition-all py-1"
                >
                  FAQ
                </a>
              </nav>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-[10px] font-bold uppercase tracking-wider bg-[#003057] hover:bg-[#001e38] text-white rounded-xl shadow-md transition-all"
                >
                  Mulai Audit
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 z-10 relative">
          
          {/* Split Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[70dvh] mb-24">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 shadow-sm">
                <Sparkles className="h-3 w-3 text-teal-600 shrink-0 animate-pulse" />
                <span className="tracking-widest uppercase text-[9px] font-extrabold font-mono">Platform Audit Properti On-Demand Pertama</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black leading-[1.08] tracking-tighter text-[#003057] text-wrap-pretty">
                Bebas Manipulasi Iklan.<br />
                Validasi Fasilitas Kos Anda.
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-[50ch] text-wrap-pretty">
                Validasi keaslian fasilitas kos secara langsung melalui verifikator berlisensi dengan uji kebersihan air, kecepatan internet, dan verifikasi foto bertenaga AI.
              </p>

              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#001e38] hover:to-[#115e59] text-white font-bold rounded-xl px-8 shadow-lg shadow-[#003057]/10 hover:scale-[1.01] active:scale-[0.98] active:translate-y-[1px] transition-all text-[11px] uppercase tracking-wider">
                  Mulai Audit Kos
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register" className="flex items-center justify-center h-14 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-8 hover:scale-[1.01] active:scale-[0.98] active:translate-y-[1px] transition-all text-[11px] uppercase tracking-wider shadow-sm">
                  Gabung Verifikator
                </Link>
              </div>
            </div>

            {/* Right Hero Visual - Modern Browser Shell Device */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="w-full max-w-[520px] rounded-2xl border border-slate-200/85 bg-white p-2 shadow-2xl relative z-10 transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="w-48 bg-slate-50 border border-slate-100 rounded-md py-0.5 text-[9px] text-slate-400 text-center mx-auto truncate font-mono">
                    inspeksikos.dev/dashboard/order
                  </div>
                </div>
                <div className="rounded-b-xl overflow-hidden border border-slate-200/50 aspect-[4/3] relative bg-slate-50">
                  <img 
                    src="/hero-dashboard-preview.jpg" 
                    alt="InspeksiKos Dashboard" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-blue-500/5 rounded-full filter blur-3xl -z-10 transform scale-90" />
            </div>
          </div>

          {/* Animated University Credibility Showcase Section */}
          <section className="w-full border border-slate-200 bg-white rounded-2xl p-8 md:p-12 mb-28 shadow-sm relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none" />
            
            <div className="text-center space-y-2 mb-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                DIANDALKAN KAMPUS TERBAIK SUMATERA BARAT
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#003057] tracking-tight">
                Telah Diandalkan oleh Mahasiswa
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Animated Showcase Card */}
              <div className="lg:col-span-6 flex justify-center">
                <div 
                  className={`w-full max-w-[420px] p-6 rounded-2xl border bg-slate-50/50 flex flex-col justify-between h-[280px] shadow-inner transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
                  } border-slate-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-xl border ${universities[activeUni].logoColor} transition-colors duration-300 w-22 h-22 flex items-center justify-center shadow-sm`}>
                      <img 
                        src={`/${universities[activeUni].logoFile}`} 
                        alt={`${universities[activeUni].short} Logo`} 
                        className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200" 
                      />
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-850 text-[8px] font-black uppercase tracking-wider font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" /> Terverifikasi
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <h3 className="text-2xl font-black text-[#003057] leading-tight">
                      {universities[activeUni].short}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                      {universities[activeUni].name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/80">
                    <div className="text-left">
                      <div className="text-xl font-black text-[#003057] font-mono">{universities[activeUni].verifiedCount}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Kamar Ter-Audit</div>
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-black text-[#003057] font-mono">{universities[activeUni].inspectors}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mitra Lapangan</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Clickable Navigation Chips with Image/Logo icons */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
                <p className="text-xs text-slate-500 font-semibold text-center lg:text-left">
                  Pilih kampus untuk melihat statistik sebaran audit InspeksiKos secara langsung:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {universities.map((uni, idx) => {
                    const isActive = activeUni === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleUniChange(idx)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-300 cursor-pointer h-22 ${
                          isActive 
                            ? 'bg-white border-[#0f766e] shadow-md scale-102 font-black text-[#003057]' 
                            : 'bg-slate-50/80 border-slate-200 opacity-60 hover:opacity-95 hover:bg-white text-slate-500'
                        }`}
                      >
                        <div className="h-9 w-full flex items-center justify-center mb-1.5">
                          <img 
                            src={`/${uni.logoFile}`} 
                            alt={`${uni.short} Logo`} 
                            className="max-h-full max-w-full object-contain filter grayscale opacity-90 contrast-125" 
                          />
                        </div>
                        <div className="text-[9px] font-extrabold font-mono tracking-tight leading-none">
                          {uni.short}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Bento Grid (Features / Technology Section) */}
          <section id="bento" className="mb-28 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex px-3 py-1 rounded-full bg-teal-50 text-[#0f766e] border border-teal-100 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                Audit Mekanis & Visual
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#003057] tracking-tight">
                Keunggulan Verifikasi Lapangan
              </h2>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                Pemeriksaan fisik langsung menggunakan parameter baku untuk menjamin kelayakan kamar kos pilihan Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Large Visual (Inspector in action) */}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center overflow-hidden hover:shadow-md hover:border-slate-350 transition-all duration-300 group">
                <div className="w-full md:w-1/2 aspect-square rounded-xl overflow-hidden border border-slate-250 relative bg-slate-100 shrink-0">
                  <img 
                    src="/inspector-verifying-room.jpg" 
                    alt="Inspector verifying facilities" 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                  />
                </div>
                <div className="space-y-4 text-left">
                  <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#003057] leading-snug">Audit Langsung On-Demand</h3>
                  <p className="text-xs text-slate-650 leading-relaxed">
                    Bukan sekadar pencocokan data. Inspektur berlisensi mendatangi kamar kos secara fisik untuk memeriksa AC, sirkulasi udara, kelembapan, dan ukuran riil kamar secara langsung.
                  </p>
                  <div className="text-[10px] font-extrabold text-[#0f766e] uppercase tracking-wider font-mono flex items-center gap-1.5 pt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" /> Terintegrasi GPS & Timestamp
                  </div>
                </div>
              </div>

              {/* Box 2: Validasi Foto AI */}
              <div className="rounded-2xl border border-[#001e38] bg-[#003057] p-6 shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300 group text-white">
                <div className="space-y-4 text-left">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black uppercase font-mono tracking-wide text-teal-300">Verifikasi Foto AI</h3>
                  <p className="text-xs text-teal-100/80 leading-relaxed">
                    Setiap foto bukti yang diunggah oleh verifikator diproses secara otomatis oleh kecerdasan buatan untuk mencocokkan kelengkapan fasilitas kamar dengan iklan.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 mt-6 text-xs text-teal-200 font-mono leading-normal text-left space-y-1.5">
                  <div className="flex items-center gap-2"><CheckSquare className="h-3.5 w-3.5 text-teal-400" /> Kasur & Ranjang Cocok</div>
                  <div className="flex items-center gap-2"><CheckSquare className="h-3.5 w-3.5 text-teal-400" /> AC & Kelistrikan Cocok</div>
                  <div className="flex items-center gap-2"><CheckSquare className="h-3.5 w-3.5 text-teal-400" /> Lemari & Meja Terverifikasi</div>
                </div>
              </div>

              {/* Box 3: Kebersihan Air */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all duration-300">
                <div className="space-y-4 text-left">
                  <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black text-[#003057] uppercase font-mono tracking-wide">Uji Kebersihan Air</h3>
                  <p className="text-xs text-slate-650 leading-relaxed">
                    Pengukuran kebersihan air kamar mandi secara langsung oleh verifikator lapangan. Menghindarkan Anda dari risiko alergi kulit akibat air keruh atau berkarat.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Status Air:</span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-250 text-[9px] font-black rounded-lg font-mono">Higienis & Layak Pakai</span>
                </div>
              </div>

              {/* Box 4: Uji Kecepatan Internet */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all duration-300">
                <div className="space-y-4 text-left">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black text-[#003057] uppercase font-mono tracking-wide">Uji Internet Kamar</h3>
                  <p className="text-xs text-slate-650 leading-relaxed">
                    Uji kecepatan internet langsung dari dalam kamar kos. Memastikan koneksi WiFi memadai dan stabil untuk kegiatan kuliah online maupun streaming harian.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Koneksi WiFi:</span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-250 text-[9px] font-black rounded-lg font-mono">Stabil & Lancar</span>
                </div>
              </div>

              {/* Box 5: Laporan Valid PDF */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all duration-300">
                <div className="space-y-4 text-left">
                  <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black text-[#003057] uppercase font-mono tracking-wide">Hasil Laporan Lengkap</h3>
                  <p className="text-xs text-slate-650 leading-relaxed">
                    Laporan ringkasan kepatuhan fasilitas kos dalam format PDF resmi untuk mempermudah Anda membandingkan berbagai kos secara objektif.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Berkas Laporan:</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-wider font-mono">
                    <Download className="h-3 w-3" /> Unduh PDF
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* Asymmetric Workflow Section */}
          <section id="fitur" className="mb-28 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-[#003057]">Bagaimana Cara Kerjanya?</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Proses validasi on-demand terverifikasi hanya dalam 3 tahapan sistematis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all duration-200 text-left">
                <div className="space-y-4">
                  <div className="text-3xl font-black text-slate-300 font-mono">01</div>
                  <h3 className="text-base font-extrabold text-[#003057] leading-snug">Pesan & Input Klaim</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Masukkan alamat kos target dan isi daftar fasilitas dari foto iklan kosan yang ingin dibuktikan kesesuaian fisiknya.
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-6 text-[10px] font-bold text-slate-400 font-mono">Dukungan: Inspeksi Single / Grup</div>
              </div>

              <div className="lg:col-span-4 p-8 rounded-2xl bg-[#0f766e] text-white shadow-xl relative flex flex-col justify-between hover:scale-[1.01] hover:shadow-2xl transition-all duration-200 text-left">
                <div className="absolute top-[-20%] left-[-20%] w-[180px] h-[180px] rounded-full bg-white/10 blur-[50px] pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="text-3xl font-black text-teal-200/40 font-mono">02</div>
                  <h3 className="text-base font-extrabold text-white leading-snug">Inspeksi Lapangan Instan</h3>
                  <p className="text-xs text-teal-50/90 leading-relaxed">
                    Verifikator terdekat menuju lokasi secara langsung untuk mendokumentasikan foto fasilitas, uji kebersihan air, dan kecepatan internet.
                  </p>
                </div>
                <div className="pt-6 border-t border-teal-850 mt-6 text-[10px] font-bold text-teal-200 font-mono relative z-10">Matchmaking: &lt; 30 Menit</div>
              </div>

              <div className="lg:col-span-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all duration-200 text-left">
                <div className="space-y-4">
                  <div className="text-3xl font-black text-slate-300 font-mono">03</div>
                  <h3 className="text-base font-extrabold text-[#003057] leading-snug">Terima Laporan Valid</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hasil laporan kecocokan visual diverifikasi oleh teknologi AI. Ringkasan skor, dokumen laporan PDF, dan asisten konsultasi siap diakses di dashboard.
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-6 text-[10px] font-bold text-slate-400 font-mono">Output: PDF Laporan + Chatbot AI</div>
              </div>
            </div>
          </section>

          {/* Pricing / Service Kategori Section */}
          <section id="harga" className="mb-28 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-[#003057]">Pilihan Kategori Layanan</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Sistem pembayaran transparan tanpa biaya tambahan, terintegrasi secure gateway Midtrans.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all duration-300 text-left">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                      Personal Audit
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase">1 Properti</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-[#003057]">Inspeksi Tunggal</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Layanan audit mendetail untuk satu properti pilihan Anda. Cocok jika Anda telah yakin pada satu opsi kosan dan hanya butuh validasi final.
                    </p>
                  </div>
                  <div className="text-3xl font-black text-[#003057] font-mono py-2 border-t border-b border-slate-100">
                    Rp 50.000 <span className="text-[11px] text-slate-400 font-normal uppercase font-sans">/ properti</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-650">
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-teal-600 shrink-0" /> Audit 5+ titik fasilitas kamar kos</li>
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-teal-600 shrink-0" /> Uji kebersihan air kamar mandi</li>
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-teal-600 shrink-0" /> Speedtest bandwidth WiFi dalam kamar</li>
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-teal-600 shrink-0" /> Laporan PDF lengkap + Chatbot AI</li>
                  </ul>
                </div>
                <Link href="/login" className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 bg-[#003057] hover:bg-[#001e38] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]">
                  Pilih Layanan
                </Link>
              </div>

              <div className="bg-white border-2 border-[#0f766e] rounded-2xl p-8 shadow-md flex flex-col justify-between relative hover:shadow-lg transition-all duration-300 text-left">
                <div className="absolute -top-3.5 right-6 px-3 py-1 bg-[#0f766e] text-[8px] font-black uppercase tracking-wider rounded-md text-white font-mono shadow-sm">
                  Paling Hemat
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="px-2.5 py-1 rounded-md bg-teal-50 text-[#0f766e] border border-teal-200 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                      Comparison Group
                    </div>
                    <span className="text-[10px] font-extrabold text-teal-700 font-mono uppercase">Hingga 5 Properti</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-[#003057]">Inspeksi Grup</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Bandingkan beberapa kos sekaligus secara komparatif untuk menemukan opsi ternyaman. Sangat ideal untuk mahasiswa dari luar kota.
                    </p>
                  </div>
                  <div className="text-3xl font-black text-[#003057] font-mono py-2 border-t border-b border-slate-100">
                    Rp 45.000 <span className="text-[11px] text-slate-400 font-normal uppercase font-sans">/ properti</span>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-650">
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-[#0f766e] shrink-0" /> Audit komparatif hingga 5 properti kos</li>
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-[#0f766e] shrink-0" /> Tabel perbandingan skor & nominal sewa</li>
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-[#0f766e] shrink-0" /> Uji kebersihan air & WiFi di setiap kosan</li>
                    <li className="flex items-center gap-2.5"><CheckSquare className="h-4 w-4 text-[#0f766e] shrink-0" /> Asisten AI untuk rekomendasi kos terbaik</li>
                  </ul>
                </div>
                <Link href="/login" className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 bg-[#0f766e] hover:bg-[#0b544f] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]">
                  Pilih Layanan
                </Link>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="mb-28 max-w-4xl mx-auto py-12 border-t border-b border-slate-200/80">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
              <div className="md:col-span-8 space-y-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <blockquote className="text-base sm:text-lg font-extrabold text-[#003057] leading-relaxed text-wrap-pretty italic">
                  &ldquo;Saya dari luar kota Padang, sehingga survei kosan satu per satu sangat sulit. Menggunakan Inspeksi Grup sangat menghemat biaya tiket pesawat saya. Laporannya sangat valid.&rdquo;
                </blockquote>
                <div className="pt-2">
                  <h4 className="text-xs font-black text-[#003057]">Anisa Putri</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Mahasiswa D4 TRPL, Politeknik Negeri Padang</p>
                </div>
              </div>
              
              <div className="md:col-span-4 flex md:justify-end">
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 max-w-[260px] text-left">
                  <div className="text-2xl font-black text-teal-600 font-mono">1.250+</div>
                  <p className="text-[10.5px] text-slate-500 leading-normal">
                    Mahasiswa telah terbantu memverifikasi kelayakan kos mereka sebelum membayar DP sewa.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-28 max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-[#003057]">Pertanyaan Umum</h2>
              <p className="text-xs text-slate-500">Menjawab keraguan teknis mengenai validitas dan survei lapangan.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all shadow-sm text-left">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-[11px] uppercase tracking-wide text-[#003057] hover:bg-slate-50 transition-all focus:outline-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-650 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Premium Startup CTA Banner */}
          <section className="bg-gradient-to-r from-[#003057] to-[#0f766e] rounded-3xl p-8 md:p-14 text-center text-white space-y-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden mb-8">
            <div className="absolute top-[-40%] left-[-20%] w-[380px] h-[380px] rounded-full bg-teal-400/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[380px] h-[380px] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Amankan Kamar Kos Idaman Anda</h2>
              <p className="text-xs text-teal-50/90 leading-relaxed max-w-md mx-auto">
                Hindari kekecewaan akibat iklan yang tidak sesuai. Dapatkan pembuktian nyata bersama verifikator ahli sekarang.
              </p>
            </div>

            <div className="pt-2 relative z-10">
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-[#003057] font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                Mulai Audit <ArrowRight className="h-4 w-4 text-[#003057]" />
              </Link>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500 relative z-10 text-left">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <img 
                src="/logo.webp" 
                alt="InspeksiKos Logo" 
                className="h-14 w-auto object-contain hover:scale-[1.01] transition-transform duration-200" 
              />
              <p className="text-[10px] text-slate-400 text-center md:text-left">
                Platform Verifikasi & Audit Properti Kos On-Demand pertama di Indonesia.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-slate-400">
              <a href="#" className="hover:text-[#003057] transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-[#003057] transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-[#003057] transition-colors">Bantuan</a>
            </div>

            <p className="text-[10px] text-slate-400 text-center md:text-right">
              © 2026 InspeksiKos. Capstone Project D4 TRPL Politeknik Negeri Padang. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
