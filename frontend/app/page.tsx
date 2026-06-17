"use client";

import Link from 'next/link';
import { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckSquare, 
  ClipboardList, 
  Zap, 
  ArrowRight, 
  Activity, 
  Cpu, 
  HelpCircle,
  Star,
  Users,
  Check,
  MapPin,
  Award,
  Compass,
  Download,
  Flame,
  Search,
  CheckCircle2,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const universityLogos = [
    { name: "UNAND", desc: "Universitas Andalas" },
    { name: "PNP", desc: "Politeknik Negeri Padang" },
    { name: "UNP", desc: "Universitas Negeri Padang" },
    { name: "UIN IB", desc: "UIN Imam Bonjol" }
  ];

  const faqs = [
    {
      q: "Bagaimana cara kerja verifikasi air bersih (TDS)?",
      a: "Setiap inspektur dibekali dengan TDS (Total Dissolved Solids) meter fisik yang terkalibrasi. Mereka akan mengambil sampel air langsung dari keran kamar mandi kosan untuk mengukur kandungan zat padat terlarut (logam berat, garam, dll.) secara presisi. Parameter ini menentukan apakah air layak pakai atau berisiko menyebabkan iritasi kulit."
    },
    {
      q: "Berapa lama proses inspeksi dari awal pemesanan?",
      a: "Setelah Anda melakukan pemesanan dan pembayaran via QRIS, sistem on-demand kami akan langsung mencocokkan pesanan dengan verifikator terdekat dalam 15-30 menit. Inspektur akan mendatangi lokasi kos, dan Anda akan menerima notifikasi scorecard digital beserta laporan PDF lengkap di dashboard dalam 2-3 jam setelah verifikasi lapangan selesai."
    },
    {
      q: "Apakah laporan kecocokan fasilitas ini valid secara hukum?",
      a: "Laporan audit kami bersifat sebagai pembuktian independen berbasis fakta (terverifikasi foto GPS, pengujian alat ukur, dan validasi visual Gemini AI). Ini dapat digunakan oleh calon penyewa sebagai bukti negosiasi harga sewa dengan pemilik kos atau pembatalan DP jika fasilitas terbukti manipulatif."
    },
    {
      q: "Bagaimana jika pemilik kos tidak mengizinkan masuk?",
      a: "Verifikator kami dilatih secara profesional untuk meminta izin kunjungan secara persuasif kepada pemilik atau penjaga kos. Jika kunjungan ditolak sepenuhnya, kami akan membatalkan pesanan secara otomatis dan dana Anda akan dikembalikan 100% tanpa potongan."
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* Background Soft Color Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00305703_1px,transparent_1px),linear-gradient(to_bottom,#00305703_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="w-full border-b border-slate-200/60 bg-white/75 backdrop-blur-md sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.webp" alt="InspeksiKos Logo" className="h-14 w-auto object-contain hover:scale-[1.02] transition-transform duration-250" />
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <a href="#fitur" className="hover:text-primary transition-all">Fitur Utama</a>
            <a href="#bento" className="hover:text-primary transition-all">Teknologi</a>
            <a href="#harga" className="hover:text-primary transition-all">Kategori Layanan</a>
            <a href="#faq" className="hover:text-primary transition-all">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary transition-all">
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
              Daftar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-primary focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white py-4 px-6 space-y-4 shadow-inner">
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary">Fitur Utama</a>
            <a href="#bento" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary">Teknologi</a>
            <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary">Kategori Layanan</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary">FAQ</a>
            <div className="pt-2 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-650 rounded-xl hover:bg-slate-50 transition-all">
                Masuk
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-primary text-xs font-bold uppercase tracking-wider text-white rounded-xl hover:bg-primary-dark transition-all">
                Daftar
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-24 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-24">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 shadow-sm">
              <Sparkles className="h-3 w-3 text-accent-light shrink-0" />
              <span className="tracking-widest uppercase text-[9px] font-extrabold font-mono">Platform Audit Properti On-Demand Pertama</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black leading-[1.08] tracking-tighter text-[#003057] text-wrap-pretty">
              Bebas Manipulasi Iklan.<br />
              Validasi Fasilitas Kos Anda.
            </h1>

            <p className="text-slate-650 text-sm sm:text-base leading-relaxed max-w-[50ch] text-wrap-pretty">
              Hindari kekecewaan foto iklan kos yang menipu. InspeksiKos memvalidasi kelayakan kamar secara langsung melalui verifikator berlisensi menggunakan integrasi <strong className="text-[#003057]">Gemini Vision AI</strong>, uji TDS air bersih, dan speedtest internet fisik.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/login" className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-primary to-accent-light hover:from-primary hover:to-accent text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/10 hover:scale-[1.01] active:scale-[0.98] transition-all text-xs uppercase tracking-wider">
                Mulai Audit Kos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="flex items-center justify-center h-14 border border-slate-355 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-8 hover:scale-[1.01] active:scale-[0.98] transition-all text-xs uppercase tracking-wider shadow-sm">
                Gabung Verifikator
              </Link>
            </div>
            
            {/* Tech Integrations Social Proof */}
            <div className="pt-6 border-t border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono block mb-3">INTEGRASI TEKNOLOGI UTAMA</span>
              <div className="flex flex-wrap gap-5 items-center opacity-65 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                <img src="https://cdn.simpleicons.org/nextdotjs/003057" alt="Next.js" className="h-4 w-auto" />
                <img src="https://cdn.simpleicons.org/supabase/003057" alt="Supabase" className="h-4 w-auto" />
                <img src="https://cdn.simpleicons.org/google/003057" alt="Google Cloud" className="h-3.5 w-auto" />
                <img src="https://cdn.simpleicons.org/leaflet/003057" alt="Leaflet" className="h-4 w-auto" />
              </div>
            </div>
          </div>

          {/* Right Hero Image (mockup) */}
          <div className="lg:col-span-6 relative flex justify-center">
            {/* Tablet Mockup Shell */}
            <div className="w-full max-w-[500px] rounded-3xl border border-slate-200/85 bg-white p-3.5 shadow-2xl relative z-10 transition-all duration-300 hover:scale-[1.01]">
              <div className="rounded-2xl overflow-hidden border border-slate-200/60 aspect-square relative bg-slate-100">
                <img 
                  src="/hero-dashboard-preview.jpg" 
                  alt="InspeksiKos Dashboard" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            {/* Background glowing aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-blue-500/5 rounded-full filter blur-3xl -z-10 transform scale-90" />
          </div>
        </div>

        {/* University Badge Grid (Social Proof) */}
        <div className="w-full border-t border-b border-slate-200/80 py-10 mb-28 text-center bg-white/40 rounded-2xl px-6 backdrop-blur-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono block mb-6">TELAH DIANDALKAN OLEH MAHASISWA DI BERBAGAI KAMPUS</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto items-center">
            {universityLogos.map((logo, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-3 border border-slate-200/40 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <div className="text-base font-extrabold text-[#003057] font-mono group-hover:scale-105 transition-transform duration-200">{logo.name}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{logo.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bento Grid (Features / Technology Section) */}
        <section id="bento" className="mb-28 max-w-5xl mx-auto space-y-12">
          <div className="text-left space-y-3">
            <div className="inline-flex px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100 text-[9px] font-extrabold uppercase tracking-wider font-mono">
              Audit Mekanis & Visual
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-primary leading-tight">Teknologi Verifikasi Lapangan</h2>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">Pemeriksaan fisik langsung menggunakan parameter baku terkalibrasi demi kenyamanan kosan Anda.</p>
          </div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Large Visual (Inspector in action) - Span 2 cols */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center overflow-hidden hover:shadow-md transition-all duration-300 group">
              <div className="w-full md:w-1/2 aspect-square rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shrink-0">
                <img 
                  src="/inspector-verifying-room.jpg" 
                  alt="Inspector verifying facilities" 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                />
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-primary leading-snug">Audit Langsung On-Demand</h3>
                <p className="text-xs text-slate-650 leading-relaxed">
                  Bukan sekadar mencocokkan data. Inspektur berlisensi mendatangi kamar kos secara fisik untuk memeriksa AC, pencahayaan, sirkulasi udara, kelembapan, dan ukuran riil kamar.
                </p>
                <div className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider font-mono flex items-center gap-1.5 pt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" /> Terintegrasi GPS & Timestamp
                </div>
              </div>
            </div>

            {/* Box 2: Gemini AI Analysis - Span 1 col */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black text-primary uppercase font-mono tracking-wide">AI Vision Extraction</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unggahan foto bukti lapangan dari verifikator dianalisis secara instan menggunakan <strong className="text-primary">Gemini 2.5 Flash</strong> untuk mengidentifikasi keberadaan fasilitas asli secara akurat.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-4 text-[10px] text-slate-600 font-mono leading-normal">
                &gt;_ gemini-vision: &quot;Bed MATCH (100%), AC MATCH (98%), Router MATCH (100%).&quot;
              </div>
            </div>

            {/* Box 3: TDS Water Testing - Span 1 col */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black text-primary uppercase font-mono tracking-wide">Uji TDS Air Higienis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pengukuran kandungan partikel air kamar mandi menggunakan TDS meter fisik. Mencegah timbulnya alergi kulit akibat air berkarat atau terkontaminasi.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Standar Bersih:</span>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black rounded-lg font-mono">TDS &lt; 150 PPM</span>
              </div>
            </div>

            {/* Box 4: Speedtest bandwidth - Span 1 col */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black text-primary uppercase font-mono tracking-wide">Speedtest WiFi Riil</h3>
                <p className="text-xs text-slate-650 leading-relaxed">
                  Uji unduh dan unggah secara langsung di dalam kamar menggunakan speedtest sensor. Pastikan koneksi WiFi memadai untuk kuliah daring dan tugas harian.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Kebutuhan Min:</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black rounded-lg font-mono">&gt; 15 MBPS</span>
              </div>
            </div>

            {/* Box 5: Digital Scorecard PDF - Span 1 col */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="text-base font-black text-primary uppercase font-mono tracking-wide">Scorecard Digital</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Laporan kepatuhan iklan berformat PDF resmi beserta persentase kebenaran klaim fasilitas kos untuk mempermudah perbandingan Anda.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Format Laporan:</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-wider font-mono"><Download className="h-3 w-3" /> PDF Export</span>
              </div>
            </div>

          </div>
        </section>

        {/* Asymmetric Work Flow Section (Instead of 3 equal columns) */}
        <section id="fitur" className="mb-28 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-primary">Bagaimana Cara Kerjanya?</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Proses validasi on-demand terverifikasi hanya dalam 3 tahapan sistematis.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Step 1 */}
            <div className="lg:col-span-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div className="space-y-4">
                <div className="text-3xl font-black text-slate-300 font-mono">01</div>
                <h3 className="text-base font-extrabold text-primary leading-snug">Pesan & Input Klaim</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Masukkan alamat kos target dan isi list fasilitas dari foto iklan kosan yang ingin dibuktikan kesesuaian fisiknya.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 text-[10px] font-bold text-slate-400 font-mono">Dukungan: Inspeksi Single / Grup</div>
            </div>

            {/* Step 2 */}
            <div className="lg:col-span-4 p-8 rounded-2xl bg-[#003057] text-white shadow-xl relative flex flex-col justify-between hover:scale-[1.01] transition-all duration-200">
              <div className="absolute top-[-20%] left-[-20%] w-[180px] h-[180px] rounded-full bg-teal-400/10 blur-[50px] pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <div className="text-3xl font-black text-teal-300/40 font-mono">02</div>
                <h3 className="text-base font-extrabold text-white leading-snug">Inspeksi Lapangan Instan</h3>
                <p className="text-xs text-teal-100/80 leading-relaxed">
                  Verifikator terdekat menuju lokasi secara on-demand untuk mendokumentasikan foto, uji TDS air, dan speedtest internet secara langsung.
                </p>
              </div>
              <div className="pt-6 border-t border-teal-800 mt-6 text-[10px] font-bold text-teal-300/80 font-mono relative z-10">Matchmaking: &lt; 30 Menit</div>
            </div>

            {/* Step 3 */}
            <div className="lg:col-span-4 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div className="space-y-4">
                <div className="text-3xl font-black text-slate-300 font-mono">03</div>
                <h3 className="text-base font-extrabold text-primary leading-snug">Terima Scorecard & AI Chat</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Laporan kecocokan visual divalidasi oleh Gemini AI. Scorecard digital, PDF laporan, dan asisten konsultasi AI siap diakses di dashboard.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 text-[10px] font-bold text-slate-400 font-mono">Output: PDF Scorecard + Chatbot</div>
            </div>
          </div>
        </section>

        {/* Pricing / Service Kategori Section */}
        <section id="harga" className="mb-28 max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-primary">Pilihan Kategori Layanan</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Sistem pembayaran transparan tanpa biaya tersembunyi, terintegrasi secure gateway Midtrans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Package 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                    Personal Audit
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase">1 Properti</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-primary">Inspeksi Tunggal</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Layanan audit mendetail untuk 1 properti pilihan Anda. Cocok jika Anda telah yakin pada satu opsi kosan dan hanya butuh validasi final.
                  </p>
                </div>
                <div className="text-3xl font-black text-primary font-mono py-2 border-t border-b border-slate-100">
                  Rp 50.000 <span className="text-[11px] text-slate-400 font-normal uppercase font-sans">/ properti</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-650">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Audit 5+ titik fasilitas kamar kos</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Uji TDS kualitas kebersihan air bersih</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Speedtest bandwidth WiFi dalam kamar</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Laporan scorecard digital + Chatbot AI</li>
                </ul>
              </div>
              <Link href="/login" className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]">
                Pesan Inspeksi Tunggal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Package 2 */}
            <div className="bg-white border-2 border-teal-600 rounded-2xl p-8 shadow-md flex flex-col justify-between relative hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-teal-600 text-[8px] font-black uppercase tracking-wider rounded-md text-white font-mono shadow-sm">
                Paling Hemat
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                    Comparison Group
                  </div>
                  <span className="text-[10px] font-extrabold text-teal-700 font-mono uppercase">Hingga 5 Properti</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-primary">Inspeksi Grup</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bandingkan beberapa kos sekaligus secara komparatif untuk menemukan opsi ternyaman. Sangat ideal untuk mahasiswa dari luar kota.
                  </p>
                </div>
                <div className="text-3xl font-black text-primary font-mono py-2 border-t border-b border-slate-100">
                  Rp 45.000 <span className="text-[11px] text-slate-400 font-normal uppercase font-sans">/ properti</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-650">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Audit komparatif hingga 5 properti kos</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Tabel perbandingan statistik skor & nominal sewa</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Uji TDS Air & Uji WiFi di setiap kosan</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" /> Rekomendasi asisten AI untuk rekomendasi kos terbaik</li>
                </ul>
              </div>
              <Link href="/login" className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]">
                Pesan Inspeksi Grup <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Composed Featured Testimonial (Editorial typography instead of 3 equal cards) */}
        <section className="mb-28 max-w-4xl mx-auto py-12 border-t border-b border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4 text-left">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <blockquote className="text-base sm:text-lg font-extrabold text-primary leading-relaxed text-wrap-pretty italic">
                &ldquo;Saya dari luar kota Padang, jadi mustahil survei satu per satu. Menggunakan Inspeksi Grup sangat menghemat biaya tiket pesawat saya. Skor kecocokan visual dari AI Vision-nya sangat akurat dan terpercaya!&rdquo;
              </blockquote>
              <div className="pt-2">
                <h4 className="text-xs font-black text-primary">Anisa Putri</h4>
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

        {/* FAQ Section with interactive accordion */}
        <section id="faq" className="mb-28 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-primary">Pertanyaan Umum</h2>
            <p className="text-xs text-slate-500">Menjawab keraguan teknis mengenai validitas dan survei lapangan.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all shadow-sm">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wide text-primary hover:bg-slate-50 transition-all focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Premium Startup CTA Banner */}
        <section className="bg-gradient-to-r from-primary to-accent-light rounded-3xl p-8 md:p-14 text-center text-white space-y-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden mb-8">
          {/* Decorative glows */}
          <div className="absolute top-[-40%] left-[-20%] w-[380px] h-[380px] rounded-full bg-teal-400/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[-20%] w-[380px] h-[380px] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Amankan Kamar Kos Idaman Anda</h2>
            <p className="text-xs text-teal-50/90 leading-relaxed max-w-md mx-auto">
              Jangan biarkan manipulasi foto iklan merugikan kenyamanan belajar Anda. Dapatkan pembuktian nyata bersama verifikator terpercaya kami sekarang juga.
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-primary font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]">
              Daftar & Mulai Audit <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <img src="/logo.webp" alt="InspeksiKos Logo" className="h-10 w-auto object-contain" />
            <p className="text-[10px] text-slate-400 text-center md:text-left">
              Platform Verifikasi & Audit Properti Kos On-Demand pertama di Indonesia.
            </p>
          </div>

          {/* Legal / Secondary links */}
          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Bantuan</a>
          </div>

          <p className="text-[10px] text-slate-400 text-center md:text-right">
            © 2026 InspeksiKos. Capstone Project D4 TRPL Politeknik Negeri Padang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
