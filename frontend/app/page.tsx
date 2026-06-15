import Link from 'next/link';
import { Sparkles, ShieldCheck, CheckSquare, ClipboardList, Zap, ArrowRight, Activity, Cpu, HelpCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-900">
      {/* Background soft color accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-15%] w-[800px] h-[800px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00305705_1px,transparent_1px),linear-gradient(to_bottom,#00305705_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/Logo InspeksiKos..webp" alt="InspeksiKos Logo" className="h-9 w-auto object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-primary font-mono hidden sm:inline">
            InspeksiKos
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary transition-all">
            Masuk
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
            Daftar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center z-10">
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

        <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center w-full max-w-md px-4">
          <Link href="/login" className="flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-primary to-accent-light hover:from-primary hover:to-accent text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase tracking-wider">
            Mulai Audit Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/register" className="flex items-center justify-center h-14 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl px-8 transition-all text-sm uppercase tracking-wider shadow-sm">
            Gabung Verifikator
          </Link>
        </div>

        {/* Dashboard Mockup Preview - Premium Light styling */}
        <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl mb-24 relative overflow-hidden">
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

        {/* Feature Sections */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-6">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold mb-3 tracking-wide text-primary uppercase font-mono">1. Ekstraksi Foto (AI)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verifikator mengunggah foto aktual kamar kos. Gemini Vision AI mengekstrak data fasilitas di foto secara cerdas untuk memverifikasi kesesuaian iklan secara otomatis.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-750 mb-6 group-hover:scale-105 transition-transform">
              <CheckSquare className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-base font-bold mb-3 tracking-wide text-primary uppercase font-mono">2. Audit Logika</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem membandingkan data klaim spesifikasi iklan oleh mahasiswa dengan hasil audit lapangan secara real-time berdasarkan rumus bobot penilaian yang adil.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 mb-6 group-hover:scale-105 transition-transform">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold mb-3 tracking-wide text-primary uppercase font-mono">3. Scorecard & TDS Air</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menghasilkan scorecard terperinci lengkap dengan koordinat peta GPS asli, hasil uji kualitas air bersih (TDS), serta kecepatan internet WiFi kos yang objektif.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Logo InspeksiKos..webp" alt="InspeksiKos Logo" className="h-6 w-auto" />
            <span className="text-xs font-bold tracking-tight text-primary font-mono">InspeksiKos Platform</span>
          </div>
          <p className="text-[11px] text-slate-400">
            © 2026 InspeksiKos. Capstone Project D4 TRPL Politeknik Negeri Padang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
