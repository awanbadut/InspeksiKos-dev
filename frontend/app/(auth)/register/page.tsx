'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader } from 'lucide-react';
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

    // Split name into first and last name
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
        role: 'mahasiswa', // Only mahasiswa role is allowed for public registration
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden font-sans">
      {/* Decorative Curved Wave Lines Background (Match Wireframe) */}
      <div className="absolute left-0 top-0 bottom-0 w-28 md:w-64 overflow-hidden pointer-events-none opacity-20">
        <svg className="h-full w-full" viewBox="0 0 100 800" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M-80,150 C50,220 30,350 -40,430 C-90,500 50,600 -10,750" />
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-28 md:w-64 overflow-hidden pointer-events-none opacity-20">
        <svg className="h-full w-full" viewBox="0 0 100 800" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M150,180 C40,280 80,420 180,500 C80,600 30,680 120,780" />
        </svg>
      </div>

      {/* Main Auth Card (White, Rounded, Clean shadow) */}
      <div className="relative w-full max-w-[420px] px-8 py-8 mx-4 bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] z-10 my-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Daftar
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed px-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. At purus tellus arcu sit nibh consectetur.
          </p>
          <div className="w-24 h-[1px] bg-gray-300 mx-auto mt-4" />
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl text-center font-medium">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Annie Hartmann"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-0 transition-all text-xs"
            />
          </div>

          {/* Phone input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              No Hp
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="1-361-200-5614"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-0 transition-all text-xs"
            />
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ed_Dietrich80@gmail.com"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-0 transition-all text-xs"
            />
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-0 transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              Konfirmasi
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="******"
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-0 transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button (Dark Navy) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 bg-[#232936] hover:bg-[#181d27] text-white font-bold rounded-lg text-xs tracking-wider transition-all focus:outline-none disabled:opacity-50 mt-6 shadow-sm"
          >
            {isLoading ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              'Daftar'
            )}
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Sudah Punya Akun?{' '}
          <Link href="/login" className="font-bold text-gray-900 hover:underline transition-all">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
