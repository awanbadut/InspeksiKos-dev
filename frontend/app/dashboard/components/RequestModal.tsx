'use client';

import { useState, useEffect } from 'react';
import {
  Building,
  Layers,
  MapPin,
  Upload,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mapReady: boolean;
  initialCategory?: 'single' | 'multi';
}

export default function RequestModal({
  isOpen,
  onClose,
  onSuccess,
  mapReady,
  initialCategory = 'single',
}: RequestModalProps) {
  const [orderCategory, setOrderCategory] = useState<'single' | 'multi'>(initialCategory);
  const [currentStepModal, setCurrentStepModal] = useState<number>(1);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Form states - Single
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyDesc, setPropertyDesc] = useState('');
  const [claims, setClaims] = useState<Record<string, boolean>>({
    kasur: true,
    lemari: true,
    ac: false,
    wifi: false,
    kamar_mandi_dalam: false,
  });
  const [tdsExpectation, setTdsExpectation] = useState(500);
  const [internetExpectation, setInternetExpectation] = useState(10);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [customFacilitySingle, setCustomFacilitySingle] = useState('');

  // Form states - Multi
  const [multiProperties, setMultiProperties] = useState<any[]>([
    {
      name: '',
      address: '',
      description: '',
      claims: { kasur: true, lemari: true, ac: false, wifi: false, kamar_mandi_dalam: false },
      tdsExpectation: 500,
      internetExpectation: 10,
      lat: null,
      lng: null,
      showPicker: false,
    },
    {
      name: '',
      address: '',
      description: '',
      claims: { kasur: true, lemari: true, ac: false, wifi: false, kamar_mandi_dalam: false },
      tdsExpectation: 500,
      internetExpectation: 10,
      lat: null,
      lng: null,
      showPicker: false,
    }
  ]);
  const [customFacilityMulti, setCustomFacilityMulti] = useState<Record<number, string>>({});

  // Payment states
  const [activeRequestInspectionIds, setActiveRequestInspectionIds] = useState<string[]>([]);
  const [paymentToken, setPaymentToken] = useState('');
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState('');
  const [paymentMode, setPaymentMode] = useState<'sandbox' | 'simulator'>('simulator');

  // Matchmaking states
  const [matchingStatus, setMatchingStatus] = useState<string>('');
  const [mockInspector, setMockInspector] = useState<any | null>(null);

  useEffect(() => {
    setOrderCategory(initialCategory);
  }, [initialCategory]);

  // Map Picker initialization (Single)
  useEffect(() => {
    if (mapReady && showMapPicker && currentStepModal === 2 && orderCategory === 'single') {
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
  }, [mapReady, showMapPicker, currentStepModal, orderCategory]);

  // Multi-Map Picker initialization for Multi-Kos category
  useEffect(() => {
    if (!mapReady || orderCategory !== 'multi' || currentStepModal !== 2) return;

    const activePickers = multiProperties
      .map((p, idx) => ({ ...p, idx }))
      .filter((p) => p.showPicker);

    const timers: any[] = [];

    activePickers.forEach((p) => {
      const idx = p.idx;
      const timer = setTimeout(() => {
        const L = (window as any).L;
        if (!L) return;

        const defaultLat = -0.9471;
        const defaultLng = 100.4172;
        const initialLat = p.lat || defaultLat;
        const initialLng = p.lng || defaultLng;

        const containerId = `map-picker-container-${idx}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clean up previous map instance on this container if it exists
        const oldMap = (window as any)[`currentMapPicker_${idx}`];
        if (oldMap) {
          try { oldMap.remove(); } catch (e) {}
        }

        const mapInstance = L.map(containerId).setView([initialLat, initialLng], 13);

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
          setMultiProperties((prev) => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], lat, lng };
            return copy;
          });
          markerInstance.setLatLng([lat, lng]);
        });

        mapInstance.invalidateSize();
        setTimeout(() => mapInstance.invalidateSize(), 150);

        (window as any)[`currentMapPicker_${idx}`] = mapInstance;
      }, 100);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      activePickers.forEach((p) => {
        const idx = p.idx;
        const mapInst = (window as any)[`currentMapPicker_${idx}`];
        if (mapInst) {
          try { mapInst.remove(); } catch (e) {}
          (window as any)[`currentMapPicker_${idx}`] = null;
        }
      });
    };
  }, [mapReady, orderCategory, currentStepModal, multiProperties.map(p => p.showPicker).join(',')]);

  // Polling for QRIS payment success
  useEffect(() => {
    if (currentStepModal !== 3 || activeRequestInspectionIds.length === 0) return;

    const intervalId = setInterval(async () => {
      try {
        let allPaid = true;
        for (const id of activeRequestInspectionIds) {
          const res = await api.get(`/inspections/${id}/check-payment`);
          if (!res.data.paid) {
            allPaid = false;
            break;
          }
        }

        if (allPaid && activeRequestInspectionIds.length > 0) {
          clearInterval(intervalId);
          // Transition to Step 4: Radar Matchmaking!
          setCurrentStepModal(4);
          setMatchingStatus('searching');
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [currentStepModal, activeRequestInspectionIds]);

  // Fetch payment token when active inspections are created
  useEffect(() => {
    if (activeRequestInspectionIds.length === 0) return;

    const fetchToken = async () => {
      try {
        const id = activeRequestInspectionIds[0];
        const res = await api.post(`/inspections/${id}/payment-token`);
        setPaymentToken(res.data.token);
        setPaymentRedirectUrl(res.data.redirect_url);
        setPaymentMode(res.data.mode);
      } catch (err) {
        console.error('Failed to fetch payment token:', err);
      }
    };

    fetchToken();
  }, [activeRequestInspectionIds]);

  // Real-time polling for inspector assignment (Gojek-Style Matchmaking)
  useEffect(() => {
    if (matchingStatus !== 'searching' || activeRequestInspectionIds.length === 0) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await api.get('/inspections');
        const list: any[] = res.data;

        // Find if any of our activeRequestInspectionIds has been assigned
        const matchingInsps = list.filter((i) => activeRequestInspectionIds.includes(i.inspection_id));
        
        // Find the first inspection that has an inspector assigned
        const assignedInsp = matchingInsps.find((i) => i.inspector !== null && i.inspector !== undefined);

        if (assignedInsp) {
          // Found a real inspector!
          clearInterval(intervalId);
          setMockInspector({
            name: `${assignedInsp.inspector.first_name || ''} ${assignedInsp.inspector.last_name || ''}`.trim() || assignedInsp.inspector.email,
            phone: assignedInsp.inspector.phone_number || 'Tidak Ada Telepon',
            rating: '5.0',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
          });
          setMatchingStatus('found');
          // Clear active IDs so we don't trigger again
          setActiveRequestInspectionIds([]);
          onSuccess(); // Refresh parent dashboard listing
        }
      } catch (err) {
        console.error('Error polling matching status:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [matchingStatus, activeRequestInspectionIds, onSuccess]);

  if (!isOpen) return null;

  const handleCreateOrderInvoice = async () => {
    setRequestLoading(true);
    setRequestError('');

    try {
      const comparisonId = `comp_${Date.now()}`;
      const createdIds: string[] = [];

      if (orderCategory === 'single') {
        const fasilitasPayload: Record<string, any> = {};
        Object.keys(claims).forEach((key) => {
          fasilitasPayload[key] = { ada: claims[key] };
        });
        fasilitasPayload['kualitas_air'] = { nilai: Number(tdsExpectation) };
        fasilitasPayload['kecepatan_internet'] = { nilai: Number(internetExpectation) };

        const claim_data = {
          location: selectedLat && selectedLng ? {
            latitude: selectedLat,
            longitude: selectedLng
          } : null,
          fasilitas: fasilitasPayload,
          payment_status: 'unpaid',
        };

        const propResponse = await api.post('/properties', {
          name: propertyName,
          address: propertyAddress,
          description: propertyDesc,
          claim_data,
        });

        const { property_id } = propResponse.data;
        const resInsp = await api.post('/inspections', { property_id });
        createdIds.push(resInsp.data.inspection_id);
      } else {
        // Multi-Kos
        for (const p of multiProperties) {
          const fasilitasPayload: Record<string, any> = {};
          Object.keys(p.claims).forEach((key) => {
            fasilitasPayload[key] = { ada: p.claims[key] };
          });
          fasilitasPayload['kualitas_air'] = { nilai: Number(p.tdsExpectation) };
          fasilitasPayload['kecepatan_internet'] = { nilai: Number(p.internetExpectation) };

          const claim_data = {
            comparison_id: comparisonId,
            location: p.lat && p.lng ? {
              latitude: p.lat,
              longitude: p.lng
            } : null,
            fasilitas: fasilitasPayload,
            payment_status: 'unpaid',
          };

          const propResponse = await api.post('/properties', {
            name: p.name,
            address: p.address,
            description: p.description,
            claim_data,
          });

          const { property_id } = propResponse.data;
          const resInsp = await api.post('/inspections', { property_id });
          createdIds.push(resInsp.data.inspection_id);
        }
      }

      onSuccess();
      setActiveRequestInspectionIds(createdIds);
      setCurrentStepModal(3);
    } catch (err: any) {
      console.error(err);
      setRequestError(err.response?.data?.message || 'Gagal membuat order inspeksi');
      setCurrentStepModal(2); // Fall back to form step
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAddCustomFacilitySingle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!customFacilitySingle.trim()) return;
    const cleanName = customFacilitySingle.trim().toLowerCase().replace(/\s+/g, '_');
    setClaims((prev) => ({ ...prev, [cleanName]: true }));
    setCustomFacilitySingle('');
  };

  const handleAddCustomFacilityMulti = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    const typedText = customFacilityMulti[idx];
    if (!typedText || !typedText.trim()) return;
    const cleanName = typedText.trim().toLowerCase().replace(/\s+/g, '_');

    setMultiProperties((prev) => {
      const copy = [...prev];
      copy[idx].claims = { ...copy[idx].claims, [cleanName]: true };
      return copy;
    });

    setCustomFacilityMulti((prev) => ({ ...prev, [idx]: '' }));
  };

  const handleCloseAndReset = () => {
    // Reset all form inputs
    setCurrentStepModal(1);
    setOrderCategory('single');
    setMatchingStatus('');
    setMockInspector(null);
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
    setPaymentToken('');
    setPaymentRedirectUrl('');
    setPaymentMode('simulator');
    setMultiProperties([
      {
        name: '',
        address: '',
        description: '',
        claims: { kasur: true, lemari: true, ac: false, wifi: false, kamar_mandi_dalam: false },
        tdsExpectation: 500,
        internetExpectation: 10,
        lat: null,
        lng: null,
        showPicker: false,
      },
      {
        name: '',
        address: '',
        description: '',
        claims: { kasur: true, lemari: true, ac: false, wifi: false, kamar_mandi_dalam: false },
        tdsExpectation: 500,
        internetExpectation: 10,
        lat: null,
        lng: null,
        showPicker: false,
      }
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 text-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#003057]">
            <span>⚡ Pesan Verifikator Kos (Gojek-Style)</span>
          </h3>
          <button
            type="button"
            onClick={handleCloseAndReset}
            className="text-slate-500 hover:text-slate-800 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {requestError && (
          <div className="mb-4 p-3 text-xs text-red-500 bg-rose-50 border border-rose-200 rounded-xl text-center font-bold">
            ⚠️ {requestError}
          </div>
        )}

        {/* STEP 1: CATEGORY SELECTION */}
        {currentStepModal === 1 && (
          <div className="space-y-5 py-2 text-slate-700 text-left">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Pilih jenis layanan verifikasi kos yang Anda inginkan. Sistem kami akan menghubungkan Anda dengan Inspektur terdekat untuk melakukan audit langsung di lapangan.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {/* Single Kos Option */}
              <label
                onClick={() => setOrderCategory('single')}
                className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
                  orderCategory === 'single'
                    ? 'border-[#0f766e] bg-teal-50/50'
                    : 'border-slate-200 bg-slate-50/40 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="orderCategory"
                  checked={orderCategory === 'single'}
                  onChange={() => setOrderCategory('single')}
                  className="hidden"
                />
                <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 text-lg">
                  🏠
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 block">Inspeksi Tunggal</span>
                    <span className="text-[10px] font-black text-[#0f766e]">Rp 50.000</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block leading-relaxed mt-0.5">
                    Verifikasi 1 properti kos. Dapatkan scorecard Gemini AI untuk fasilitas iklan.
                  </span>
                </div>
              </label>

              {/* Multi-Kos Option */}
              <label
                onClick={() => setOrderCategory('multi')}
                className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
                  orderCategory === 'multi'
                    ? 'border-[#0f766e] bg-teal-50/50'
                    : 'border-slate-200 bg-slate-50/40 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="orderCategory"
                  checked={orderCategory === 'multi'}
                  onChange={() => setOrderCategory('multi')}
                  className="hidden"
                />
                <div className="h-9 w-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 text-lg">
                  🏢
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 block">Multi-Kos (Grup Banding)</span>
                    <span className="text-[10px] font-black text-purple-600">Rp 45.000 <span className="text-[8px] font-normal text-slate-450">/ kos</span></span>
                  </div>
                  <span className="text-[9px] text-slate-400 block leading-relaxed mt-0.5">
                    Verifikasi 2 sampai 5 kos secara bersamaan. Dapatkan lembar perbandingan dasbor interaktif.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setCurrentStepModal(2)}
                className="px-6 py-2.5 bg-[#003057] hover:bg-[#003057]/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Lanjut Pengisian Form
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FILL FORMS */}
        {currentStepModal === 2 && (
          <div className="space-y-4 py-2 text-slate-800 text-left">
            
            {orderCategory === 'single' ? (
              /* Form Single Kos */
              <form onSubmit={(e) => { e.preventDefault(); handleCreateOrderInvoice(); }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Properti Kos</label>
                  <input
                    type="text"
                    required
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Contoh: Kos Anggrek Indah TRPL"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Alamat Lengkap</label>
                  <input
                    type="text"
                    required
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="Jl. Limau Manis No. 40, Padang"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lokasi Koordinat Kos</label>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="text-[9px] text-[#0f766e] hover:underline font-bold cursor-pointer"
                    >
                      📍 {showMapPicker ? 'Tutup Peta' : 'Pilih di Peta'}
                    </button>
                  </div>
                  {showMapPicker && (
                    <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-2">
                      <div
                        id="map-picker-container"
                        className="w-full h-48 rounded-xl overflow-hidden bg-gray-950 border border-slate-200 z-10"
                        style={{ minHeight: '192px' }}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" readOnly placeholder="Latitude" value={selectedLat ? selectedLat.toFixed(6) : ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono" />
                    <input type="text" readOnly placeholder="Longitude" value={selectedLng ? selectedLng.toFixed(6) : ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deskripsi Fasilitas Iklan</label>
                  <textarea
                    value={propertyDesc}
                    onChange={(e) => setPropertyDesc(e.target.value)}
                    placeholder="Catatan mengenai fasilitas..."
                    rows={2}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-[#0f766e] rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono border-b border-slate-200 pb-1">Klaim Fasilitas Iklan</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(claims).map((facility) => (
                      <label key={facility} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={claims[facility]}
                          onChange={(e) => setClaims({ ...claims, [facility]: e.target.checked })}
                          className="rounded border-slate-200 text-[#0f766e] focus:ring-0 bg-white"
                        />
                        <span className="capitalize">{facility.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Tambah fasilitas kustom... (e.g. TV, Kulkas)"
                      value={customFacilitySingle}
                      onChange={(e) => setCustomFacilitySingle(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 focus:border-[#0f766e] rounded-xl text-[10px] text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFacilitySingle}
                      className="px-3 py-1.5 bg-[#003057] hover:bg-[#003057]/90 text-white font-bold rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block font-mono uppercase">TDS Air (ppm)</label>
                    <input type="number" required value={tdsExpectation} onChange={(e) => setTdsExpectation(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 block font-mono uppercase">Wifi (Mbps)</label>
                    <input type="number" required value={internetExpectation} onChange={(e) => setInternetExpectation(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
                  <button type="button" onClick={() => setCurrentStepModal(1)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 uppercase cursor-pointer">Kembali</button>
                  <button type="submit" className="px-5 py-2.5 bg-[#003057] hover:bg-[#003057]/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer">Lanjut Bayar</button>
                </div>
              </form>
            ) : (
              /* Form Multi-Kos */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#003057] font-bold uppercase tracking-wider">Mendaftarkan {multiProperties.length} Kos</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (multiProperties.length >= 5) return;
                      setMultiProperties([...multiProperties, {
                        name: '', address: '', description: '',
                        claims: { kasur: true, lemari: true, ac: false, wifi: false, kamar_mandi_dalam: false },
                        tdsExpectation: 500, internetExpectation: 10, lat: null, lng: null, showPicker: false
                      }]);
                    }}
                    className="text-[9px] bg-teal-50 hover:bg-teal-100 text-[#0f766e] border border-teal-200 font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    ➕ Tambah Kos
                  </button>
                </div>

                <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1">
                  {multiProperties.map((p, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 relative text-slate-850">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-bold text-slate-705 uppercase">Kos Properti #{idx + 1}</span>
                        {multiProperties.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...multiProperties];
                              copy.splice(idx, 1);
                              setMultiProperties(copy);
                            }}
                            className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Nama Kos (Contoh: Kos Sakura)"
                          value={p.name}
                          onChange={(e) => {
                            const copy = [...multiProperties];
                            copy[idx].name = e.target.value;
                            setMultiProperties(copy);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Alamat Lengkap Kos"
                          value={p.address}
                          onChange={(e) => {
                            const copy = [...multiProperties];
                            copy[idx].address = e.target.value;
                            setMultiProperties(copy);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Pin Lokasi</span>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...multiProperties];
                              copy[idx].showPicker = !copy[idx].showPicker;
                              setMultiProperties(copy);
                            }}
                            className="text-[9px] text-[#0f766e] font-bold hover:underline cursor-pointer"
                          >
                            {p.showPicker ? 'Tutup Peta' : '📍 Pilih di Peta'}
                          </button>
                        </div>
                        {p.showPicker && (
                          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-2">
                            <div
                              id={`map-picker-container-${idx}`}
                              className="w-full h-48 rounded-xl overflow-hidden bg-gray-950 border border-slate-200 z-10"
                              style={{ minHeight: '192px' }}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500">
                          <span>Lat: {p.lat ? p.lat.toFixed(5) : '-'}</span>
                          <span>Lng: {p.lng ? p.lng.toFixed(5) : '-'}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-500 block font-mono border-b border-slate-200 pb-0.5">Fasilitas</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {Object.keys(p.claims).map((facility) => (
                            <label key={facility} className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] text-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={p.claims[facility]}
                                onChange={(e) => {
                                  const copy = [...multiProperties];
                                  copy[idx].claims[facility] = e.target.checked;
                                  setMultiProperties(copy);
                                }}
                                className="rounded border-slate-200 text-[#0f766e] focus:ring-0 scale-75 bg-white"
                              />
                              <span className="capitalize truncate">{facility.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="Tambah fasilitas..."
                            value={customFacilityMulti[idx] || ''}
                            onChange={(e) => setCustomFacilityMulti((prev) => ({ ...prev, [idx]: e.target.value }))}
                            className="flex-1 px-2 py-1 bg-white border border-slate-200 focus:border-[#0f766e] rounded-md text-[9px] text-slate-800 focus:outline-none placeholder-slate-400"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleAddCustomFacilityMulti(idx, e)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#0f766e] border border-teal-200 font-bold rounded-md text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
                  <button type="button" onClick={() => setCurrentStepModal(1)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 uppercase cursor-pointer">Kembali</button>
                  <button
                    type="button"
                    onClick={handleCreateOrderInvoice}
                    disabled={requestLoading}
                    className="px-5 py-2.5 bg-[#003057] hover:bg-[#003057]/90 disabled:bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    {requestLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    Lanjut Bayar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: QRIS PAYMENT */}
        {currentStepModal === 3 && (
          <div className="space-y-5 py-2 text-center text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Invoice Ringkasan Transaksi</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-550">Jenis Layanan:</span>
                  <span className="text-slate-800 font-bold">{orderCategory === 'single' ? 'Inspeksi Tunggal (1 Properti)' : `Multi-Kos (${multiProperties.length} Properti)`}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-extrabold text-sm">
                  <span className="text-slate-600">Total Tagihan:</span>
                  <span className="text-emerald-600">
                    {orderCategory === 'single' ? 'Rp 50.000' : `Rp ${(multiProperties.length * 45000).toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
            </div>

            {(() => {
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const isSandbox = paymentMode === 'sandbox' && paymentRedirectUrl;
              const targetUrl = isSandbox ? paymentRedirectUrl : `${origin}/payment/simulate?id=${activeRequestInspectionIds[0] || ''}`;
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}`;

              return (
                <div className="space-y-4">
                  {isSandbox ? (
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-center space-y-1.5 max-w-sm mx-auto shadow-inner">
                      <div className="flex items-center justify-center gap-1.5 text-[#0f766e]">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs font-bold font-mono tracking-wider uppercase text-[#003057]">Midtrans Sandbox Active</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Menggunakan gerbang pembayaran resmi Midtrans Sandbox. Pindai kode QRIS di bawah atau klik tombol untuk membayar.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center space-y-1.5 max-w-sm mx-auto shadow-inner">
                      <span className="text-[10px] font-bold text-amber-800 font-mono tracking-wider uppercase">Mode Simulator Pembayaran</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Kunci API Midtrans belum dikonfigurasi. Menggunakan simulator internal InspeksiKos.
                      </p>
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-2xl p-5 bg-white max-w-[240px] mx-auto space-y-3 shadow-inner">
                    {/* QRIS Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <span className="text-xs font-extrabold text-[#da251d]">QRIS</span>
                      <span className="text-[8px] font-black text-[#003057] font-mono">GPN</span>
                    </div>
                    
                    {/* Real scannable QR Code */}
                    <div className="p-2 border border-gray-100 rounded-lg flex items-center justify-center bg-white">
                      {activeRequestInspectionIds.length > 0 ? (
                        <img src={qrUrl} alt="QR Code" className="w-[140px] h-[140px]" />
                      ) : (
                        <div className="w-[140px] h-[140px] flex items-center justify-center text-slate-500 text-[10px] font-mono">
                          Memuat QR Code...
                        </div>
                      )}
                    </div>

                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      {isSandbox ? 'MIDTRANS SECURE SANDBOX' : 'INSPEKSIKOS ON-DEMAND'}<br />
                      NMID: {isSandbox ? 'ID202688776655' : 'ID1020304050'}
                    </p>
                  </div>

                  {activeRequestInspectionIds.length > 0 && (
                    <div className="pt-1 flex flex-col gap-2 max-w-xs mx-auto">
                      {isSandbox ? (
                        <a
                          href={paymentRedirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#003057] to-[#0f766e] hover:from-[#003057]/90 hover:to-[#0f766e]/90 text-white font-extrabold rounded-xl text-[11px] shadow-lg shadow-[#003057]/20 active:scale-[0.98] transition-all duration-200 uppercase tracking-wider"
                        >
                          🚀 Bayar via Midtrans Sandbox
                        </a>
                      ) : (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-[11px] shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200 uppercase tracking-wider"
                        >
                          🔗 Buka Simulator Pembayaran
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <p className="text-[9px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Silakan scan QRIS di atas dengan aplikasi pembayaran Anda (Gopay, OVO, Dana, LinkAja) atau klik tombol di atas untuk melanjutkan pembayaran.
            </p>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
              <button type="button" onClick={() => setCurrentStepModal(2)} className="px-4 py-2 text-xs font-bold text-slate-450 hover:text-slate-700 uppercase cursor-pointer">Kembali</button>
              <button
                type="button"
                disabled={true}
                className="px-5 py-2.5 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed w-56"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0f766e]" />
                Menunggu Pembayaran...
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: RADAR MATCHING ANIMATION */}
        {currentStepModal === 4 && (
          <div className="space-y-6 py-6 text-center text-slate-800">
            
            {matchingStatus === 'searching' ? (
              <div className="space-y-6">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-[#0f766e]/20 animate-ping" style={{ animationDuration: '2s' }} />
                  <span className="absolute inset-2 rounded-full bg-[#003057]/30 animate-pulse" style={{ animationDuration: '1.5s' }} />
                  <div className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-[#003057] to-[#0f766e] flex items-center justify-center shadow-lg shadow-[#003057]/30 border border-teal-400">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Mencari Inspektur...</h4>
                  <p className="text-[9px] text-slate-450 max-w-xs mx-auto leading-relaxed">
                    Menghubungkan dengan verifikasi bersertifikat terdekat dari lokasi kosan untuk langsung mengaudit ke lapangan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-200">
                <div className="h-12 w-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-xl shadow-lg shadow-emerald-900/10 text-emerald-600">
                  ✔
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Inspektur Ditemukan!</h4>
                  <p className="text-[9px] text-slate-450 max-w-xs mx-auto leading-relaxed">
                    Inspektur mitra kami telah menerima pesanan verifikasi Anda.
                  </p>
                </div>

                {/* Driver Card */}
                {mockInspector && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4 text-left max-w-xs mx-auto text-slate-800">
                    <img src={mockInspector.avatar} alt={mockInspector.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold text-slate-805 block truncate">{mockInspector.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium block">⭐ {mockInspector.rating} • Mitra Lapangan</span>
                      <span className="text-[9px] text-[#0f766e] font-mono block mt-0.5">{mockInspector.phone}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className="px-6 py-2.5 bg-[#003057] hover:bg-[#003057]/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Selesai & Ke Dasbor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
