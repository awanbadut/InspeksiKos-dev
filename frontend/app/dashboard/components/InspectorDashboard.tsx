'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  CheckCircle2,
  XCircle,
  LogOut,
  Upload,
  Eye,
  Loader2,
  Layers,
  Wifi,
  MapPin,
  ClipboardList,
  RefreshCw,
  Sparkles,
  ChevronRight,
  User,
  Compass,
  Droplets,
} from 'lucide-react';
import api from '@/lib/api';

const checkPoints = [
  { key: 'kasur', label: 'Kasur', type: 'boolean', desc: 'Kasur yang disediakan' },
  { key: 'lemari', label: 'Lemari Pakaian', type: 'boolean', desc: 'Lemari pakaian untuk mahasiswa' },
  { key: 'ac', label: 'Pendingin Ruangan (AC)', type: 'boolean', desc: 'Unit AC di dalam kamar' },
  { key: 'wifi', label: 'Router WiFi', type: 'boolean', desc: 'Perangkat router WiFi kos' },
  { key: 'kamar_mandi_dalam', label: 'Kamar Mandi Dalam', type: 'boolean', desc: 'Fasilitas kamar mandi dalam' },
  { key: 'kualitas_air', label: 'Kualitas Air (TDS)', type: 'technical', desc: 'Pengukuran kualitas air bersih' },
  { key: 'kecepatan_internet', label: 'Kecepatan Internet', type: 'technical', desc: 'Hasil uji kecepatan internet (Speedtest)' },
];

interface InspectorDashboardProps {
  email: string | null;
  inspections: any[];
  loading: boolean;
  fetchInspections: (silent?: boolean) => Promise<void>;
  mapReady: boolean;
  handleLogout: () => void;
  onViewReport: (inspection: any) => void;
  setSelectedInspection: (inspection: any) => void;
  setShowReportModal: (show: boolean) => void;
}

