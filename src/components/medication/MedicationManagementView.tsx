import React, { useState } from 'react';
import {
  Pill,
  CheckCircle,
  Clock,
  AlertTriangle,
  QrCode,
  Search,
  Filter,
  Check,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { PrintableBarcode } from '../common/PrintableBarcode';

export const MedicationManagementView: React.FC = () => {
  const {
    medicationOrders,
    marRecords,
    verifyMedicationOrderPharmacy,
    administerMedication,
    currentUser,
    patients,
  } = useEMR();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = medicationOrders.filter((ord) => {
    if (selectedFilter !== 'all' && ord.status !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.medicationName.toLowerCase().includes(q) ||
        ord.patientName.toLowerCase().includes(q) ||
        ord.mrn.toLowerCase().includes(q) ||
        ord.eTicketBarcode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <Pill className="w-5 h-5 text-teal-300" />
              </span>
              <h2 className="text-base font-extrabold tracking-wide">
                Medication Management (Closed-Loop Instalasi Farmasi)
              </h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Alur tertutup peresepan elektronik dokter, verifikasi telaah resep apoteker, pencetakan e-tiket barcode, dan verifikasi pemberian obat di bedside perawat.
            </p>
          </div>

          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/20 text-xs">
            <span className="text-[10px] uppercase font-bold text-teal-200 block">Status Farmasi:</span>
            <span className="font-semibold text-white">Depo Obat Puskesmas Siaga</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">Filter Status:</span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="all">Semua Status Resep</option>
              <option value="ordered">Menunggu Telaah Farmasi (Ordered)</option>
              <option value="ticket_generated">E-Tiket Barcode Terbit</option>
              <option value="administered">Sudah Diberikan (Administered)</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari obat, pasien, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Prescription & E-Ticket Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((ord) => {
          const pt = patients.find((p) => p.id === ord.patientId);

          return (
            <div
              key={ord.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between text-xs space-y-3"
            >
              {/* Card Top: Patient Info & Status */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{ord.patientName}</span>
                    <div className="text-[10px] font-mono text-slate-500">
                      {ord.mrn} • {pt?.roomName || 'Bed'} {pt?.bedNumber || ''}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.status === 'ticket_generated'
                        ? 'bg-teal-100 text-teal-900 border border-teal-200'
                        : ord.status === 'administered'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                    }`}
                  >
                    {ord.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Medication Details */}
                <div className="pt-2 space-y-1">
                  <div className="text-base font-extrabold text-blue-950">{ord.medicationName}</div>
                  <div className="text-slate-700 font-semibold">
                    {ord.dosage} • Rute: {ord.route} • {ord.frequency}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Instruksi: <strong>{ord.instructions}</strong> (Jumlah: {ord.quantity})
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Dokter: {ord.orderingDoctorName} ({ord.orderDateTime})
                  </div>
                </div>

                {/* Allergy Check Alert if matched */}
                {pt && pt.allergies.length > 0 && (
                  <div className="mt-2 p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-800 text-[10px] flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Alergi Terdaftar: {pt.allergies.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Barcode E-Ticket Section */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                <PrintableBarcode
                  value={ord.eTicketBarcode}
                  type="code128"
                  label="E-TIKET OBAT PUSKESMAS"
                  subLabel={`${ord.medicationName} • ${ord.patientName}`}
                  width={180}
                  height={36}
                />
              </div>

              {/* Actions depending on user role */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {ord.status === 'ordered' ? (
                  <button
                    onClick={() => verifyMedicationOrderPharmacy(ord.id)}
                    className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold shadow flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verifikasi Telaah Resep & Terbitkan E-Tiket</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between w-full text-[10px] text-slate-500">
                    <span>
                      Diverifikasi: <strong>{ord.verifiedByPharmacist || 'Apt. Rina Kusuma'}</strong>
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center space-x-0.5"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Cetak</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
