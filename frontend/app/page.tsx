import Link from 'next/link';
import { Sparkles, ShieldCheck, CheckCircle, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#090d16] text-white overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#1e293b]/30 blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            🏠 InspeksiKos
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-all">
            Masuk
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all">
            Daftar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-900/50 text-xs font-semibold text-blue-400 mb-8 animate-pulse">
          <Sparkles className="h-4 w-4" />
          Platform Verifikasi Kos No. 1 di Kota Padang
        </div>

        <h1 className="max-w-4xl text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6 bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
          Bebas Catfishing Iklan,<br />Validasi Fasilitas Kos Secara Real-Time.
        </h1>

        <p className="max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed">
          Hindari penipuan foto iklan kos. InspeksiKos menggunakan teknologi <span className="text-blue-400 font-semibold">Gemini Vision AI</span> dan <span className="text-indigo-400 font-semibold">Rule-Based Engine</span> untuk mengaudit fasilitas kos aktual di lapangan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center w-full max-w-md">
          <Link href="/login" className="flex items-center justify-center h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-xl hover:shadow-blue-600/20 hover:scale-[1.02] transition-all text-base">
            Mulai Audit Sekarang
          </Link>
          <Link href="/register" className="flex items-center justify-center h-14 border border-gray-800 hover:bg-gray-900 text-gray-300 hover:text-white font-bold rounded-xl px-8 transition-all text-base">
            Daftar Akun Verifikator
          </Link>
        </div>

        {/* Feature Steps / Pipeline */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-10">
          <div className="p-6 rounded-2xl bg-[#111827]/40 border border-gray-800 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">1. EXTRACT</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Petugas mengunggah foto aktual kosan. Gemini AI Vision mengekstrak daftar fasilitas secara otomatis ke format terstruktur.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827]/40 border border-gray-800 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">2. COMPARE</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Aturan komparasi logis membandingkan fasilitas hasil deteksi dengan klaim spesifikasi iklan yang diinput oleh mahasiswa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827]/40 border border-gray-800 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">3. REPORT</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Menghasilkan Laporan Audit Scorecard PDF berisi tingkat kecocokan validasi, lengkap dengan data teknis air TDS dan kecepatan internet.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#070b12] py-8 text-center text-xs text-gray-600">
        © 2026 InspeksiKos. Dibuat untuk Capstone Project TRPL 3A Politeknik Negeri Padang.
      </footer>
    </div>
  );
}
