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
  Home as HomeIcon,
  HelpCircle,
  MessageSquare,
  Search,
  PhoneCall,
  Bell,
  User,
  MapPin,
  Sliders,
  Clock,
  Send,
  CheckCircle2,
  ThumbsUp,
  XCircle,
  Plus
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeUni, setActiveUni] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'home' | 'layanan' | 'testi' | 'faq' | 'profile'>('home');

  // Interactive mobile UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: 'Halo! Saya asisten AI InspeksiKos. Ada yang bisa saya bantu hari ini tentang verifikasi kos?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState('Semua');
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('Limau Manis, Padang');
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  // Auto-swipe promo banners
  useEffect(() => {
    const promoInterval = setInterval(() => {
      setActivePromoIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(promoInterval);
  }, []);

  // AI Chat Bot response generator
  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    const userText = aiInput;
    setAiMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiInput('');

    setTimeout(() => {
      let reply = "Terima kasih atas pertanyaannya! Silakan ketik pertanyaan Anda dengan kata kunci seperti 'biaya', 'cara kerja', atau 'kebersihan air'.";
      const normalizedText = userText.toLowerCase();
      if (normalizedText.includes('biaya') || normalizedText.includes('harga') || normalizedText.includes('tarif')) {
        reply = "Tarif audit kami sangat bersahabat:\n1. *Inspeksi Tunggal*: Rp 50.000 untuk 1 kosan.\n2. *Inspeksi Grup*: Rp 45.000 per properti (maksimal 5 kosan). Semua pembayaran diproses aman lewat QRIS/Midtrans.";
      } else if (normalizedText.includes('air') || normalizedText.includes('bersih') || normalizedText.includes('keruh')) {
        reply = "Setiap verifikator kami dibekali dengan alat TDS meter yang dikalibrasi. Kami mengambil sampel air dari keran kamar mandi dan menguji kadar zat padat terlarut langsung di depan pengelola kos.";
      } else if (normalizedText.includes('cara') || normalizedText.includes('kerja') || normalizedText.includes('bagaimana')) {
        reply = "Caranya sangat mudah:\n1. Pilih paket di menu 'Layanan'.\n2. Masukkan alamat kosan dan isi klaim fasilitas.\n3. Lakukan pembayaran.\n4. Verifikator kami meluncur ke lokasi dan memberikan laporan lengkap PDF dalam 2-3 jam.";
      } else if (normalizedText.includes('aman') || normalizedText.includes('terpercaya') || normalizedText.includes('penipuan')) {
        reply = "InspeksiKos dijamin aman. Kami bermitra dengan verifikator lokal bersertifikat. Hasil foto diverifikasi AI, dan jika kunjungan ditolak pemilik kos, uang Anda dikembalikan 100%!";
      } else if (normalizedText.includes('wa') || normalizedText.includes('whatsapp') || normalizedText.includes('kontak')) {
        reply = "Kamu bisa menghubungi CS WhatsApp resmi kami di nomor 0812-3456-789 untuk bantuan instan.";
      }
      setAiMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

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
      {/* 1. DESKTOP VIEWPORT (hidden on mobile, block on md/lg screens) */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        
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

            <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <a href="#fitur" className="hover:text-[#003057] transition-all">Cara Kerja</a>
              <a href="#bento" className="hover:text-[#003057] transition-all">Keunggulan</a>
              <a href="#harga" className="hover:text-[#003057] transition-all">Kategori Layanan</a>
              <a href="#faq" className="hover:text-[#003057] transition-all">FAQ</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login" className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-[#003057] transition-all active:scale-[0.98]">
                Masuk
              </Link>
              <Link href="/register" className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider bg-[#003057] hover:bg-[#001e38] text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] active:translate-y-[1px]">
                Mulai Audit
              </Link>
            </div>
          </div>
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
      {/* ========================================================================= */}
      {/* 2. MOBILE FIRST NATIVE APP SHELL (block on mobile, hidden on desktop) */}
      {/* ========================================================================= */}
      <div className="block md:hidden min-h-screen bg-slate-50 relative pb-20">
        
        {/* Top App Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 z-40 shadow-sm">
          {/* Location Selector */}
          <button 
            onClick={() => setShowRegionPicker(true)} 
            className="flex items-center gap-1.5 text-left cursor-pointer focus:outline-none"
          >
            <div className="p-1.5 rounded-full bg-teal-50 text-[#0f766e]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 font-semibold leading-none uppercase">Lokasi Anda</div>
              <div className="text-xs font-black text-[#003057] flex items-center gap-0.5 leading-tight mt-0.5">
                {selectedRegion} <ChevronDown className="h-3.5 w-3.5 text-slate-505" />
              </div>
            </div>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-505">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white animate-pulse" />
            </button>
            
            {/* Profile Avatar */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#003057] to-[#0f766e] text-white flex items-center justify-center font-bold text-xs shadow-sm"
            >
              BS
            </button>
          </div>
        </header>

        {/* Dynamic Mobile App Tab Content */}
        <main className="pt-20 px-4 pb-8 space-y-6">
          
          {/* TAB 1: BERANDA (Home) */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              
              {/* Interactive Search Bar */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari kos dekat UNAND, PNP, UNP..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchFocused(true);
                      }}
                      onFocus={() => setIsSearchFocused(true)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-sm"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-650"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm cursor-pointer">
                    <Sliders className="h-4 w-4" />
                  </button>
                </div>

                {/* Mock Search Suggestions Dropdown */}
                {isSearchFocused && (
                  <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-3 text-left space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pencarian Populer</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['UNAND Limau Manis', 'Kos Putri PNP', 'Kos Murah UNP', 'Uji Air Bersih', 'WiFi Cepat'].map((tag, i) => (
                        <button 
                          key={i} 
                          onClick={() => { setSearchQuery(tag); setIsSearchFocused(false); }}
                          className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10.5px] border border-slate-200/50 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    {searchQuery && (
                      <div className="border-t border-slate-100 pt-2.5 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Simulasi</div>
                        {['Kos Ananda Syariah', 'Pondok Orange', 'Wisma Melati'].map((name, i) => (
                          <div 
                            key={i} 
                            onClick={() => { setSearchQuery(name); setIsSearchFocused(false); }}
                            className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-semibold text-slate-700"
                          >
                            <Search className="h-3.5 w-3.5 text-slate-400" />
                            {name} - {selectedRegion}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-[10px] text-teal-650 font-bold">
                      <span>Pencarian Cepat Aktif</span>
                      <button onClick={() => setIsSearchFocused(false)} className="hover:text-teal-800">Tutup</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Order Progress Tracking Widget */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm text-left">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider font-mono">Inspeksi Berjalan</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">ID: IK-7281</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#003057]">Wisma Mawar - Air Tawar (UNP)</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Verifikator <strong className="text-slate-700 font-bold">Reza R.</strong> sedang menguji kebersihan air kamar mandi.
                  </p>
                </div>
                {/* Progress bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase font-mono">
                    <span>1. Cocok</span>
                    <span className="text-teal-600 font-extrabold">2. Tes Air & WiFi</span>
                    <span>3. Selesai</span>
                  </div>
                </div>
              </div>

              {/* Gojek-style Quick Action Grid */}
              <div className="grid grid-cols-4 gap-y-4 gap-x-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                
                {/* Item 1: Audit Baru */}
                <Link href="/login" className="flex flex-col items-center text-center cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white flex items-center justify-center shadow-md shadow-rose-500/10 group-active:scale-95 transition-transform relative">
                    <ShieldCheck className="h-6 w-6" />
                    <span className="absolute -top-1.5 -right-1 px-1 py-0.5 bg-yellow-450 text-slate-900 text-[6.5px] font-extrabold rounded-md uppercase tracking-wider">Hot</span>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">Audit Baru</span>
                </Link>

                {/* Item 2: Tes Air */}
                <button 
                  onClick={() => { setActiveTab('layanan'); }}
                  className="flex flex-col items-center text-center cursor-pointer group focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-md shadow-sky-500/10 group-active:scale-95 transition-transform">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">Tes Air</span>
                </button>

                {/* Item 3: Tes WiFi */}
                <button 
                  onClick={() => { setActiveTab('layanan'); }}
                  className="flex flex-col items-center text-center cursor-pointer group focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/10 group-active:scale-95 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">Tes WiFi</span>
                </button>

                {/* Item 4: Asisten AI */}
                <button 
                  onClick={() => setShowAiChat(true)}
                  className="flex flex-col items-center text-center cursor-pointer group focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/10 group-active:scale-95 transition-transform relative">
                    <Cpu className="h-6 w-6" />
                    <span className="absolute -top-1.5 -right-1 px-1 py-0.5 bg-emerald-500 text-white text-[6.5px] font-extrabold rounded-md uppercase tracking-wider">AI</span>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">Tanya AI</span>
                </button>

                {/* Item 5: Paket Hemat */}
                <button 
                  onClick={() => { setActiveTab('layanan'); }}
                  className="flex flex-col items-center text-center cursor-pointer group focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10 group-active:scale-95 transition-transform">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">Pilih Paket</span>
                </button>

                {/* Item 6: Mitra Ahli */}
                <button 
                  onClick={() => {
                    const el = document.getElementById('inspectors-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex flex-col items-center text-center cursor-pointer group focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/10 group-active:scale-95 transition-transform">
                    <User className="h-6 w-6" />
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">Mitra Ahli</span>
                </button>

                {/* Item 7: Riwayat */}
                <button 
                  onClick={() => { setActiveTab('profile'); }}
                  className="flex flex-col items-center text-center cursor-pointer group focus:outline-none"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-650 text-white flex items-center justify-center shadow-md shadow-slate-500/10 group-active:scale-95 transition-transform">
                    <Clock className="h-6 w-6" />
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">Riwayat</span>
                </button>

                {/* Item 8: CS WhatsApp */}
                <a 
                  href="https://wa.me/628123456789" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center text-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-green-500/10 group-active:scale-95 transition-transform">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <span className="text-[9.5px] font-extrabold text-[#003057] mt-2 leading-tight">CS Online</span>
                </a>

              </div>

              {/* Promo Banners Carousel */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm">
                
                {/* Banner container */}
                <div className="h-28 text-white flex transition-all duration-300">
                  {activePromoIndex === 0 && (
                    <div className="w-full h-full bg-gradient-to-r from-teal-700 to-emerald-600 p-4 flex flex-col justify-between text-left shrink-0">
                      <div>
                        <div className="px-2 py-0.5 bg-white/20 inline-block text-[8px] font-mono font-bold rounded uppercase">Promo MABA</div>
                        <h4 className="text-xs font-black mt-1 leading-tight">Potongan 20% Inspeksi Pertama</h4>
                        <p className="text-[9px] text-teal-100 leading-normal mt-0.5">Validasi kos impianmu dengan kode promo khusus mahasiswa baru: <span className="font-bold font-mono">MABAPADANG</span></p>
                      </div>
                      <Link href="/login" className="self-start text-[8px] font-black uppercase tracking-wider bg-white text-teal-850 px-3 py-1 rounded-md mt-1">Gunakan Promo</Link>
                    </div>
                  )}
                  {activePromoIndex === 1 && (
                    <div className="w-full h-full bg-gradient-to-r from-blue-700 to-indigo-600 p-4 flex flex-col justify-between text-left shrink-0">
                      <div>
                        <div className="px-2 py-0.5 bg-white/20 inline-block text-[8px] font-mono font-bold rounded uppercase">Garansi 100%</div>
                        <h4 className="text-xs font-black mt-1 leading-tight">Uang Kembali Jika Kos Ditolak</h4>
                        <p className="text-[9px] text-blue-105 leading-normal mt-0.5">Jika pengelola menolak kunjungan, dana akan dikembalikan otomatis tanpa potongan biaya apapun.</p>
                      </div>
                      <button onClick={() => setActiveTab('faq')} className="self-start text-[8px] font-black uppercase tracking-wider bg-white text-blue-800 px-3 py-1 rounded-md mt-1">Pelajari S&K</button>
                    </div>
                  )}
                  {activePromoIndex === 2 && (
                    <div className="w-full h-full bg-gradient-to-r from-rose-700 to-amber-600 p-4 flex flex-col justify-between text-left shrink-0">
                      <div>
                        <div className="px-2 py-0.5 bg-white/20 inline-block text-[8px] font-mono font-bold rounded uppercase">Grup Audit</div>
                        <h4 className="text-xs font-black mt-1 leading-tight">Bandingkan 5 Kosan Sekaligus</h4>
                        <p className="text-[9px] text-rose-100 leading-normal mt-0.5">Lebih hemat Rp 25.000 menggunakan paket Grup Audit. Dapatkan tabel skor komparatif.</p>
                      </div>
                      <button onClick={() => setActiveTab('layanan')} className="self-start text-[8px] font-black uppercase tracking-wider bg-white text-rose-800 px-3 py-1 rounded-md mt-1">Pilih Paket</button>
                    </div>
                  )}
                </div>

                {/* Dot Indicators */}
                <div className="absolute bottom-2 right-4 flex gap-1 z-10">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePromoIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activePromoIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Campus Showcase */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
                <div className="text-left flex justify-between items-end">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0f766e] font-mono block">
                      SEBARAN AUDIT KAMPUS
                    </span>
                    <h2 className="text-sm font-black text-[#003057] tracking-tight">
                      Mitra Wilayah Universitas
                    </h2>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Sumbar</span>
                </div>

                {/* Animated Showcase Card for Mobile */}
                <div 
                  className={`p-4 rounded-xl border bg-slate-50/50 flex flex-col justify-between h-[180px] border-slate-200 transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 translate-y-2 scale-98' : 'opacity-100 translate-y-0 scale-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg border ${universities[activeUni].logoColor} w-14 h-14 flex items-center justify-center bg-white shadow-sm`}>
                      <img 
                        src={`/${universities[activeUni].logoFile}`} 
                        alt={universities[activeUni].short} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-[8px] font-extrabold uppercase tracking-wider font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" /> Ter-Audit
                    </span>
                  </div>

                  <div className="text-left space-y-0.5 mt-2">
                    <h3 className="text-base font-black text-[#003057] leading-none">
                      {universities[activeUni].short}
                    </h3>
                    <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wide truncate max-w-[280px]">
                      {universities[activeUni].name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-left">
                    <div>
                      <div className="text-sm font-black text-[#003057] font-mono leading-none">{universities[activeUni].verifiedCount}</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Kamar Ter-Audit</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#003057] font-mono leading-none">{universities[activeUni].inspectors}</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Verifikator</div>
                    </div>
                  </div>
                </div>

                {/* Grid of Chips for Selector */}
                <div className="grid grid-cols-4 gap-2">
                  {universities.map((uni, idx) => {
                    const isActive = activeUni === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleUniChange(idx)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all duration-300 cursor-pointer h-16 ${
                          isActive 
                            ? 'bg-white border-[#0f766e] shadow-sm scale-102 font-black text-[#003057]' 
                            : 'bg-slate-50/50 border-slate-150 opacity-60 hover:opacity-100 text-slate-500'
                        }`}
                      >
                        <div className="h-6 w-full flex items-center justify-center mb-1">
                          <img 
                            src={`/${uni.logoFile}`} 
                            alt={uni.short} 
                            className="max-h-full max-w-full object-contain filter grayscale contrast-125" 
                          />
                        </div>
                        <div className="text-[7.5px] font-black font-mono tracking-tight leading-none truncate w-full">
                          {uni.short}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Keunggulan Section (Bento Grid cards stacked vertically) */}
              <div className="space-y-4">
                <div className="text-left">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0f766e] font-mono block">
                    KEUNGGULAN UTAMA
                  </span>
                  <h2 className="text-sm font-black text-[#003057] tracking-tight">
                    Mengapa Memilih Kami?
                  </h2>
                </div>

                <div className="space-y-3.5">
                  
                  {/* Card 1: Live Verification */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3 text-left">
                    <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-100">
                      <img 
                        src="/inspector-verifying-room.jpg" 
                        alt="Inspector in action" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-teal-50 text-[#0f766e] text-[9px] font-bold uppercase font-mono">Lap. Fisik</span>
                        <h3 className="text-xs font-black text-[#003057] uppercase tracking-wider font-mono">1. Audit Langsung di Tempat</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Verifikator memeriksa kondisi AC, sirkulasi udara, ukuran ruangan, dan kelembapan secara real-time langsung di lokasi properti.
                      </p>
                    </div>
                  </div>

                  {/* Card 2: AI Verification */}
                  <div className="rounded-2xl border border-slate-200 bg-[#003057] text-white p-4 shadow-md text-left flex justify-between items-center gap-3">
                    <div className="space-y-1 max-w-[65%]">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-white/10 text-teal-300 text-[9px] font-bold uppercase font-mono">Visual AI</span>
                        <h3 className="text-xs font-black text-teal-300 uppercase tracking-wider font-mono">2. Validasi Foto AI</h3>
                      </div>
                      <p className="text-[10px] text-teal-150/90 leading-relaxed">
                        Algoritma computer vision mendeteksi keaslian furnitur (kasur, AC, lemari) untuk dicocokkan dengan gambar iklan.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-[8px] text-teal-200 font-mono space-y-1 flex-1 text-left">
                      <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-teal-400 shrink-0" /> Kasur Cocok</div>
                      <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-teal-400 shrink-0" /> AC Terdeteksi</div>
                      <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-teal-400 shrink-0" /> Lemari Cocok</div>
                    </div>
                  </div>

                  {/* Card 3: Water Quality & Wifi */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between h-36 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10.5px] font-black text-[#003057] uppercase font-mono">Uji Air</h3>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-[9.5px] text-slate-505 leading-snug">Uji TDS meter untuk menjamin kebersihan air keran kamar mandi kos.</p>
                      <span className="inline-block self-start px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-150 text-[7.5px] font-black rounded-md font-mono">Higienis & Layak</span>
                    </div>

                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between h-36 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10.5px] font-black text-[#003057] uppercase font-mono">Uji WiFi</h3>
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      </div>
                      <p className="text-[9.5px] text-slate-505 leading-snug">Speedtest riil di dalam kamar untuk kestabilan belajar online.</p>
                      <span className="inline-block self-start px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-150 text-[7.5px] font-black rounded-md font-mono">WiFi Stabil</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Active Verifiers Profile List */}
              <div id="inspectors-section" className="space-y-4 text-left">
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0f766e] font-mono block">
                    MITRA LAPANGAN
                  </span>
                  <h2 className="text-sm font-black text-[#003057] tracking-tight">
                    Verifikator Terdekat
                  </h2>
                </div>
                
                {/* Horizontal scroll list */}
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {[
                    { name: "Ahmad Fadhil", area: "Limau Manis (UNAND)", rating: "4.9", audits: "142", initial: "AF", status: "Online" },
                    { name: "Reza Ramadhan", area: "Air Tawar (UNP)", rating: "4.8", audits: "98", initial: "RR", status: "Online" },
                    { name: "Fitri Handayani", area: "Ulak Karang (UIN)", rating: "4.9", audits: "76", initial: "FH", status: "Offline" },
                    { name: "Bagus Setiawan", area: "Bungo Pasang (UPI)", rating: "4.7", audits: "112", initial: "BS", status: "Online" }
                  ].map((verif, idx) => (
                    <div 
                      key={idx} 
                      className="w-40 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm snap-start shrink-0 flex flex-col justify-between h-32"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10.5px] font-bold text-slate-700 font-mono">
                          {verif.initial}
                        </div>
                        <span className={`h-2 w-2 rounded-full ${verif.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      </div>
                      <div className="mt-2 text-left">
                        <h4 className="text-[11px] font-bold text-[#003057] truncate">{verif.name}</h4>
                        <p className="text-[8.5px] text-slate-400 font-semibold truncate">{verif.area}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100">
                        <span className="text-[9px] text-[#0f766e] font-extrabold font-mono">⭐ {verif.rating}</span>
                        <span className="text-[8.5px] text-slate-400 font-mono">{verif.audits} Audit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LAYANAN (Pricing & Workflow) */}
          {activeTab === 'layanan' && (
            <div className="space-y-6">
              
              {/* Timeline of Steps */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
                <div className="text-left">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0f766e] font-mono block">
                    PROSES MUDAH
                  </span>
                  <h2 className="text-sm font-black text-[#003057] tracking-tight">
                    Bagaimana Kami Membantu Anda
                  </h2>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-650 font-mono shrink-0">1</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#003057]">Pilih Paket & Isi Formulir</h4>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">Masukkan target alamat kos, pilih layanan tunggal/grup, dan ketik daftar fasilitas iklan.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-705 font-mono shrink-0">2</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#003057]">Matchmaking & Survei</h4>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">Verifikator lapangan kami segera mendatangi kos secara on-demand, melakukan tes air & speedtest.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-650 font-mono shrink-0">3</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#003057]">Laporan & Asisten AI</h4>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">Akses hasil verifikasi visual AI, foto asli, data numerik air/WiFi, dan PDF laporan di dasbor.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="space-y-4">
                <div className="text-left">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0f766e] font-mono block">
                    KATEGORI LAYANAN
                  </span>
                  <h2 className="text-sm font-black text-[#003057] tracking-tight">
                    Pilih Paket Verifikasi Anda
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Pack 1 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-black text-[#003057]">Inspeksi Tunggal</h3>
                        <p className="text-[10.5px] text-slate-505 mt-0.5">Cocok jika sudah yakin 1 kos target</p>
                      </div>
                      <span className="text-[8px] font-extrabold text-slate-400 font-mono uppercase bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">1 Properti</span>
                    </div>
                    <div className="text-xl font-black text-[#003057] font-mono py-2.5 my-2.5 border-t border-b border-slate-100">
                      Rp 50.000 <span className="text-[9px] font-normal text-slate-400">/ sekali audit</span>
                    </div>
                    <ul className="text-[10px] text-slate-505 space-y-1.5 mb-4">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Cek 5+ titik fasilitas utama</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Pengujian kebersihan air TDS meter</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Speedtest kestabilan WiFi kamar</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Laporan ringkasan format PDF resmi</li>
                    </ul>
                    <Link href="/login" className="block text-center w-full py-3 bg-[#003057] hover:bg-[#001e38] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider active:scale-95 transition-transform shadow-sm">
                      Pilih Inspeksi Tunggal
                    </Link>
                  </div>

                  {/* Pack 2 */}
                  <div className="bg-white border-2 border-[#0f766e] rounded-2xl p-5 shadow-md text-left relative">
                    <div className="absolute top-2 right-4 px-2 py-0.5 bg-[#0f766e] text-[6.5px] font-black uppercase text-white rounded font-mono">Terpopuler</div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-black text-[#003057]">Inspeksi Grup</h3>
                        <p className="text-[10.5px] text-slate-505 mt-0.5">Bandingkan beberapa kos sekaligus</p>
                      </div>
                      <span className="text-[8px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded font-mono">Maks 5 Properti</span>
                    </div>
                    <div className="text-xl font-black text-[#003057] font-mono py-2.5 my-2.5 border-t border-b border-slate-100">
                      Rp 45.000 <span className="text-[9px] font-normal text-slate-450">/ properti</span>
                    </div>
                    <ul className="text-[10px] text-slate-550 space-y-1.5 mb-4">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#0f766e] shrink-0" /> Audit komparatif hingga 5 kosan</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#0f766e] shrink-0" /> Tabel perbandingan skor terpadu</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#0f766e] shrink-0" /> Uji kebersihan air & WiFi di tiap kos</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#0f766e] shrink-0" /> AI rekomendasi kamar kos terbaik</li>
                    </ul>
                    <Link href="/login" className="block text-center w-full py-3 bg-[#0f766e] hover:bg-[#0b544f] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider active:scale-95 transition-transform shadow-md">
                      Pilih Inspeksi Grup
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: REVIEW / RIWAYAT (Testimoni & User Orders) */}
          {activeTab === 'testi' && (
            <div className="space-y-6 text-left">
              
              {/* Tab Selector inside Review page */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button className="flex-1 py-1.5 text-[10px] font-extrabold text-slate-700 rounded-lg bg-white shadow-xs text-center uppercase">Ulasan Mahasiswa</button>
                <button 
                  onClick={() => setActiveTab('profile')} 
                  className="flex-1 py-1.5 text-[10px] font-semibold text-slate-500 rounded-lg text-center uppercase hover:text-slate-705"
                >
                  Riwayat Audit
                </button>
              </div>

              {/* Student Testimonials */}
              <div className="space-y-4">
                <div className="text-left">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0f766e] font-mono block">
                    ULASAN NYATA
                  </span>
                  <h2 className="text-sm font-black text-[#003057] tracking-tight">
                    Suara Mahasiswa
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Anisa Putri", univ: "TRPL, Politeknik Negeri Padang", quote: "Saya dari luar kota Padang, sehingga survei kosan satu per satu sangat sulit. Menggunakan Inspeksi Grup sangat menghemat biaya tiket pesawat saya. Laporannya sangat valid.", service: "Inspeksi Grup" },
                    { name: "Farhan Mahendra", univ: "Teknik Sipil, Universitas Andalas", quote: "Sangat menolong! Air kosan yang saya minati ternyata TDS-nya tinggi (berkarat), akhirnya pindah opsi kos lain berkat verifikasi air dari InspeksiKos.", service: "Inspeksi Tunggal" },
                    { name: "Dina Lestari", univ: "Pendidikan Bahasa, Universitas Negeri Padang", quote: "Proses cepat. Dari pesan via QRIS sampai verifikator jalan hanya 20 menit. Laporan PDF-nya rapi sekali dan detail.", service: "Inspeksi Tunggal" }
                  ].map((testi, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-450" />)}
                        </div>
                        <span className="text-[7.5px] font-black text-[#0f766e] bg-teal-50 border border-teal-100 px-2 py-0.5 rounded font-mono">{testi.service}</span>
                      </div>
                      <blockquote className="text-[11px] font-medium text-slate-650 leading-relaxed italic">
                        &ldquo;{testi.quote}&rdquo;
                      </blockquote>
                      <div className="border-t border-slate-100 pt-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-[9px] font-black text-slate-650 font-mono flex items-center justify-center">
                          {testi.name[0]}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-[#003057] leading-none">{testi.name}</h4>
                          <p className="text-[8px] text-slate-400 font-semibold mt-0.5">{testi.univ}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Count Banner */}
              <div className="bg-gradient-to-br from-[#003057] to-[#0f766e] text-white p-5 rounded-2xl shadow-md space-y-2.5 relative overflow-hidden">
                <div className="absolute top-[-30%] right-[-20%] w-[160px] h-[160px] rounded-full bg-white/10 blur-[40px] pointer-events-none" />
                <div className="text-3xl font-black font-mono">1.250+</div>
                <h4 className="text-xs font-bold text-teal-200 uppercase tracking-wide">Kamar Kos Telah Ter-Verifikasi</h4>
                <p className="text-[10px] text-teal-100/80 leading-relaxed">
                  Kami berkomitmen menghadirkan transparansi penuh di pasar sewa properti kos, melindungi Anda dari manipulasi iklan sepihak.
                </p>
              </div>

            </div>
          )}

          {/* TAB 4: BANTUAN & FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              
              {/* FAQ Accordion List */}
              <div className="space-y-4">
                <div className="text-left">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0f766e] font-mono block">
                    BANTUAN & FAQ
                  </span>
                  <h2 className="text-sm font-black text-[#003057] tracking-tight">
                    Pertanyaan Umum Pengguna
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {faqs.map((faq, idx) => {
                    const isOpen = activeFaq === idx;
                    return (
                      <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs text-left">
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full px-4 py-3.5 flex items-center justify-between text-left font-bold text-[10px] uppercase tracking-wide text-[#003057] hover:bg-slate-50 transition-all focus:outline-none"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-450 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct Support Button */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-3">
                <div className="text-xs font-bold text-[#003057]">Punya Masalah Lain?</div>
                <p className="text-[10px] text-slate-500">Hubungi customer support resmi kami. Kami siap melayani keluhan Anda.</p>
                <a 
                  href="https://wa.me/628123456789" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center justify-center gap-1.5 w-full py-3 bg-[#0f766e] hover:bg-[#0b544f] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> WhatsApp Layanan CS
                </a>
              </div>

            </div>
          )}

          {/* TAB 5: PROFIL / AKUN */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-left">
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#003057] to-[#0f766e] text-white flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                    BS
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#003057]">Budi Santoso</h3>
                    <p className="text-[10.5px] text-slate-505 font-semibold">budi.santoso@mahasiswa.unand.ac.id</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[8px] font-black font-mono border border-emerald-200 rounded-full">
                      ✓ Mahasiswa UNAND Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock Transaction History */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-black text-[#003057] uppercase tracking-wider font-mono">Riwayat Transaksi Terakhir</h3>
                
                <div className="space-y-2.5">
                  
                  {/* Order 1 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-semibold border-b border-slate-100 pb-1.5">
                      <span>17 Juni 2026</span>
                      <span className="font-mono text-slate-450 uppercase">Order: #IK-7281</span>
                    </div>
                    <div className="flex justify-between items-start mt-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Wisma Mawar - Air Tawar (UNP)</h4>
                        <p className="text-[9.5px] text-slate-450 mt-0.5">Layanan: Inspeksi Tunggal (Tes Air + WiFi)</p>
                      </div>
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-850 border border-sky-200 text-[8px] font-black rounded-md font-mono">Sedang Proses</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100/50">
                      <span className="text-xs font-black text-[#003057] font-mono">Rp 50.000</span>
                      <button 
                        onClick={() => { setActiveTab('home'); }} 
                        className="text-[9.5px] font-bold text-[#0f766e] uppercase tracking-wider hover:text-teal-800"
                      >
                        Lacak Detail
                      </button>
                    </div>
                  </div>

                  {/* Order 2 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-semibold border-b border-slate-100 pb-1.5">
                      <span>12 Juni 2026</span>
                      <span className="font-mono text-slate-450 uppercase">Order: #IK-6190</span>
                    </div>
                    <div className="flex justify-between items-start mt-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Kos Pondok Ananda - Limau Manis (UNAND)</h4>
                        <p className="text-[9.5px] text-slate-455 mt-0.5">Layanan: Inspeksi Tunggal</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250 text-[8px] font-black rounded-md font-mono">Selesai</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100/50">
                      <span className="text-xs font-black text-[#003057] font-mono">Rp 50.000</span>
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); alert('Mengunduh berkas laporan format PDF...'); }}
                        className="flex items-center gap-0.5 text-[9.5px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-800"
                      >
                        <Download className="h-3 w-3" /> Unduh PDF
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Native settings options list */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {[
                  { label: "Daftar Kos Favorit", badge: "0" },
                  { label: "Metode Pembayaran (Midtrans)", badge: "QRIS, VA" },
                  { label: "Pengaturan Akun & Keamanan" },
                  { label: "Ubah Kata Sandi" },
                  { label: "Kebijakan Privasi InspeksiKos" },
                  { label: "Syarat & Ketentuan" }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => alert(`Fitur ${item.label} sedang disiapkan!`)}
                    className="w-full px-4 py-3 flex items-center justify-between border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      {item.badge && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold">{item.badge}</span>}
                      <span>▾</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Logout button */}
              <Link href="/login" className="block text-center w-full py-3 bg-rose-50 border border-rose-200 text-rose-705 font-extrabold rounded-2xl text-xs uppercase tracking-wider active:bg-rose-100 transition-colors">
                Keluar Dari Akun
              </Link>

            </div>
          )}

        </main>

        {/* Location Selector Bottom Sheet Drawer */}
        {showRegionPicker && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end animate-in fade-in duration-300">
            <div className="w-full bg-white rounded-t-3xl max-h-[75dvh] flex flex-col p-5 shadow-2xl relative text-left animate-in slide-in-from-bottom duration-300">
              
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-[#003057]">Pilih Wilayah Kampus</h3>
                <button 
                  onClick={() => setShowRegionPicker(false)}
                  className="p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-205"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-[11px] text-slate-500 mb-4 leading-normal">
                Memilih wilayah kampus akan mempercepat pencarian verifikator terdekat dan menyesuaikan rekomendasi kos.
              </p>
              
              <div className="space-y-2 overflow-y-auto flex-1 pb-4">
                {[
                  { region: "Limau Manis, Padang", label: "Dekat Kampus UNAND" },
                  { region: "Air Tawar, Padang", label: "Dekat Kampus UNP" },
                  { region: "Ketaping, Padang", label: "Dekat Kampus Politeknik Negeri Padang (PNP)" },
                  { region: "Lubuk Buaya, Padang", label: "Dekat Kampus UNP & Poltekkes" },
                  { region: "Ulak Karang, Padang", label: "Dekat Kampus UIN Imam Bonjol" },
                  { region: "Bungo Pasang, Padang", label: "Dekat Kampus UPI YPTK" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedRegion(item.region);
                      setShowRegionPicker(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedRegion === item.region 
                        ? 'border-teal-500 bg-teal-50/50 text-[#0f766e] font-black'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{item.region}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{item.label}</div>
                    </div>
                    {selectedRegion === item.region && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating AI Chat Bubble Button */}
        <button 
          onClick={() => setShowAiChat(true)}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-to-tr from-[#003057] to-[#0f766e] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all z-40 border border-white/20"
        >
          <MessageSquare className="h-5.5 w-5.5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white animate-pulse" />
        </button>

        {/* Interactive Chatbot Drawer Modal */}
        {showAiChat && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end animate-in fade-in duration-300">
            <div className="w-full bg-white rounded-t-3xl h-[85dvh] flex flex-col p-4 shadow-2xl relative text-left animate-in slide-in-from-bottom duration-300">
              
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
              
              {/* Chat Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 text-[#0f766e]">
                    <Cpu className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#003057]">Asisten AI InspeksiKos</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8.5px] text-slate-400 font-semibold uppercase">Siap Menjawab</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAiChat(false)}
                  className="p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-205"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Suggested Quick Question Tags */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
                {[
                  { tag: "Berapa biaya audit?", text: "Berapa biaya audit?" },
                  { tag: "Bagaimana tes air?", text: "Bagaimana cara kerja tes air bersih?" },
                  { tag: "Apakah terpercaya?", text: "Apakah layanan ini aman dan terpercaya?" },
                  { tag: "Alur pemesanan", text: "Bagaimana cara kerja pemesanan audit?" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiInput(item.text);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-850 hover:border-teal-205 rounded-lg text-[9.5px] border border-slate-200 text-slate-650 shrink-0 font-medium transition-colors"
                  >
                    {item.tag}
                  </button>
                ))}
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1 mb-3">
                {aiMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end ml-auto' : 'self-start mr-auto'}`}
                  >
                    <div 
                      className={`p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user' 
                          ? 'bg-[#003057] text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[7.5px] text-slate-400 mt-1 self-end font-mono">
                      {msg.sender === 'user' ? 'Anda' : 'AI'} • Live
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                <input
                  type="text"
                  placeholder="Tanyakan sesuatu ke AI..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
                />
                <button 
                  onClick={handleSendAiMessage}
                  className="p-2.5 bg-[#0f766e] text-white rounded-xl shadow-md active:scale-95 transition-transform cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Mobile Tab Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/60 flex items-center justify-around z-40 shadow-lg px-2">
          
          {/* Tab 1: Beranda */}
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-200 active:scale-90 cursor-pointer ${
              activeTab === 'home' ? 'text-[#0f766e]' : 'text-slate-400'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Beranda</span>
          </button>

          {/* Tab 2: Layanan */}
          <button 
            onClick={() => setActiveTab('layanan')}
            className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-200 active:scale-90 cursor-pointer ${
              activeTab === 'layanan' ? 'text-[#0f766e]' : 'text-slate-400'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Layanan</span>
          </button>

          {/* Tab 3: Elevated central booking button */}
          <Link 
            href="/login" 
            className="flex flex-col items-center justify-center w-14 h-full relative -top-3.5"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#003057] to-[#0f766e] text-white flex items-center justify-center shadow-lg border-4 border-white active:scale-90 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-[9px] font-extrabold text-[#003057] mt-0.5 leading-none">Audit</span>
          </Link>

          {/* Tab 4: Review */}
          <button 
            onClick={() => setActiveTab('testi')}
            className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-200 active:scale-90 cursor-pointer ${
              activeTab === 'testi' ? 'text-[#0f766e]' : 'text-slate-400'
            }`}
          >
            <Star className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Ulasan</span>
          </button>

          {/* Tab 5: Akun */}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-200 active:scale-90 cursor-pointer ${
              activeTab === 'profile' ? 'text-[#0f766e]' : 'text-slate-400'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-[9px] font-bold mt-1">Akun</span>
          </button>

        </nav>

      </div>

    </div>
  );
}
