import React, { useState } from 'react';
import {
  Bed as BedIcon,
  UserPlus,
  AlertTriangle,
  Pill,
  TestTube2,
  UtensilsCrossed,
  Syringe,
  Wind,
  ShieldAlert,
  Brain,
  Lock,
  Stethoscope,
  HeartPulse,
  Eye,
  LogOut,
  X,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { Bed, ClinicalSeverity, Patient } from '../../types/emr';
import { calculateBedOccupancy, getSeverityStyle } from '../../utils/clinicalCalculations';

interface InpatientBedDashboardProps {
  onNavigateToEMR: (patientId?: string, targetTab?: string) => void;
}

export const InpatientBedDashboard: React.FC<InpatientBedDashboardProps> = ({
  onNavigateToEMR,
}) => {
  const {
    beds,
    patients,
    selectedPatient,
    setSelectedPatient,
    selectedBed,
    setSelectedBed,
    admitPatient,
    dischargePatient,
    updateBedSeverity,
    currentUser,
  } = useEMR();

  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAdmissionModal, setShowAdmissionModal] = useState<boolean>(false);
  const [showPatientDrawer, setShowPatientDrawer] = useState<boolean>(false);
  const [targetAdmissionBed, setTargetAdmissionBed] = useState<Bed | null>(null);

  // Admission form state
  const [admName, setAdmName] = useState('');
  const [admNik, setAdmNik] = useState('');
  const [admAge, setAdmAge] = useState<number>(35);
  const [admGender, setAdmGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [admDiagnosis, setAdmDiagnosis] = useState('');
  const [admReason, setAdmReason] = useState('');
  const [admSeverity, setAdmSeverity] = useState<ClinicalSeverity>('stable');

  const occupancy = calculateBedOccupancy(beds);

  const rooms = Array.from(new Set(beds.map((b) => b.roomName)));

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
    if (bed.status === 'occupied' && bed.patientId) {
      const pt = patients.find((p) => p.id === bed.patientId);
      if (pt) {
        setSelectedPatient(pt);
        setShowPatientDrawer(true);
      }
    } else if (bed.status === 'vacant') {
      setTargetAdmissionBed(bed);
      setShowAdmissionModal(true);
    }
  };

  const handleConfirmAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAdmissionBed || !admName.trim() || !admDiagnosis.trim()) return;

    admitPatient(
      {
        name: admName.trim(),
        nik: admNik.trim() || '3201000000000000',
        age: Number(admAge) || 30,
        gender: admGender,
        primaryDiagnosis: admDiagnosis.trim(),
        admissionReason: admReason.trim() || 'Rujukan pemeriksaan rawat inap Puskesmas',
        clinicalSeverity: admSeverity,
      },
      targetAdmissionBed.id
    );

    setShowAdmissionModal(false);
    // Reset form
    setAdmName('');
    setAdmNik('');
    setAdmDiagnosis('');
    setAdmReason('');
    setAdmSeverity('stable');
  };

  const filteredBeds = beds.filter((b) => {
    if (filterRoom !== 'all' && b.roomName !== filterRoom) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner: Mandatory Color Indicators & Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#172B4D] flex items-center space-x-2">
              <BedIcon className="w-5 h-5 text-[#2563EB]" />
              <span>Inpatient Bed Management Dashboard (EMR Ward)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi okupansi tempat tidur fisik dan tingkat keparahan klinis pasien Puskesmas Rawat Inap.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-slate-500">Total Bed: </span>
              <span className="font-bold text-slate-900">{occupancy.totalBeds}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-white border border-slate-800">
              <span className="text-slate-300">Terisi (Black): </span>
              <span className="font-bold text-teal-300">{occupancy.occupiedBeds}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white">
              <span>Tersedia (Blue): </span>
              <span className="font-bold text-white">{occupancy.availableBeds}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              <span>BOR (Occupancy): </span>
              <span className="font-bold text-blue-700">{occupancy.occupancyRate}%</span>
            </div>
          </div>
        </div>

        {/* Legend strip: Mandatory VERA Clinical System */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Status Bed:</span>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#2563EB]" />
              <span className="text-slate-600">Blue (#2563EB) — Bed Tersedia / Vacant</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#111827] border border-slate-600" />
              <span className="text-slate-600">Black (#111827) — Bed Terisi / Occupied</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-slate-500" />
              <span className="text-slate-600">Gray — Pemeliharaan</span>
            </div>
          </div>

          {/* Severity strip legend */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Tingkat Kegawatan (Strip Indikator):</span>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-3.5 rounded-sm bg-[#7F1D1D]" />
              <span className="text-slate-600">Kritis / Paliatif</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-3.5 rounded-sm bg-[#DC2626]" />
              <span className="text-slate-600">Berat</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-3.5 rounded-sm bg-[#FACC15]" />
              <span className="text-slate-600">Sedang</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-3.5 rounded-sm bg-[#16A34A]" />
              <span className="text-slate-600">Stabil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">Filter Ruangan:</span>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Ruangan (4 Bangsal)</option>
            {rooms.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <span className="font-bold text-slate-700 ml-2">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="occupied">Terisi Saja (Black)</option>
            <option value="vacant">Kosong Saja (Blue)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Klik bed hitam untuk <strong>Detail Pasien</strong>, klik bed biru untuk <strong>Admisi Pasien Baru</strong>.
        </div>
      </div>

      {/* Main Grid: Room Sections with 4 Beds Each */}
      <div className="space-y-6">
        {rooms
          .filter((roomName) => filterRoom === 'all' || filterRoom === roomName)
          .map((roomName) => {
            const roomBeds = filteredBeds.filter((b) => b.roomName === roomName);
            if (roomBeds.length === 0) return null;

            return (
              <div key={roomName} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Room Header */}
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-[#123B63]">{roomName}</span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {roomBeds[0]?.roomCategory}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Kapasitas: {roomBeds.filter((b) => b.status === 'occupied').length} terisi / {roomBeds.length} bed
                  </div>
                </div>

                {/* 4 Beds Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roomBeds.map((bed) => {
                    const isOccupied = bed.status === 'occupied';
                    const isMaintenance = bed.status === 'maintenance';
                    const pt = isOccupied ? patients.find((p) => p.id === bed.patientId) : null;
                    const severity = getSeverityStyle(bed.severity || pt?.clinicalSeverity);

                    if (!isOccupied && !isMaintenance) {
                      // VACANT BED: BLUE (#2563EB)
                      return (
                        <div
                          key={bed.id}
                          onClick={() => handleBedClick(bed)}
                          className="group relative rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white p-4 shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] border-2 border-blue-400/40 hover:border-white"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded">
                              {bed.bedNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 px-2 py-0.5 rounded">
                              Tersedia
                            </span>
                          </div>

                          <div className="my-auto text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 mx-auto flex items-center justify-center transition-transform group-hover:scale-110 mb-2">
                              <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div className="font-bold text-sm">Bed Kosong</div>
                            <div className="text-[11px] text-blue-100 mt-0.5">Siap Dialokasikan</div>
                          </div>

                          <button
                            type="button"
                            className="w-full py-1.5 bg-white text-[#2563EB] hover:bg-blue-50 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center space-x-1"
                          >
                            <span>+ Admisi Pasien</span>
                          </button>
                        </div>
                      );
                    }

                    if (isMaintenance) {
                      // MAINTENANCE BED: GRAY
                      return (
                        <div
                          key={bed.id}
                          className="rounded-xl bg-slate-600 text-slate-200 p-4 shadow min-h-[220px] flex flex-col justify-between border border-slate-500"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold bg-black/20 px-2 py-0.5 rounded">
                              {bed.bedNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded">
                              Maintenance
                            </span>
                          </div>
                          <div className="my-auto text-center py-4">
                            <div className="font-bold text-sm text-slate-100">Sedang Sterilisasi</div>
                            <div className="text-[11px] text-slate-300 mt-1">
                              Terakhir dibersihkan: {bed.lastCleaned || 'Hari ini'}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 text-center">
                            Tidak dapat dialokasikan untuk admisi langsung
                          </div>
                        </div>
                      );
                    }

                    // OCCUPIED BED: MANDATORY BLACK (#111827) BACKGROUND
                    // with Distinct Vertical Colored Strip / Badge for Clinical Severity
                    return (
                      <div
                        key={bed.id}
                        onClick={() => handleBedClick(bed)}
                        className={`group relative rounded-xl bg-[#111827] hover:bg-slate-900 text-white p-3.5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] border border-slate-700 hover:border-slate-400 ${
                          selectedPatient?.id === pt?.id ? 'ring-2 ring-teal-400 shadow-teal-500/20' : ''
                        }`}
                      >
                        {/* DISTINCT VERTICAL CLINICAL SEVERITY STRIP (Left Edge) */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 rounded-l-xl transition-all"
                          style={{ backgroundColor: severity.color }}
                          title={`Tingkat Kegawatan: ${severity.label}`}
                        />

                        {/* Top: Bed number, Room & Severity Badge */}
                        <div className="pl-1.5 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-mono font-extrabold bg-slate-800 px-2 py-0.5 rounded text-teal-300 border border-slate-700">
                              {bed.bedNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">{roomName}</span>
                          </div>

                          {/* Prominent Severity Badge */}
                          <div
                            className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${severity.badgeClass}`}
                          >
                            {severity.label}
                          </div>
                        </div>

                        {/* Patient Identity & MRN */}
                        <div className="pl-1.5 my-1.5">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-sm text-white truncate group-hover:text-teal-300">
                              {pt?.name || 'Pasien Terdaftar'}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                              {pt?.gender === 'Perempuan' ? 'P' : 'L'} • {pt?.age} th
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-teal-400/90 mt-0.5">
                            {pt?.mrn || 'RM-XXXX'}
                          </div>

                          {/* Primary Diagnosis */}
                          <div className="text-[11px] font-medium text-slate-300 line-clamp-2 mt-1 leading-tight">
                            {pt?.primaryDiagnosis || 'Observasi Klinis Rawat Inap'}
                          </div>
                        </div>

                        {/* Responsible Clinicians (DPJP & Perawat) */}
                        <div className="pl-1.5 text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 space-y-0.5">
                          <div className="truncate">
                            <span className="text-slate-500">DPJP: </span>
                            <span className="text-slate-300">{pt?.dpjpName || 'dr. Budi Santoso'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-500">Perawat: </span>
                            <span className="text-slate-300">{pt?.primaryNurseName || 'Ns. Dewi Sartika'}</span>
                          </div>
                        </div>

                        {/* Clinical Warning Icons & Status Symbols with Tooltips */}
                        <div className="pl-1.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                          {pt?.clinicalFlags.fallRisk && (
                            <span className="p-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]" title="⚠️ Risiko Jatuh (Morse Scale)">
                              ⚠️ Jatuh
                            </span>
                          )}
                          {pt?.clinicalFlags.ivTherapy && (
                            <span className="p-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]" title="💉 Terapi IV / Infus Aktif">
                              💉 IV
                            </span>
                          )}
                          {pt?.clinicalFlags.oxygenTherapy && (
                            <span className="p-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px]" title="🫁 Terapi Oksigen Aktif">
                              🫁 O2
                            </span>
                          )}
                          {pt?.clinicalFlags.medicationPending && (
                            <span className="p-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]" title="💊 Jadwal Obat Pending">
                              💊 Obat
                            </span>
                          )}
                          {pt?.clinicalFlags.labPending && (
                            <span className="p-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px]" title="🧪 Order Lab Belum Diambil">
                              🧪 Lab
                            </span>
                          )}
                          {pt?.clinicalFlags.specialDiet && (
                            <span className="p-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]" title="🍽️ Diet Khusus">
                              🍽️ Diet
                            </span>
                          )}
                          {pt?.clinicalFlags.criticalAttention && (
                            <span className="p-1 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50 text-[10px] animate-pulse" title="🚨 Perhatian Kritis">
                              🚨 Kritis
                            </span>
                          )}
                          {pt?.clinicalFlags.isolationPrecautions && (
                            <span className="p-1 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px]" title="🔒 Protokol Isolasi">
                              🔒 Isolasi
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* DETAILED PATIENT INFORMATION PANEL (DRAWER / MODAL) WHEN OCCUPIED BED IS CLICKED */}
      {showPatientDrawer && selectedPatient && selectedBed && selectedBed.status === 'occupied' && (
        <div className="fixed top-16 bottom-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-300 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right">
          {/* Drawer Header */}
          <div className="bg-[#123B63] text-white p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold bg-teal-500 text-white px-2 py-0.5 rounded">
                  {selectedPatient.roomName} {selectedPatient.bedNumber}
                </span>
                <span className="text-xs font-semibold text-blue-200">Encounter Rawat Inap</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">{selectedPatient.name}</h3>
              <div className="text-xs text-blue-200 font-mono">
                {selectedPatient.mrn} • NIK: {selectedPatient.nik}
              </div>
            </div>

            <button
              onClick={() => setShowPatientDrawer(false)}
              className="p-1.5 rounded-full hover:bg-blue-800 text-blue-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: Comprehensive Patient Profile & Actions */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
            {/* Quick Severity Selector */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Tingkat Keparahan Klinis (Confirmed by Clinician):</span>
                <span className="font-mono text-[10px] text-slate-500">Permenkes 24/2022</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['critical', 'severe', 'moderate', 'stable'] as ClinicalSeverity[]).map((sev) => {
                  const style = getSeverityStyle(sev);
                  const isCurrent = selectedPatient.clinicalSeverity === sev;
                  return (
                    <button
                      key={sev}
                      onClick={() => updateBedSeverity(selectedBed.id, sev)}
                      className={`py-1.5 px-1 rounded text-center text-[10px] font-bold border transition ${
                        isCurrent
                          ? `${style.badgeClass} ring-2 ring-blue-500 font-extrabold`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clinical Overview Card */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 border-b pb-1">Diagnosa & Penanggung Jawab</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Diagnosis Primer</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.primaryDiagnosis}</span>
                  <span className="text-[10px] font-mono text-blue-600 block">({selectedPatient.icd10Code})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tanggal Admisi</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.admissionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dokter DPJP</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.dpjpName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Perawat Penanggung Jawab</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.primaryNurseName}</span>
                </div>
              </div>
            </div>

            {/* Allergy Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <span className="font-bold text-amber-900 text-xs flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Peringatan Alergi:</span>
              </span>
              <div className="text-amber-800 text-[11px] mt-0.5">
                {selectedPatient.allergies.length > 0
                  ? selectedPatient.allergies.join(', ')
                  : 'Tidak ada riwayat alergi yang terdokumentasi.'}
              </div>
            </div>

            {/* Barcode Wristband Identifier */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Token Gelang Pasien (Wristband Barcode)
                </span>
                <span className="font-mono font-bold text-xs text-slate-900">
                  {selectedPatient.wristbandToken}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                Aktif & Terverifikasi
              </span>
            </div>

            {/* Quick Action Navigation to EMR tabs */}
            <div className="space-y-1.5 pt-2">
              <div className="font-bold text-slate-900 text-xs">Akses Cepat Modul Klinis EMR:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigateToEMR(selectedPatient.id, 'summary')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded font-semibold text-left flex items-center justify-between"
                >
                  <span>Ringkasan Pasien</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToEMR(selectedPatient.id, 'doctor')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded font-semibold text-left flex items-center justify-between"
                >
                  <span>Asesmen Dokter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToEMR(selectedPatient.id, 'nurse')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded font-semibold text-left flex items-center justify-between"
                >
                  <span>Asesmen Perawat</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToEMR(selectedPatient.id, 'cppt')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded font-semibold text-left flex items-center justify-between"
                >
                  <span>Catatan CPPT</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToEMR(selectedPatient.id, 'orders')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded font-semibold text-left flex items-center justify-between"
                >
                  <span>E-Resep & Lab</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigateToEMR(selectedPatient.id, 'lab-results')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded font-semibold text-left flex items-center justify-between"
                >
                  <span>Hasil Laboratorium</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer: Discharge Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm(`Konfirmasi pemulangan (discharge) pasien ${selectedPatient.name}? Bed ${selectedBed.bedNumber} akan otomatis menjadi kosong (Blue) kembali.`)) {
                  dischargePatient(selectedPatient.id);
                  setSelectedPatient(null);
                }
              }}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow"
            >
              <LogOut className="w-4 h-4" />
              <span>Pulangkan Pasien (Discharge)</span>
            </button>

            <button
              onClick={() => onNavigateToEMR(selectedPatient.id, 'summary')}
              className="px-4 py-2 bg-[#123B63] hover:bg-blue-900 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow"
            >
              <span>Buka EMR Lengkap &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* ADMISSION WORKFLOW MODAL WHEN VACANT BED IS CLICKED */}
      {showAdmissionModal && targetAdmissionBed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-[#123B63] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Admisi Pasien Baru Rawat Inap</h3>
                <div className="text-xs text-blue-200">
                  Alokasi Tempat Tidur: <strong>{targetAdmissionBed.roomName} — {targetAdmissionBed.bedNumber}</strong> ({targetAdmissionBed.roomCategory})
                </div>
              </div>
              <button
                onClick={() => setShowAdmissionModal(false)}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdmission} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Bpk. Muhammad Aris"
                  value={admName}
                  onChange={(e) => setAdmName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="3201..."
                    value={admNik}
                    onChange={(e) => setAdmNik(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usia (Tahun)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={admAge}
                    onChange={(e) => setAdmAge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={admGender}
                    onChange={(e) => setAdmGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosis Masuk / Kerja *</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: DHF Grade I / Hipertensi Urgensi / GEA Dehidrasi Sedang"
                  value={admDiagnosis}
                  onChange={(e) => setAdmDiagnosis(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keluhan / Alasan Rawat Inap</label>
                <textarea
                  rows={2}
                  placeholder="Keluhan utama pasien saat rujukan poli/IGD..."
                  value={admReason}
                  onChange={(e) => setAdmReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Kegawatan Klinis Awal</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['critical', 'severe', 'moderate', 'stable'] as ClinicalSeverity[]).map((sev) => {
                    const style = getSeverityStyle(sev);
                    return (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setAdmSeverity(sev)}
                        className={`py-1.5 px-1 rounded text-center text-[10px] font-bold border transition ${
                          admSeverity === sev
                            ? `${style.badgeClass} ring-2 ring-blue-500`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg shadow flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Admisi (Ubah Bed Jadi Black)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
