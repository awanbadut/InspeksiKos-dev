'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inspections' | 'inspectors' | 'users'>('inspections');

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
        status: assigningInsp.status === 'completed' ? 'completed' : 'assigned', // Keep status logic consistent
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
        role: 'inspektur', // Admin registers account as inspector
      });

      setCreateSuccess('Akun verifikator berhasil didaftarkan!');
      // Reset form
      setNewEmail('');
      setNewPassword('');
      setNewFirstName('');
      setNewLastName('');
      setNewPhone('');
      // Reload lists
      await Promise.all([fetchInspectors(), fetchUsers()]);
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || 'Registrasi gagal, coba lagi nanti');
    } finally {
      setCreateLoading(false);
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
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🏠 InspeksiKos
          </span>
          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 font-semibold rounded-md uppercase tracking-wider">
            Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-500 hidden md:block">
            {email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <div className="bg-[#232936] text-white py-10 px-8 relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-30%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-2">
              Panel Administrator Utama
            </h1>
            <p className="text-xs text-gray-400 max-w-xl">
              Kelola tugas penugasan lapangan untuk verifikator, pantau status audit properti mahasiswa, dan daftarkan akun inspektur baru.
            </p>
          </div>
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Perbarui Data
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-gray-100 bg-white px-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'inspections'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Penugasan Lapangan ({inspections.length})
          </button>
          <button
            onClick={() => setActiveTab('inspectors')}
            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'inspectors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Registrasi Verifikator ({inspectors.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Semua Pengguna ({users.length})
          </button>
        </div>
      </div>

      {/* Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="text-xs font-semibold text-gray-500">Memuat data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab 1: Inspections */}
            {activeTab === 'inspections' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                  Daftar Sesi Pengajuan Lapangan
                </h2>

                {inspections.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Building className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-500">Belum ada pengajuan inspeksi</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold">
                          <th className="pb-3 pr-4">NAMA KOS</th>
                          <th className="pb-3 px-4">ALAMAT</th>
                          <th className="pb-3 px-4">STATUS</th>
                          <th className="pb-3 px-4">PETUGAS VERIFIKATOR</th>
                          <th className="pb-3 pl-4 text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {inspections.map((insp: any) => (
                          <tr key={insp.inspection_id} className="hover:bg-gray-50/50 transition-all">
                            <td className="py-3.5 pr-4 font-bold text-gray-900">
                              {insp.property?.name}
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                              {insp.property?.address}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  insp.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : insp.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {insp.status === 'completed'
                                  ? 'Selesai'
                                  : insp.status === 'in_progress'
                                  ? 'Proses'
                                  : 'Ditugaskan'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-gray-600">
                              {insp.inspector ? (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-gray-400" />
                                  {insp.inspector.first_name} {insp.inspector.last_name}
                                </span>
                              ) : (
                                <span className="text-red-500 italic font-medium">Belum Ditugaskan</span>
                              )}
                            </td>
                            <td className="py-3.5 pl-4 text-right space-x-2">
                              {insp.status !== 'completed' && (
                                <button
                                  onClick={() => setAssigningInsp(insp)}
                                  className="px-3 py-1.5 text-[10px] font-bold bg-[#232936] text-white hover:bg-[#181e28] rounded-lg transition-all"
                                >
                                  Tugaskan Petugas
                                </button>
                              )}
                              {insp.status === 'completed' && (
                                <button
                                  onClick={() => handleViewReport(insp)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold border border-gray-200 hover:bg-gray-50 rounded-lg transition-all"
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
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit">
                  <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    Daftar Verifikator Baru
                  </h2>
                  <p className="text-[10px] text-gray-500 mb-6 leading-relaxed">
                    Buat akun petugas verifikasi lapangan. Registrasi publik hanya diizinkan untuk mahasiswa.
                  </p>

                  {createError && (
                    <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                      ⚠️ {createError}
                    </div>
                  )}

                  {createSuccess && (
                    <div className="mb-4 p-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl">
                      ✅ {createSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreateInspector} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-700 uppercase">Nama Depan</label>
                        <input
                          type="text"
                          required
                          value={newFirstName}
                          onChange={(e) => setNewFirstName(e.target.value)}
                          placeholder="Annie"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-700 uppercase">Nama Belakang</label>
                        <input
                          type="text"
                          required
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                          placeholder="Hartmann"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-700 uppercase">No Handphone</label>
                      <input
                        type="text"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-700 uppercase">Email Verifikator</label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="annie.h@inspeksikos.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-700 uppercase">Kata Sandi</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="******"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full py-2.5 bg-[#232936] hover:bg-[#181d26] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm mt-6"
                    >
                      {createLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Daftarkan Verifikator
                    </button>
                  </form>
                </div>

                {/* Inspectors list */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Daftar Verifikator Aktif ({inspectors.length})
                  </h2>

                  {inspectors.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-500">Belum ada verifikator terdaftar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inspectors.map((insp: any) => (
                        <div
                          key={insp.user_id}
                          className="p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center transition-all"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {insp.first_name} {insp.last_name}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{insp.email}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Hp: {insp.phone_number}</p>
                          </div>
                          <span className="text-[8px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md uppercase">
                            Petugas Lapangan
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
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Daftar Semua Pengguna Terdaftar ({users.length})
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold">
                        <th className="pb-3 pr-4">NAMA LENGKAP</th>
                        <th className="pb-3 px-4">EMAIL</th>
                        <th className="pb-3 px-4">NO HP</th>
                        <th className="pb-3 px-4">ROLE</th>
                        <th className="pb-3 pl-4 text-right">TANGGAL REGISTER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((u: any) => (
                        <tr key={u.user_id} className="hover:bg-gray-50/50 transition-all">
                          <td className="py-3 pr-4 font-bold text-gray-900">
                            {u.first_name} {u.last_name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3 px-4 text-gray-500">{u.phone_number || '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                u.role === 'admin'
                                  ? 'bg-red-100 text-red-800'
                                  : u.role === 'inspektur'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right text-gray-400">
                            {new Date(u.created_at).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Assign Inspector Modal */}
      {assigningInsp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Tugaskan Verifikator
            </h3>
            <p className="text-[10px] text-gray-500 mb-5 leading-relaxed">
              Pilih salah satu petugas verifikasi lapangan bersertifikat untuk mengaudit kosan &quot;{assigningInsp.property?.name}&quot;.
            </p>

            <form onSubmit={handleAssignInspector} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase block">
                  Pilih Petugas Lapangan
                </label>
                <select
                  required
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                >
                  <option value="">-- Pilih Verifikator --</option>
                  {inspectors.map((insp) => (
                    <option key={insp.user_id} value={insp.user_id}>
                      {insp.first_name} {insp.last_name} ({insp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAssigningInsp(null);
                    setSelectedInspectorId('');
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !selectedInspectorId}
                  className="px-5 py-2.5 bg-[#232936] hover:bg-[#1b202a] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Laporan Audit Scorecard
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {selectedInspection.property?.name} — {selectedInspection.property?.address}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-900 p-1"
              >
                Tutup
              </button>
            </div>

            {/* Main Score Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center flex flex-col justify-center items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Nilai Validitas
                </span>
                <span className="text-3xl font-black text-blue-600 mt-1">
                  {selectedInspection.audit_report.score}%
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center flex flex-col justify-center items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Tingkat Kepercayaan
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase mt-2 ${
                    selectedInspection.audit_report.confidence_level === 'VALID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedInspection.audit_report.confidence_level === 'PARTIAL_VALID'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedInspection.audit_report.confidence_level.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Laporan Scorecard
                </span>
                {selectedInspection.audit_report.pdf_url ? (
                  <a
                    href={selectedInspection.audit_report.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-400 mt-2 font-semibold">
                    PDF Belum Tersedia
                  </span>
                )}
              </div>
            </div>

            {/* Comparison Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1">
                <ClipboardList className="h-4 w-4 text-blue-500" />
                Rincian Kecocokan Fasilitas (AI Vision)
              </h4>

              {/* Match/Mismatch grid */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedInspection.audit_report.breakdown_data?.items?.map((item: any, i: number) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold capitalize text-gray-800">
                          {item.facility.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'MATCH' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> MATCH
                          </span>
                        )}
                        {item.status === 'MISMATCH' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                            <XCircle className="h-3 w-3" /> MISMATCH
                          </span>
                        )}
                        {item.status === 'NEUTRAL' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            TIDAK DIKLAIM
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 bg-[#232936] hover:bg-[#1a1f29] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
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
