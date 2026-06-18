'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

import InspectorDashboard from '../../dashboard/components/InspectorDashboard';
import ReportModal from '../../dashboard/components/ReportModal';

export default function InspekturDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Core Data
  const [inspections, setInspections] = useState<any[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<any | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('user_role');
      const userEmail = localStorage.getItem('user_email');
      const token = localStorage.getItem('access_token');

      if (!token || userRole !== 'inspektur') {
        router.push('/login');
        return;
      }

      setEmail(userEmail);
      fetchInspections();
    }
  }, []);

  // Check if Leaflet is ready
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

  // Poll inspections in background (every 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInspections(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    // Clear cookies too
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
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

  if (loading && !email) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="text-xs font-semibold font-mono">Mengotentikasi Dasbor Inspektur...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      <InspectorDashboard
        email={email}
        inspections={inspections}
        loading={loading}
        fetchInspections={fetchInspections}
        mapReady={mapReady}
        handleLogout={handleLogout}
        onViewReport={handleViewReport}
        setSelectedInspection={setSelectedInspection}
        setShowReportModal={setShowReportModal}
      />

      {/* Shared Modals */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedInspection(null);
        }}
        inspection={selectedInspection}
      />
    </div>
  );
}
