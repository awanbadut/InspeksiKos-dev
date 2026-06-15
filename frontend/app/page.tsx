import Link from 'next/link';
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
  Award
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-900">
      {/* Background soft color accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-15%] w-[800px] h-[800px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00305705_1px,transparent_1px),linear-gradient(to_bottom,#00305705_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.webp" alt="InspeksiKos Logo" className="h-16 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary transition-all">
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 z-10">
        <div className="flex flex-col items-center text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-medium text-teal-800 mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent-light" />
            <span className="tracking-wide uppercase text-[10px] font-extrabold font-mono">Platform Verifikasi Kos Terpercaya & On-Demand</span>
          </div>

          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-black leading-[1.15] tracking-tight mb-8 text-primary">
            Bebas Manipulasi Iklan.<br />
            Validasi Fasilitas Kos Anda.
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-slate-600 mb-10 leading-relaxed px-4">
            Hindari kekecewaan foto iklan kos yang menipu. InspeksiKos memvalidasi kelayakan kamar secara langsung melalui inspektur berlisensi menggunakan integrasi <span className="text-primary font-bold">Gemini Vision AI</span> dan penilai kualitas air & internet secara langsung.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center w-full max-w-md px-4">
            <Link href="/login" className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-primary to-accent-light hover:from-primary hover:to-accent text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase tracking-wider">
              Mulai Audit Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/register" className="flex items-center justify-center h-14 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-8 transition-all text-sm uppercase tracking-wider shadow-sm">
              Gabung Verifikator
            </Link>
          </div>
        </div>

        {/* Statistics Bar Component */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <div className="space-y-1">
            <div className="text-2xl md:text-3xl font-extrabold text-primary font-mono">1.250+</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kamar Kos Diaudit</div>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <div className="text-2xl md:text-3xl font-extrabold text-brand-teal font-mono">99.4%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Akurasi Validasi AI</div>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <div className="text-2xl md:text-3xl font-extrabold text-teal-700 font-mono">45 Menit</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waktu Pencocokan Rata-rata</div>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <div className="text-2xl md:text-3xl font-extrabold text-primary font-mono">4.8 / 5.0</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rating Kepuasan Mahasiswa</div>
          </div>
        </div>

        {/* Dashboard Mockup Preview - Premium Light styling */}
        <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl mb-28 relative overflow-hidden mx-auto">
          <div className="absolute -top-3 left-10 px-3 py-1 bg-primary text-[9px] font-bold uppercase tracking-wider rounded-md text-white font-mono">
            LIVE SYSTEM PREVIEW
          </div>
          
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 mt-1">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <div className="h-6 w-52 bg-slate-50 rounded-md ml-4 border border-slate-200 flex items-center px-2 text-[9px] text-slate-400 font-mono">
                inspeksikos.com/dashboard/report
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-ping" />
              <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider font-mono">STATUS: AUDITED</span>
            </div>
          </div>

          {/* Mock Dashboard Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Box 1: AI Analysis */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Vision AI Extraction</span>
                <Cpu className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Kasur (Bed)</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-extrabold text-[9px]">MATCH</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">AC (Air Conditioner)</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-extrabold text-[9px]">MATCH</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Router WiFi</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-[9px]">MISMATCH</span>
                </div>
              </div>
              <div className="h-[1px] bg-slate-200 my-2" />
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                &gt;_ gemini-2.5-flash: "Router WiFi terdeteksi merk TP-Link tapi status daya mati, klaim kecepatan gagal dibandingkan."
              </p>
            </div>

            {/* Box 2: Compliance Stats */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-4 font-mono">COMPLIANCE SCORECARD</span>
                <div className="flex items-center gap-4">
                  {/* SVG Donut */}
                  <div className="relative h-16 w-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-primary" strokeDasharray="72, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-primary">72%</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">PARTIAL VALID</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sebagian fasilitas terbukti berbeda dari iklan.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <div className="flex justify-between text-[9px] font-bold text-slate-500">
                  <span>TDS AIR</span>
                  <span>95 ppm (Bersih)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            {/* Box 3: AI Consultant */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3 font-mono">AI ASSISTANT CONSULTATION</span>
                <div className="space-y-2.5">
                  <div className="bg-teal-50 border border-teal-100 rounded-lg p-2.5 text-[10px] text-teal-800 font-medium">
                    "Apakah air dengan TDS 95 ppm ini aman untuk kulit sensitif?"
                  </div>
                  <div className="bg-white rounded-lg p-2.5 text-[10px] text-slate-600 border border-slate-200 leading-relaxed shadow-sm">
                    "Sangat aman. TDS di bawah 150 ppm tergolong sangat bersih dan layak konsumsi maupun mandi..."
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-slate-400 italic mt-3 font-mono">
                * Real-time chatbot asisten mahasiswa
              </div>
            </div>
          </div>
        </div>

        {/* How It Works (Alur Kerja) Component */}
        <section className="mb-28 max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-primary">Bagaimana InspeksiKos Melindungi Anda?</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">Proses 3 langkah sederhana yang memastikan Anda mendapatkan informasi kos yang jujur dan apa adanya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6 bg-white border border-slate-200 rounded-2xl relative shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold font-mono mb-4 text-sm">1</div>
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-2 font-mono">Pesan Inspeksi On-Demand</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih jenis layanan (inspeksi tunggal atau grup), masukkan alamat kos, serta klaim fasilitas dari iklan iklan kos yang ingin Anda buktikan.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white border border-slate-200 rounded-2xl relative shadow-sm">
              <div className="h-10 w-10 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold font-mono mb-4 text-sm">2</div>
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-2 font-mono">Inspektur Turun ke Lapangan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem kami otomatis mencocokkan pesanan Anda dengan inspektur terdekat secara real-time. Inspektur mendatangi kos untuk mengambil foto, menguji air, dan kecepatan internet.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white border border-slate-200 rounded-2xl relative shadow-sm">
              <div className="h-10 w-10 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold font-mono mb-4 text-sm">3</div>
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider mb-2 font-mono">Dapatkan Scorecard Digital</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hasil visual diverifikasi otomatis oleh Gemini AI Vision. Anda akan menerima laporan kelayakan kos (PDF), persentase kebenaran iklan, dan asisten konsultasi AI.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section className="mb-28 max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-primary">Fitur & Teknologi Kami</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">Menggunakan sensor fisik lapangan teruji dikombinasikan dengan kecerdasan buatan Gemini AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold mb-3 tracking-wide text-primary uppercase font-mono">1. Ekstraksi Foto (AI)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verifikator mengunggah foto aktual kamar kos. Gemini Vision AI mengekstrak data fasilitas di foto secara cerdas untuk memverifikasi kesesuaian iklan secara otomatis.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-750 mb-6 group-hover:scale-105 transition-transform">
                <CheckSquare className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-base font-bold mb-3 tracking-wide text-primary uppercase font-mono">2. Kualitas Air (TDS)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspektur menguji langsung air kamar mandi dan keran dengan TDS meter fisik untuk membuktikan kebersihan air dari partikel berbahaya demi kenyamanan kulit Anda.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 mb-6 group-hover:scale-105 transition-transform">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold mb-3 tracking-wide text-primary uppercase font-mono">3. Speedtest WiFi Kos</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bukan sekadar tulisan "WiFi Cepat" di iklan. Inspektur mengukur langsung bandwidth unduh & unggah secara presisi menggunakan sensor speedtest di dalam kamar kos.
              </p>
            </div>
          </div>
        </section>

        {/* Service Packages */}
        <section className="mb-28 max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-primary">Pilihan Kategori Layanan</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">Dirancang untuk kebutuhan pencarian kos tunggal maupun perbandingan multi-kos secara hemat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Single Kos Package */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                  Personal Audit
                </div>
                <h3 className="text-lg font-extrabold text-primary">Inspeksi Tunggal (Single-Kos)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Layanan audit mendetail untuk 1 properti kos pilihan Anda. Cocok bagi Anda yang sudah yakin pada satu opsi kosan dan hanya butuh pembuktian kebenaran iklan.
                </p>
                <div className="text-3xl font-black text-primary font-mono py-2">
                  Rp 50.000 <span className="text-xs text-slate-400 font-normal">/ properti</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Audit 5+ titik fasilitas kamar kos</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Uji TDS kualitas air bersih</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Speedtest presisi WiFi kamar</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Sertifikat Scorecard PDF & Chatbot AI</li>
                </ul>
              </div>
              <Link href="/login" className="mt-8 flex items-center justify-center gap-1.5 w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all">
                Pesan Inspeksi Tunggal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Multi-Kos Group Comparison Package */}
            <div className="bg-white border-2 border-brand-teal rounded-2xl p-8 shadow-sm flex flex-col justify-between relative hover:shadow-md transition-all">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-brand-teal text-[8px] font-black uppercase tracking-wider rounded-md text-white font-mono shadow-md">
                Paling Hemat
              </div>
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100 text-[9px] font-extrabold uppercase tracking-wider font-mono">
                  Comparison Group
                </div>
                <h3 className="text-lg font-extrabold text-primary">Inspeksi Grup (Multi-Kos)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bandingkan beberapa kos sekaligus untuk menemukan opsi terbaik. Anda akan mendapatkan tabel perbandingan skor, air, internet, dan keakuratan fasilitas.
                </p>
                <div className="text-3xl font-black text-primary font-mono py-2">
                  Rp 45.000 <span className="text-xs text-slate-400 font-normal">/ properti</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Audit komparatif hingga 5 properti kos</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Tabel perbandingan skor & nominal sewa</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Uji TDS Air & Speedtest WiFi per kos</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-teal-600 shrink-0" /> Rekomendasi asisten AI untuk kos terbaik</li>
                </ul>
              </div>
              <Link href="/login" className="mt-8 flex items-center justify-center gap-1.5 w-full py-3 bg-gradient-to-r from-primary to-accent-light hover:from-primary hover:to-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md">
                Pesan Inspeksi Grup <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Real Testimonials */}
        <section className="mb-28 max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-primary">Apa Kata Mahasiswa?</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">Kepuasan nyata dari para pencari kos yang terhindar dari manipulasi iklan properti.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-slate-650 leading-relaxed italic">
                "Sebelumnya saya pernah bayar DP kos yang ternyata WiFi-nya mati dan airnya berbau. Di kos berikutnya saya pakai InspeksiKos, terdeteksi TDS airnya aman dan kecepatan internet 25 Mbps. Sangat terbantu!"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-primary">R</div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-primary">Rian Hidayat</h4>
                  <p className="text-[9px] text-slate-400">Mahasiswa UNAND</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-slate-650 leading-relaxed italic">
                "Saya dari luar kota Padang, jadi mustahil untuk survei langsung. Menggunakan Inspeksi Grup untuk 3 opsi kos sangat menghemat biaya tiket pesawat saya. Skor komparatifnya sangat tepercaya."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-primary">A</div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-primary">Anisa Putri</h4>
                  <p className="text-[9px] text-slate-400">Mahasiswa PNP</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-slate-650 leading-relaxed italic">
                "Gemini AI yang mengidentifikasi foto kasur dan AC sangat akurat. Asisten chatbot AI-nya juga pintar menjelaskan arti angka TDS air kosan saya. Layak bintang lima."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-primary">F</div>
                <div>
                  <h4 className="text-[11px] font-extrabold text-primary">Farhan Maulana</h4>
                  <p className="text-[9px] text-slate-400">Mahasiswa UIN IB</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-28 max-w-3xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-primary">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-xs text-slate-500">Menjawab keraguan Anda mengenai validitas, pembayaran, dan teknis laporan audit.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
              <h4 className="text-xs font-extrabold text-primary flex items-center gap-2 uppercase tracking-wide font-mono">
                <HelpCircle className="h-4 w-4 text-brand-teal shrink-0" />
                Bagaimana cara kerja verifikasi air TDS?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                Inspektur kami membawa TDS (Total Dissolved Solids) meter fisik ke lokasi kos. Alat ini mengukur jumlah zat padat terlarut dalam air (seperti logam berat, garam, dll) untuk menentukan kelayakan higienis air kamar mandi kosan.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
              <h4 className="text-xs font-extrabold text-primary flex items-center gap-2 uppercase tracking-wide font-mono">
                <HelpCircle className="h-4 w-4 text-brand-teal shrink-0" />
                Berapa lama proses inspeksi dari pemesanan?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                Proses matchmaking dengan inspektur membutuhkan waktu rata-rata 10-30 menit. Inspektur akan mendatangi lokasi kos di hari yang sama atau sesuai jadwal, dan scorecard digital AI Anda akan selesai dalam 2-3 jam setelah audit lapangan dilakukan.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
              <h4 className="text-xs font-extrabold text-primary flex items-center gap-2 uppercase tracking-wide font-mono">
                <HelpCircle className="h-4 w-4 text-brand-teal shrink-0" />
                Apakah pembayaran via QRIS resmi?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                Ya. Transaksi diproses menggunakan Midtrans Secure Payment Gateway berlisensi Bank Indonesia. Pembayaran dapat dilakukan secara instan dengan memindai kode QRIS dinamis menggunakan dompet digital Anda (Gopay, OVO, Dana, LinkAja) atau Mobile Banking.
              </p>
            </div>
          </div>
        </section>

        {/* Strong Final Conversion CTA Block */}
        <section className="bg-gradient-to-r from-primary to-accent-light rounded-3xl p-8 md:p-12 text-center text-white space-y-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-[-50%] left-[-20%] w-[350px] h-[350px] rounded-full bg-teal-400/10 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-[-40%] right-[-20%] w-[350px] h-[350px] rounded-full bg-blue-400/10 blur-[90px] pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black">Cari Kos yang Pasti & Jujur Sekarang Juga</h2>
            <p className="text-xs text-teal-100/90 leading-relaxed">
              Jangan biarkan diri Anda menjadi korban penipuan foto iklan kosan. Lakukan verifikasi sekarang dan amankan masa depan kenyamanan belajar Anda di perantauan.
            </p>
          </div>

          <div className="pt-4 relative z-10">
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-primary font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]">
              Daftar & Ajukan Inspeksi Pertama <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img src="/logo.webp" alt="InspeksiKos Logo" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-[11px] text-slate-400">
            © 2026 InspeksiKos. Capstone Project D4 TRPL Politeknik Negeri Padang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