export default function InspectorDashboard({
  email,
  inspections,
  loading,
  fetchInspections,
  mapReady,
  handleLogout,
  onViewReport,
  setSelectedInspection,
  setShowReportModal,
}: InspectorDashboardProps) {
  const [mobileTab, setMobileTab] = useState<'home' | 'bantuan' | 'akun'>('home');
  const [activeTabInspector, setActiveTabInspector] = useState<'my_tasks' | 'available_orders'>('my_tasks');
  const [acceptingTaskLoading, setAcceptingTaskLoading] = useState<Record<string, boolean>>({});

  // Inspector Execution State
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [uploadLoadingState, setUploadLoadingState] = useState<Record<string, boolean>>({});
  const [taskPhotos, setTaskPhotos] = useState<any[]>([]);
  const [tdsInput, setTdsInput] = useState('');
  const [internetInput, setInternetInput] = useState('');
  const [techSaving, setTechSaving] = useState(false);
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [evaluations, setEvaluations] = useState<Record<string, boolean>>({});

  // Active steps parser
  const activeSteps = (() => {
    if (!activeTask?.property?.claim_data?.fasilitas) {
      return checkPoints;
    }
    const standardBoolean = checkPoints.filter(
      (cp) => cp.type === 'boolean' && activeTask.property.claim_data.fasilitas?.[cp.key]?.ada === true
    );
    const technical = checkPoints.filter((cp) => cp.type === 'technical');
    
    const customSteps: any[] = [];
    const standardKeys = ['kasur', 'lemari', 'ac', 'wifi', 'kamar_mandi_dalam', 'kualitas_air', 'kecepatan_internet'];
    const claimsObj = activeTask.property.claim_data.fasilitas;
    Object.keys(claimsObj).forEach((key) => {
      if (!standardKeys.includes(key) && claimsObj[key]?.ada === true) {
        customSteps.push({
          key: key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          type: 'boolean',
          desc: `Verifikasi fasilitas kustom: ${key.replace(/_/g, ' ')}`
        });
      }
    });

    return [...standardBoolean, ...customSteps, ...technical];
  })();
  const currentActiveStep = activeSteps[currentStep];

  // Map Routing effect
  useEffect(() => {
    if (mapReady && activeTask && activeTask.property?.claim_data?.location) {
      const { latitude, longitude } = activeTask.property.claim_data.location;
      if (!latitude || !longitude) return;

      const timer = setTimeout(() => {
        const L = (window as any).L;
        if (!L) return;

        const mapInstance = L.map('task-map-container').setView([latitude, longitude], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapInstance);

        // Custom pulsing blue dot for inspector's GPS location
        const userIcon = L.divIcon({
          className: 'custom-gps-marker',
          html: `
            <div class="relative flex h-5 w-5 items-center justify-center">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white shadow-md"></span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        // Custom glowing red pin for property destination
        const destinationIcon = L.divIcon({
          className: 'custom-destination-marker',
          html: `
            <div class="relative flex h-8 w-8 items-center justify-center">
              <span class="animate-pulse absolute inline-flex h-6 w-6 rounded-full bg-rose-500/30"></span>
              <div class="relative flex items-center justify-center bg-rose-500 text-white rounded-full p-1.5 shadow-lg border border-rose-400">
                <svg xmlns="http://www.w3.org/2005/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.54 20.193 4 14.99 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const drawOnlyDestination = () => {
          mapInstance.setView([latitude, longitude], 15);
          L.marker([latitude, longitude], { icon: destinationIcon })
            .addTo(mapInstance)
            .bindPopup(`<div class="p-1 font-sans text-slate-800"><h5 class="font-bold text-[11px]">${activeTask.property.name}</h5><p class="text-[9px] text-slate-400">${activeTask.property.address}</p></div>`);
        };

        const drawFallback = (currentLat: number, currentLng: number) => {
          // Draw dashed red line connecting positions if routing API fails
          L.polyline([[currentLat, currentLng], [latitude, longitude]], {
            color: '#ef4444',
            weight: 3,
            dashArray: '5, 5',
            opacity: 0.7
          }).addTo(mapInstance);

          L.marker([currentLat, currentLng], { icon: userIcon })
            .addTo(mapInstance)
            .bindPopup('<span class="text-xs font-bold text-slate-800">Posisi Anda</span>');

          L.marker([latitude, longitude], { icon: destinationIcon })
            .addTo(mapInstance)
            .bindPopup(`<div class="p-1 font-sans text-slate-800"><h5 class="font-bold text-[11px]">${activeTask.property.name}</h5><p class="text-[9px] text-slate-400">${activeTask.property.address}</p></div>`);

          const bounds = L.latLngBounds([
            [currentLat, currentLng],
            [latitude, longitude]
          ]);
          mapInstance.fitBounds(bounds, { padding: [30, 30] });
        };

        // Try to obtain current position for routing
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const currentLat = position.coords.latitude;
              const currentLng = position.coords.longitude;

              try {
                // Fetch driving route coordinates from OSRM
                const response = await fetch(
                  `https://router.project-osrm.org/route/v1/driving/${currentLng},${currentLat};${longitude},${latitude}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                  const coords = data.routes[0].geometry.coordinates.map(
                    (c: number[]) => [c[1], c[0]] // Swap to [lat, lng]
                  );

                  // Draw driving route polyline
                  L.polyline(coords, {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.85,
                    lineJoin: 'round'
                  }).addTo(mapInstance);

                  // Add user and destination markers
                  L.marker([currentLat, currentLng], { icon: userIcon })
                    .addTo(mapInstance)
                    .bindPopup('<span class="text-xs font-bold text-slate-800">Posisi Anda</span>');

                  L.marker([latitude, longitude], { icon: destinationIcon })
                    .addTo(mapInstance)
                    .bindPopup(`<div class="p-1 font-sans text-slate-800"><h5 class="font-bold text-[11px]">${activeTask.property.name}</h5><p class="text-[9px] text-slate-400">${activeTask.property.address}</p></div>`);

                  const bounds = L.latLngBounds([
                    [currentLat, currentLng],
                    [latitude, longitude]
                  ]);
                  mapInstance.fitBounds(bounds, { padding: [35, 35] });
                } else {
                  drawFallback(currentLat, currentLng);
                }
              } catch (err) {
                console.warn('Failed to fetch OSRM route, fallback to straight line:', err);
                drawFallback(currentLat, currentLng);
              }
            },
            (err) => {
              console.warn('Geolocation denied or failed, showing destination only:', err);
              drawOnlyDestination();
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          drawOnlyDestination();
        }

        mapInstance.invalidateSize();
        setTimeout(() => mapInstance.invalidateSize(), 150);

        (window as any).currentTaskMap = mapInstance;
      }, 100);

      return () => {
        clearTimeout(timer);
        const mapInst = (window as any).currentTaskMap;
        if (mapInst) {
          mapInst.remove();
          (window as any).currentTaskMap = null;
        }
      };
    }
  }, [mapReady, activeTask]);

  // Inspector logic actions
  const handleSelectTask = async (inspection: any) => {
    setActiveTask(inspection);
    setTdsInput(inspection.tds_value !== null ? String(inspection.tds_value) : '');
    setInternetInput(inspection.internet_speed !== null ? String(inspection.internet_speed) : '');
    setAuditError('');
    setCurrentStep(0);

    const initialEval: Record<string, boolean> = {};
    if (inspection.inspector_data?.fasilitas) {
      Object.keys(inspection.inspector_data.fasilitas).forEach((key) => {
        initialEval[key] = inspection.inspector_data.fasilitas[key]?.ada === true;
      });
    } else {
      const claimFasilitas = inspection.property?.claim_data?.fasilitas || {};
      Object.keys(claimFasilitas).forEach((key) => {
        if (claimFasilitas[key]?.ada !== undefined) {
          initialEval[key] = claimFasilitas[key].ada;
        }
      });
    }
    setEvaluations(initialEval);

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

  const handleAcceptOrder = async (inspectionId: string) => {
    try {
      setAcceptingTaskLoading((prev) => ({ ...prev, [inspectionId]: true }));
      await api.patch(`/inspections/${inspectionId}/status`, {
        status: 'assigned',
      });
      await fetchInspections();
    } catch (err) {
      console.error('Failed to accept order:', err);
    } finally {
      setAcceptingTaskLoading((prev) => ({ ...prev, [inspectionId]: false }));
    }
  };

  const handleUploadPhotoForCategory = async (category: string, file: File) => {
    if (!activeTask) return;
    setUploadLoadingState((prev) => ({ ...prev, [category]: true }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('room_type', category);

    try {
      await api.post(`/inspections/${activeTask.inspection_id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await api.get(`/inspections/${activeTask.inspection_id}/photos`);
      setTaskPhotos(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengunggah foto');
    } finally {
      setUploadLoadingState((prev) => ({ ...prev, [category]: false }));
    }
  };

  const handleUploadVideoForCategory = async (category: string, file: File) => {
    if (!activeTask) return;
    const videoCategory = category + '_video';
    setUploadLoadingState((prev) => ({ ...prev, [videoCategory]: true }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('room_type', videoCategory);

    try {
      await api.post(`/inspections/${activeTask.inspection_id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await api.get(`/inspections/${activeTask.inspection_id}/photos`);
      setTaskPhotos(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengunggah video');
    } finally {
      setUploadLoadingState((prev) => ({ ...prev, [videoCategory]: false }));
    }
  };

  const handleSaveStepProgress = async (nextStepIndex?: number) => {
    if (!activeTask) return;
    setTechSaving(true);
    setAuditError('');

    const payloadInspectorData = {
      fasilitas: Object.keys(evaluations).reduce((acc, key) => {
        acc[key] = { ada: evaluations[key] };
        return acc;
      }, {} as Record<string, any>),
    };

    try {
      const updated = await api.patch(`/inspections/${activeTask.inspection_id}/teknis`, {
        tds_value: Number(tdsInput || 0),
        internet_speed: Number(internetInput || 0),
        inspector_data: payloadInspectorData,
      });
      
      setActiveTask(updated.data);
      
      if (nextStepIndex !== undefined) {
        setCurrentStep(nextStepIndex);
      } else {
        alert('Data progres berhasil disimpan!');
      }
    } catch (err: any) {
      console.error(err);
      setAuditError(err.response?.data?.message || 'Gagal menyimpan progres data.');
    } finally {
      setTechSaving(false);
    }
  };

  const handleRunAudit = async () => {
    if (!activeTask) return;
    setAuditRunning(true);
    setAuditError('');

    const payloadInspectorData = {
      fasilitas: Object.keys(evaluations).reduce((acc, key) => {
        acc[key] = { ada: evaluations[key] };
        return acc;
      }, {} as Record<string, any>),
    };

    try {
      await api.patch(`/inspections/${activeTask.inspection_id}/teknis`, {
        tds_value: Number(tdsInput || 0),
        internet_speed: Number(internetInput || 0),
        inspector_data: payloadInspectorData,
      });

      await api.post(`/audit/${activeTask.inspection_id}/run`);
      await fetchInspections();
      
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

  const displayedInspections = activeTabInspector === 'my_tasks'
    ? inspections.filter(i => i.inspector_id !== null)
    : inspections.filter(i => i.inspector_id === null);

  const auditedInspections = inspections.filter(i => i.status === 'completed' && i.audit_report);
  const totalAudited = auditedInspections.length;

  const avgTds = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.tds_value || 0), 0) / totalAudited 
    : 0;
  const avgSpeed = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.internet_speed || 0), 0) / totalAudited 
    : 0;

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col flex-1">
        {/* Navbar */}
        <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <img src="/logo.webp" alt="InspeksiKos Logo" className="h-14 w-auto object-contain" />
              </Link>
              <span className="text-[9px] px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-extrabold rounded-md uppercase tracking-wider font-mono">
                inspektur
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-705 font-mono">
                  {email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer active:scale-[0.98] shadow-sm font-mono"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Welcome banner */}
        <div className="relative bg-slate-100 border-b border-slate-200/60 py-10 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 text-left">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold bg-blue-950/50 px-2 py-1 rounded border border-blue-900/55 block w-fit mb-2">Panel Dasbor Utama</span>
              <h1 className="text-2xl md:text-3xl font-black mb-1 text-slate-800">
                Selamat Datang, {email?.split('@')[0]}!
              </h1>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                Daftar kerja verifikator lapangan. Isi data TDS air, kecepatan internet, unggah bukti visual, dan jalankan audit AI.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-400 font-mono">Memuat database...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Tasks List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-blue-500" />
                      Daftar Permintaan Inspeksi ({displayedInspections.length})
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTabInspector('my_tasks');
                            setActiveTask(null);
                          }}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                            activeTabInspector === 'my_tasks'
                              ? 'bg-blue-650 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          📋 Tugas Saya
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTabInspector('available_orders');
                            setActiveTask(null);
                          }}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                            activeTabInspector === 'available_orders'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🔔 Orderan Baru
                        </button>
                      </div>
                      <button
                        onClick={() => fetchInspections(false)}
                        className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 border border-slate-200 hover:border-slate-200 transition-all cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {displayedInspections.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                      <Building className="h-10 w-10 text-slate-350 mx-auto mb-3" />
                      <p className="text-xs font-bold text-slate-500 mb-1">Belum Ada Sesi Inspeksi</p>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        {activeTabInspector === 'my_tasks'
                          ? 'Tidak ada tugas verifikasi aktif yang sedang Anda tangani.'
                          : 'Tidak ada pesanan inspeksi baru yang tersedia saat ini.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedInspections.map((insp: any) => {
                        const isActive = activeTask?.inspection_id === insp.inspection_id;
                        const isUnassigned = insp.inspector_id === null;
                        return (
                          <div
                            key={insp.inspection_id}
                            className={`p-4 rounded-xl border transition-all text-left ${
                              isActive
                                ? 'border-blue-500 bg-blue-50/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.1)]'
                                : isUnassigned
                                ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                                : 'border-slate-200 bg-slate-50/60 hover:border-slate-200/80'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-800">
                                    {insp.property?.name || 'Properti Tanpa Nama'}
                                  </span>
                                  {isUnassigned ? (
                                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                                      Tersedia (Gojek Match)
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                        insp.status === 'completed'
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                          : insp.status === 'in_progress'
                                          ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                                      }`}
                                    >
                                      {insp.status === 'completed'
                                        ? 'Selesai'
                                        : insp.status === 'in_progress'
                                        ? 'Proses'
                                        : 'Ditugaskan'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-slate-400" />
                                  {insp.property?.address}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[9px] text-slate-400 font-mono pt-1">
                                  <span>
                                    Tgl: {new Date(insp.assigned_at).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                {isUnassigned ? (
                                  <button
                                    onClick={() => handleAcceptOrder(insp.inspection_id)}
                                    disabled={acceptingTaskLoading[insp.inspection_id]}
                                    className="px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 disabled:bg-amber-100 text-slate-800 rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-1 hover:scale-[1.02]"
                                  >
                                    {acceptingTaskLoading[insp.inspection_id] ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : '⚡ Terima Orderan'}
                                  </button>
                                ) : (
                                  <>
                                    {insp.status !== 'completed' && !isActive && (
                                      <button
                                        onClick={() => handleSelectTask(insp)}
                                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer text-slate-700"
                                      >
                                        Buka Kerja
                                      </button>
                                    )}
                                    {isActive && (
                                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" /> SEDANG AKTIF
                                      </span>
                                    )}
                                  </>
                                )}

                                {insp.status === 'completed' && (
                                  <button
                                    onClick={() => onViewReport(insp)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-650 transition-all cursor-pointer shadow-sm"
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

              {/* Right Column - Inspector Active Task Audit Panel */}
              <div className="space-y-6">
                {activeTask ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden text-left text-slate-800">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
                    
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Inspeksi Lapangan Aktif
                        </h3>
                        <p className="text-[11px] text-blue-600 font-bold mt-1">
                          {activeTask.property?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTask(null)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-all uppercase tracking-wider cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>

                    {activeTask.status === 'assigned' ? (
                      <div className="text-center py-6 space-y-4">
                        <p className="text-xs text-slate-500 leading-relaxed px-2">
                          Tekan mulai untuk memicu status kerja lapangan, mengaktifkan formulir input teknis, dan mengunggah bukti media.
                        </p>
                        <button
                          onClick={() => handleStartTask(activeTask.inspection_id)}
                          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          Mulai Kerja Lapangan
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Task Map */}
                        {activeTask.property?.claim_data?.location && (
                          <div className="border-b border-slate-200/80 pb-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-red-550" />
                                Lokasi Kos Rute Lapangan
                              </span>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${activeTask.property.claim_data.location.latitude},${activeTask.property.claim_data.location.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-blue-500 hover:underline font-bold"
                              >
                                🚀 Google Maps
                              </a>
                            </h4>
                            <div
                              id="task-map-container"
                              className="w-full h-56 rounded-xl overflow-hidden bg-gray-900 border border-slate-200 z-10 shadow-inner"
                              style={{ minHeight: '224px' }}
                            />
                          </div>
                        )}

                        {/* Stepper Steps Navigation */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/60 scrollbar-none">
                          {activeSteps.map((step, idx) => (
                            <button
                              key={step.key}
                              type="button"
                              onClick={() => setCurrentStep(idx)}
                              className={`text-[9px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all uppercase tracking-wider border shrink-0 cursor-pointer ${
                                idx === currentStep
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                  : idx < currentStep
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-655'
                              }`}
                            >
                              {idx + 1}. {step.label}
                            </button>
                          ))}
                        </div>

                        {/* Active step form inputs */}
                        {currentActiveStep && (
                          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-605 uppercase tracking-wider">
                                  Lgkh {currentStep + 1} / {activeSteps.length}: {currentActiveStep.label}
                                </h4>
                                <p className="text-[9px] text-slate-400 mt-0.5">{currentActiveStep.desc}</p>
                              </div>
                              <div>
                                {currentActiveStep.type === 'boolean' ? (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wide">
                                    Klaim: ADA
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-805 border border-indigo-200 uppercase tracking-wide">
                                    Klaim: {activeTask.property?.claim_data?.fasilitas?.[currentActiveStep.key]?.nilai} {currentActiveStep.key === 'kualitas_air' ? 'ppm' : 'Mbps'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Penilaian input */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Hasil Penilaian Lapangan
                              </label>
                              {currentActiveStep.type === 'boolean' ? (
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEvaluations(prev => ({ ...prev, [currentActiveStep.key]: true }))}
                                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                      evaluations[currentActiveStep.key] === true
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-805 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Ada
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEvaluations(prev => ({ ...prev, [currentActiveStep.key]: false }))}
                                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                      evaluations[currentActiveStep.key] === false
                                        ? 'border-red-500 bg-red-50 text-red-805 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Tidak Ada
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  {currentActiveStep.key === 'kualitas_air' ? (
                                    <div className="relative">
                                      <Droplets className="absolute left-3 top-2.5 h-3.5 w-3.5 text-blue-400" />
                                      <input
                                        type="number"
                                        required
                                        value={tdsInput}
                                        onChange={(e) => setTdsInput(e.target.value)}
                                        placeholder="Masukkan kadar air TDS (contoh: 120)"
                                        className="w-full pl-9 pr-12 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                                      />
                                      <span className="absolute right-3 top-2.5 text-[9px] font-bold text-slate-400">ppm</span>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <Wifi className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-500" />
                                      <input
                                        type="number"
                                        required
                                        value={internetInput}
                                        onChange={(e) => setInternetInput(e.target.value)}
                                        placeholder="Masukkan internet speedtest (contoh: 30)"
                                        className="w-full pl-9 pr-12 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 focus:outline-none"
                                      />
                                      <span className="absolute right-3 top-2.5 text-[9px] font-bold text-slate-400">Mbps</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Foto & Video Upload */}
                            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-200">
                              {/* Foto Bukti */}
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Upload className="h-3 w-3 text-blue-400" />
                                  Foto Bukti Lapangan
                                </label>
                                {(() => {
                                  const uploadedPhoto = taskPhotos.find(p => p.room_type === currentActiveStep.key);
                                  const isUploading = uploadLoadingState[currentActiveStep.key];
                                  
                                  if (uploadedPhoto) {
                                    return (
                                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="relative h-10 w-10 rounded-lg border border-slate-200 overflow-hidden bg-gray-900 group cursor-pointer" onClick={() => window.open(uploadedPhoto.photo_url, '_blank')}>
                                            <img src={uploadedPhoto.photo_url} alt={currentActiveStep.label} className="h-full w-full object-cover" />
                                          </div>
                                          <div>
                                            <p className="text-[9px] font-bold text-slate-600 truncate max-w-[80px]">Foto Tersimpan</p>
                                          </div>
                                        </div>
                                        <label className="cursor-pointer px-2.5 py-1.5 text-[9px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-lg text-slate-600 transition-all">
                                          {isUploading ? 'Mengunggah...' : 'Ubah Foto'}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            disabled={isUploading}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadPhotoForCategory(currentActiveStep.key, file);
                                            }}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <label className="cursor-pointer flex flex-col items-center justify-center p-3 border border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/30 hover:bg-blue-50/5 rounded-xl transition-all h-20 text-center">
                                        {isUploading ? (
                                          <>
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mb-1" />
                                            <span className="text-[8px] font-bold text-slate-400 font-mono">Mengunggah...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="h-4 w-4 text-slate-400 mb-1" />
                                            <span className="text-[9px] font-bold text-slate-600">Unggah Foto Aktual</span>
                                          </>
                                        )}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          disabled={isUploading}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadPhotoForCategory(currentActiveStep.key, file);
                                          }}
                                          className="hidden"
                                        />
                                      </label>
                                    );
                                  }
                                })()}
                              </div>

                              {/* Video Bukti */}
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Upload className="h-3 w-3 text-purple-400" />
                                  Video Bukti Lapangan
                                </label>
                                {(() => {
                                  const videoKey = currentActiveStep.key + '_video';
                                  const uploadedVideo = taskPhotos.find(p => p.room_type === videoKey);
                                  const isUploading = uploadLoadingState[videoKey];

                                  if (uploadedVideo) {
                                    return (
                                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="relative h-10 w-10 rounded-lg border border-slate-200 overflow-hidden bg-black group cursor-pointer" onClick={() => window.open(uploadedVideo.photo_url, '_blank')}>
                                            <video src={uploadedVideo.photo_url} className="h-full w-full object-cover" />
                                          </div>
                                          <div>
                                            <p className="text-[9px] font-bold text-slate-600 truncate max-w-[80px]">Video Tersimpan</p>
                                          </div>
                                        </div>
                                        <label className="cursor-pointer px-2.5 py-1.5 text-[9px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-lg text-slate-600 transition-all">
                                          {isUploading ? 'Mengunggah...' : 'Ubah Video'}
                                          <input
                                            type="file"
                                            accept="video/*"
                                            disabled={isUploading}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadVideoForCategory(currentActiveStep.key, file);
                                            }}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <label className="cursor-pointer flex flex-col items-center justify-center p-3 border border-dashed border-slate-200 hover:border-purple-500 bg-slate-50/30 hover:bg-purple-50/5 rounded-xl transition-all h-20 text-center">
                                        {isUploading ? (
                                          <>
                                            <Loader2 className="h-4 w-4 animate-spin text-purple-500 mb-1" />
                                            <span className="text-[8px] font-bold text-slate-400 font-mono">Mengunggah...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="h-4 w-4 text-slate-400 mb-1" />
                                            <span className="text-[9px] font-bold text-slate-600">Unggah Video Aktual</span>
                                          </>
                                        )}
                                        <input
                                          type="file"
                                          accept="video/*"
                                          disabled={isUploading}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadVideoForCategory(currentActiveStep.key, file);
                                          }}
                                          className="hidden"
                                        />
                                      </label>
                                    );
                                  }
                                })()}
                              </div>
                            </div>

                            {/* Stepper wizard navigation actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2">
                              <button
                                type="button"
                                disabled={currentStep === 0 || techSaving}
                                onClick={() => handleSaveStepProgress(currentStep - 1)}
                                className="px-3.5 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-[10px] font-bold disabled:opacity-30 transition-all cursor-pointer uppercase tracking-wider"
                              >
                                Sebelumnya
                              </button>

                              {currentStep < activeSteps.length - 1 ? (
                                <button
                                  type="button"
                                  disabled={techSaving}
                                  onClick={() => handleSaveStepProgress(currentStep + 1)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                                >
                                  {techSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                                  Lanjut
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={techSaving}
                                  onClick={() => handleSaveStepProgress()}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                                >
                                  {techSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                                  Simpan Final
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* FINAL RUN AUDIT SECTION */}
                        {currentStep === activeSteps.length - 1 && (
                          <div className="border-t border-slate-200 pt-4 space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-505 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Langkah Akhir: Evaluasi
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                              Menjalankan deteksi AI Vision pada berkas bukti visual dan menghitung skor akhir berdasarkan bobot kepatuhan.
                            </p>
                            {auditError && (
                              <div className="p-2.5 text-[10px] text-red-500 bg-rose-50 border border-rose-200 rounded-lg">
                                {auditError}
                              </div>
                            )}
                            <button
                              onClick={handleRunAudit}
                              disabled={auditRunning || techSaving}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                            >
                              {auditRunning ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Memproses AI & Aturan...
                                </>
                              ) : (
                                'Jalankan Evaluasi & Selesaikan'
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/70 border border-slate-200/85 rounded-2xl p-8 shadow-xl backdrop-blur-md text-center py-12 text-slate-650">
                    <Compass className="h-8 w-8 text-slate-400 mx-auto mb-3 animate-spin" style={{ animationDuration: '6s' }} />
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Pilih Sesi Kerja</h3>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                      Pilih salah satu tugas dari daftar di samping untuk memulai pengisian berkas audit lapangan.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>

      {/* MOBILE VIEWPORT */}
      <div className="block md:hidden flex-1 flex flex-col min-h-screen bg-slate-50 relative pb-20">
        {/* Mobile Top App Bar */}
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <img src="/logo.webp" alt="InspeksiKos Logo" className="h-10 w-auto object-contain" />
            </Link>
            <span className="text-[8px] px-1.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-extrabold rounded-md uppercase tracking-wider font-mono">
              inspektur
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#003057] text-white flex items-center justify-center font-bold text-xs shadow-md border border-slate-200 uppercase">
            {email ? email.substring(0, 2).toUpperCase() : 'IS'}
          </div>
        </header>

        {/* Mobile Main Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-400 font-mono">Memuat Dasbor...</span>
            </div>
          ) : (
            <>
              {mobileTab === 'home' && (
                <div className="space-y-5 text-slate-805">
                  {activeTask ? (
                    // ACTIVE STEP WIZARD ON MOBILE
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-5 text-left">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <span className="text-[8px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-black font-mono">STEP {currentStep + 1} OF {activeSteps.length + 1}</span>
                          <h3 className="text-xs font-black text-slate-800 mt-1.5 truncate max-w-[180px]">{activeTask.property?.name}</h3>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Batal mengedit audit lapangan? Progres tersimpan akan dipertahankan.")) {
                              setActiveTask(null);
                            }
                          }}
                          className="text-[9px] font-extrabold text-slate-400 hover:text-slate-600 uppercase tracking-wider cursor-pointer"
                        >
                          Keluar
                        </button>
                      </div>

                      {currentStep < activeSteps.length ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-black text-[#003057]">{currentActiveStep.label}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{currentActiveStep.desc}</p>
                          </div>

                          {currentActiveStep.type === 'boolean' ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Status Keberadaan Fasilitas</label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setEvaluations(prev => ({ ...prev, [currentActiveStep.key]: true }))}
                                    className={`py-2 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                                      evaluations[currentActiveStep.key] === true
                                        ? 'bg-blue-600 border-blue-600 text-white shadow'
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                    }`}
                                  >
                                    ✓ Ada
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEvaluations(prev => ({ ...prev, [currentActiveStep.key]: false }))}
                                    className={`py-2 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                                      evaluations[currentActiveStep.key] === false
                                        ? 'bg-rose-600 border-rose-600 text-white shadow'
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                    }`}
                                  >
                                    ✗ Tidak Ada
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Unggah Foto Bukti Lapangan</label>
                                <div className="flex items-center gap-3">
                                  <label className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Pilih Foto</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadPhotoForCategory(currentActiveStep.key, file);
                                      }}
                                    />
                                  </label>
                                  {taskPhotos.find(p => p.room_type === currentActiveStep.key) ? (
                                    <div className="h-16 w-16 rounded-xl overflow-hidden border border-emerald-500 relative bg-slate-100 shrink-0 shadow-sm flex items-center justify-center">
                                      <img
                                        src={taskPhotos.find(p => p.room_type === currentActiveStep.key)?.photo_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white text-[8px] font-black">
                                        ✓ OK
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-16 w-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 text-[18px] shrink-0">
                                      📷
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : currentActiveStep.key === 'kualitas_air' ? (
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Hasil Ukur TDS (ppm)</label>
                                <input
                                  type="number"
                                  value={tdsInput}
                                  onChange={(e) => setTdsInput(e.target.value)}
                                  placeholder="Masukkan nilai TDS, contoh: 120"
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Foto Alat Ukur TDS Lapangan</label>
                                <div className="flex items-center gap-3">
                                  <label className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Pilih Foto TDS</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadPhotoForCategory('kualitas_air', file);
                                      }}
                                    />
                                  </label>
                                  {taskPhotos.find(p => p.room_type === 'kualitas_air') ? (
                                    <div className="h-16 w-16 rounded-xl overflow-hidden border border-emerald-500 relative bg-slate-100 shrink-0 shadow-sm flex items-center justify-center">
                                      <img
                                        src={taskPhotos.find(p => p.room_type === 'kualitas_air')?.photo_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white text-[8px] font-black font-mono">
                                        ✓ OK
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-16 w-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 text-[18px] shrink-0">
                                      📷
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Hasil Ukur Internet (Mbps)</label>
                                <input
                                  type="number"
                                  value={internetInput}
                                  onChange={(e) => setInternetInput(e.target.value)}
                                  placeholder="Masukkan Kecepatan Internet, contoh: 24"
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Video Bukti Speedtest Kamar</label>
                                <div className="flex items-center gap-3">
                                  <label className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Pilih Video</span>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadVideoForCategory('kecepatan_internet', file);
                                      }}
                                    />
                                  </label>
                                  {taskPhotos.find(p => p.room_type === 'kecepatan_internet_video') ? (
                                    <div className="h-16 w-16 rounded-xl overflow-hidden border border-emerald-500 relative bg-slate-100 shrink-0 shadow-sm flex flex-col items-center justify-center">
                                      <span className="text-[12px]">📹</span>
                                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white text-[8px] font-black font-mono">
                                        ✓ OK
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-16 w-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 text-[18px] shrink-0">
                                      🎥
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {auditError && (
                            <div className="p-3 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                              ⚠️ {auditError}
                            </div>
                          )}

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              disabled={currentStep === 0}
                              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                              className="px-4 py-2.5 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-xl transition-all disabled:opacity-40"
                            >
                              Kembali
                            </button>
                            <button
                              type="button"
                              disabled={techSaving}
                              onClick={() => handleSaveStepProgress(currentStep + 1)}
                              className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              {techSaving ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Menyimpan...
                                </>
                              ) : (
                                'Simpan & Lanjut'
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        // STEP FINAL
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <h4 className="text-xs font-black text-slate-800">Semua Data Siap Di-Audit</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Bukti foto fasilitas, TDS air, dan video speedtest wifi telah lengkap terkumpul di lapangan. Silakan jalankan validasi AI.
                            </p>
                          </div>

                          {auditError && (
                            <div className="p-3 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                              ⚠️ {auditError}
                            </div>
                          )}

                          <div className="pt-2">
                            <button
                              type="button"
                              disabled={auditRunning || techSaving}
                              onClick={handleRunAudit}
                              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-650 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                            >
                              {auditRunning ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                                  Gemini AI Sedang Menilai...
                                </>
                              ) : (
                                '⚡ Jalankan Validasi AI & Selesaikan'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // INSPECTOR MOBILE LISTINGS
                    <div className="space-y-4">
                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Verified</span>
                          <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">{auditedInspections.length} Kos</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Rata TDS</span>
                          <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">{avgTds.toFixed(0)} ppm</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Rata Speed</span>
                          <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">{avgSpeed.toFixed(0)} Mbps</span>
                        </div>
                      </div>

                      {/* Tab toggles */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTabInspector('my_tasks');
                            setActiveTask(null);
                          }}
                          className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            activeTabInspector === 'my_tasks'
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          📋 Tugas Saya
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTabInspector('available_orders');
                            setActiveTask(null);
                          }}
                          className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            activeTabInspector === 'available_orders'
                              ? 'bg-amber-500 text-white shadow'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🔔 Orderan Baru
                        </button>
                      </div>

                      {/* Tasks lists */}
                      <div className="space-y-3">
                        {displayedInspections.length === 0 ? (
                          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6 text-slate-500">
                            <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-500 mb-1">Tidak Ada Tugas</p>
                            <p className="text-[9px] text-slate-405 max-w-xs mx-auto">
                              {activeTabInspector === 'my_tasks'
                                ? 'Belum ada tugas lapangan yang ditugaskan ke Anda.'
                                : 'Belum ada pesanan verifikasi baru yang masuk di Padang.'}
                            </p>
                          </div>
                        ) : (
                          displayedInspections.map((insp: any) => (
                            <div key={insp.inspection_id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-left space-y-3">
                              <div>
                                <div className="flex items-center justify-between gap-3 mb-1">
                                  <h4 className="text-xs font-black text-slate-800 truncate max-w-[170px]">{insp.property?.name}</h4>
                                  <span className="text-[8px] font-mono text-slate-400 font-semibold">ID: #{insp.inspection_id.substring(0, 8).toUpperCase()}</span>
                                </div>
                                <p className="text-[9px] text-slate-500 leading-normal flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{insp.property?.address}</span>
                                </p>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                                {activeTabInspector === 'my_tasks' ? (
                                  insp.status === 'assigned' ? (
                                    <button
                                      onClick={() => handleStartTask(insp.inspection_id)}
                                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-650 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg shadow cursor-pointer"
                                    >
                                      Mulai Kerja Lapangan
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleSelectTask(insp)}
                                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-650 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg shadow cursor-pointer"
                                    >
                                      Jalankan Audit
                                    </button>
                                  )
                                ) : (
                                  <button
                                    disabled={acceptingTaskLoading[insp.inspection_id]}
                                    onClick={() => handleAcceptOrder(insp.inspection_id)}
                                    className="w-full py-2 bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg shadow cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    {acceptingTaskLoading[insp.inspection_id] ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      'Ambil Tugas Lapangan'
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* HELP & SUPPORT TAB */}
              {mobileTab === 'bantuan' && (
                <div className="space-y-5 text-left text-slate-800">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">Hubungi CS InspeksiKos</h4>
                      <p className="text-[9px] text-slate-400">Verifikator Support di Padang.</p>
                    </div>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* ACCOUNT TAB */}
              {mobileTab === 'akun' && (
                <div className="space-y-5 text-left text-slate-805">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#003057] text-white flex items-center justify-center font-black text-sm uppercase shadow">
                      {email ? email.substring(0, 2).toUpperCase() : 'IS'}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{email}</h4>
                      <div className="flex gap-2 items-center">
                        <span className="text-[8px] px-1.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-extrabold rounded uppercase tracking-wider font-mono">
                          inspektur
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold font-mono">ID Inspektur aktif</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div
                      onClick={handleLogout}
                      className="px-4 py-3.5 flex items-center justify-between text-rose-600 hover:bg-rose-50 cursor-pointer active:scale-[0.99] transition-all"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 font-mono">
                        <LogOut className="h-3.5 w-3.5" /> Keluar dari Dasbor
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-rose-405" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Navigation bar */}
        <nav className="w-full h-16 bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around shadow-lg px-2">
          <button
            onClick={() => setMobileTab('home')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'home' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Tugas</span>
          </button>

          <button
            onClick={() => setMobileTab('bantuan')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'bantuan' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Compass className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Bantuan</span>
          </button>

          <button
            onClick={() => setMobileTab('akun')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              mobileTab === 'akun' ? 'text-blue-600 scale-102 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <User className="h-4.5 w-4.5" />
            <span className="text-[8px] font-extrabold uppercase tracking-wide">Akun</span>
          </button>
        </nav>
      </div>
    </>
  );
}
