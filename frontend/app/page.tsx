import Link from 'next/link';
import { Sparkles, ShieldCheck, CheckSquare, ClipboardList, Zap, ArrowRight, Activity, Cpu, HelpCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#080d1a] text-gray-100 overflow-hidden font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Background radial glow spots */}
      <div className="absolute top-[-25%] left-[-10%] w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-15%] w-[800px] h-[800px] rounded-full bg-indigo-600/8 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[130px] pointer-events-none" />

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl font-bold text-white">🏠</span>
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
            InspeksiKos
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all">
            Masuk
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white hover:bg-gray-100 text-gray-900 rounded-xl shadow-lg transition-all">
            Daftar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-16 pb-32 flex flex-col items-center text-center z-10">
        {/* Pulsing Badge pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/50 border border-blue-900/60 text-xs font-medium text-blue-400 mb-8 backdrop-blur-md shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          <span className="tracking-wide uppercase text-[10px] font-bold">Platform Verifikasi Kos Terintegrasi AI</span>
        </div>

        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.15] tracking-tight mb-8 bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
          Bebas Manipulasi Iklan.<br className="hidden sm:inline" /> Validasi Fasilitas Kos Anda.
        </h1>

        <p className="max-w-2xl text-sm sm:text-base text-gray-400 mb-12 leading-relaxed px-4">
          Hindari jebakan foto iklan kos yang tidak sesuai kenyataan. InspeksiKos menggunakan kekuatan <span className="text-blue-400 font-semibold">Gemini Vision AI</span> dan <span className="text-indigo-400 font-semibold">Rule-Based Engine</span> untuk membuktikan kebenaran fasilitas secara real-time dan transparan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 justify-center w-full max-w-md px-4">
          <Link href="/login" className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl px-8 shadow-xl shadow-blue-900/20 hover:scale-[1.02] transition-all text-sm uppercase tracking-wider">
            Mulai Audit Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/register" className="flex items-center justify-center h-14 border border-gray-800 hover:border-gray-700 bg-gray-900/30 hover:bg-gray-900/60 text-gray-300 hover:text-white font-bold rounded-xl px-8 transition-all text-sm uppercase tracking-wider">
            Gabung Verifikator
          </Link>
        </div>

        {/* Dashboard Mockup Preview - Classy styling */}
        <div className="w-full max-w-5xl rounded-2xl border border-gray-800 bg-[#0e1626]/70 p-4 sm:p-6 shadow-2xl backdrop-blur-md mb-28 relative">
          <div className="absolute -top-3 left-10 px-3 py-1 bg-blue-600 text-[9px] font-bold uppercase tracking-wider rounded-md text-white">
            LIVE PREVIEW SYSTEM
          </div>
          
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
              <div className="h-6 w-48 bg-gray-900 rounded-md ml-4 border border-gray-800 flex items-center px-2 text-[9px] text-gray-500 font-mono">
                inspeksikos.com/dashboard/report
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">STATUS: AUDITED</span>
            </div>
          </div>

          {/* Mock Dashboard Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Box 1: AI Analysis */}
            <div className="bg-[#0b101c] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vision AI Extraction</span>
                <Cpu className="h-4 w-4 text-blue-500" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Kasur (Bed)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[9px] border border-emerald-500/20">MATCH</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">AC (Air Conditioner)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[9px] border border-emerald-500/20">MATCH</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Router WiFi</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold text-[9px] border border-red-500/20">MISMATCH</span>
                </div>
              </div>
              <div className="h-[1px] bg-gray-800 my-2" />
              <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
                &gt;_ gemini-2.5-flash: "Router WiFi terdeteksi merk TP-Link tapi status daya mati, klaim kecepatan gagal dibandingkan."
              </p>
            </div>

            {/* Box 2: Compliance Stats */}
            <div className="bg-[#0b101c] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-4">COMPLIANCE SCORECARD</span>
                <div className="flex items-center gap-4">
                  {/* SVG Donut */}
                  <div className="relative h-16 w-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-500" strokeDasharray="72, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">72%</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">PARTIAL VALID</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Sebagian fasilitas terbukti berbeda dari iklan.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <div className="flex justify-between text-[9px] font-bold text-gray-400">
                  <span>TDS AIR</span>
                  <span>95 ppm (Bersih)</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            {/* Box 3: AI Consultant */}
            <div className="bg-[#0b101c] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-3">AI ASSISTANT CONSULTATION</span>
                <div className="space-y-2.5">
                  <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-2.5 text-[10px] text-blue-300">
                    "Apakah air dengan TDS 95 ppm ini aman untuk kulit sensitif?"
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2.5 text-[10px] text-gray-300 border border-gray-800">
                    "Sangat aman. TDS di bawah 150 ppm tergolong sangat bersih dan layak konsumsi maupun mandi..."
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-gray-500 italic mt-3 font-mono">
                * Real-time multi-turn conversation
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-10">
          <div className="p-8 rounded-2xl bg-[#0b101c]/60 border border-gray-800 hover:border-gray-700/80 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold mb-3 tracking-wide text-gray-200">1. EKSTRAKSI FOTO (AI)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Verifikator mengunggah foto aktual kamar kos. Gemini Vision AI mengekstrak data fasilitas di foto secara cerdas tanpa manipulasi manual.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0b101c]/60 border border-gray-800 hover:border-gray-700/80 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold mb-3 tracking-wide text-gray-200">2. AUDIT LOGIK (RULES)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sistem membandingkan data klaim iklan mahasiswa dengan hasil deteksi lapangan secara otomatis melalui aturan parameter bobot pinalti yang adil.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0b101c]/60 border border-gray-800 hover:border-gray-700/80 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold mb-3 tracking-wide text-gray-200">3. SCORECARD & PDF</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Menghasilkan PDF Scorecard resmi terverifikasi lengkap dengan hasil pengukuran TDS Air, Internet Speedtest, dan koordinat maps asli properti.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#050810] py-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-white">🏠 InspeksiKos</span>
          </div>
          <p className="text-[11px] text-gray-600">
            © 2026 InspeksiKos. Capstone Project D4 TRPL Politeknik Negeri Padang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
