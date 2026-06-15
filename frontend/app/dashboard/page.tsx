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
  ShieldCheck,
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

  // Gojek Model States
  const [orderCategory, setOrderCategory] = useState<'single' | 'multi'>('single');
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
  const [currentStepModal, setCurrentStepModal] = useState<number>(1);
  const [matchingStatus, setMatchingStatus] = useState<string>('');
  const [mockInspector, setMockInspector] = useState<any | null>(null);
  const [activeTabInspector, setActiveTabInspector] = useState<'my_tasks' | 'available_orders'>('my_tasks');
  const [acceptingTaskLoading, setAcceptingTaskLoading] = useState<Record<string, boolean>>({});

  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedComparisonGroup, setSelectedComparisonGroup] = useState<any[]>([]);

  const [customFacilitySingle, setCustomFacilitySingle] = useState('');
  const [customFacilityMulti, setCustomFacilityMulti] = useState<Record<number, string>>({});
  const [activeRequestInspectionIds, setActiveRequestInspectionIds] = useState<string[]>([]);
  const [paymentToken, setPaymentToken] = useState('');
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState('');
  const [paymentMode, setPaymentMode] = useState<'sandbox' | 'simulator'>('simulator');

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
        }
      } catch (err) {
        console.error('Error polling matching status:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [matchingStatus, activeRequestInspectionIds]);

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

  // Dynamic dashboard background polling (every 10s)
  useEffect(() => {
    if (!role) return;
    const interval = setInterval(() => {
      fetchInspections(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [role]);

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

  // Multi-Map Picker initialization for Multi-Kos category
  useEffect(() => {
    if (!mapReady || orderCategory !== 'multi') return;

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
  }, [mapReady, orderCategory, multiProperties.map(p => p.showPicker).join(',')]);

  // Inspector Task Map initialization with live routing and user location tracking
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
              <span class="animate-pulse absolute inline-flex h-6 w-6 rounded-full bg-red-500/30"></span>
              <div class="relative flex items-center justify-center bg-red-500 text-white rounded-full p-1.5 shadow-lg border border-red-400">
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
            .bindPopup(`<div class="p-1 font-sans"><h5 class="font-bold text-[11px] text-gray-900">${activeTask.property.name}</h5><p class="text-[9px] text-gray-500">${activeTask.property.address}</p></div>`);
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
            .bindPopup('<span class="text-xs font-bold text-gray-800">Posisi Anda</span>');

          L.marker([latitude, longitude], { icon: destinationIcon })
            .addTo(mapInstance)
            .bindPopup(`<div class="p-1 font-sans"><h5 class="font-bold text-[11px] text-gray-900">${activeTask.property.name}</h5><p class="text-[9px] text-gray-500">${activeTask.property.address}</p></div>`);

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
                    .bindPopup('<span class="text-xs font-bold text-gray-800">Posisi Anda</span>');

                  L.marker([latitude, longitude], { icon: destinationIcon })
                    .addTo(mapInstance)
                    .bindPopup(`<div class="p-1 font-sans"><h5 class="font-bold text-[11px] text-gray-900">${activeTask.property.name}</h5><p class="text-[9px] text-gray-500">${activeTask.property.address}</p></div>`);

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

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const fetchInspections = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/inspections');
      setInspections(response.data);
    } catch (err) {
      console.error('Failed to fetch inspections:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateOrderInvoice = async () => {
    setRequestLoading(true);
    setRequestError('');

    try {
      const comparisonId = `comp_${Date.now()}`;

      const createdIds: string[] = [];
      if (orderCategory === 'single') {
        const fasilitasPayload: Record<string, any> = {};
        Object.keys(claims).forEach((key) => {
          fasilitasPayload[key] = { ada: (claims as any)[key] };
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

      await fetchInspections();
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

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
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

  const activeSteps = (() => {
    if (!activeTask?.property?.claim_data?.fasilitas) {
      return checkPoints;
    }
    const standardBoolean = checkPoints.filter(cp => cp.type === 'boolean' && activeTask.property.claim_data.fasilitas?.[cp.key]?.ada === true);
    const technical = checkPoints.filter(cp => cp.type === 'technical');
    
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

  const displayedInspections = role === 'inspektur'
    ? (activeTabInspector === 'my_tasks'
        ? inspections.filter(i => i.inspector_id !== null)
        : inspections.filter(i => i.inspector_id === null))
    : inspections;

  // Group completed inspections by comparison_id for Mahasiswa
  const mahasiswaCompleted = inspections.filter(i => i.status === 'completed');
  const comparisonGroups: Record<string, any[]> = {};
  mahasiswaCompleted.forEach(insp => {
    const compId = insp.property?.claim_data?.comparison_id;
    if (compId) {
      if (!comparisonGroups[compId]) {
        comparisonGroups[compId] = [];
      }
      comparisonGroups[compId].push(insp);
    }
  });

  const validComparisonGroups = Object.keys(comparisonGroups)
    .map(key => ({
      id: key,
      items: comparisonGroups[key]
    }))
    .filter(g => g.items.length >= 2);

  const hasCompletedLocations = inspections.some(
    (insp) => insp.status === 'completed' && insp.property?.claim_data?.location?.latitude
  );

  return (
    <div className="min-h-screen bg-[#080c14] text-gray-100 font-sans flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-0 right-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/Logo InspeksiKos..webp" alt="InspeksiKos Logo" className="h-8 w-auto object-contain" />
              <span className="text-sm font-extrabold tracking-tight text-[#003057] font-mono hidden sm:inline">
                InspeksiKos
              </span>
            </Link>
            <span className="text-[9px] px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-extrabold rounded-md uppercase tracking-wider font-mono">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hidden md:flex">
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

              {role === 'mahasiswa' && validComparisonGroups.length > 0 && (
                <div className="bg-[#0c1220]/75 border border-indigo-900/35 rounded-2xl p-5 shadow-2xl backdrop-blur-md mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                    Analisis Perbandingan Multi-Kos Anda
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {validComparisonGroups.map((group) => {
                      const names = group.items.map(i => i.property.name).join(' vs ');
                      return (
                        <div key={group.id} className="p-4 bg-[#090d16]/80 border border-gray-800 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <p className="text-xs font-extrabold text-white truncate">{names}</p>
                            <p className="text-[10px] text-gray-500 font-medium">Membandingkan {group.items.length} properti kos</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedComparisonGroup(group.items);
                              setShowComparisonModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-[9px] rounded-lg tracking-wider uppercase shrink-0 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                          >
                            Bandingkan
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-[#0c1220]/70 border border-gray-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-800 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-500" />
                    Daftar Permintaan Inspeksi ({displayedInspections.length})
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    {role === 'inspektur' && (
                      <div className="flex bg-[#090d16] p-0.5 rounded-lg border border-gray-800">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTabInspector('my_tasks');
                            setActiveTask(null);
                          }}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
                            activeTabInspector === 'my_tasks'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-white'
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
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
                            activeTabInspector === 'available_orders'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          🔔 Orderan Baru
                        </button>
                      </div>
                    )}
                    <button
                      onClick={fetchInspections}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#0f172a] border border-gray-850 hover:border-gray-800 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {displayedInspections.length === 0 ? (
                  <div className="text-center py-16 bg-[#090d16] rounded-xl border border-dashed border-gray-850">
                    <Building className="h-10 w-10 text-gray-650 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-400 mb-1">Belum Ada Sesi Inspeksi</p>
                    <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                      {role === 'mahasiswa'
                        ? 'Ajukan inspeksi kos pertama Anda dengan mengklik tombol "Ajukan Inspeksi" di pojok kanan atas.'
                        : (activeTabInspector === 'my_tasks'
                          ? 'Tidak ada tugas verifikasi aktif yang sedang Anda tangani.'
                          : 'Tidak ada pesanan inspeksi baru (Gojek-style) yang tersedia saat ini.')}
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
                          className={`p-4 rounded-xl border transition-all ${
                            isActive
                              ? 'border-blue-500 bg-blue-950/10 shadow-[0_0_15px_-3px_rgba(59,130,246,0.1)]'
                              : isUnassigned
                              ? 'border-amber-900/40 bg-amber-955/5 hover:border-amber-700/60'
                              : 'border-gray-800/80 bg-[#090e1a]/60 hover:border-gray-700/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white">
                                  {insp.property?.name || 'Properti Tanpa Nama'}
                                </span>
                                {isUnassigned ? (
                                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-900/60 animate-pulse">
                                    Tersedia (Gojek Match)
                                  </span>
                                ) : (
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
                                )}
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
                                  {isUnassigned ? (
                                    <button
                                      onClick={() => handleAcceptOrder(insp.inspection_id)}
                                      disabled={acceptingTaskLoading[insp.inspection_id]}
                                      className="px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900/40 text-black rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-1 hover:scale-[1.02]"
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
                            className="w-full h-56 rounded-xl overflow-hidden bg-gray-900 border border-gray-850 z-10 shadow-inner"
                            style={{ minHeight: '224px' }}
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

       {/* Modal - Request Inspection (Mahasiswa) - Gojek Style Wizard */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
          <div className="bg-[#0c1220] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-gray-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>⚡ Pesan Verifikator Kos (Gojek-Style)</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseRequestModal}
                className="text-gray-400 hover:text-white font-bold text-[10px] uppercase tracking-wider"
              >
                Tutup
              </button>
            </div>

            {requestError && (
              <div className="mb-4 p-3 text-xs text-red-400 bg-red-955/20 border border-red-900/30 rounded-xl text-center font-bold">
                ⚠️ {requestError}
              </div>
            )}

            {/* STEP 1: CATEGORY SELECTION */}
            {currentStepModal === 1 && (
              <div className="space-y-5 py-2">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Pilih jenis layanan verifikasi kos yang Anda inginkan. Sistem kami akan menghubungkan Anda dengan Inspektur terdekat untuk melakukan audit langsung di lapangan.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {/* Single Kos Option */}
                  <label
                    onClick={() => setOrderCategory('single')}
                    className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
                      orderCategory === 'single'
                        ? 'border-blue-500 bg-blue-950/10'
                        : 'border-gray-800 bg-[#090e1a]/40 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderCategory"
                      checked={orderCategory === 'single'}
                      onChange={() => setOrderCategory('single')}
                      className="hidden"
                    />
                    <div className="h-9 w-9 rounded-lg bg-blue-950/40 border border-blue-900/50 flex items-center justify-center shrink-0 text-lg">
                      🏠
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white block">Inspeksi Tunggal</span>
                        <span className="text-[10px] font-black text-blue-400">Rp 50.000</span>
                      </div>
                      <span className="text-[9px] text-gray-500 block leading-relaxed mt-0.5">
                        Verifikasi 1 properti kos. Dapatkan scorecard Gemini AI untuk fasilitas iklan.
                      </span>
                    </div>
                  </label>

                  {/* Multi-Kos Option */}
                  <label
                    onClick={() => setOrderCategory('multi')}
                    className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
                      orderCategory === 'multi'
                        ? 'border-blue-500 bg-blue-950/10'
                        : 'border-gray-800 bg-[#090e1a]/40 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderCategory"
                      checked={orderCategory === 'multi'}
                      onChange={() => setOrderCategory('multi')}
                      className="hidden"
                    />
                    <div className="h-9 w-9 rounded-lg bg-purple-950/40 border border-purple-900/50 flex items-center justify-center shrink-0 text-lg">
                      🏢
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white block">Multi-Kos (Grup Banding)</span>
                        <span className="text-[10px] font-black text-purple-400">Rp 45.000 <span className="text-[8px] font-normal text-gray-400">/ kos</span></span>
                      </div>
                      <span className="text-[9px] text-gray-500 block leading-relaxed mt-0.5">
                        Verifikasi 2 sampai 5 kos secara bersamaan. Dapatkan lembar perbandingan dasbor interaktif.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStepModal(2)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
                  >
                    Lanjut Pengisian Form
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: FILL FORMS */}
            {currentStepModal === 2 && (
              <div className="space-y-4 py-2">
                
                {orderCategory === 'single' ? (
                  /* Form Single Kos */
                  <form onSubmit={(e) => { e.preventDefault(); handleCreateOrderInvoice(); }} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nama Properti Kos</label>
                      <input
                        type="text"
                        required
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        placeholder="Contoh: Kos Anggrek Indah TRPL"
                        className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Alamat Lengkap</label>
                      <input
                        type="text"
                        required
                        value={propertyAddress}
                        onChange={(e) => setPropertyAddress(e.target.value)}
                        placeholder="Jl. Limau Manis No. 40, Padang"
                        className="w-full px-3.5 py-2.5 bg-[#080d1a] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Lokasi Koordinat Kos</label>
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
                            className="w-full h-48 rounded-xl overflow-hidden bg-gray-950 border border-gray-850 z-10"
                            style={{ minHeight: '192px' }}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" readOnly placeholder="Latitude" value={selectedLat ? selectedLat.toFixed(6) : ''} className="w-full px-3 py-2 bg-[#080d1a] border border-gray-850 rounded-xl text-xs text-gray-400 font-mono" />
                        <input type="text" readOnly placeholder="Longitude" value={selectedLng ? selectedLng.toFixed(6) : ''} className="w-full px-3 py-2 bg-[#080d1a] border border-gray-850 rounded-xl text-xs text-gray-400 font-mono" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Deskripsi Fasilitas Iklan</label>
                      <textarea
                        value={propertyDesc}
                        onChange={(e) => setPropertyDesc(e.target.value)}
                        placeholder="Catatan mengenai fasilitas..."
                        rows={2}
                        className="w-full px-3.5 py-2 bg-[#080d1a] border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono border-b border-gray-850 pb-1">Klaim Fasilitas Iklan</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(claims).map((facility) => (
                          <label key={facility} className="flex items-center gap-2 p-2 bg-[#090e1a] border border-gray-850 rounded-xl text-[10px] text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(claims as any)[facility]}
                              onChange={(e) => setClaims({ ...claims, [facility]: e.target.checked })}
                              className="rounded border-gray-800 text-blue-600 focus:ring-0 bg-gray-900"
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (!customFacilitySingle.trim()) return;
                              const cleanName = customFacilitySingle.trim().toLowerCase().replace(/\s+/g, '_');
                              setClaims((prev) => ({ ...prev, [cleanName]: true }));
                              setCustomFacilitySingle('');
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#080d1a] border border-gray-800 focus:border-blue-500 rounded-xl text-[10px] text-white placeholder-gray-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomFacilitySingle}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[9px] uppercase tracking-wider transition-all"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 block font-mono uppercase">TDS Air (ppm)</label>
                        <input type="number" required value={tdsExpectation} onChange={(e) => setTdsExpectation(Number(e.target.value))} className="w-full px-3 py-2 bg-[#080d1a] border border-gray-805 rounded-xl text-xs text-white" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 block font-mono uppercase">Wifi (Mbps)</label>
                        <input type="number" required value={internetExpectation} onChange={(e) => setInternetExpectation(Number(e.target.value))} className="w-full px-3 py-2 bg-[#080d1a] border border-gray-805 rounded-xl text-xs text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-850 pt-4 mt-6">
                      <button type="button" onClick={() => setCurrentStepModal(1)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white uppercase">Kembali</button>
                      <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider">Lanjut Bayar</button>
                    </div>
                  </form>
                ) : (
                  /* Form Multi-Kos */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Mendaftarkan {multiProperties.length} Kos</span>
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
                        className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/60 font-bold px-2.5 py-1.5 rounded-lg hover:bg-indigo-900/40"
                      >
                        ➕ Tambah Kos
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1">
                      {multiProperties.map((p, idx) => (
                        <div key={idx} className="p-4 bg-[#090d16]/70 border border-gray-850 rounded-xl space-y-3 relative">
                          <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                            <span className="text-[10px] font-bold text-white uppercase">Kos Properti #{idx + 1}</span>
                            {multiProperties.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...multiProperties];
                                  copy.splice(idx, 1);
                                  setMultiProperties(copy);
                                }}
                                className="text-[9px] text-red-400 font-bold hover:underline"
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
                              className="w-full px-3 py-2 bg-[#080d1a] border border-gray-850 rounded-lg text-xs text-white"
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
                              className="w-full px-3 py-2 bg-[#080d1a] border border-gray-850 rounded-lg text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-gray-500 uppercase font-mono">Pin Lokasi</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...multiProperties];
                                  copy[idx].showPicker = !copy[idx].showPicker;
                                  setMultiProperties(copy);
                                }}
                                className="text-[9px] text-blue-400 font-bold hover:underline"
                              >
                                {p.showPicker ? 'Tutup Peta' : '📍 Pilih di Peta'}
                              </button>
                            </div>
                            {p.showPicker && (
                              <div className="border border-gray-850 rounded-xl p-2 bg-[#090d16] space-y-2">
                                <div
                                  id={`map-picker-container-${idx}`}
                                  className="w-full h-48 rounded-xl overflow-hidden bg-gray-950 border border-gray-850 z-10"
                                  style={{ minHeight: '192px' }}
                                />
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-gray-500">
                              <span>Lat: {p.lat ? p.lat.toFixed(5) : '-'}</span>
                              <span>Lng: {p.lng ? p.lng.toFixed(5) : '-'}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-gray-400 block font-mono border-b border-gray-855 pb-0.5">Fasilitas</span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {Object.keys(p.claims).map((facility) => (
                                <label key={facility} className="flex items-center gap-1 p-1 bg-[#090e1a] border border-gray-850 rounded-lg text-[9px] text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={(p.claims as any)[facility]}
                                    onChange={(e) => {
                                      const copy = [...multiProperties];
                                      copy[idx].claims[facility] = e.target.checked;
                                      setMultiProperties(copy);
                                    }}
                                    className="rounded border-gray-800 text-blue-600 focus:ring-0 scale-75 bg-gray-900"
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
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
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
                                  }
                                }}
                                className="flex-1 px-2 py-1 bg-[#080d1a] border border-gray-850 focus:border-indigo-500 rounded-md text-[9px] text-white focus:outline-none placeholder-gray-650"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleAddCustomFacilityMulti(idx, e)}
                                className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900/60 text-indigo-400 border border-indigo-900/60 font-bold rounded-md text-[8px] uppercase tracking-wider transition-all"
                              >
                                Tambah
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-850 pt-4 mt-6">
                      <button type="button" onClick={() => setCurrentStepModal(1)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white uppercase">Kembali</button>
                      <button
                        type="button"
                        onClick={handleCreateOrderInvoice}
                        disabled={requestLoading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5"
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
              <div className="space-y-5 py-2 text-center">
                <div className="p-4 bg-[#090d16] border border-gray-855 rounded-xl text-left space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Invoice Ringkasan Transaksi</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Jenis Layanan:</span>
                      <span className="text-white font-bold">{orderCategory === 'single' ? 'Inspeksi Tunggal (1 Properti)' : `Multi-Kos (${multiProperties.length} Properti)`}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-850 pt-1 mt-1 font-extrabold text-sm">
                      <span className="text-gray-300">Total Tagihan:</span>
                      <span className="text-emerald-400">
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
                        <div className="bg-[#0b172a] border border-blue-900/60 rounded-xl p-3.5 text-center space-y-1.5 max-w-sm mx-auto shadow-inner">
                          <div className="flex items-center justify-center gap-1.5 text-blue-400">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-xs font-bold font-mono tracking-wider uppercase text-blue-300">Midtrans Sandbox Active</span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Menggunakan gerbang pembayaran resmi Midtrans Sandbox. Pindai kode QRIS di bawah atau klik tombol untuk membayar.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-[#1f160c] border border-amber-900/40 rounded-xl p-3.5 text-center space-y-1.5 max-w-sm mx-auto shadow-inner">
                          <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider uppercase">Mode Simulator Pembayaran</span>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Kunci API Midtrans belum dikonfigurasi. Menggunakan simulator internal InspeksiKos.
                          </p>
                        </div>
                      )}

                      <div className="border border-gray-800 rounded-2xl p-5 bg-white max-w-[240px] mx-auto space-y-3 shadow-inner">
                        {/* QRIS Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                          <span className="text-xs font-extrabold text-[#da251d]">QRIS</span>
                          <span className="text-[8px] font-black text-blue-900 font-mono">GPN</span>
                        </div>
                        
                        {/* Real scannable QR Code */}
                        <div className="p-2 border border-gray-100 rounded-lg flex items-center justify-center bg-white">
                          {activeRequestInspectionIds.length > 0 ? (
                            <img src={qrUrl} alt="QR Code" className="w-[140px] h-[140px]" />
                          ) : (
                            <div className="w-[140px] h-[140px] flex items-center justify-center text-gray-400 text-[10px] font-mono">
                              Memuat QR Code...
                            </div>
                          )}
                        </div>

                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider font-mono">
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
                              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-[11px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 uppercase tracking-wider"
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

                <p className="text-[9px] text-gray-405 max-w-xs mx-auto leading-relaxed">
                  Silakan scan QRIS di atas dengan aplikasi pembayaran Anda (Gopay, OVO, Dana, LinkAja) atau klik tombol di atas untuk melanjutkan pembayaran.
                </p>

                <div className="flex items-center justify-between border-t border-gray-850 pt-4 mt-6">
                  <button type="button" onClick={() => setCurrentStepModal(2)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white uppercase">Kembali</button>
                  <button
                    type="button"
                    disabled={true}
                    className="px-5 py-2.5 bg-gray-800 text-gray-500 border border-gray-700/60 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed w-56"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    Menunggu Pembayaran...
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: RADAR MATCHING ANIMATION */}
            {currentStepModal === 4 && (
              <div className="space-y-6 py-6 text-center">
                
                {matchingStatus === 'searching' ? (
                  <div className="space-y-6">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      {/* Radar pulses */}
                      <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <span className="absolute inset-2 rounded-full bg-indigo-500/30 animate-pulse" style={{ animationDuration: '1.5s' }} />
                      <div className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Mencari Inspektur...</h4>
                      <p className="text-[9px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                        Menghubungkan dengan verifikasi bersertifikat terdekat dari lokasi kosan untuk langsung mengaudit ke lapangan.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="h-12 w-12 rounded-full bg-emerald-950 border border-emerald-900/60 flex items-center justify-center mx-auto text-xl shadow-lg shadow-emerald-900/20 text-emerald-400">
                      ✔
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider text-emerald-400">Inspektur Ditemukan!</h4>
                      <p className="text-[9px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                        Inspektur mitra kami telah menerima pesanan verifikasi Anda.
                      </p>
                    </div>

                    {/* Driver Card */}
                    {mockInspector && (
                      <div className="p-4 bg-[#090d16] border border-gray-850 rounded-xl flex items-center gap-4 text-left max-w-xs mx-auto">
                        <img src={mockInspector.avatar} alt={mockInspector.name} className="w-10 h-10 rounded-full border border-gray-800 object-cover" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-extrabold text-white block truncate">{mockInspector.name}</span>
                          <span className="text-[9px] text-gray-500 font-medium block">⭐ {mockInspector.rating} • Mitra Lapangan</span>
                          <span className="text-[9px] text-blue-400 font-mono block mt-0.5">{mockInspector.phone}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleCloseRequestModal}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
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
      )}

      {/* Modal - Multi-Kos Comparison Panel */}
      {showComparisonModal && selectedComparisonGroup.length >= 2 && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
          <div className="bg-[#0c1220] rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative border border-gray-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                  Hasil Analisis Komparatif Properti Kos
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed font-medium">
                  Perbandingan data iklan vs hasil verifikasi lapangan (TDS air, Wifi speed, fasilitas) bersertifikasi AI.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowComparisonModal(false);
                  setSelectedComparisonGroup([]);
                }}
                className="text-gray-400 hover:text-white font-extrabold text-[10px] uppercase tracking-wider"
              >
                Tutup
              </button>
            </div>

            {/* Smart Recommendation Card */}
            {(() => {
              const sorted = [...selectedComparisonGroup].sort(
                (a, b) => Number(b.audit_report?.score || 0) - Number(a.audit_report?.score || 0)
              );
              const bestKos = sorted[0];
              return (
                <div className="mb-6 p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-extrabold px-3 py-1 uppercase rounded-bl-lg tracking-wider">
                    Rekomendasi Terbaik
                  </div>
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                    🌟 Pilihan Utama: {bestKos.property.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                    Berdasarkan verifikasi lapangan, properti ini memiliki tingkat akreditasi tertinggi sebesar <strong className="text-emerald-400 font-extrabold">{bestKos.audit_report?.score}%</strong> dengan kualitas air bersih ({bestKos.tds_value} ppm) dan kecepatan internet ({bestKos.internet_speed} Mbps) yang paling unggul.
                  </p>
                </div>
              );
            })()}

            {/* Comparison Table */}
            <div className="overflow-x-auto border border-gray-800 rounded-xl bg-[#090d16]/50 shadow-inner">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/40 text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="p-3 w-1/4">Parameter</th>
                    {selectedComparisonGroup.map((insp) => (
                      <th key={insp.inspection_id} className="p-3 text-center border-l border-gray-800/60 font-black text-white">
                        {insp.property.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 font-medium">
                  {/* Score */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-300">Skor Akreditasi</td>
                    {selectedComparisonGroup.map((insp) => (
                      <td key={insp.inspection_id} className="p-3 text-center border-l border-gray-800/60">
                        <span className="font-extrabold text-xs text-blue-400">
                          {insp.audit_report?.score}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Validity status */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-300">Status Validitas</td>
                    {selectedComparisonGroup.map((insp) => (
                      <td key={insp.inspection_id} className="p-3 text-center border-l border-gray-800/60">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          insp.audit_report?.confidence_level === 'VALID'
                            ? 'bg-emerald-955 text-emerald-400'
                            : insp.audit_report?.confidence_level === 'PARTIAL_VALID'
                            ? 'bg-blue-950 text-blue-400 animate-pulse'
                            : 'bg-red-955 text-red-400'
                        }`}>
                          {insp.audit_report?.confidence_level?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Water TDS */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-300">Kualitas Air (TDS)</td>
                    {selectedComparisonGroup.map((insp) => (
                      <td key={insp.inspection_id} className="p-3 text-center border-l border-gray-800/60 font-mono text-gray-200">
                        {insp.tds_value} ppm
                        <span className="block text-[8px] text-gray-500 font-bold uppercase mt-0.5">
                          {Number(insp.tds_value) <= 300 ? '🟢 Sangat Baik' : Number(insp.tds_value) <= 500 ? '🟡 Layak' : '🔴 Buruk'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Internet Speed */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-300">Kecepatan WiFi</td>
                    {selectedComparisonGroup.map((insp) => (
                      <td key={insp.inspection_id} className="p-3 text-center border-l border-gray-800/60 font-mono text-gray-200">
                        {insp.internet_speed} Mbps
                        <span className="block text-[8px] text-gray-500 font-bold uppercase mt-0.5">
                          {Number(insp.internet_speed) >= 20 ? '🟢 Cepat' : Number(insp.internet_speed) >= 10 ? '🟡 Cukup' : '🔴 Lambat'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* Address */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-300">Alamat Properti</td>
                    {selectedComparisonGroup.map((insp) => (
                      <td key={insp.inspection_id} className="p-3 border-l border-gray-800/60 text-gray-400 max-w-[200px] leading-relaxed">
                        {insp.property.address}
                      </td>
                    ))}
                  </tr>
                  {(() => {
                    const allKeys = new Set<string>();
                    selectedComparisonGroup.forEach((insp) => {
                      const claimFas = insp.property?.claim_data?.fasilitas || {};
                      Object.keys(claimFas).forEach((k) => {
                        if (k !== 'kualitas_air' && k !== 'kecepatan_internet' && claimFas[k]?.ada !== undefined) {
                          allKeys.add(k);
                        }
                      });
                    });
                    
                    return Array.from(allKeys).map((facilityKey) => {
                      return (
                        <tr key={facilityKey}>
                          <td className="p-3 font-semibold text-gray-300 capitalize">
                            Fasilitas {facilityKey.replace(/_/g, ' ')}
                          </td>
                          {selectedComparisonGroup.map((insp) => {
                            const claim = insp.property?.claim_data?.fasilitas?.[facilityKey]?.ada;
                            const actual = insp.inspector_data?.fasilitas?.[facilityKey]?.ada ?? claim;
                            return (
                              <td key={insp.inspection_id} className="p-3 text-center border-l border-gray-800/60">
                                {claim === undefined ? (
                                  <span className="text-gray-550 font-mono text-[8px] uppercase">TDK DIKLAIM</span>
                                ) : actual ? (
                                  <span className="text-emerald-400 font-bold">✔ Ada</span>
                                ) : (
                                  <span className="text-red-500 font-bold">✖ Tidak Ada</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
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
