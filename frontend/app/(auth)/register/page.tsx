'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader, CheckCircle2, ArrowLeft, MailCheck } from 'lucide-react';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  
  // Registration data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP state
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  // Form view states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // General status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Field validation errors
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Timer countdown handler
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const validateStep1 = () => {
    let isValid = true;

    // Validate Name
    if (!name.trim()) {
      setNameError('Nama lengkap harus diisi');
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError('Nama lengkap minimal harus 3 karakter');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate Phone (Indonesian format 08xx or 628xx, 10-13 digits)
    const phoneRegex = /^(08|628)[0-9]{8,11}$/;
    if (!phone.trim()) {
      setPhoneError('Nomor handphone harus diisi');
      isValid = false;
    } else if (!phoneRegex.test(phone.trim())) {
      setPhoneError('Nomor HP tidak valid (harus aktif & berformat Indonesia, contoh: 08123456789)');
      isValid = false;
    } else {
      setPhoneError('');
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email harus diisi');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Format email tidak valid (contoh: nama@domain.com)');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate Password
    if (!password) {
      setPasswordError('Password harus diisi');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      setConfirmPasswordError('Konfirmasi password harus diisi');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Konfirmasi password tidak cocok');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStep1()) return;

    setIsLoading(true);

    try {
      await api.post('/auth/send-otp', { email });
      setSuccess('Kode OTP telah dikirimkan ke email Anda. Silakan periksa kotak masuk.');
      setStep(2);
      setOtpCountdown(60); // 60s cooldown
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengirimkan kode OTP. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0 || isLoading) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/auth/send-otp', { email });
      setSuccess('Kode OTP baru telah dikirimkan ke email Anda.');
      setOtpCountdown(60);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal mengirimkan ulang kode OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp.trim()) {
      setOtpError('Kode OTP harus diisi');
      return;
    } else if (otp.trim().length !== 6 || isNaN(Number(otp))) {
      setOtpError('Kode OTP harus berupa 6 digit angka');
      return;
    } else {
      setOtpError('');
    }

    setIsLoading(true);

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
        otp: otp.trim(),
      });

      setSuccess('Registrasi berhasil terverifikasi! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registrasi gagal. Pastikan kode OTP Anda benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#E8F4FD] font-sans text-slate-800">
      
      {/* Left side: Premium Promo Panel */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-[#1F3E5A] text-white border-r border-slate-200 overflow-hidden shadow-2xl">
        <div className="absolute top-[-20%] left-[-20%] w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
        
        {/* Header */}
        <Link href="/" className="relative flex items-center z-10 group">
          <img src="/logo.webp" alt="InspeksiKos Logo" className="h-16 w-auto object-contain mix-blend-multiply" />
        </Link>

        {/* Marketing/Feature Points */}
        <div className="relative space-y-8 z-10 my-auto">
          <div className="space-y-3">
            <h2 className="text-2xl font-black leading-snug">
              Gabung dengan Ribuan Mahasiswa
            </h2>
            <p className="text-xs text-teal-100/80 leading-relaxed">
              Daftarkan diri Anda untuk mengajukan permintaan inspeksi, verifikasi fasilitas iklan kos secara valid, dan nikmati fitur asisten perbandingan laporan secara detail.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Ajukan Inspeksi Cepat</h4>
                <p className="text-[11px] text-teal-100/70 mt-0.5">Input klaim fasilitas kosan Anda dan verifikator kami akan segera melakukan tinjauan lapangan.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Lihat Laporan Kepatuhan</h4>
                <p className="text-[11px] text-teal-100/70 mt-0.5">Dapatkan skor validitas langsung, rincian kecocokan, dan unduh berkas laporan PDF resmi.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Asisten Perbandingan Laporan</h4>
                <p className="text-[11px] text-teal-100/70 mt-0.5">Bandingkan kelayakan air TDS dan kecepatan internet antar kos dengan mudah.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info inside promo panel */}
        <div className="relative text-[10px] text-teal-200/50 z-10 font-mono">
          © 2026 InspeksiKos. Politeknik Negeri Padang.
        </div>
      </div>

      {/* Right side: Register Form Column */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 relative bg-[#E8F4FD] overflow-y-auto">
        <div className="absolute top-10 left-6">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
                setSuccess('');
                setError('');
              } else {
                router.push('/');
              }
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-[#1F3E5A] transition-all uppercase tracking-wider font-mono cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        </div>

        <div className="w-full max-w-[380px] bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5 my-8">
          <div className="space-y-2 text-center">
            {/* Show logo on top for mobile */}
            <div className="flex justify-center lg:hidden mb-4">
              <img src="/logo.webp" alt="InspeksiKos Logo" className="h-16 w-auto object-contain mix-blend-multiply" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#1F3E5A]">
              {step === 1 ? 'Buat Akun Mahasiswa' : 'Verifikasi Email Anda'}
            </h1>
            <p className="text-xs text-slate-500">
              {step === 1 
                ? 'Isi data diri di bawah ini untuk memulai audit properti kos Anda.' 
                : `Masukkan 6 digit kode OTP yang kami kirimkan ke ${email}`}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-center font-extrabold font-mono">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-xl text-center font-extrabold font-mono">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Nama Lengkap Anda"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${nameError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-[#1F3E5A]'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs`}
                />
                {nameError && (
                  <p className="text-[10px] text-rose-500 font-semibold">{nameError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  No Handphone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="contoh: 08123456789"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-[#1F3E5A]'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs`}
                />
                {phoneError && (
                  <p className="text-[10px] text-rose-500 font-semibold">{phoneError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="nama@email.com"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${emailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-[#1F3E5A]'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs`}
                />
                {emailError && (
                  <p className="text-[10px] text-rose-500 font-semibold">{emailError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border ${passwordError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-[#1F3E5A]'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[10px] text-rose-500 font-semibold">{passwordError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border ${confirmPasswordError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-[#1F3E5A]'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-[10px] text-rose-500 font-semibold">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 bg-[#1F3E5A] hover:bg-[#152a3d] text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-5 shadow-md shadow-primary/10 cursor-pointer grab-btn-transition active:scale-[0.95] hover:scale-[1.02]"
              >
                {isLoading ? (
                  <Loader className="animate-spin h-4 w-4" />
                ) : (
                  'Kirim Kode Verifikasi OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="flex justify-center my-2">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-200">
                  <MailCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center font-mono">
                  Kode OTP (6 Digit)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  placeholder="123456"
                  className={`w-full px-4 py-3 bg-slate-50 border ${otpError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-[#1F3E5A]'} rounded-xl text-center text-lg font-black tracking-[10px] placeholder:tracking-normal placeholder:font-normal text-slate-800 placeholder-slate-300 focus:outline-none transition-all`}
                />
                {otpError && (
                  <p className="text-[10px] text-rose-500 font-semibold text-center">{otpError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 bg-[#1F3E5A] hover:bg-[#152a3d] text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-4 shadow-md shadow-primary/10 cursor-pointer grab-btn-transition active:scale-[0.95] hover:scale-[1.02]"
              >
                {isLoading ? (
                  <Loader className="animate-spin h-4 w-4" />
                ) : (
                  'Verifikasi & Daftar'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={otpCountdown > 0 || isLoading}
                  onClick={handleResendOtp}
                  className={`text-xs font-bold font-mono transition-colors ${
                    otpCountdown > 0 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-[#3B82F6] hover:text-[#2563EB] cursor-pointer'
                  }`}
                >
                  {otpCountdown > 0 
                    ? `Kirim Ulang OTP (${otpCountdown}s)` 
                    : 'Kirim Ulang OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 pt-1 font-medium">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-extrabold text-[#1F3E5A] hover:underline transition-all font-mono">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
