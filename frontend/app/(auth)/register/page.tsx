'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }

    const nameParts = name.trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    try {
      await api.post('/auth/register', {
        email,
        password,
        first_name,
        last_name,
        phone_number: phone,
        role: 'mahasiswa',
      });

      setSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registrasi gagal, coba lagi nanti');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#080d1a] font-sans text-gray-100">
      
      {/* Left side: Premium Promo Panel (Hidden on small screens) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-[#0c1224] border-r border-gray-800/80 overflow-hidden">
        {/* Glow Background inside panel */}
        <div className="absolute top-[-20%] left-[-20%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-600/5 blur-[90px] pointer-events-none" />
        
        {/* Header */}
        <Link href="/" className="relative flex items-center gap-2.5 z-10 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform">
            <span className="text-sm font-bold text-white">🏠</span>
          </div>
          <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            InspeksiKos
          </span>
        </Link>

        {/* Marketing/Feature Points */}
        <div className="relative space-y-8 z-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-black leading-snug bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Gabung dengan Ribuan Mahasiswa Padang
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Daftarkan diri Anda untuk mengajukan permintaan inspeksi, verifikasi fasilitas iklan kos, dan nikmati fitur analisis laporan bertenaga AI.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-200">Ajukan Inspeksi Cepat</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Input klaim fasilitas kosan Anda dan verifikator kami akan segera melakukan tinjauan lapangan.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-200">Lihat Laporan Kepatuhan</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Dapatkan skor validitas langsung, rincian kecocokan, dan unduh berkas laporan PDF resmi.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-200">Asisten Chatbot AI</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Tanyakan kelayakan air TDS dan internet dengan chatbot asisten laporan lapangan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info inside promo panel */}
        <div className="relative text-[10px] text-gray-600 z-10">
          © 2026 InspeksiKos. Politeknik Negeri Padang.
        </div>
      </div>

      {/* Right side: Register Form Column */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 relative overflow-y-auto">
        <div className="absolute top-10 left-6 block lg:hidden">
          <Link href="/" className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white transition-all uppercase tracking-wider">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        <div className="w-full max-w-[380px] space-y-6 my-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Buat Akun Mahasiswa
            </h1>
            <p className="text-xs text-gray-400">
              Isi data diri di bawah ini untuk memulai audit properti kos Anda.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl text-center font-bold">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-center font-bold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="masukkan nama lengkap Anda"
                className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-gray-800 focus:border-blue-500 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                No Handphone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="contoh: 08123456789"
                className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-gray-800 focus:border-blue-500 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 bg-[#0e1626] border border-gray-800 focus:border-blue-500 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#0e1626] border border-gray-800 focus:border-blue-500 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#0e1626] border border-gray-800 focus:border-blue-500 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-6 shadow-lg shadow-blue-900/10 cursor-pointer"
            >
              {isLoading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                'Buat Akun'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-white hover:underline transition-all">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
