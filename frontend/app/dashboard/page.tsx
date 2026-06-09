'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building,
  CheckCircle2,
  XCircle,
  Plus,
  LogOut,
  Upload,
  Download,
  AlertTriangle,
  Gauge,
  Droplets,
  Eye,
  Loader2,
  ShieldAlert,
  FileText,
  Layers,
  Wifi,
  MapPin,
  ClipboardList,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Core Data
  const [inspections, setInspections] = useState<any[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // New Request Form State
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyDesc, setPropertyDesc] = useState('');
  const [claims, setClaims] = useState({
    kasur: true,
    lemari: true,
    ac: false,
    wifi: false,
    kamar_mandi_dalam: false,
  });
  const [tdsExpectation, setTdsExpectation] = useState(500);
  const [internetExpectation, setInternetExpectation] = useState(10);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Leaflet map states
  const [mapReady, setMapReady] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Inspector Execution State
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [roomType, setRoomType] = useState('kamar_tidur');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [taskPhotos, setTaskPhotos] = useState<any[]>([]);
  const [tdsInput, setTdsInput] = useState('');
  const [internetInput, setInternetInput] = useState('');
  const [techSaving, setTechSaving] = useState(false);
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditError, setAuditError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('user_role');
      const userEmail = localStorage.getItem('user_email');
      const token = localStorage.getItem('access_token');

      if (!token || !userRole) {
        router.push('/login');
        return;
      }

      setRole(userRole);
      setEmail(userEmail);
      fetchInspections();
    }
  }, []);

  // Dynamically load Leaflet CDN scripts/CSS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapReady(true);
      document.head.appendChild(script);
    } else {
      setMapReady(true);
    }
  }, []);

  // Map Picker initialization
  useEffect(() => {
    if (mapReady && showMapPicker) {
      const timer = setTimeout(() => {
        const L = (window as any).L;
        if (!L) return;

        const defaultLat = -0.9471;
        const defaultLng = 100.4172;

        const initialLat = selectedLat || defaultLat;
        const initialLng = selectedLng || defaultLng;

        const mapInstance = L.map('map-picker-container').setView([initialLat, initialLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        let markerInstance = L.marker([initialLat, initialLng]).addTo(mapInstance);

        mapInstance.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setSelectedLat(lat);
          setSelectedLng(lng);
          markerInstance.setLatLng([lat, lng]);
        });

        (window as any).currentMapPicker = mapInstance;
      }, 100);

      return () => {
        const mapInst = (window as any).currentMapPicker;
        if (mapInst) {
          mapInst.remove();
          (window as any).currentMapPicker = null;
        }
      };
    }
  }, [mapReady, showMapPicker]);

  // Inspector Task Map initialization
  useEffect(() => {
    if (mapReady && activeTask && activeTask.property?.claim_data?.location) {
      const { latitude, longitude } = activeTask.property.claim_data.location;
      if (!latitude || !longitude) return;

      const timer = setTimeout(() => {
        const L = (window as any).L;
        if (!L) return;

        const mapInstance = L.map('task-map-container').setView([latitude, longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        L.marker([latitude, longitude]).addTo(mapInstance);

        (window as any).currentTaskMap = mapInstance;
      }, 100);

      return () => {
        const mapInst = (window as any).currentTaskMap;
        if (mapInst) {
          mapInst.remove();
          (window as any).currentTaskMap = null;
        }
      };
    }
  }, [mapReady, activeTask]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError('');

    try {
      // 1. Structure the claim data
      const claim_data = {
        location: selectedLat && selectedLng ? {
          latitude: selectedLat,
          longitude: selectedLng
        } : null,
        fasilitas: {
          kasur: { ada: claims.kasur },
          lemari: { ada: claims.lemari },
          ac: { ada: claims.ac },
          wifi: { ada: claims.wifi },
          kamar_mandi_dalam: { ada: claims.kamar_mandi_dalam },
          kualitas_air: { nilai: Number(tdsExpectation) },
          kecepatan_internet: { nilai: Number(internetExpectation) },
        },
      };

      // 2. Create the Property
      const propResponse = await api.post('/properties', {
        name: propertyName,
        address: propertyAddress,
        description: propertyDesc,
        claim_data,
      });

      const { property_id } = propResponse.data;

      // 3. Request Inspection
      await api.post('/inspections', { property_id });

      // Refresh and reset
      await fetchInspections();
      setShowRequestModal(false);
      setPropertyName('');
      setPropertyAddress('');
      setPropertyDesc('');
      setClaims({
        kasur: true,
        lemari: true,
        ac: false,
        wifi: false,
        kamar_mandi_dalam: false,
      });
      setTdsExpectation(500);
      setInternetExpectation(10);
      setSelectedLat(null);
      setSelectedLng(null);
      setShowMapPicker(false);
    } catch (err: any) {
      console.error(err);
      setRequestError(err.response?.data?.message || 'Gagal mengirim permintaan inspeksi');
    } finally {
      setRequestLoading(false);
    }
  };

  // Inspector Functions
  const handleSelectTask = async (inspection: any) => {
    setActiveTask(inspection);
    setTdsInput(inspection.tds_value !== null ? String(inspection.tds_value) : '');
    setInternetInput(inspection.internet_speed !== null ? String(inspection.internet_speed) : '');
    setAuditError('');
    // Load photos
    try {
      const res = await api.get(`/inspections/${inspection.inspection_id}/photos`);
      setTaskPhotos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTask = async (task_id: string) => {
    try {
      const updated = await api.patch(`/inspections/${task_id}/status`, {
        status: 'in_progress',
      });
      setActiveTask(updated.data);
      await fetchInspections();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingFile || !activeTask) return;
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('file', uploadingFile);
    formData.append('room_type', roomType);

    try {
      await api.post(`/inspections/${activeTask.inspection_id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Refresh photos
      const res = await api.get(`/inspections/${activeTask.inspection_id}/photos`);
      setTaskPhotos(res.data);
      setUploadingFile(null);
      // Reset input element
      const fileInput = document.getElementById('photo-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengunggah foto');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveTechnicalData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    setTechSaving(true);
    setAuditError('');

    try {
      const updated = await api.patch(`/inspections/${activeTask.inspection_id}/teknis`, {
        tds_value: Number(tdsInput),
        internet_speed: Number(internetInput),
      });
      setActiveTask(updated.data);
      alert('Data teknis berhasil disimpan!');
    } catch (err: any) {
      console.error(err);
      setAuditError(err.response?.data?.message || 'Gagal menyimpan data teknis');
    } finally {
      setTechSaving(false);
    }
  };

  const handleRunAudit = async () => {
    if (!activeTask) return;
    setAuditRunning(true);
    setAuditError('');

    try {
      // First save current inputs in case they forgot to save
      await api.patch(`/inspections/${activeTask.inspection_id}/teknis`, {
        tds_value: Number(tdsInput),
        internet_speed: Number(internetInput),
      });

      // Run AI and Rule evaluation
      const auditRes = await api.post(`/audit/${activeTask.inspection_id}/run`);
      
      // Refresh
      await fetchInspections();
      
      // Get detailed report
      const reportRes = await api.get(`/audit/${activeTask.inspection_id}/report`);
      setSelectedInspection({
        ...activeTask,
        status: 'completed',
        audit_report: reportRes.data,
      });
      setShowReportModal(true);
      setActiveTask(null);
    } catch (err: any) {
      console.error(err);
      setAuditError(err.response?.data?.message || 'Gagal menjalankan audit AI. Pastikan foto sudah terunggah.');
    } finally {
      setAuditRunning(false);
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
      alert('Laporan audit belum siap atau tidak ditemukan.');
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
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 font-semibold rounded-md uppercase tracking-wider">
            {role} Panel
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

      {/* Hero Welcome banner */}
      <div className="bg-[#232936] text-white py-10 px-8 relative overflow-hidden">
        <div className="absolute right-[-10%] top-[-30%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-2">
              Halo, {email?.split('@')[0]}!
            </h1>
            <p className="text-xs text-gray-400 max-w-xl">
              {role === 'mahasiswa'
                ? 'Kelola pengajuan inspeksi properti kos Anda di Kota Padang untuk memvalidasi fasilitas secara objektif.'
                : 'Daftar tugas verifikasi lapangan. Isi data TDS air, kecepatan internet, unggah foto, dan jalankan audit Gemini AI.'}
            </p>
          </div>
          {role === 'mahasiswa' && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              Ajukan Inspeksi
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="text-xs font-semibold text-gray-500">Memuat data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col (2 cols wide on desktop) - Inspections List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    Daftar Permintaan Inspeksi ({inspections.length})
                  </h2>
                  <button
                    onClick={fetchInspections}
                    className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                {inspections.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Building className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-600 mb-1">Belum Ada Sesi Inspeksi</p>
                    <p className="text-[10px] text-gray-400">
                      {role === 'mahasiswa'
                        ? 'Klik tombol "Ajukan Inspeksi" untuk mendaftarkan kosan Anda.'
                        : 'Tidak ada tugas inspeksi yang ditugaskan kepada Anda saat ini.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspections.map((insp: any) => {
                      const isActive = activeTask?.inspection_id === insp.inspection_id;
                      return (
                        <div
                          key={insp.inspection_id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isActive
                              ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500'
                              : 'border-gray-100 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-bold text-gray-900">
                                  {insp.property?.name || 'Properti Tanpa Nama'}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    insp.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : insp.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {insp.status === 'completed'
                                    ? 'Selesai'
                                    : insp.status === 'in_progress'
                                    ? 'Proses'
                                    : 'Ditugaskan'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-2">
                                <MapPin className="h-3 w-3 inline text-gray-400" />
                                {insp.property?.address}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
                                <span>
                                  Tanggal: {new Date(insp.assigned_at).toLocaleDateString('id-ID')}
                                </span>
                                {insp.inspector && (
                                  <span>
                                    Inspektur: {insp.inspector.first_name} {insp.inspector.last_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 self-end sm:self-auto">
                              {role === 'inspektur' && (
                                <>
                                  {insp.status !== 'completed' && !isActive && (
                                    <button
                                      onClick={() => handleSelectTask(insp)}
                                      className="px-4 py-2 text-xs font-bold bg-[#232936] text-white hover:bg-[#1c212b] rounded-xl transition-all"
                                    >
                                      Buka Kerja
                                    </button>
                                  )}
                                  {isActive && (
                                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Sedang Aktif
                                    </span>
                                  )}
                                </>
                              )}

                              {insp.status === 'completed' && (
                                <button
                                  onClick={() => handleViewReport(insp)}
                                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Scorecard
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col - Inspection Details/Actions */}
            <div className="space-y-6">
              {role === 'inspektur' && activeTask ? (
                <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-md ring-1 ring-blue-50/50">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Inspeksi Lapangan Aktif
                      </h3>
                      <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                        {activeTask.property?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTask(null)}
                      className="text-xs font-bold text-gray-400 hover:text-gray-900"
                    >
                      Batal
                    </button>
                  </div>

                  {activeTask.status === 'assigned' ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-500 mb-4">
                        Mulai status &quot;In Progress&quot; untuk mengaktifkan formulir unggah bukti.
                      </p>
                      <button
                        onClick={() => handleStartTask(activeTask.inspection_id)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        Mulai Sesi Inspeksi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Navigation Map */}
                      {activeTask.property?.claim_data?.location && (
                        <div className="border-b border-gray-100 pb-5">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-red-500 animate-bounce" />
                              Lokasi Rute Lapangan
                            </span>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${activeTask.property.claim_data.location.latitude},${activeTask.property.claim_data.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                            >
                              🚀 Buka Rute Navigasi
                            </a>
                          </h4>
                          <div
                            id="task-map-container"
                            className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 z-10"
                            style={{ minHeight: '128px' }}
                          />
                        </div>
                      )}

                      {/* Technical Inputs */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-indigo-500" />
                          1. Pengukuran Teknis
                        </h4>
                        <form onSubmit={handleSaveTechnicalData} className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Droplets className="h-3.5 w-3.5 text-blue-500" />
                                TDS Air (ppm)
                              </label>
                              <input
                                type="number"
                                required
                                value={tdsInput}
                                onChange={(e) => setTdsInput(e.target.value)}
                                placeholder="Contoh: 120"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Wifi className="h-3.5 w-3.5 text-orange-500" />
                                Internet (Mbps)
                              </label>
                              <input
                                type="number"
                                required
                                value={internetInput}
                                onChange={(e) => setInternetInput(e.target.value)}
                                placeholder="Contoh: 35"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={techSaving}
                            className="w-full py-2 text-xs font-bold border border-gray-300 hover:bg-gray-50 rounded-lg transition-all flex items-center justify-center gap-1"
                          >
                            {techSaving && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                            Simpan Data Teknis
                          </button>
                        </form>
                      </div>

                      {/* Photo Upload Form */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5 text-blue-500" />
                          2. Unggah Foto Fasilitas
                        </h4>
                        <form onSubmit={handleUploadPhoto} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500">
                              Jenis Ruangan/Fasilitas
                            </label>
                            <select
                              value={roomType}
                              onChange={(e) => setRoomType(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                            >
                              <option value="kamar_tidur">Kamar Tidur</option>
                              <option value="kamar_mandi">Kamar Mandi</option>
                              <option value="ac">Pendingin AC</option>
                              <option value="wifi">Router Wifi</option>
                              <option value="lemari">Lemari</option>
                              <option value="umum">Fasilitas Umum</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <input
                              type="file"
                              id="photo-upload-input"
                              accept="image/*"
                              required
                              onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
                              className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={uploadLoading || !uploadingFile}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                          >
                            {uploadLoading && <Loader2 className="h-3 w-3 animate-spin text-white" />}
                            Unggah Foto Bukti
                          </button>
                        </form>

                        {/* Thumbnails of uploaded photos */}
                        {taskPhotos.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[10px] font-bold text-gray-500 mb-2">
                              Foto Terunggah ({taskPhotos.length})
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                              {taskPhotos.map((photo: any) => (
                                <div
                                  key={photo.photo_id}
                                  className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
                                >
                                  <img
                                    src={photo.photo_url}
                                    alt={photo.room_type}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white py-0.5 text-center truncate">
                                    {photo.room_type}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Run AI Scorecard Audit */}
                      <div className="border-t border-gray-100 pt-5 space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          3. Evaluasi Platform
                        </h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Menjalankan ekstraksi Gemini AI Vision untuk mengecek foto aktual dengan klaim mahasiswa, kemudian mengomparasi data air dan wifi menggunakan Rule-Based Engine.
                        </p>
                        {auditError && (
                          <div className="p-3 text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {auditError}
                          </div>
                        )}
                        <button
                          onClick={handleRunAudit}
                          disabled={auditRunning}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-500/10"
                        >
                          {auditRunning ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Memproses AI & Rules...
                            </>
                          ) : (
                            'Jalankan Audit AI & Hitung Skor'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center py-10">
                  <Building className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-xs font-bold text-gray-900 mb-1">
                    {role === 'mahasiswa' ? 'Panel Informasi' : 'Pilih Tugas'}
                  </h3>
                  <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto leading-relaxed">
                    {role === 'mahasiswa'
                      ? 'Setelah inspektur selesai mengaudit lapangan, scorecard PDF otomatis terbit.'
                      : 'Pilih salah satu tugas dari daftar di samping untuk memulai pengisian data.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal - Request Inspection (Mahasiswa) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Ajukan Permintaan Inspeksi Baru
            </h3>
            <p className="text-[10px] text-gray-500 mb-5 leading-relaxed">
              Mendaftarkan properti kos baru dan klaim fasilitas iklan. Data ini akan diaudit di lapangan oleh tim verifikator bersertifikat.
            </p>

            {requestError && (
              <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                ⚠️ {requestError}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase">
                  Nama Properti Kos
                </label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Kos Anggrek Indah TRPL"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Jl. Limau Manis Kec. Pauh No. 40, Kota Padang"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-700 uppercase flex items-center justify-between">
                  <span>Lokasi Koordinat Kos (Maps)</span>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="text-[9px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    📍 {showMapPicker ? 'Tutup Peta' : 'Pilih di Peta'}
                  </button>
                </label>
                
                {showMapPicker && (
                  <div className="border border-gray-200 rounded-2xl p-2 bg-gray-50 space-y-2">
                    <div
                      id="map-picker-container"
                      className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 z-10"
                      style={{ minHeight: '192px' }}
                    />
                    <p className="text-[8px] text-gray-400 text-center font-medium">
                      Klik pada peta untuk memindahkan pin lokasi.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Latitude"
                      readOnly
                      value={selectedLat !== null ? selectedLat.toFixed(6) : ''}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 font-semibold"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Longitude"
                      readOnly
                      value={selectedLng !== null ? selectedLng.toFixed(6) : ''}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase">
                  Deskripsi / Info Tambahan (Opsional)
                </label>
                <textarea
                  value={propertyDesc}
                  onChange={(e) => setPropertyDesc(e.target.value)}
                  placeholder="Kamar berukuran 3x4 meter, dekat dengan gerbang utama..."
                  rows={2}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-gray-700 uppercase block">
                  Fasilitas Yang Diklaim Di Iklan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(claims).map((facility) => (
                    <label
                      key={facility}
                      className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={(claims as any)[facility]}
                        onChange={(e) =>
                          setClaims({ ...claims, [facility]: e.target.checked })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-0"
                      />
                      <span className="capitalize">{facility.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase block">
                    Klaim TDS Air (Maks ppm)
                  </label>
                  <input
                    type="number"
                    required
                    value={tdsExpectation}
                    onChange={(e) => setTdsExpectation(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                  <span className="text-[8px] text-gray-400">Standar air bersih: &lt;= 500 ppm</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase block">
                    Klaim Speed Wifi (Min Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    value={internetExpectation}
                    onChange={(e) => setInternetExpectation(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                  <span className="text-[8px] text-gray-400">Kecepatan minimal: 10 Mbps</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="px-5 py-2.5 bg-[#232936] hover:bg-[#1b202a] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm"
                >
                  {requestLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Ajukan Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Report Scorecard Detail */}
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

              {/* Technical breakdown */}
              <h4 className="text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2 pt-2 flex items-center gap-1">
                <Gauge className="h-4 w-4 text-indigo-500" />
                Data Teknis Pengukuran
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">
                    TDS AIR AKTUAL
                  </span>
                  <span className="text-lg font-black text-gray-800">
                    {selectedInspection.tds_value} ppm
                  </span>
                  <span className="text-[9px] text-gray-500 block mt-1">
                    Klaim/Batas: &lt;= {selectedInspection.property?.claim_data?.fasilitas?.kualitas_air?.nilai || 500} ppm
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">
                    INTERNET SPEED AKTUAL
                  </span>
                  <span className="text-lg font-black text-gray-800">
                    {selectedInspection.internet_speed} Mbps
                  </span>
                  <span className="text-[9px] text-gray-500 block mt-1">
                    Klaim/Batas: &gt;= {selectedInspection.property?.claim_data?.fasilitas?.kecepatan_internet?.nilai || 10} Mbps
                  </span>
                </div>
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
