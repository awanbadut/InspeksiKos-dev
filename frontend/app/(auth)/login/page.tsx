'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
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

      // Save tokens and user info
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_email', userEmail);

      // Redirect to correct dashboard based on role
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#090d16] overflow-hidden font-sans">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#1e293b]/30 blur-[120px] pointer-events-none" />
      
      {/* Curved Lines Background Decorative CSS */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100 200 C 300 400, 400 100, 1000 300" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <path d="M0 600 C 500 500, 200 800, 1200 700" stroke="#1e293b" strokeWidth="3" fill="none" />
      </svg>

      {/* Main Auth Card */}
      <div className="relative w-full max-w-md px-6 py-10 mx-4 bg-[#111827]/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            🏠 InspeksiKos
          </h1>
          <p className="text-sm text-gray-400">
            Masuk ke akun Anda untuk memulai audit properti
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@mahasiswa.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0f172a]/90 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#0f172a]/90 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#090d16] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-all">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
