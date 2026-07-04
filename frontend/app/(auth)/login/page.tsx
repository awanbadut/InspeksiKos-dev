'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token, role, email: userEmail } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_email', userEmail);

      // Set cookies for Next.js Middleware route protection and routing
      document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_email=${userEmail}; path=/; max-age=86400; SameSite=Lax`;

      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans text-slate-800">
      
      {/* Left side: Promo Panel */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-primary text-white overflow-hidden">
        
        {/* Logo */}
        <Link href="/" className="relative z-10">
          <div className="bg-white rounded-xl px-3 py-2 w-fit">
            <img src="/logo.webp" alt="InspeksiKos" className="h-10 w-auto object-contain" />
          </div>
        </Link>

        {/* Content */}
        <div className="relative z-10 my-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold leading-snug tracking-tight">
              Cari kos yang sesuai iklan,
              <br />bukan yang sesuai harapan.
            </h2>
            <p className="text-[13px] text-white/60 leading-relaxed mt-3 max-w-xs">
              Inspektur kami datang langsung ke lokasi, cek fasilitas, ukur kualitas air dan WiFi, lalu buat laporan yang bisa Anda baca sebelum bayar DP.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6 space-y-5">
            <div className="flex gap-4 items-baseline">
              <span className="text-[13px] font-mono text-white/30 tabular-nums">01</span>
              <div>
                <p className="text-[13px] font-semibold text-white/90">Pesan inspeksi lewat dashboard</p>
                <p className="text-[11px] text-white/40 mt-0.5">Pilih kos, isi alamat, bayar via QRIS.</p>
              </div>
            </div>
            <div className="flex gap-4 items-baseline">
              <span className="text-[13px] font-mono text-white/30 tabular-nums">02</span>
              <div>
                <p className="text-[13px] font-semibold text-white/90">Inspektur verifikasi di lapangan</p>
                <p className="text-[11px] text-white/40 mt-0.5">Foto real-time, uji TDS air, speed test WiFi.</p>
              </div>
            </div>
            <div className="flex gap-4 items-baseline">
              <span className="text-[13px] font-mono text-white/30 tabular-nums">03</span>
              <div>
                <p className="text-[13px] font-semibold text-white/90">Terima scorecard dari Gemini AI</p>
                <p className="text-[11px] text-white/40 mt-0.5">Bandingkan skor antar kos, putuskan sendiri.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-white/30 font-mono">
          Politeknik Negeri Padang &middot; 2026
        </div>
      </div>

      {/* Right side: Login Form Column */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 relative bg-slate-50">
        <div className="absolute top-10 left-6">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-primary transition-all uppercase tracking-wider font-mono">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        <div className="w-full max-w-[380px] bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="space-y-2 text-center">
            {/* Show logo on top for mobile */}
            <div className="flex justify-center lg:hidden mb-4">
              <img src="/logo.webp" alt="InspeksiKos Logo" className="h-16 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-primary">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs text-slate-500">
              Silakan masuk dengan akun terdaftar Anda untuk mengelola verifikasi kos.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-center font-extrabold font-mono">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-accent rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-slate-400 hover:text-primary transition-all font-mono">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-accent rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 bg-gradient-to-r from-primary to-accent-light hover:from-primary hover:to-accent text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-6 shadow-md shadow-primary/10 cursor-pointer grab-btn-transition active:scale-[0.95] hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                'Masuk ke Akun'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 font-medium">
            Belum punya akun?{' '}
            <Link href="/register" className="font-extrabold text-brand-teal hover:underline transition-all font-mono">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
