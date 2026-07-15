'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Loader2,
  MapPin,
  Calendar,
} from 'lucide-react';
import api from '@/lib/api';

const ITEMS_PER_PAGE = 3;

export default function RiwayatInspeksiPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userRole = localStorage.getItem('user_role');
      const userEmail = localStorage.getItem('user_email');

      if (!token || userRole !== 'mahasiswa') {
        router.push('/login');
        return;
      }

      setEmail(userEmail);
      fetchInspections();
    }
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inspections');
      setInspections(response.data);
    } catch (err) {
      console.error('Failed to fetch inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  // Filter inspections: only completed, then apply search/status/date
  const filteredInspections = useMemo(() => {
    let results = inspections.filter((insp) => insp.status === 'completed');

    // Search by kos name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((insp) =>
        (insp.property?.name || '').toLowerCase().includes(query)
      );
    }

    // Status filter (all completed inspections are 'Selesai', but keep for extensibility)
    if (statusFilter !== 'all') {
      results = results.filter((insp) => insp.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      results = results.filter((insp) => {
        const inspDate = new Date(insp.assigned_at || insp.created_at)
          .toISOString()
          .split('T')[0];
        return inspDate === dateFilter;
      });
    }

    return results;
  }, [inspections, searchQuery, statusFilter, dateFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  // Pagination logic
  const totalItems = filteredInspections.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInspections = filteredInspections.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate visible page numbers
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading && !email) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 text-[#298EEE] animate-spin" />
        <span className="text-xs font-semibold font-mono">
          Memuat Riwayat Inspeksi...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F4FD] font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
        {/* Navbar */}
        <header className="w-full bg-[#D6E8F7] rounded-full px-6 py-3 flex items-center justify-between border border-blue-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.webp"
                alt="InspeksiKos"
                className="h-16 mix-blend-multiply"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-[#1F3E5A] rounded-xl">
              <User className="h-4 w-4 text-[#1F3E5A]" />
              <span className="text-xs font-bold text-[#1F3E5A] font-mono">
                {email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-50 text-[#B41E1D] border border-[#B41E1D] rounded-xl hover:bg-red-100/50 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="w-full bg-gradient-to-r from-[#1F3E5A] to-[#3B82F6] rounded-2xl p-8 md:p-12 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <button
              onClick={() => router.push('/mahasiswa-dashboard')}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Kembali ke Dashboard</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Riwayat Pesanan
            </h1>
            <p className="text-sm md:text-base text-white/80 mt-2 max-w-xl">
              Lihat semua riwayat inspeksi yang pernah Anda lakukan.
            </p>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="w-full bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama kos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent placeholder:text-slate-400 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent cursor-pointer appearance-none min-w-[160px] transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="completed">Selesai</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent cursor-pointer min-w-[160px] transition-all"
              />
            </div>
          </div>
        </section>

        {/* Inspection List */}
        <section className="w-full">
          <h2 className="text-lg font-extrabold text-[#1F3E5A] mb-4">
            Daftar Riwayat Inspeksi
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="h-6 w-6 text-[#3B82F6] animate-spin" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Memuat data inspeksi...
              </span>
            </div>
          ) : filteredInspections.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 mb-1">
                Tidak Ada Riwayat Inspeksi
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {searchQuery || dateFilter
                  ? 'Tidak ditemukan inspeksi yang cocok dengan filter Anda.'
                  : 'Belum ada inspeksi yang selesai. Riwayat inspeksi akan muncul di sini setelah inspeksi selesai dilakukan.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedInspections.map((insp: any) => {
                const packageLabel = insp.property?.claim_data?.comparison_id
                  ? 'Komparasi'
                  : 'Single';
                const photoUrl =
                  insp.photos?.[0]?.photo_url || '/logo.webp';
                const inspDate = new Date(
                  insp.assigned_at || insp.created_at
                ).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const price = insp.property?.claim_data?.comparison_id
                  ? 'Rp 75.000'
                  : 'Rp 50.000';

                return (
                  <div
                    key={insp.inspection_id}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:border-slate-300 hover:shadow-md transition-all shadow-sm"
                  >
                    {/* Left: Thumbnail + Name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img
                          src={photoUrl}
                          alt={insp.property?.name || 'Kos'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-[#1F3E5A] truncate">
                          {insp.property?.name || 'Kos'}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px] md:max-w-[250px]">
                            {insp.property?.address || '-'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Middle: Package, Date, Status, Price */}
                    <div className="flex flex-wrap gap-6 text-left items-center">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                          Paket
                        </span>
                        <span className="text-xs font-extrabold text-slate-700 block">
                          {packageLabel}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                          Tanggal
                        </span>
                        <span className="text-xs font-extrabold text-slate-700 block">
                          {inspDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                          Status
                        </span>
                        <span className="inline-flex items-center gap-1.5 mt-0.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-extrabold text-emerald-700">
                            Selesai
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                          Harga
                        </span>
                        <span className="text-xs font-extrabold text-[#1F3E5A] block">
                          {price}
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="shrink-0">
                      <Link
                        href="/mahasiswa-dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-xl transition-all shadow-sm"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Lihat Laporan</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Pagination */}
        {filteredInspections.length > 0 && (
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-sm text-slate-500">
              Menampilkan{' '}
              <span className="font-bold text-[#1F3E5A]">
                {Math.min(paginatedInspections.length, totalItems)}
              </span>{' '}
              dari{' '}
              <span className="font-bold text-[#1F3E5A]">{totalItems}</span>{' '}
              pesanan
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-9 w-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    page === currentPage
                      ? 'bg-[#3B82F6] text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
