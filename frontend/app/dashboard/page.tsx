'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardFallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('user_role');
      const token = localStorage.getItem('access_token');

      if (!token || !userRole) {
        router.push('/login');
        return;
      }

      if (userRole === 'mahasiswa') {
        router.push('/mahasiswa-dashboard');
      } else if (userRole === 'inspektur') {
        router.push('/inspektur-dashboard');
      } else if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-8 w-8 text-[#0f766e] animate-spin" />
      <span className="text-xs font-semibold font-mono">Mengarahkan ke Dasbor...</span>
    </div>
  );
}
