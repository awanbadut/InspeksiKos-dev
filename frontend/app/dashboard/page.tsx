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
  Sparkles,
  ChevronRight,
  Send,
  User,
  Compass,
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
  const [uploadLoadingState, setUploadLoadingState] = useState<Record<string, boolean>>({});
  const [taskPhotos, setTaskPhotos] = useState<any[]>([]);
  const [tdsInput, setTdsInput] = useState('');
  const [internetInput, setInternetInput] = useState('');
  const [techSaving, setTechSaving] = useState(false);
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [evaluations, setEvaluations] = useState<Record<string, boolean>>({});

  // Chatbot states
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

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

  // Check if Leaflet is ready (loaded globally in layout.tsx)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ((window as any).L) {
      setMapReady(true);
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).L) {
          setMapReady(true);
          clearInterval(checkInterval);
        }
      }, 50);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Interactive All-Audited-Properties Map for Students
  useEffect(() => {
    if (mapReady && role === 'mahasiswa' && inspections.length > 0) {
      const timer = setTimeout(() => {
        const L = (window as any).L;
        if (!L) return;

        const completedWithLocation = inspections.filter(
          (insp) => insp.status === 'completed' && insp.property?.claim_data?.location?.latitude
        );

        const mapContainer = document.getElementById('all-properties-map-container');
        if (!mapContainer || completedWithLocation.length === 0) return;

        const defaultLat = -0.9471;
        const defaultLng = 100.4172;

        const mapInstance = L.map('all-properties-map-container').setView([defaultLat, defaultLng], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapInstance);

        const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        completedWithLocation.forEach((insp) => {
          const { latitude, longitude } = insp.property.claim_data.location;
          const score = insp.audit_report?.score || 0;
          const conf = insp.audit_report?.confidence_level || 'UNKNOWN';

          const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapInstance);
          
          const popupContent = `
            <div style="font-family: sans-serif; padding: 4px; min-width: 140px; color: #1e293b;">
              <h5 style="margin: 0 0 3px 0; font-size: 11px; font-weight: 850; color: #0f172a;">${insp.property.name}</h5>
              <p style="margin: 0 0 6px 0; font-size: 9px; color: #64748b; line-height: 1.3;">${insp.property.address}</p>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 9px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 1px 4px; border-radius: 4px; border: 1px solid #bfdbfe;">
                  Skor: ${score}%
                </span>
                <span style="font-size: 8px; font-weight: 700; color: #475569; text-transform: uppercase;">
                  ${conf.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
        });

        mapInstance.invalidateSize();
        setTimeout(() => mapInstance.invalidateSize(), 150);

        (window as any).currentDashboardMap = mapInstance;
      }, 200);

      return () => {
        clearTimeout(timer);
        const mapInst = (window as any).currentDashboardMap;
        if (mapInst) {
          mapInst.remove();
          (window as any).currentDashboardMap = null;
        }
      };
    }
  }, [mapReady, inspections, role]);

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

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapInstance);

        const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        let markerInstance = L.marker([initialLat, initialLng], { icon: customIcon }).addTo(mapInstance);

        mapInstance.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setSelectedLat(lat);
          setSelectedLng(lng);
          markerInstance.setLatLng([lat, lng]);
        });

        mapInstance.invalidateSize();
        setTimeout(() => mapInstance.invalidateSize(), 150);

        (window as any).currentMapPicker = mapInstance;
      }, 100);

      return () => {
        clearTimeout(timer);
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

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapInstance);

        const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        L.marker([latitude, longitude], { icon: customIcon }).addTo(mapInstance);

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

      const propResponse = await api.post('/properties', {
        name: propertyName,
        address: propertyAddress,
        description: propertyDesc,
        claim_data,
      });

      const { property_id } = propResponse.data;

      await api.post('/inspections', { property_id });

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

  const handleViewReport = async (inspection: any) => {
    try {
      const res = await api.get(`/audit/${inspection.inspection_id}/report`);
      setSelectedInspection({
        ...inspection,
        audit_report: res.data,
      });
      setChatHistory([]);
      setShowChat(false);
      setChatMessage('');
      setShowReportModal(true);
    } catch (err) {
      console.error(err);
      alert('Laporan audit belum siap atau tidak ditemukan.');
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading || !selectedInspection) return;

    const userMsg = { role: 'user', parts: [{ text: chatMessage }] };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    const msgToSend = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    try {
      const res = await api.post(`/audit/${selectedInspection.inspection_id}/chat`, {
        message: msgToSend,
        history: chatHistory,
      });

      const modelMsg = { role: 'model', parts: [{ text: res.data.reply }] };
      setChatHistory([...newHistory, modelMsg]);
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const activeSteps = checkPoints.filter((cp) => {
    if (cp.type === 'technical') return true;
    return activeTask?.property?.claim_data?.fasilitas?.[cp.key]?.ada === true;
  });
  const currentActiveStep = activeSteps[currentStep];

  // Analytics calculations
  const auditedInspections = inspections.filter(i => i.status === 'completed' && i.audit_report);
  const totalAudited = auditedInspections.length;
  
  const validCount = auditedInspections.filter(i => i.audit_report.confidence_level === 'VALID').length;
  const partialCount = auditedInspections.filter(i => i.audit_report.confidence_level === 'PARTIAL_VALID').length;
  const fraudCount = auditedInspections.filter(i => i.audit_report.confidence_level === 'FATAL_FRAUD').length;

  const validPct = totalAudited > 0 ? (validCount / totalAudited) * 100 : 0;
  const partialPct = totalAudited > 0 ? (partialCount / totalAudited) * 100 : 0;
  const fraudPct = totalAudited > 0 ? (fraudCount / totalAudited) * 100 : 0;

  const avgTds = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.tds_value || 0), 0) / totalAudited 
    : 0;
  const avgSpeed = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.internet_speed || 0), 0) / totalAudited 
    : 0;
  const avgScore = totalAudited > 0 
    ? auditedInspections.reduce((acc, curr) => acc + Number(curr.audit_report.score || 0), 0) / totalAudited 
    : 0;

  const hasCompletedLocations = inspections.some(
    (i) => i.status === 'completed' && i.property?.claim_data?.location?.latitude
  );

  return (
    <div className="min-h-screen bg-[#080c14] text-gray-100 font-sans flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-0 right-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="relative bg-[#0c1220]/80 border-b border-gray-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <span className="text-base font-bold text-white">🏠</span>
          </Link>
          <div>
            <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
              InspeksiKos
            </span>
            <span className="ml-2 text-[9px] px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900/60 font-bold rounded-md uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f182c] border border-gray-800 rounded-xl hidden md:flex">
            <User className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-300">
              {email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-955/20 border border-transparent hover:border-red-900/30 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <div className="relative bg-[#0b111e] border-b border-gray-800/60 py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold bg-blue-950/50 px-2 py-1 rounded border border-blue-900/55 block w-fit mb-2">Panel Dasbor Utama</span>
            <h1 className="text-2xl md:text-3xl font-black mb-1 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Selamat Datang, {email?.split('@')[0]}!
            </h1>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              {role === 'mahasiswa'
                ? 'Kelola pengajuan verifikasi properti kos Anda di Kota Padang untuk memvalidasi fasilitas iklan secara transparan.'
                : 'Daftar kerja verifikator lapangan. Isi data TDS air, kecepatan internet, unggah bukti visual, dan jalankan audit AI.'}
            </p>
          </div>
          {role === 'mahasiswa' && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase px-5 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              Ajukan Inspeksi
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="text-xs font-semibold text-gray-500 font-mono">&gt; Memuat database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col (2 cols wide on desktop) - Map and Inspections List */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Interactive Leaflet Map for Student browsing */}
              {role === 'mahasiswa' && hasCompletedLocations && (
                <div className="bg-[#0c1220]/70 border border-gray-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-blue-500 animate-spin" style={{ animationDuration: '8s' }} />
                    Peta Sebaran Kos Terakreditasi di Kota Padang
                  </h2>
                  <div
                    id="all-properties-map-container"
                    className="w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-gray-950 border border-gray-850 z-10"
                    style={{ minHeight: '280px' }}
                  />
                </div>
              )}

              <div className="bg-[#0c1220]/70 border border-gray-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-500" />
                    Daftar Permintaan Inspeksi ({inspections.length})
                  </h2>
                  <button
                    onClick={fetchInspections}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#0f172a] border border-gray-850 hover:border-gray-800 transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {inspections.length === 0 ? (
                  <div className="text-center py-16 bg-[#090d16] rounded-xl border border-dashed border-gray-850">
                    <Building className="h-10 w-10 text-gray-650 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-400 mb-1">Belum Ada Sesi Inspeksi</p>
                    <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                      {role === 'mahasiswa'
                        ? 'Ajukan inspeksi kos pertama Anda dengan mengklik tombol "Ajukan Inspeksi" di pojok kanan atas.'
                        : 'Tidak ada tugas verifikasi yang ditugaskan kepada Anda saat ini.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inspections.map((insp: any) => {
                      const isActive = activeTask?.inspection_id === insp.inspection_id;
                      return (
                        <div
                          key={insp.inspection_id}
                          className={`p-4 rounded-xl border transition-all ${
                            isActive
                              ? 'border-blue-500 bg-blue-950/10 shadow-[0_0_15px_-3px_rgba(59,130,246,0.1)]'
                              : 'border-gray-800/80 bg-[#090e1a]/60 hover:border-gray-700/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white">
                                  {insp.property?.name || 'Properti Tanpa Nama'}
                                </span>
                                <span
                                  className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    insp.status === 'completed'
                                      ? 'bg-emerald-955 text-emerald-400 border border-emerald-900/50'
                                      : insp.status === 'in_progress'
                                      ? 'bg-blue-950 text-blue-400 border border-blue-900/60 animate-pulse'
                                      : 'bg-amber-955 text-amber-400 border border-amber-900/60'
                                  }`}
                                >
                                  {insp.status === 'completed'
                                    ? 'Selesai'
                                    : insp.status === 'in_progress'
                                    ? 'Proses'
                                    : 'Ditugaskan'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                {insp.property?.address}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[9px] text-gray-500 font-mono pt-1">
                                <span>
                                  Tgl: {new Date(insp.assigned_at).toLocaleDateString('id-ID')}
                                </span>
                                {insp.inspector && (
                                  <span>
                                    Verifikator: {insp.inspector.first_name} {insp.inspector.last_name}
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
                                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-gray-100 text-gray-955 rounded-lg transition-all cursor-pointer"
                                    >
                                      Buka Kerja
                                    </button>
                                  )}
                                  {isActive && (
                                    <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 bg-blue-950/40 border border-blue-900/40 px-2 py-1 rounded-md">
                                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" /> SEDANG AKTIF
                                    </span>
                                  )}
                                </>
                              )}

                              {insp.status === 'completed' && (
                                <button
                                  onClick={() => handleViewReport(insp)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-gray-800 bg-[#0e172a] hover:bg-gray-800 rounded-lg text-gray-300 transition-all cursor-pointer"
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
                <div className="bg-[#0c1220]/70 border border-blue-900/30 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                  
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
                  
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Inspeksi Lapangan Aktif
                      </h3>
                      <p className="text-[11px] text-blue-400 font-bold mt-1">
                        {activeTask.property?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTask(null)}
                      className="text-[10px] font-bold text-gray-500 hover:text-white transition-all uppercase tracking-wider"
                    >
                      Batal
                    </button>
                  </div>

                  {activeTask.status === 'assigned' ? (
                    <div className="text-center py-6 space-y-4">
                      <p className="text-xs text-gray-400 leading-relaxed px-2">
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
                      
                      {/* Navigation Map */}
                      {activeTask.property?.claim_data?.location && (
                        <div className="border-b border-gray-800/80 pb-4">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-red-500" />
                              Lokasi Kos Rute Lapangan
                            </span>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${activeTask.property.claim_data.location.latitude},${activeTask.property.claim_data.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-blue-400 hover:underline font-bold"
                            >
                              🚀 Google Maps
                            </a>
                          </h4>
                          <div
                            id="task-map-container"
                            className="w-full h-32 rounded-xl overflow-hidden bg-gray-900 border border-gray-850 z-10"
                            style={{ minHeight: '128px' }}
                          />
                        </div>
                      )}

                      {/* Step-by-Step Wizard Stepper */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-800/60 scrollbar-none">
                        {activeSteps.map((step, idx) => (
                          <button
                            key={step.key}
                            type="button"
                            onClick={() => setCurrentStep(idx)}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all uppercase tracking-wider border shrink-0 ${
                              idx === currentStep
                                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                : idx < currentStep
                                ? 'bg-emerald-955 border-emerald-900/40 text-emerald-400'
                                : 'bg-[#0f172a] border-gray-800 text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {idx + 1}. {step.label}
                          </button>
                        ))}
                      </div>

                      {/* Active Step Panel */}
                      {currentActiveStep && (
                        <div className="p-4 bg-[#0a0f1b]/50 rounded-xl border border-gray-855 space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-855 pb-2">
                            <div>
                              <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                                Lgkh {currentStep + 1} / {activeSteps.length}: {currentActiveStep.label}
                              </h4>
                              <p className="text-[9px] text-gray-500 mt-0.5">{currentActiveStep.desc}</p>
                            </div>
                            <div>
                              {currentActiveStep.type === 'boolean' ? (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-900/40 uppercase tracking-wide">
                                  Klaim: ADA
                                </span>
                              ) : (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-900/40 uppercase tracking-wide">
                                  Klaim: {activeTask.property?.claim_data?.fasilitas?.[currentActiveStep.key]?.nilai} {currentActiveStep.key === 'kualitas_air' ? 'ppm' : 'Mbps'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pilihan Penilaian */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
                              Hasil Penilaian Lapangan
                            </label>
                            {currentActiveStep.type === 'boolean' ? (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEvaluations(prev => ({ ...prev, [currentActiveStep.key]: true }))}
                                  className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    evaluations[currentActiveStep.key] === true
                                      ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400 shadow-sm'
                                      : 'border-gray-800 bg-[#0e1626] text-gray-400 hover:text-white'
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
                                      ? 'border-red-500/80 bg-red-955/20 text-red-400 shadow-sm'
                                      : 'border-gray-800 bg-[#0e1626] text-gray-400 hover:text-white'
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
                                      className="w-full pl-9 pr-12 py-2 bg-[#0e1626] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white"
                                    />
                                    <span className="absolute right-3 top-2.5 text-[9px] font-bold text-gray-500">ppm</span>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <Wifi className="absolute left-3 top-2.5 h-3.5 w-3.5 text-orange-400" />
                                    <input
                                      type="number"
                                      required
                                      value={internetInput}
                                      onChange={(e) => setInternetInput(e.target.value)}
                                      placeholder="Masukkan internet speedtest (contoh: 30)"
                                      className="w-full pl-9 pr-12 py-2 bg-[#0e1626] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white"
                                    />
                                    <span className="absolute right-3 top-2.5 text-[9px] font-bold text-gray-500">Mbps</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Unggah Bukti Media */}
                          <div className="grid grid-cols-1 gap-3 pt-2 border-t border-gray-855">
                            
                            {/* Foto Aktual */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Upload className="h-3 w-3 text-blue-400" />
                                Foto Bukti Lapangan
                              </label>
                              {(() => {
                                const uploadedPhoto = taskPhotos.find(p => p.room_type === currentActiveStep.key);
                                const isUploading = uploadLoadingState[currentActiveStep.key];
                                
                                if (uploadedPhoto) {
                                  return (
                                    <div className="p-2.5 bg-[#0a0e1a] border border-gray-800 rounded-xl flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="relative h-10 w-10 rounded-lg border border-gray-800 overflow-hidden bg-gray-900 group cursor-pointer" onClick={() => window.open(uploadedPhoto.photo_url, '_blank')}>
                                          <img src={uploadedPhoto.photo_url} alt={currentActiveStep.label} className="h-full w-full object-cover" />
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="h-3 w-3 text-white" />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-bold text-gray-300 truncate max-w-[80px]">Foto Tersimpan</p>
                                          <p className="text-[8px] text-gray-500">Bukti visual</p>
                                        </div>
                                      </div>
                                      <label className="cursor-pointer px-2.5 py-1.5 text-[9px] font-bold bg-[#0f172a] hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-300 transition-all">
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
                                    <label className="cursor-pointer flex flex-col items-center justify-center p-3 border border-dashed border-gray-800 hover:border-blue-500 bg-[#090e1a]/30 hover:bg-blue-955/5 rounded-xl transition-all h-20 text-center">
                                      {isUploading ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mb-1" />
                                          <span className="text-[8px] font-bold text-gray-500 font-mono">Mengunggah...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="h-4 w-4 text-gray-500 mb-1" />
                                          <span className="text-[9px] font-bold text-gray-300">Unggah Foto Aktual</span>
                                          <span className="text-[8px] text-gray-500">Format gambar JPEG, PNG, WEBP</span>
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

                            {/* Video Aktual */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Upload className="h-3 w-3 text-purple-400" />
                                Video Bukti Lapangan
                              </label>
                              {(() => {
                                const videoKey = currentActiveStep.key + '_video';
                                const uploadedVideo = taskPhotos.find(p => p.room_type === videoKey);
                                const isUploading = uploadLoadingState[videoKey];

                                if (uploadedVideo) {
                                  return (
                                    <div className="p-2.5 bg-[#0a0e1a] border border-gray-800 rounded-xl flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="relative h-10 w-10 rounded-lg border border-gray-800 overflow-hidden bg-black group cursor-pointer" onClick={() => window.open(uploadedVideo.photo_url, '_blank')}>
                                          <video src={uploadedVideo.photo_url} className="h-full w-full object-cover" />
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="h-3 w-3 text-white" />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-bold text-gray-300 truncate max-w-[80px]">Video Tersimpan</p>
                                          <p className="text-[8px] text-gray-500">Bukti video</p>
                                        </div>
                                      </div>
                                      <label className="cursor-pointer px-2.5 py-1.5 text-[9px] font-bold bg-[#0f172a] hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-300 transition-all">
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
                                    <label className="cursor-pointer flex flex-col items-center justify-center p-3 border border-dashed border-gray-800 hover:border-purple-500 bg-[#090e1a]/30 hover:bg-purple-955/5 rounded-xl transition-all h-20 text-center">
                                      {isUploading ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin text-purple-500 mb-1" />
                                          <span className="text-[8px] font-bold text-gray-500 font-mono">Mengunggah...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="h-4 w-4 text-gray-500 mb-1" />
                                          <span className="text-[9px] font-bold text-gray-300">Unggah Video Aktual</span>
                                          <span className="text-[8px] text-gray-500">Format MP4, MOV, WebM</span>
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

                          {/* Tombol Navigasi Wizard */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-855 gap-2">
                            <button
                              type="button"
                              disabled={currentStep === 0 || techSaving}
                              onClick={() => handleSaveStepProgress(currentStep - 1)}
                              className="px-3.5 py-2 border border-gray-800 bg-[#0f172a] hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg text-[10px] font-bold disabled:opacity-30 transition-all cursor-pointer uppercase tracking-wider"
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
                                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                              >
                                {techSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                                Simpan Final
                              </button>
                            )}
                          </div>

                        </div>
                      )}

                      {/* Run AI Scorecard Audit */}
                      {currentStep === activeSteps.length - 1 && (
                        <div className="border-t border-gray-855 pt-4 space-y-3">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Langkah Akhir: Evaluasi
                          </h4>
                          <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
                            Menjalankan deteksi AI Vision pada berkas bukti visual dan menghitung skor akhir berdasarkan bobot kepatuhan.
                          </p>
                          {auditError && (
                            <div className="p-2.5 text-[10px] text-red-400 bg-red-955/20 border border-red-900/30 rounded-lg">
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
                role === 'mahasiswa' ? (
                  <div className="bg-[#0c1220]/70 border border-gray-800/85 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
                    
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                        <Gauge className="h-4 w-4 text-blue-500" />
                        Statistik Kepatuhan Properti
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Analisis kos terinspeksi milik Anda di Kota Padang
                      </p>
                    </div>

                    {totalAudited === 0 ? (
                      <div className="text-center py-8">
                        <Building className="h-7 w-7 text-gray-600 mx-auto mb-2" />
                        <h4 className="text-[10px] font-bold text-gray-400">Belum Ada Data Audit</h4>
                        <p className="text-[9px] text-gray-500 max-w-[180px] mx-auto mt-1 leading-relaxed">
                          Setelah inspektur menyelesaikan audit lapangan, grafik data kualitas kos Anda akan muncul di sini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        {/* Donut Chart - Avg Score */}
                        <div className="flex flex-col items-center justify-center p-4 bg-[#0a0f1b]/50 rounded-xl border border-gray-855">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono">
                            SKOR VALIDITAS RATA-RATA
                          </span>
                          <div className="relative flex items-center justify-center h-28 w-28">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-800"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-blue-500 transition-all duration-500"
                                strokeDasharray={`${avgScore.toFixed(1)}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                              <span className="text-xl font-black text-white">{avgScore.toFixed(0)}%</span>
                              <span className="text-[8px] font-bold text-gray-500 uppercase font-mono tracking-wide">Skor</span>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Level Progress Bars */}
                        <div className="space-y-3.5 p-4 bg-[#0a0f1b]/50 rounded-xl border border-gray-855">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block font-mono border-b border-gray-855 pb-1.5">
                            STATUS KEPATUHAN KOS
                          </span>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                VALID ({validCount})
                              </span>
                              <span>{validPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${validPct}%` }} />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                PARTIAL VALID ({partialCount})
                              </span>
                              <span>{partialPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${partialPct}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                FATAL FRAUD ({fraudCount})
                              </span>
                              <span>{fraudPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${fraudPct}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Tech Average Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-955/20 border border-blue-900/30 rounded-xl text-center">
                            <span className="text-[8px] font-bold text-blue-400 block mb-1 uppercase font-mono tracking-wider">Rata-Rata TDS</span>
                            <span className="text-sm font-black text-white">{avgTds.toFixed(0)} ppm</span>
                            <span className="text-[8px] text-gray-500 block mt-1 font-mono">{avgTds <= 300 ? 'Air Bersih' : 'Kualitas Rendah'}</span>
                          </div>
                          <div className="p-3 bg-orange-955/20 border border-orange-900/30 rounded-xl text-center">
                            <span className="text-[8px] font-bold text-orange-400 block mb-1 uppercase font-mono tracking-wider">Rata-Rata Speed</span>
                            <span className="text-sm font-black text-white">{avgSpeed.toFixed(0)} Mbps</span>
                            <span className="text-[8px] text-gray-500 block mt-1 font-mono">{avgSpeed >= 15 ? 'Internet Cepat' : 'Internet Buffering'}</span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#0c1220]/70 border border-gray-800/85 rounded-2xl p-8 shadow-xl backdrop-blur-md text-center py-12">
                    <Compass className="h-8 w-8 text-gray-600 mx-auto mb-3 animate-spin" style={{ animationDuration: '6s' }} />
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Pilih Sesi Kerja</h3>
                    <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto leading-relaxed">
                      Pilih salah satu tugas dari daftar di samping untuk memulai pengisian berkas audit lapangan.
                    </p>
                  </div>
                )
              )}

            </div>
          </div>
        )}
      </main>

      {/* Modal - Request Inspection (Mahasiswa) */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
          <div className="bg-[#0c1220] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-gray-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Ajukan Permintaan Inspeksi Baru
            </h3>
            <p className="text-[10px] text-gray-400 mb-5 leading-relaxed">
              Mendaftarkan properti kos baru dan klaim fasilitas iklan. Data ini akan diverifikasi di lapangan oleh tim inspektur kami.
            </p>

            {requestError && (
              <div className="mb-4 p-3 text-xs text-red-400 bg-red-955/20 border border-red-900/30 rounded-xl text-center font-bold">
                ⚠️ {requestError}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Nama Properti Kos
                </label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Contoh: Kos Anggrek Indah TRPL"
                  className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Jl. Limau Manis Kec. Pauh No. 40, Kota Padang"
                  className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-gray-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Lokasi Koordinat Kos (Maps)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="text-[9px] text-blue-400 hover:underline font-bold"
                  >
                    📍 {showMapPicker ? 'Tutup Peta' : 'Pilih di Peta'}
                  </button>
                </div>
                
                {showMapPicker && (
                  <div className="border border-gray-800 rounded-xl p-2 bg-[#090d16] space-y-2">
                    <div
                      id="map-picker-container"
                      className="w-full h-48 rounded-xl overflow-hidden bg-gray-950 border border-gray-855 z-10"
                      style={{ minHeight: '192px' }}
                    />
                    <p className="text-[8px] text-gray-500 text-center font-mono">
                      Klik pada peta untuk memindahkan pin lokasi kos.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Latitude"
                    readOnly
                    value={selectedLat !== null ? selectedLat.toFixed(6) : ''}
                    className="w-full px-3.5 py-2 bg-[#080d1a] border border-gray-805 rounded-xl text-xs text-gray-400 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Longitude"
                    readOnly
                    value={selectedLng !== null ? selectedLng.toFixed(6) : ''}
                    className="w-full px-3.5 py-2 bg-[#080d1a] border border-gray-805 rounded-xl text-xs text-gray-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Deskripsi / Catatan Iklan
                </label>
                <textarea
                  value={propertyDesc}
                  onChange={(e) => setPropertyDesc(e.target.value)}
                  placeholder="Kamar berukuran 3x4 meter, dekat gerbang utama..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-[#080d1a] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-gray-650 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono border-b border-gray-855 pb-1">
                  Fasilitas Yang Terpasang di Iklan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(claims).map((facility) => (
                    <label
                      key={facility}
                      className="flex items-center gap-2 p-2 bg-[#090e1a] border border-gray-855 rounded-xl text-[10px] font-semibold text-gray-300 cursor-pointer hover:bg-gray-850 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={(claims as any)[facility]}
                        onChange={(e) =>
                          setClaims({ ...claims, [facility]: e.target.checked })
                        }
                        className="rounded border-gray-800 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-gray-900"
                      />
                      <span className="capitalize">{facility.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-855 pt-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block font-mono">
                    Klaim TDS Air (Maks ppm)
                  </label>
                  <input
                    type="number"
                    required
                    value={tdsExpectation}
                    onChange={(e) => setTdsExpectation(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase block font-mono">
                    Klaim Speed Wifi (Min Mbps)
                  </label>
                  <input
                    type="number"
                    required
                    value={internetExpectation}
                    onChange={(e) => setInternetExpectation(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080d1a] border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-855 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-white transition-all uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer"
                >
                  {requestLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Kirim Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Report Scorecard Detail */}
      {showReportModal && selectedInspection && selectedInspection.audit_report && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
          <div className="bg-[#0c1220] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative border border-gray-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Laporan Audit Scorecard
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">
                  {selectedInspection.property?.name} — {selectedInspection.property?.address}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-xs font-bold text-gray-500 hover:text-white transition-all"
              >
                Tutup
              </button>
            </div>

            {/* Main Score Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              <div className="bg-[#0a0f1b]/60 border border-gray-855 p-4 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                  Skor Validitas
                </span>
                <span className="text-3xl font-black text-blue-500 mt-1">
                  {selectedInspection.audit_report.score}%
                </span>
              </div>

              <div className="bg-[#0a0f1b]/60 border border-gray-855 p-4 rounded-xl text-center flex flex-col justify-center items-center">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                  Tingkat Kepercayaan
                </span>
                <span
                  className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider mt-2 border ${
                    selectedInspection.audit_report.confidence_level === 'VALID'
                      ? 'bg-emerald-955 text-emerald-400 border-emerald-900/50'
                      : selectedInspection.audit_report.confidence_level === 'PARTIAL_VALID'
                      ? 'bg-amber-955 text-amber-400 border-amber-900/50'
                      : 'bg-red-955 text-red-400 border-red-900/50'
                  }`}
                >
                  {selectedInspection.audit_report.confidence_level.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="bg-[#0a0f1b]/60 border border-gray-855 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                  Laporan Resmi PDF
                </span>
                {selectedInspection.audit_report.pdf_url ? (
                  <a
                    href={selectedInspection.audit_report.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-400 hover:underline"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-550 mt-2 font-mono">
                    Belum Tersedia
                  </span>
                )}
              </div>
            </div>

            {/* Comparison Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-855 pb-2 flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-blue-500" />
                Kecocokan Fasilitas Lapangan (AI Vision)
              </h4>

              {/* Match/Mismatch grid */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedInspection.audit_report.breakdown_data?.items?.map((item: any, i: number) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-[#0a0f1b]/30 rounded-xl border border-gray-855"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold capitalize text-gray-300">
                          {item.facility.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'MATCH' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-955/40 px-2 py-0.5 rounded-md border border-emerald-900/50 tracking-wider">
                            ✓ MATCH
                          </span>
                        )}
                        {item.status === 'MISMATCH' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-955/40 px-2 py-0.5 rounded-md border border-red-900/50 tracking-wider">
                            ✗ MISMATCH
                          </span>
                        )}
                        {item.status === 'NEUTRAL' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-900/40 px-2 py-0.5 rounded-md border border-gray-800/60 tracking-wider">
                            TIDAK DIKLAIM
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Technical breakdown */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-855 pb-2 pt-2 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-indigo-500" />
                Data Teknis Pengukuran
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#0a0f1b]/50 rounded-xl border border-gray-855">
                  <span className="text-[9px] font-bold text-gray-500 block mb-1 font-mono uppercase tracking-wider">
                    TDS Air Aktual
                  </span>
                  <span className="text-base font-black text-white">
                    {selectedInspection.tds_value} ppm
                  </span>
                  <span className="text-[8px] text-gray-500 block mt-1 font-mono">
                    Klaim Maks: {selectedInspection.property?.claim_data?.fasilitas?.kualitas_air?.nilai || 500} ppm
                  </span>
                </div>
                <div className="p-3 bg-[#0a0f1b]/50 rounded-xl border border-gray-855">
                  <span className="text-[9px] font-bold text-gray-500 block mb-1 font-mono uppercase tracking-wider">
                    Speed Internet
                  </span>
                  <span className="text-base font-black text-white">
                    {selectedInspection.internet_speed} Mbps
                  </span>
                  <span className="text-[8px] text-gray-500 block mt-1 font-mono">
                    Klaim Min: {selectedInspection.property?.claim_data?.fasilitas?.kecepatan_internet?.nilai || 10} Mbps
                  </span>
                </div>
              </div>
            </div>

            {/* Chatbot Gemini Section */}
            <div className="border-t border-gray-855 pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowChat(!showChat);
                  if (chatHistory.length === 0) {
                    setChatHistory([
                      {
                        role: 'model',
                        parts: [
                          {
                            text: `Halo! Saya adalah AI Asisten InspeksiKos. Saya telah meninjau hasil audit untuk "${selectedInspection.property?.name}". Apakah ada yang ingin Anda tanyakan mengenai tingkat validitas, kecepatan internet, atau kualitas air di kos ini?`
                          }
                        ]
                      }
                    ]);
                  }
                }}
                className="w-full flex items-center justify-between p-3 bg-blue-955/20 hover:bg-blue-955/40 border border-blue-900/40 rounded-xl text-xs font-bold text-blue-400 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                  Konsultasi Hasil Audit dengan AI Assistant
                </span>
                <span>{showChat ? 'Sembunyikan Chat' : 'Tanya AI'}</span>
              </button>

              {showChat && (
                <div className="mt-3 bg-[#090e1a] rounded-xl border border-gray-800 overflow-hidden flex flex-col h-72 shadow-inner">
                  
                  {/* Chat message list */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 max-h-56 text-[10px] leading-relaxed scrollbar-none">
                    {chatHistory.map((chat, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          chat.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-2.5 ${
                            chat.role === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                              : 'bg-[#0f172a] text-gray-200 border border-gray-800 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-line font-sans">{chat.parts[0].text}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#0f172a] text-gray-500 border border-gray-800 rounded-xl rounded-tl-none p-2.5 flex items-center gap-1.5 font-mono">
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          <span>AI sedang merespon...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChatMessage} className="p-2 bg-[#0c1220] border-t border-gray-800 flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Tanyakan mengenai hasil audit kos ke AI..."
                      className="flex-1 px-3 py-2 bg-[#080d1a] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-650"
                      disabled={chatLoading}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatMessage.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-855 pt-4 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
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
