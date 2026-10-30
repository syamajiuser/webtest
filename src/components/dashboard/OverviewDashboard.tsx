import React from 'react';
import {
  Bed,
  Users,
  AlertTriangle,
  Pill,
  TestTube2,
  Mic,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { calculateBedOccupancy, getSeverityStyle } from '../../utils/clinicalCalculations';

interface OverviewDashboardProps {
  onNavigate: (tab: string, patientId?: string) => void;
  onOpenVoiceModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onOpenVoiceModal,
}) => {
  const { beds, patients, medicationOrders, marRecords, labOrders, auditLogs, currentUser } = useEMR();
  const occupancy = calculateBedOccupancy(beds);

  const criticalPatients = patients.filter(
    (p) => p.clinicalSeverity === 'critical' || p.clinicalFlags.criticalAttention
  );
  const pendingMeds = marRecords.filter((m) => m.status === 'Scheduled');
  const pendingLabs = labOrders.filter((l) => l.status !== 'Result Released');

  // Severity counts
  const criticalCount = beds.filter((b) => b.status === 'occupied' && b.severity === 'critical').length;
  const severeCount = beds.filter((b) => b.status === 'occupied' && b.severity === 'severe').length;
  const moderateCount = beds.filter((b) => b.status === 'occupied' && b.severity === 'moderate').length;
  const stableCount = beds.filter((b) => b.status === 'occupied' && (b.severity === 'stable' || !b.severity)).length;

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#123B63] to-[#2563EB] text-white p-5 rounded-2xl shadow-lg border border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded">
              Puskesmas Rawat Inap
            </span>
            <span className="text-xs text-blue-200">Sistem VERA Terintegrasi</span>
          </div>
          <h1 className="text-xl font-extrabold mt-1 tracking-tight">
            Selamat Bertugas, {currentUser.name}
          </h1>
          <p className="text-xs text-blue-100 mt-0.5 max-w-xl leading-relaxed">
            Sistem rekam medis berbasis voice recognition siap membantu Anda mengurangi screen-driven distraction dan menjaga komunikasi terapeutik di bangsal rawat inap.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenVoiceModal}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition active:scale-95 animate-pulse"
          >
            <Mic className="w-4 h-4" />
            <span>Dikte Suara Visite</span>
          </button>
          <button
            onClick={() => onNavigate('scanner')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 shadow flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4 text-teal-300" />
            <span>Scan Barcode</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Beds */}
        <div
          onClick={() => onNavigate('beds')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Kapasitas Bed</span>
            <Bed className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{occupancy.totalBeds}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">4 Ruang Bangsal</div>
        </div>

        {/* Occupied Beds (Black) */}
        <div
          onClick={() => onNavigate('beds')}
          className="bg-[#111827] text-white p-3.5 rounded-xl border border-slate-700 shadow-sm cursor-pointer hover:border-slate-500 transition"
        >
          <div className="flex items-center justify-between text-slate-300 text-[11px] font-bold">
            <span>Bed Terisi (Black)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{occupancy.occupiedBeds}</div>
          <div className="text-[10px] text-teal-300 font-bold mt-0.5">{occupancy.occupancyRate}% BOR</div>
        </div>

        {/* Available Beds (Blue) */}
        <div
          onClick={() => onNavigate('beds')}
          className="bg-[#2563EB] text-white p-3.5 rounded-xl shadow-sm cursor-pointer hover:bg-blue-700 transition"
        >
          <div className="flex items-center justify-between text-blue-100 text-[11px] font-bold">
            <span>Bed Kosong (Blue)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{occupancy.availableBeds}</div>
          <div className="text-[10px] text-blue-100 mt-0.5">Siap Admisi Baru</div>
        </div>

        {/* Critical Attention */}
        <div
          onClick={() => onNavigate('beds')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-rose-400 transition"
        >
          <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold">
            <span>Pasien Kritis</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pengawasan Intensif</div>
        </div>

        {/* Pending Medications */}
        <div
          onClick={() => onNavigate('medication')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-purple-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Jadwal Obat</span>
            <Pill className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-950 mt-1">{pendingMeds.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Menunggu MAR Bedside</div>
        </div>

        {/* Pending Lab Tests */}
        <div
          onClick={() => onNavigate('laboratory')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Order Lab Aktif</span>
            <TestTube2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-900 mt-1">{pendingLabs.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Koleksi & Proses Lab</div>
        </div>
      </div>

      {/* Middle Row: Severity Acuity Breakdown & Quick Bed Status Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Acuity Distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-bold text-slate-900 text-xs">Distribusi Tingkat Kegawatan Pasien</span>
            <span className="text-[10px] font-mono text-slate-500">{occupancy.occupiedBeds} Pasien Dirawat</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-[#7F1D1D]" />
                <span>Kritis / Paliatif (#7F1D1D)</span>
              </span>
              <span className="font-extrabold text-slate-900">{criticalCount} pasien</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-[#DC2626]" />
                <span>Berat / Severe (#DC2626)</span>
              </span>
              <span className="font-extrabold text-slate-900">{severeCount} pasien</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-[#FACC15]" />
                <span>Sedang / Moderate (#FACC15)</span>
              </span>
              <span className="font-extrabold text-slate-900">{moderateCount} pasien</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-[#16A34A]" />
                <span>Stabil / Terkontrol (#16A34A)</span>
              </span>
              <span className="font-extrabold text-slate-900">{stableCount} pasien</span>
            </div>
          </div>

          <div className="pt-2 border-t text-[11px] text-slate-500">
            Penetapan kegawatan diverifikasi oleh dokter DPJP pada bed tile bangsal.
          </div>
        </div>

        {/* Live Clinical Activities Feed */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-bold text-slate-900 text-xs">Aktivitas Klinis Terkini (Live Audit Log)</span>
            <button
              onClick={() => onNavigate('users')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Lihat Semua Log &rarr;
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="pt-2 flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">{log.action}</div>
                    <div className="text-slate-600 text-[11px]">{log.details}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {log.userName} ({log.userRole})
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp.substring(11)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
