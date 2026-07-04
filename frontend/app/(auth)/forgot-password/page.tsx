'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Mail, ArrowLeft, Loader, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(response.data.message || 'Kode verifikasi telah dikirim ke email Anda.');
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengirim kode verifikasi. Pastikan email terdaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        email,
        code,
        new_password: newPassword,
      });

      setSuccessMessage(response.data.message || 'Kata sandi Anda berhasil diperbarui.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengatur ulang kata sandi. Pastikan kode verifikasi benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12 bg-[#E8F4FD] font-sans text-slate-800 relative">
      
      {/* Back button */}
      <div className="absolute top-10 left-6">
        <Link href="/login" className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-[#1F3E5A] transition-all uppercase tracking-wider font-mono">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>

      <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-12 w-12 bg-blue-50 text-[#1F3E5A] rounded-full flex items-center justify-center shadow-inner">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#1F3E5A] mt-4">
            {step === 1 ? 'Lupa Kata Sandi' : 'Atur Ulang Kata Sandi'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed px-2">
            {step === 1 
              ? 'Masukkan alamat email Anda untuk menerima 6-digit kode verifikasi penyetelan ulang.'
              : `Kode verifikasi telah dikirim ke ${email}. Silakan masukkan kode dan kata sandi baru Anda.`}
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-center font-extrabold font-mono flex items-center justify-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && step === 2 && (
          <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-250 rounded-xl text-center font-bold font-mono flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1F3E5A] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 bg-[#1F3E5A] hover:bg-[#152a3d] text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-6 shadow-md shadow-primary/10 cursor-pointer active:scale-[0.95] hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                'Kirim Kode Verifikasi'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                6-Digit Kode Verifikasi
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1F3E5A] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs text-center font-extrabold tracking-[5px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1F3E5A] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1F3E5A] rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 bg-[#1F3E5A] hover:bg-[#152a3d] text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-6 shadow-md shadow-primary/10 cursor-pointer active:scale-[0.95] hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                'Atur Ulang Kata Sandi'
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 font-medium">
          Ingat kata sandi Anda?{' '}
          <Link href="/login" className="font-extrabold text-[#1F3E5A] hover:underline transition-all font-mono">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
