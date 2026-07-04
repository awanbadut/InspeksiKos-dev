'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building,
  UserPlus,
  Users,
  ClipboardList,
  LogOut,
  RefreshCw,
  Loader2,
  CheckCircle2,
  MapPin,
  User,
  Plus,
  ChevronRight,
  Eye,
  Download,
  XCircle,
  Settings,
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inspections' | 'inspectors' | 'users' | 'rules'>('inspections');

  // Data
  const [inspections, setInspections] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Selection & Actions
  const [assigningInsp, setAssigningInsp] = useState<any | null>(null);
  const [selectedInspectorId, setSelectedInspectorId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // New Inspector Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Report details
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Audit rules states
  const [rules, setRules] = useState<any[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [rulesSuccess, setRulesSuccess] = useState('');
  const [rulesError, setRulesError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('user_role');
      const userEmail = localStorage.getItem('user_email');
      const token = localStorage.getItem('access_token');

      if (!token || userRole !== 'admin') {
        router.push('/login');
        return;
      }

      setRole(userRole);
      setEmail(userEmail);
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInspections(),
        fetchInspectors(),
        fetchUsers(),
        fetchRules(),
      ]);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspections = async () => {
    const res = await api.get('/inspections');
    setInspections(res.data);
  };

  const fetchInspectors = async () => {
    const res = await api.get('/auth/inspectors');
    setInspectors(res.data);
  };

  const fetchRules = async () => {
    try {
      setRulesLoading(true);
      const res = await api.get('/audit/rules');
      setRules(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setRulesLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await api.get('/auth/users');
    setUsers(res.data);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleAssignInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningInsp || !selectedInspectorId) return;
    setAssignLoading(true);

    try {
      await api.patch(`/inspections/${assigningInsp.inspection_id}/status`, {
        inspector_id: selectedInspectorId,
        status: assigningInsp.status === 'completed' ? 'completed' : 'assigned',
      });
      await fetchInspections();
      setAssigningInsp(null);
      setSelectedInspectorId('');
    } catch (err) {
      console.error('Failed to assign inspector:', err);
      alert('Gagal menugaskan verifikator.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCreateInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      await api.post('/auth/register', {
        email: newEmail,
        password: newPassword,
        first_name: newFirstName,
        last_name: newLastName,
        phone_number: newPhone,
        role: 'inspektur',
      });

      setCreateSuccess('Akun verifikator berhasil didaftarkan!');
      setNewEmail('');
      setNewPassword('');
      setNewFirstName('');
      setNewLastName('');
      setNewPhone('');
      await Promise.all([fetchInspectors(), fetchUsers()]);
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || 'Registrasi gagal, coba lagi nanti');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setRulesSaving(true);
    setRulesError('');
    setRulesSuccess('');

    try {
      await api.post('/audit/rules', { items: rules });
      setRulesSuccess('Konfigurasi aturan evaluasi berhasil diperbarui!');
      await fetchRules();
    } catch (err: any) {
      console.error(err);
      setRulesError(err.response?.data?.message || 'Gagal menyimpan konfigurasi aturan.');
    } finally {
      setRulesSaving(false);
    }
  };

  const handleViewReport = async (inspection: any) => {
    try {
      const res = await api.get(`/audit/${inspection.inspection_id}/report`);
      setSelectedInspection({
        ...inspection,
        audit_report: res.data,
      });
      setShowReportModal(true);
    } catch (err) {
      console.error(err);
      alert('Laporan audit belum dibuat untuk sesi inspeksi ini.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-[#003057]/20 selection:text-[#003057]">
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00305703_1px,transparent_1px),linear-gradient(to_bottom,#00305703_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-0 right-[10%] w-[500px] h-[500px] rounded-full bg-[#0f766e]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full bg-[#003057]/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <img src="/logo.webp" alt="InspeksiKos Logo" className="h-14 w-auto object-contain" />
            </Link>
            <span className="text-[9px] px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 font-extrabold rounded-md uppercase tracking-wider font-mono">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-205 rounded-xl hidden md:flex">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-700 font-mono">
                {email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-sm font-mono"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="relative bg-[#003057]/5 border-b border-[#003057]/10 py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#003057] font-extrabold bg-[#003057]/10 px-2.5 py-1 rounded-md border border-[#003057]/15 block w-fit mb-2 font-mono">Panel Kontrol Administrator</span>
            <h1 className="text-2xl md:text-3xl font-black mb-1 bg-gradient-to-r from-[#003057] to-[#0f766e] bg-clip-text text-transparent">
              Dasbor Administrasi
            </h1>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-medium">
              Kelola penugasan kerja untuk verifikator lapangan, pantau status audit properti mahasiswa, daftarkan akun verifikator baru, dan ubah bobot penilaian.
            </p>
          </div>
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#001e38] hover:to-[#115e59] text-white font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl shadow-lg shadow-teal-500/10 hover:scale-[1.02] transition-all cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 bg-white/60 px-8 z-10">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inspections'
                ? 'border-[#0f766e] text-[#0f766e]'
                : 'border-transparent text-slate-450 hover:text-[#003057]'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Penugasan Lapangan ({inspections.length})
          </button>
          <button
            onClick={() => setActiveTab('inspectors')}
            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inspectors'
                ? 'border-[#0f766e] text-[#0f766e]'
                : 'border-transparent text-slate-450 hover:text-[#003057]'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Registrasi Verifikator ({inspectors.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#0f766e] text-[#0f766e]'
                : 'border-transparent text-slate-450 hover:text-[#003057]'
            }`}
          >
            <Users className="h-4 w-4" />
            Semua Pengguna ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-[#0f766e] text-[#0f766e]'
                : 'border-transparent text-slate-450 hover:text-[#003057]'
            }`}
          >
            <Settings className="h-4 w-4" />
            Aturan Evaluasi
          </button>
        </div>
      </div>

      {/* Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#0f766e] animate-spin" />
            <span className="text-xs font-semibold text-slate-450 font-mono">&gt; Menghubungkan...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Tab 1: Inspections */}
            {activeTab === 'inspections' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-6 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[#0f766e]" />
                  Daftar Sesi Pengajuan Lapangan
                </h2>

                {inspections.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Building className="h-8 w-8 text-gray-650 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-400 font-mono">Belum ada pengajuan inspeksi</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold">
                          <th className="pb-3 pr-4">NAMA KOS</th>
                          <th className="pb-3 px-4">ALAMAT</th>
                          <th className="pb-3 px-4">STATUS</th>
                          <th className="pb-3 px-4">PETUGAS VERIFIKATOR</th>
                          <th className="pb-3 pl-4 text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspections.map((insp: any) => (
                          <tr key={insp.inspection_id} className="hover:bg-slate-50 transition-all border-b border-slate-100">
                            <td className="py-4 pr-4 font-bold text-slate-800">
                              {insp.property?.name}
                            </td>
                            <td className="py-4 px-4 text-slate-500 max-w-xs truncate">
                              {insp.property?.address}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`text-[8px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${
                                  insp.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : insp.status === 'in_progress'
                                    ? 'bg-teal-50 text-teal-800 border border-teal-200 animate-pulse'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {insp.status === 'completed'
                                  ? 'Selesai'
                                  : insp.status === 'in_progress'
                                  ? 'Proses'
                                  : 'Ditugaskan'}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-slate-600">
                              {insp.inspector ? (
                                <span className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-slate-400" />
                                  {insp.inspector.first_name} {insp.inspector.last_name}
                                </span>
                              ) : (
                                <span className="text-rose-600 italic font-bold font-mono text-[10px]">Belum Ditugaskan</span>
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right space-x-2">
                              {insp.status !== 'completed' && (
                                <button
                                  onClick={() => setAssigningInsp(insp)}
                                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-250 transition-all cursor-pointer"
                                >
                                  Tugaskan
                                </button>
                              )}
                              {insp.status === 'completed' && (
                                <button
                                  onClick={() => handleViewReport(insp)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Laporan
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Create Inspector */}
            {activeTab === 'inspectors' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Registration form */}
                <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md h-fit">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-[#0f766e]" />
                    Daftar Verifikator Baru
                  </h2>
                  <p className="text-[10px] text-slate-400 mb-6 leading-relaxed">
                    Buat akun petugas verifikator lapangan resmi. Pendaftaran publik langsung hanya diizinkan untuk mahasiswa.
                  </p>

                  {createError && (
                    <div className="mb-4 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-center font-bold">
                      ⚠️ {createError}
                    </div>
                  )}

                  {createSuccess && (
                    <div className="mb-4 p-3 text-xs text-emerald-705 bg-emerald-50 border border-emerald-200 rounded-xl text-center font-bold">
                      ✅ {createSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreateInspector} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Depan</label>
                        <input
                          type="text"
                          required
                          value={newFirstName}
                          onChange={(e) => setNewFirstName(e.target.value)}
                          placeholder="Annie"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Belakang</label>
                        <input
                          type="text"
                          required
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                          placeholder="Hartmann"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No Handphone</label>
                      <input
                        type="text"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Verifikator</label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="annie.h@inspeksikos.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kata Sandi</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#001e38] hover:to-[#115e59] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md mt-6 cursor-pointer"
                    >
                      {createLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Daftarkan Verifikator
                    </button>
                  </form>
                </div>

                {/* Inspectors list */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-6 flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#0f766e]" />
                    Daftar Verifikator Aktif ({inspectors.length})
                  </h2>

                  {inspectors.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-400 font-mono">Belum ada verifikator terdaftar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inspectors.map((insp: any) => (
                        <div
                          key={insp.user_id}
                          className="p-4 bg-slate-50 border border-slate-200 hover:border-[#0f766e]/30 rounded-xl flex justify-between items-center transition-all"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {insp.first_name} {insp.last_name}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{insp.email}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-1">Hp: {insp.phone_number}</p>
                          </div>
                          <span className="text-[8px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-1 rounded-md uppercase tracking-wider">
                            VERIFIKATOR
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: All Users */}
            {activeTab === 'users' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md font-sans">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-6 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#0f766e]" />
                  Daftar Semua Pengguna Terdaftar ({users.length})
                </h2>

                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="pb-3 pr-4">NAMA LENGKAP</th>
                        <th className="pb-3 px-4">EMAIL</th>
                        <th className="pb-3 px-4">NO HP</th>
                        <th className="pb-3 px-4">ROLE</th>
                        <th className="pb-3 pl-4 text-right">TANGGAL REGISTER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u: any) => (
                        <tr key={u.user_id} className="hover:bg-slate-50 transition-all border-b border-slate-100">
                          <td className="py-4 pr-4 font-bold text-slate-800">
                            {u.first_name} {u.last_name}
                          </td>
                          <td className="py-4 px-4 text-slate-500 font-mono">{u.email}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono">{u.phone_number || '-'}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                                u.role === 'admin'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : u.role === 'inspektur'
                                  ? 'bg-teal-50 text-teal-805 border border-teal-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-right text-slate-450 font-mono">
                            {new Date(u.created_at).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Evaluation Rules */}
            {activeTab === 'rules' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#0f766e]" />
                    Manajemen Aturan Evaluasi (Weights & Penalties)
                  </h2>
                </div>
                <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
                  Sesuaikan bobot kontribusi nilai (Weight) dan pinalti denda pengurangan nilai (Penalty) untuk setiap checkpoint fasilitas. Bobot yang lebih besar meningkatkan pengaruh terhadap skor validitas akhir properti.
                </p>

                {rulesSuccess && (
                  <div className="mb-4 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-center font-bold">
                    ✅ {rulesSuccess}
                  </div>
                )}

                {rulesError && (
                  <div className="mb-4 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-center font-bold">
                    ⚠️ {rulesError}
                  </div>
                )}

                {rulesLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 text-[#0f766e] animate-spin" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveRules} className="space-y-6">
                    <div className="overflow-x-auto scrollbar-none">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold">
                            <th className="pb-3 pr-4">NAMA FASILITAS</th>
                            <th className="pb-3 px-4">TIPE BATAS</th>
                            <th className="pb-3 px-4">AMBANG BATAS</th>
                            <th className="pb-3 px-4 w-28">BOBOT (WEIGHT)</th>
                            <th className="pb-3 px-4 w-28">DENDA (PENALTY)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rules.map((ruleItem, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-all border-b border-slate-100">
                              <td className="py-4 pr-4 font-bold text-slate-800 capitalize">
                                {ruleItem.facility_name.replace(/_/g, ' ')}
                              </td>
                              <td className="py-4 px-4 text-slate-500">
                                <span className="px-2 py-0.5 bg-slate-105 rounded-md text-[8px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 font-mono">
                                  {ruleItem.threshold_type}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                {ruleItem.threshold_type === 'numeric' ? (
                                  <input
                                    type="text"
                                    required
                                    value={ruleItem.threshold_value || ''}
                                    onChange={(e) => {
                                      const updated = [...rules];
                                      updated[index].threshold_value = e.target.value;
                                      setRules(updated);
                                    }}
                                    className="w-24 px-2 py-1.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-lg text-xs font-mono text-slate-800 text-center focus:outline-none"
                                  />
                                ) : (
                                  <span className="text-slate-400 italic font-mono text-[10px]">Boolean (Yes/No)</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  required
                                  value={ruleItem.weight}
                                  onChange={(e) => {
                                    const updated = [...rules];
                                    updated[index].weight = Number(e.target.value);
                                    setRules(updated);
                                  }}
                                  className="w-20 px-2 py-1.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-lg text-xs font-mono text-[#0f766e] text-center font-bold focus:outline-none"
                                />
                              </td>
                              <td className="py-4 px-4">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  required
                                  value={ruleItem.penalty}
                                  onChange={(e) => {
                                    const updated = [...rules];
                                    updated[index].penalty = Number(e.target.value);
                                    setRules(updated);
                                  }}
                                  className="w-20 px-2 py-1.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-lg text-xs font-mono text-rose-600 text-center font-bold focus:outline-none"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <button
                        type="submit"
                        disabled={rulesSaving}
                        className="px-6 py-3 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#001e38] hover:to-[#115e59] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        {rulesSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Simpan Aturan Evaluasi
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Assign Inspector Modal */}
      {assigningInsp && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#003057] mb-1">
              Tugaskan Verifikator
            </h3>
            <p className="text-[10px] text-slate-500 mb-5 leading-relaxed">
              Pilih salah satu petugas verifikasi lapangan bersertifikat untuk mengaudit kosan &quot;{assigningInsp.property?.name}&quot;.
            </p>

            <form onSubmit={handleAssignInspector} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pilih Petugas Lapangan
                </label>
                <select
                  required
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                >
                  <option value="" className="bg-white text-slate-500">-- Pilih Verifikator --</option>
                  {inspectors.map((insp) => (
                    <option key={insp.user_id} value={insp.user_id} className="bg-white text-slate-800">
                      {insp.first_name} {insp.last_name} ({insp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAssigningInsp(null);
                    setSelectedInspectorId('');
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !selectedInspectorId}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#001e38] hover:to-[#115e59] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer"
                >
                  {assignLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Tugaskan Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Report Scorecard Detail (Admin view) */}
      {showReportModal && selectedInspection && selectedInspection.audit_report && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#003057]">
                  Laporan Audit Scorecard
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {selectedInspection.property?.name} — {selectedInspection.property?.address}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Main Score Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Skor Validitas
                </span>
                <span className="text-3xl font-black text-[#003057] mt-1 font-mono">
                  {selectedInspection.audit_report.score}%
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Tingkat Kepercayaan
                </span>
                <span
                  className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider mt-2 border ${
                    selectedInspection.audit_report.confidence_level === 'VALID'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                      : selectedInspection.audit_report.confidence_level === 'PARTIAL_VALID'
                      ? 'bg-amber-50 text-amber-800 border-amber-250'
                      : 'bg-rose-50 text-rose-800 border-rose-250'
                  }`}
                >
                  {selectedInspection.audit_report.confidence_level === 'VALID'
                    ? 'SANGAT SESUAI'
                    : selectedInspection.audit_report.confidence_level === 'PARTIAL_VALID'
                    ? 'CUKUP SESUAI'
                    : 'TIDAK SESUAI'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Laporan Scorecard
                </span>
                {selectedInspection.audit_report.pdf_url ? (
                  <a
                    href={selectedInspection.audit_report.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#0f766e] hover:underline"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-550 mt-2 font-mono">
                    PDF Belum Tersedia
                  </span>
                )}
              </div>
            </div>

            {/* Comparison Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-[#0f766e]" />
                Rincian Kecocokan Fasilitas (AI Vision)
              </h4>

              {/* Match/Mismatch grid */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedInspection.audit_report.breakdown_data?.items?.map((item: any, i: number) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold capitalize text-slate-700">
                          {item.facility.replace(/_/g, ' ')}
                        </span>
                        {item.status !== 'NEUTRAL' && (
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            Iklan: <span className="font-semibold text-slate-500">{item.claimed}</span> &middot; Lapangan: <span className="font-semibold text-slate-605">{item.actual}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'MATCH' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-250 tracking-wider">
                            ✓ SESUAI
                          </span>
                        )}
                        {item.status === 'MISMATCH' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#be123c] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-250 tracking-wider">
                            ✗ TIDAK SESUAI
                          </span>
                        )}
                        {item.status === 'NEUTRAL' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 tracking-wider">
                            TIDAK DIKLAIM
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-4 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#001e38] hover:to-[#115e59] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
