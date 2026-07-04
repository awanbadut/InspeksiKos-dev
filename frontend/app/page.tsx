"use client";

import Link from 'next/link';
import { useState } from 'react';
import { 
  CheckSquare, 
  ArrowRight, 
  ChevronDown,
  ArrowUpRight
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
    <div className="relative min-h-screen bg-[#F6F9FC] text-black font-sans pb-24">
      {/* Navbar */}
      <header className="w-full px-6 pt-6 pb-8 sticky top-0 z-50 flex justify-center">
        <div className="w-full max-w-5xl bg-[#E6F0FA] rounded-full flex items-center justify-between px-2 py-2 shadow-sm border border-[#D9E8F5]">
          <div className="pl-4">
            <div className="px-3 py-1 bg-blue-100 rounded text-blue-900 font-bold text-sm tracking-wide">
              logo
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/" className="px-5 py-2 bg-[#D1E5F7] rounded-full text-sm font-semibold text-slate-800 border border-[#B6D4F1]">
              Home
            </Link>
            <Link href="#about" className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-black">
              About Us
            </Link>
            <Link href="#how-it-works" className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-black">
              How it Works
            </Link>
            <Link href="#pricing" className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-black">
              Pricing
            </Link>
          </nav>
          
          <div className="pr-1">
            <Link href="/login" className="px-5 py-2.5 bg-[#1F3E5A] text-white text-sm font-semibold rounded-full flex items-center gap-1.5 hover:bg-[#152a3d] transition-colors">
              Get Started <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-8">
            <h1 className="text-[52px] font-bold leading-[1.1] text-black tracking-tight">
              Bebas Manipulasi Iklan<br />
              Validasi Fasilitas Kos<br />
              Anda
            </h1>
            <p className="text-base text-black leading-relaxed max-w-lg">
              Validasi keaslian fasilitas kos secara langsung melalui verifikator berlisensi dengan uji kebersihan air, kecepatan internet, dan verifikasi foto bertenaga AI.
            </p>
            <div>
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1F3E5A] text-white font-semibold rounded-lg hover:bg-[#152a3d] transition-colors">
                Mulai Audit Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Hero Illustration Collage */}
          <div className="relative flex justify-center items-center h-[500px]">
             {/* Note: In a real app we'd export the SVG/PNG layers from Figma. Using placeholder divs styled to match the collage. */}
             <div className="absolute top-0 right-10 w-[300px] h-[300px] bg-[#FFC55C] rounded-3xl overflow-hidden shadow-lg transform rotate-3">
               <img src="/assets/Gemini_Generated_Image_jmdup3jmdup3jmdu.png" alt="Person" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
             </div>
             <div className="absolute bottom-10 left-10 w-[240px] h-[200px] bg-[#3E86FF] rounded-3xl shadow-xl transform -rotate-2 border-4 border-white flex flex-col justify-end p-4">
                <div className="bg-white/20 h-2 w-1/2 rounded mb-2"></div>
                <div className="bg-white/20 h-2 w-3/4 rounded"></div>
             </div>
             <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[220px] h-[280px] bg-[#E1F0FF] rounded-3xl shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                <img src="/assets/Gemini_Generated_Image_xpspmtxpspmtxpsp.png" alt="House" className="w-full h-full object-cover opacity-90" />
             </div>
             <div className="absolute top-1/4 left-1/4 w-[160px] h-[60px] bg-[#4CE0D8] rounded-full shadow-lg z-10 animate-bounce"></div>
          </div>
        </div>

        {/* Telah Diandalkan oleh Mahasiswa */}
        <section className="mb-24">
          <div className="border-[1.5px] border-slate-300 rounded-[40px] p-10 bg-transparent relative overflow-hidden">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-black mb-2">Telah Diandalkan oleh Mahasiswa</h2>
              <p className="text-sm text-slate-700">Diandalkan oleh Mahasiswa Kampus Terbaik Sumatra Barat</p>
            </div>

            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1 Orange */}
              <div className="bg-[#FF9B3E] rounded-3xl overflow-hidden p-6 text-black flex flex-col shadow-sm">
                <div className="h-32 mb-4 relative bg-orange-300/30 rounded-xl flex items-center justify-center">
                  <div className="text-5xl">🧑‍🎓</div>
                </div>
                <div className="flex gap-4 mb-3">
                  <div>
                    <div className="text-xl font-bold">2500+</div>
                    <div className="text-xs font-medium">Mahasiswa</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">30+</div>
                    <div className="text-xs font-medium">Karyawan</div>
                  </div>
                </div>
                <p className="text-[11px] leading-snug mt-auto">Adipiscing nulla neque aliquam gravida adipiscing lorem eget. Congue pharetra volutpat euismod in.</p>
              </div>

              {/* Card 2 Yellow */}
              <div className="bg-[#FFD147] rounded-3xl overflow-hidden p-6 text-black flex flex-col shadow-sm">
                <div className="h-32 mb-4 relative bg-yellow-300/30 rounded-xl flex items-center justify-center">
                  <div className="text-5xl">🏠</div>
                </div>
                <div className="mb-3">
                  <div className="text-xl font-bold">1752+</div>
                  <div className="text-xs font-medium">Kost Ter-audit</div>
                </div>
                <p className="text-[11px] leading-snug mt-auto">Diam leo cursus sem viverra in id. Nulla nulla neque amet eros molestie lobortis nunc. Amet sed tristique non fames etiam fringilla ante aliquet gravida.</p>
              </div>

              {/* Card 3 Blue */}
              <div className="bg-[#3E86FF] rounded-3xl overflow-hidden p-6 text-white flex flex-col shadow-sm">
                <div className="h-32 mb-4 relative bg-blue-400/30 rounded-xl flex items-center justify-center">
                  <div className="text-5xl">📄</div>
                </div>
                <div className="mb-3">
                  <div className="text-xl font-bold">50+</div>
                  <div className="text-xs font-medium">Mitra Lapangan</div>
                </div>
                <p className="text-[11px] leading-snug mt-auto opacity-90">Diam leo cursus sem viverra in id. Nulla nulla neque amet eros molestie lobortis nunc. Amet sed tristique non fames etiam fringilla ante aliquet gravida.</p>
              </div>
            </div>

            {/* Bottom 3 Uni Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PNP */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1F3E5A] rounded-full overflow-hidden flex items-center justify-center p-1">
                      <img src="/logo-pnp.png" alt="PNP" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-black">PNP</div>
                      <div className="text-[10px] text-slate-600">Politeknik Negeri Padang</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-semibold rounded border border-green-200">✓ Terverifikasi</span>
                </div>
                <div className="flex justify-between mt-auto">
                  <div>
                    <div className="font-bold text-sm text-black">410+</div>
                    <div className="text-[10px] text-slate-500">Kost Ter-audit</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-black">7 Verifikator</div>
                    <div className="text-[10px] text-slate-500">Mitra Lapangan</div>
                  </div>
                </div>
              </div>

              {/* UNP */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1F3E5A] rounded-full overflow-hidden flex items-center justify-center p-1">
                      <img src="/logo-unp.jpg" alt="UNP" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-black">UNP</div>
                      <div className="text-[10px] text-slate-600">Universitas Negeri Padang</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-semibold rounded border border-green-200">✓ Terverifikasi</span>
                </div>
                <div className="flex justify-between mt-auto">
                  <div>
                    <div className="font-bold text-sm text-black">410+</div>
                    <div className="text-[10px] text-slate-500">Kost Ter-audit</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-black">7 Verifikator</div>
                    <div className="text-[10px] text-slate-500">Mitra Lapangan</div>
                  </div>
                </div>
              </div>

              {/* UNAND */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1F3E5A] rounded-full overflow-hidden flex items-center justify-center p-1">
                      <img src="/logo-unand.svg" alt="UNAND" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-black">UNAND</div>
                      <div className="text-[10px] text-slate-600">Universitas Andalas</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-semibold rounded border border-green-200">✓ Terverifikasi</span>
                </div>
                <div className="flex justify-between mt-auto">
                  <div>
                    <div className="font-bold text-sm text-black">410+</div>
                    <div className="text-[10px] text-slate-500">Kost Ter-audit</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-black">7 Verifikator</div>
                    <div className="text-[10px] text-slate-500">Mitra Lapangan</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Keunggulan Verifikasi Lapangan */}
        <section className="mb-24 text-center">
          <h2 className="text-3xl font-bold text-black mb-2">Keunggulan Verifikasi Lapangan</h2>
          <p className="text-sm text-slate-700 mb-10">Pemeriksaan fisik langsung menggunakan parameter baku untuk menjamin kelayakan kamar<br/>kos pilihan Anda.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Box 1 (Span 2) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex relative overflow-hidden">
               <div className="w-1/2 relative z-10">
                 {/* Visual placeholder for the connected nodes in figma */}
                 <svg className="absolute top-10 left-10 w-full h-full text-slate-300" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
                    <path d="M 0,0 Q 100,50 50,150 T 200,200" />
                 </svg>
                 <div className="absolute top-5 left-5 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 border border-yellow-200 z-20 shadow-sm text-xs">👤</div>
                 <div className="absolute top-20 left-32 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200 z-20 shadow-sm text-sm">🏢</div>
                 <div className="absolute bottom-20 left-20 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 border border-red-200 z-20 shadow-sm text-xs">📍</div>
                 <div className="absolute bottom-5 left-40 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 border border-orange-200 z-20 shadow-sm text-sm">📋</div>
               </div>
               <div className="w-1/2 flex flex-col justify-center relative z-10">
                 <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4 border border-green-100">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                 </div>
                 <h3 className="text-xl font-bold text-black mb-3">Audit Langsung On-Demand</h3>
                 <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                   Bukan sekadar pencocokan data. Inspektur berlisensi mendatangi kamar kos secara fisik untuk memeriksa AC, sirkulasi udara, kelembapan, dan ukuran riil kamar secara langsung.
                 </p>
                 <div className="inline-flex px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 w-fit">
                   • Terintegrasi GPS & Timestamp
                 </div>
               </div>
            </div>

            {/* Box 2 (Blue) */}
            <div className="bg-[#3E86FF] rounded-3xl p-8 text-white shadow-md flex flex-col justify-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Verifikasi Foto AI</h3>
              <p className="text-xs opacity-90 mb-6 leading-relaxed">
                Setiap foto bukti yang diunggah oleh verifikator diproses secara otomatis oleh kecerdasan buatan untuk mencocokkan kelengkapan fasilitas kamar dengan iklan.
              </p>
              <div className="bg-white text-black p-4 rounded-xl text-xs space-y-2 font-medium">
                <div className="flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5 text-blue-600" /> Furniture lengkap dan bagus</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5 text-blue-600" /> AC & Kelistrikan Cocok</div>
                <div className="flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5 text-blue-600" /> Kamar mandi & Air baik</div>
              </div>
            </div>

            {/* Bottom 3 Boxes */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-4 border border-blue-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-3">Uji Kebersihan Air</h3>
              <p className="text-xs text-slate-600 mb-6 flex-grow leading-relaxed">
                Pengukuran kebersihan air kamar mandi secara langsung oleh verifikator lapangan. Menghindarkan Anda dari risiko alergi kulit akibat air keruh atau berkarat.
              </p>
              <div className="inline-flex px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-100 w-fit mt-auto">
                • menggunakan alat TDS Meter
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-4 border border-orange-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M16 12l-4-4-4 4"/></svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-3">Uji Internet Kamar</h3>
              <p className="text-xs text-slate-600 mb-6 flex-grow leading-relaxed">
                Uji kecepatan internet langsung dari dalam kamar kos. Memastikan koneksi WiFi memadai dan stabil untuk kegiatan kuliah online maupun streaming harian.
              </p>
              <div className="inline-flex px-3 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-semibold rounded-full border border-orange-100 w-fit mt-auto">
                • menggunakan alat Speed Test
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-4 border border-red-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-3">Hasil Laporan Lengkap</h3>
              <p className="text-xs text-slate-600 mb-6 flex-grow leading-relaxed">
                Laporan ringkasan kepatuhan fasilitas kos dalam format PDF resmi untuk mempermudah Anda membandingkan berbagai kos secara objektif.
              </p>
              <div className="inline-flex px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-100 w-fit mt-auto">
                • laporan berformat PDF
              </div>
            </div>
          </div>
        </section>

        {/* Bagaimana Cara Kerjanya? */}
        <section className="mb-24 text-center">
          <h2 className="text-3xl font-bold text-black mb-2">Bagaimana Cara Kerjanya?</h2>
          <p className="text-sm text-slate-700 mb-12">Proses validasi on-demand terverifikasi hanya dalam 3 tahapan sistematis.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Decorative arrow path */}
            <div className="hidden md:block absolute top-1/3 left-[20%] w-[60%] h-[2px] bg-slate-200 z-0 border-t-2 border-dashed border-slate-300"></div>
            
            {/* Step 1 */}
            <div className="bg-[#567A99] rounded-3xl p-8 text-white flex flex-col text-left shadow-lg relative z-10">
              <div className="text-4xl font-light mb-4 opacity-80">01</div>
              <h3 className="text-xl font-bold mb-3">Pesan & Input Klaim</h3>
              <p className="text-xs leading-relaxed mb-8 opacity-90 flex-grow">
                Masukkan alamat kos target dan isi daftar fasilitas dari foto iklan kosan yang ingin dibuktikan kesesuaian fisiknya.
              </p>
              <div className="bg-[#3E86FF] text-white text-xs font-semibold py-3 px-4 rounded-full text-center mt-auto">
                Inspeksi Single / Grup
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FF9B3E] rounded-3xl p-8 text-white flex flex-col text-left shadow-lg relative z-10">
              <div className="text-4xl font-light mb-4 opacity-80">02</div>
              <h3 className="text-xl font-bold mb-3">Inspeksi Lapangan Instan</h3>
              <p className="text-xs leading-relaxed mb-8 opacity-90 flex-grow">
                Verifikator terdekat menuju lokasi secara langsung untuk mendokumentasikan foto fasilitas, uji kebersihan air, dan kecepatan internet.
              </p>
              <div className="bg-[#FFD147] text-orange-900 text-xs font-semibold py-3 px-4 rounded-full text-center mt-auto">
                Matchmaking {'<'} 30 Menit
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#8CB2D4] rounded-3xl p-8 text-white flex flex-col text-left shadow-lg relative z-10">
              <div className="text-4xl font-light mb-4 opacity-80">03</div>
              <h3 className="text-xl font-bold mb-3">Terima Laporan Valid</h3>
              <p className="text-xs leading-relaxed mb-8 opacity-90 flex-grow">
                Hasil laporan kecocokan visual diverifikasi oleh teknologi AI. Ringkasan skor, dokumen laporan PDF, dan asisten konsultasi siap diakses di dashboard.
              </p>
              <div className="bg-[#C2DFFF] text-blue-900 text-xs font-semibold py-3 px-4 rounded-full text-center mt-auto">
                PDF Laporan + Chatbot A
              </div>
            </div>
          </div>
        </section>

        {/* Pilihan Kategori Layanan */}
        <section className="mb-24">
          <div className="border-[1.5px] border-slate-300 rounded-[40px] p-10 bg-transparent text-center">
            <h2 className="text-3xl font-bold text-black mb-2">Pilihan Kategori Layanan</h2>
            <p className="text-sm text-slate-700 mb-10">Sistem pembayaran transparan tanpa biaya tambahan, terintegrasi secure gateway<br/>Midtrans.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              {/* Box 1 */}
              <div className="bg-[#3E86FF] rounded-3xl p-8 text-white flex flex-col shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Inspeksi Tunggal</h3>
                </div>
                <div className="mb-2 flex items-end gap-1">
                  <span className="text-4xl font-bold">Rp 50.000</span>
                  <span className="text-sm opacity-80 mb-1">/ properti</span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] mb-8 pb-4 border-b border-blue-400">
                   <div className="px-2 py-1 bg-white/20 rounded-full">Personal Audit</div>
                   <div>1 Properti</div>
                </div>

                <p className="text-xs opacity-90 mb-6 leading-relaxed">
                  Bukan sekadar pencocokan data. Inspektur berlisensi mendatangi kamar kos secara fisik untuk memeriksa AC, sirkulasi udara, kelembapan, dan ukuran riil kamar secara langsung.
                </p>

                <div className="space-y-3 text-xs font-medium mb-8 flex-grow">
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-white" /> Audit 5+ titik fasilitas kamar kos</div>
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-white" /> Uji kebersihan air kamar mandi</div>
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-white" /> Speedtest bandwidth WiFi dalam kamar</div>
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-white" /> Laporan PDF lengkap + Chatbot AI</div>
                </div>

                <Link href="/login" className="block w-full py-3.5 bg-[#5BA0FF] hover:bg-[#4d8be6] text-white font-bold rounded-full text-center text-sm transition-colors mt-auto shadow-sm">
                  Pilih Layanan
                </Link>
              </div>

              {/* Box 2 */}
              <div className="bg-[#FFD147] rounded-3xl p-8 text-black flex flex-col shadow-lg relative border-2 border-yellow-400">
                <div className="absolute -top-4 right-8 bg-[#FF9B3E] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md">
                  Paling Hemat
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Inspeksi Grup</h3>
                </div>
                <div className="mb-2 flex items-end gap-1">
                  <span className="text-4xl font-bold">Rp 45.000</span>
                  <span className="text-sm opacity-70 mb-1">/ properti</span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] mb-8 pb-4 border-b border-yellow-500/30">
                   <div className="px-2 py-1 bg-white/50 rounded-full">Comparison Group</div>
                   <div>Hingga 5 Properti</div>
                </div>

                <p className="text-xs opacity-90 mb-6 leading-relaxed text-slate-800">
                  Bandingkan beberapa kos sekaligus secara komparatif untuk menemukan opsi ternyaman. Sangat ideal untuk mahasiswa dari luar kota.
                </p>

                <div className="space-y-3 text-xs font-medium mb-8 flex-grow text-slate-800">
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-black" /> Audit 5+ titik fasilitas kamar kos</div>
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-black" /> Tabel perbandingan skor & nominal sewa</div>
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-black" /> Uji kebersihan air & WiFi di setiap kosan</div>
                  <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-black" /> Asisten AI untuk rekomendasi kos terbaik</div>
                </div>

                <Link href="/login" className="block w-full py-3.5 bg-[#FFC107] hover:bg-[#eab006] text-black font-bold rounded-full text-center text-sm transition-colors mt-auto shadow-sm">
                  Pilih Layanan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pertanyaan Umum */}
        <section className="mb-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-2">Pertanyaan Umum</h2>
          <p className="text-sm text-slate-700 mb-8">Menjawab keraguan teknis mengenai validitas dan survei lapangan.</p>

          <div className="space-y-0 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border-b border-slate-300 transition-all duration-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-5 flex items-center justify-between text-left font-bold text-sm text-black hover:text-blue-600 transition-all focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="pb-5 pt-1 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="bg-[#3E86FF] rounded-[40px] p-12 text-center text-white space-y-6 max-w-5xl mx-auto shadow-lg">
          <h2 className="text-4xl font-bold tracking-tight mb-2">Amankan Kamar Kos Idaman Anda</h2>
          <p className="text-sm opacity-90 max-w-2xl mx-auto mb-8">
            Hindari kekecewaan akibat iklan yang tidak sesuai. Dapatkan pembuktian nyata bersama verifikator ahli sekarang.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold rounded-full text-sm transition-all hover:bg-slate-100 shadow-md">
            Mulai Audit <ArrowRight className="h-4 w-4 text-black" />
          </Link>
        </section>
      </main>
    </div>
  );
}
