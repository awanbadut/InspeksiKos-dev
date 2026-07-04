"use client";

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ArrowUpRight,
  CheckSquare,
  ShieldCheck,
  Droplets,
  Wifi,
  FileText,
  Check,
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

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
    <div className="relative min-h-screen bg-[#E8F4FD] text-black font-sans">

      {/* ===== NAVBAR ===== */}
      <header className="w-full px-4 sm:px-6 pt-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto bg-[#D6E8F7] rounded-full flex items-center justify-between px-3 py-2 border border-[#C5DBEF]">
          {/* Logo */}
          <Link href="/" className="pl-3 flex items-center shrink-0">
            <img src="/logo.webp" alt="InspeksiKos" className="h-7 w-auto object-contain" />
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-1.5 bg-[#C0D8EF] rounded-full text-[13px] font-semibold text-slate-800 border border-[#AECDE8]">
              Home
            </Link>
            <Link href="#about" className="px-4 py-1.5 text-[13px] font-medium text-slate-600 hover:text-black transition-colors">
              About Us
            </Link>
            <Link href="#how-it-works" className="px-4 py-1.5 text-[13px] font-medium text-slate-600 hover:text-black transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="px-4 py-1.5 text-[13px] font-medium text-slate-600 hover:text-black transition-colors">
              Pricing
            </Link>
          </nav>

          {/* CTA */}
          <Link href="/login" className="px-4 py-2 bg-[#1F3E5A] text-white text-[13px] font-semibold rounded-full flex items-center gap-1 hover:bg-[#152a3d] transition-colors shrink-0">
            Get Started <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-[44px] font-extrabold leading-[1.1] text-black tracking-tight">
              Bebas Manipulasi Iklan{' '}
              Validasi Fasilitas Kos{' '}
              Anda
            </h1>
            <p className="text-sm text-slate-700 leading-relaxed max-w-md">
              Validasi keaslian fasilitas kos secara langsung melalui verifikator berlisensi dengan uji kebersihan air, kecepatan internet, dan verifikasi foto bertenaga AI.
            </p>
            <div>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F3E5A] text-white font-semibold rounded-lg hover:bg-[#152a3d] transition-colors text-sm">
                Mulai Audit Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Illustration collage matching Figma */}
          <div className="relative h-[420px] flex items-center justify-center">
            {/* Top-right: person waving (orange-tinted) */}
            <div className="absolute top-0 right-4 w-[200px] h-[200px] rounded-2xl overflow-hidden shadow-lg z-10">
              <img src="/assets/Gemini_Generated_Image_jmdup3jmdup3jmdu.png" alt="Person waving" className="w-full h-full object-cover" />
            </div>
            {/* Bottom-left: house scene with people */}
            <div className="absolute bottom-0 left-0 w-[280px] h-[240px] rounded-2xl overflow-hidden shadow-lg z-20">
              <img src="/assets/Gemini_Generated_Image_xpspmtxpspmtxpsp.png" alt="House scene" className="w-full h-full object-cover" />
            </div>
            {/* Middle accent card */}
            <div className="absolute top-[140px] right-[40px] w-[180px] h-[160px] rounded-2xl overflow-hidden shadow-lg z-30 border-4 border-white">
              <img src="/assets/Gemini_Generated_Image_35wl5g35wl5g35wl.png" alt="Verification" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TELAH DIANDALKAN OLEH MAHASISWA ===== */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="border border-slate-300 rounded-[32px] p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-[34px] font-extrabold text-black mb-1">Telah Diandalkan oleh Mahasiswa</h2>
            <p className="text-sm text-slate-600">Diandalkan oleh Mahasiswa Kampus Terbaik Sumatra Barat</p>
          </div>

          {/* Top 3 stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {/* Card Orange */}
            <div className="bg-[#FF9B3E] rounded-2xl p-5 text-black">
              <div className="h-28 mb-3 rounded-xl overflow-hidden bg-orange-400/30">
                <img src="/assets/Gemini_Generated_Image_35wl5g35wl5g35wl.png" alt="Mahasiswa" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-6 mb-2">
                <div>
                  <div className="text-xl font-bold">2500+</div>
                  <div className="text-[11px]">Mahasiswa</div>
                </div>
                <div>
                  <div className="text-xl font-bold">30+</div>
                  <div className="text-[11px]">Karyawan</div>
                </div>
              </div>
              <p className="text-[10px] leading-snug text-black/70 mt-2">Adipiscing nulla neque aliquam gravida adipiscing lorem eget. Congue pharetra volutpat euismod in.</p>
            </div>

            {/* Card Yellow-Green */}
            <div className="bg-[#FFD147] rounded-2xl p-5 text-black">
              <div className="h-28 mb-3 rounded-xl overflow-hidden bg-yellow-400/30">
                <img src="/assets/Gemini_Generated_Image_lbgxwwlbgxwwlbgx.png" alt="Kost" className="w-full h-full object-cover" />
              </div>
              <div className="mb-2">
                <div className="text-xl font-bold">1752+</div>
                <div className="text-[11px]">Kost Ter-audit</div>
              </div>
              <p className="text-[10px] leading-snug text-black/70 mt-2">Diam leo cursus sem viverra in id. Nulla nulla neque amet eros molestie lobortis nunc. Amet sed tristique non fames etiam fringilla ante aliquet gravida.</p>
            </div>

            {/* Card Blue */}
            <div className="bg-[#3B82F6] rounded-2xl p-5 text-white">
              <div className="h-28 mb-3 rounded-xl overflow-hidden bg-blue-400/30">
                <img src="/assets/Gemini_Generated_Image_p4vfwdp4vfwdp4vf.png" alt="Mitra" className="w-full h-full object-cover" />
              </div>
              <div className="mb-2">
                <div className="text-xl font-bold">50+</div>
                <div className="text-[11px]">Mitra Lapangan</div>
              </div>
              <p className="text-[10px] leading-snug text-white/70 mt-2">Diam leo cursus sem viverra in id. Nulla nulla neque amet eros molestie lobortis nunc. Amet sed tristique non fames etiam fringilla ante aliquet gravida.</p>
            </div>
          </div>

          {/* Bottom 3 university cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* PNP */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#1F3E5A] rounded-full overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                    <img src="/logo-pnp.png" alt="PNP" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-black leading-none">PNP</div>
                    <div className="text-[10px] text-slate-500">Politeknik Negeri Padang</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded border border-green-200 shrink-0">Terverifikasi</span>
              </div>
              <div className="flex justify-between pt-1">
                <div>
                  <div className="font-bold text-[13px] text-black">410+</div>
                  <div className="text-[9px] text-slate-500">Kost Ter-audit</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[13px] text-black">7 Verifikator</div>
                  <div className="text-[9px] text-slate-500">Mitra Lapangan</div>
                </div>
              </div>
            </div>

            {/* UNP */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#1F3E5A] rounded-full overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                    <img src="/logo-unp.jpg" alt="UNP" className="w-full h-full object-contain rounded-full" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-black leading-none">UNP</div>
                    <div className="text-[10px] text-slate-500">Universitas Negeri Padang</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded border border-green-200 shrink-0">Terverifikasi</span>
              </div>
              <div className="flex justify-between pt-1">
                <div>
                  <div className="font-bold text-[13px] text-black">410+</div>
                  <div className="text-[9px] text-slate-500">Kost Ter-audit</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[13px] text-black">7 Verifikator</div>
                  <div className="text-[9px] text-slate-500">Mitra Lapangan</div>
                </div>
              </div>
            </div>

            {/* UNAND */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#1F3E5A] rounded-full overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                    <img src="/logo-unand.svg" alt="UNAND" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-black leading-none">UNAND</div>
                    <div className="text-[10px] text-slate-500">Universitas Andalas</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded border border-green-200 shrink-0">Terverifikasi</span>
              </div>
              <div className="flex justify-between pt-1">
                <div>
                  <div className="font-bold text-[13px] text-black">410+</div>
                  <div className="text-[9px] text-slate-500">Kost Ter-audit</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[13px] text-black">7 Verifikator</div>
                  <div className="text-[9px] text-slate-500">Mitra Lapangan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KEUNGGULAN VERIFIKASI LAPANGAN ===== */}
      <section id="about" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-[34px] font-extrabold text-black mb-1">Keunggulan Verifikasi Lapangan</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">Pemeriksaan fisik langsung menggunakan parameter baku untuk menjamin kelayakan kamar kos pilihan Anda.</p>
        </div>

        {/* Bento grid — row 1: 2 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Large card: Audit Langsung On-Demand */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-5">
            {/* Left: illustration */}
            <div className="w-full md:w-[45%] shrink-0 rounded-xl overflow-hidden bg-slate-100 aspect-square md:aspect-auto">
              <img src="/assets/Gemini_Generated_Image_vb0i0evb0i0evb0i.png" alt="Audit On-Demand" className="w-full h-full object-cover" />
            </div>
            {/* Right: text */}
            <div className="flex flex-col justify-center">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Audit Langsung On-Demand</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Bukan sekadar pencocokan data. Inspektur berlisensi mendatangi kamar kos secara fisik untuk memeriksa AC, sirkulasi udara, kelembapan, dan ukuran riil kamar secara langsung.
              </p>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-200 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Terintegrasi GPS &amp; Timestamp
              </span>
            </div>
          </div>

          {/* Small card: Verifikasi Foto AI — dark blue */}
          <div className="bg-[#1F3E5A] rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">Verifikasi Foto AI</h3>
              <p className="text-[11px] text-white/80 leading-relaxed mb-4">
                Setiap foto bukti yang diunggah oleh verifikator diproses secara otomatis oleh kecerdasan buatan untuk mencocokkan kelengkapan fasilitas kamar dengan iklan.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-5 h-5 rounded bg-blue-500/30 flex items-center justify-center"><Check className="w-3 h-3 text-blue-300" /></div>
                Furniture lengkap dan bagus
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-5 h-5 rounded bg-blue-500/30 flex items-center justify-center"><Check className="w-3 h-3 text-blue-300" /></div>
                AC &amp; Kelistrikan Cocok
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-5 h-5 rounded bg-blue-500/30 flex items-center justify-center"><Check className="w-3 h-3 text-blue-300" /></div>
                Kamar mandi &amp; Air baik
              </div>
            </div>
          </div>
        </div>

        {/* Bento grid — row 2: 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Uji Kebersihan Air */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 mb-3">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-black mb-2">Uji Kebersihan Air</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-grow">
              Pengukuran kebersihan air kamar mandi secara langsung oleh verifikator lapangan. Menghindarkan Anda dari risiko alergi kulit akibat air keruh atau berkarat.
            </p>
            <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-100 w-fit">
              • menggunakan alat TDS Meter
            </span>
          </div>

          {/* Uji Internet Kamar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 mb-3">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-black mb-2">Uji Internet Kamar</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-grow">
              Uji kecepatan internet langsung dari dalam kamar kos. Memastikan koneksi WiFi memadai dan stabil untuk kegiatan kuliah online maupun streaming harian.
            </p>
            <span className="inline-flex px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-semibold rounded-full border border-orange-100 w-fit">
              • menggunakan alat Speed Test
            </span>
          </div>

          {/* Hasil Laporan Lengkap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-black mb-2">Hasil Laporan Lengkap</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-grow">
              Laporan ringkasan kepatuhan fasilitas kos dalam format PDF resmi untuk mempermudah Anda membandingkan berbagai kos secara objektif.
            </p>
            <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-100 w-fit">
              • laporan berformat PDF
            </span>
          </div>
        </div>
      </section>

      {/* ===== BAGAIMANA CARA KERJANYA ===== */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-[34px] font-extrabold text-black mb-1">Bagaimana Cara Kerjanya?</h2>
          <p className="text-sm text-slate-600">Proses validasi on-demand terverifikasi hanya dalam 3 tahapan sistematis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-[#5A8FAD] rounded-2xl p-7 text-white flex flex-col">
            <div className="text-3xl font-light mb-1 opacity-60">01</div>
            <h3 className="text-lg font-bold mb-2">Pesan &amp; Input Klaim</h3>
            <p className="text-[11px] leading-relaxed mb-6 opacity-90 flex-grow">
              Masukkan alamat kos target dan isi daftar fasilitas dari foto iklan kosan yang ingin dibuktikan kesesuaian fisiknya.
            </p>
            <div className="bg-[#3B82F6] text-white text-[11px] font-semibold py-2.5 px-4 rounded-full text-center mt-auto">
              Inspeksi Single / Grup
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FF9B3E] rounded-2xl p-7 text-white flex flex-col">
            <div className="text-3xl font-light mb-1 opacity-60">02</div>
            <h3 className="text-lg font-bold mb-2">Inspeksi Lapangan Instan</h3>
            <p className="text-[11px] leading-relaxed mb-6 opacity-90 flex-grow">
              Verifikator terdekat menuju lokasi secara langsung untuk mendokumentasikan foto fasilitas, uji kebersihan air, dan kecepatan internet.
            </p>
            <div className="bg-[#FFD147] text-orange-900 text-[11px] font-semibold py-2.5 px-4 rounded-full text-center mt-auto">
              Matchmaking {'<'} 30 Menit
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#8CB8D8] rounded-2xl p-7 text-white flex flex-col">
            <div className="text-3xl font-light mb-1 opacity-60">03</div>
            <h3 className="text-lg font-bold mb-2">Terima Laporan Valid</h3>
            <p className="text-[11px] leading-relaxed mb-6 opacity-90 flex-grow">
              Hasil laporan kecocokan visual diverifikasi oleh teknologi AI. Ringkasan skor, dokumen laporan PDF, dan asisten konsultasi siap diakses di dashboard.
            </p>
            <div className="bg-[#C2DFFF] text-blue-900 text-[11px] font-semibold py-2.5 px-4 rounded-full text-center mt-auto">
              PDF Laporan + Chatbot AI
            </div>
          </div>
        </div>
      </section>

      {/* ===== PILIHAN KATEGORI LAYANAN ===== */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="border border-slate-300 rounded-[32px] p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-[34px] font-extrabold text-black mb-1">Pilihan Kategori Layanan</h2>
            <p className="text-sm text-slate-600">Sistem pembayaran transparan tanpa biaya tambahan, terintegrasi secure gateway Midtrans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Inspeksi Tunggal */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col">
              <h3 className="text-xl font-bold text-black mb-1">Inspeksi Tunggal</h3>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-3xl font-extrabold text-black">Rp 50.000</span>
                <span className="text-sm text-slate-500 mb-0.5">/ properti</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-5 pb-4 border-b border-slate-200">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 font-semibold">Personal Audit</span>
                <span>1 Properti</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Bukan sekadar pencocokan data. Inspektur berlisensi mendatangi kamar kos secara fisik untuk memeriksa AC, sirkulasi udara, kelembapan, dan ukuran riil kamar secara langsung.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 mb-6 flex-grow">
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-blue-500 shrink-0" /> Audit 5+ titik fasilitas kamar kos</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-blue-500 shrink-0" /> Uji kebersihan air kamar mandi</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-blue-500 shrink-0" /> Speedtest bandwidth WiFi dalam kamar</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-blue-500 shrink-0" /> Laporan PDF lengkap + Chatbot AI</div>
              </div>
              <Link href="/login" className="block w-full py-3 bg-[#1F3E5A] text-white font-semibold rounded-full text-center text-sm hover:bg-[#152a3d] transition-colors mt-auto">
                Pilih Layanan
              </Link>
            </div>

            {/* Inspeksi Grup */}
            <div className="bg-white rounded-2xl border-2 border-[#FF9B3E] p-7 flex flex-col relative">
              <div className="absolute -top-3 right-6 bg-[#FF9B3E] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                Paling Hemat
              </div>
              <h3 className="text-xl font-bold text-black mb-1">Inspeksi Grup</h3>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-3xl font-extrabold text-black">Rp 45.000</span>
                <span className="text-sm text-slate-500 mb-0.5">/ properti</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-5 pb-4 border-b border-slate-200">
                <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-200 font-semibold">Comparison Group</span>
                <span>Hingga 5 Properti</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Bandingkan beberapa kos sekaligus secara komparatif untuk menemukan opsi ternyaman. Sangat ideal untuk mahasiswa dari luar kota.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 mb-6 flex-grow">
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-orange-500 shrink-0" /> Audit 5+ titik fasilitas kamar kos</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-orange-500 shrink-0" /> Tabel perbandingan skor &amp; nominal sewa</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-orange-500 shrink-0" /> Uji kebersihan air &amp; WiFi di setiap kosan</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-orange-500 shrink-0" /> Asisten AI untuk rekomendasi kos terbaik</div>
              </div>
              <Link href="/login" className="block w-full py-3 bg-[#FF9B3E] text-white font-semibold rounded-full text-center text-sm hover:bg-[#e88a2e] transition-colors mt-auto">
                Pilih Layanan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PERTANYAAN UMUM ===== */}
      <section className="max-w-3xl mx-auto px-6 mb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-[34px] font-extrabold text-black mb-1">Pertanyaan Umum</h2>
          <p className="text-sm text-slate-600">Menjawab keraguan teknis mengenai validitas dan survei lapangan.</p>
        </div>

        <div className="space-y-0">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="border-b border-slate-300">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 flex items-center justify-between text-left font-semibold text-sm text-black hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="pb-5 text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="max-w-5xl mx-auto px-6 mb-16">
        <div className="bg-[#3B82F6] rounded-[32px] py-14 px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Amankan Kamar Kos Idaman Anda</h2>
          <p className="text-sm opacity-90 max-w-xl mx-auto mb-8">
            Hindari kekecewaan akibat iklan yang tidak sesuai. Dapatkan pembuktian nyata bersama verifikator ahli sekarang.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3 bg-white text-black font-bold rounded-full text-sm hover:bg-slate-100 transition-colors shadow-md">
            Mulai Audit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
