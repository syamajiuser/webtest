import React from 'react';
import {
  X,
  Heart,
  Pill,
  UtensilsCrossed,
  TestTube2,
  Calendar,
  User,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';

interface PatientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientPortalModal: React.FC<PatientPortalModalProps> = ({ isOpen, onClose }) => {
  const { selectedPatient, patients, medicationOrders, dietaryOrders, labResults } = useEMR();
  const pt = selectedPatient || patients[0];

  if (!isOpen || !pt) return null;

  const meds = medicationOrders.filter((m) => m.patientId === pt.id);
  const diets = dietaryOrders.filter((d) => d.patientId === pt.id);
  const labs = labResults.filter((l) => l.patientId === pt.id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-[#123B63] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-200 font-bold">
                Portal Pasien & Keluarga • VERA Care
              </div>
              <h3 className="font-extrabold text-base text-white">{pt.name}</h3>
              <div className="text-xs text-blue-100">
                {pt.roomName || 'Bangsal'} • Bed {pt.bedNumber || '-'} (DPJP: {pt.dpjpName})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
          {/* Friendly Greeting Card */}
          <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-xl text-teal-950 space-y-1">
            <div className="font-bold text-sm">Informasi Perawatan Anda Hari Ini</div>
            <p className="text-xs leading-relaxed text-teal-900">
              Dokter dan perawat Puskesmas mendokumentasikan perkembangan kesehatan Anda secara langsung menggunakan teknologi pengenalan suara VERA agar dapat melayani dan mendengarkan Anda dengan penuh perhatian.
            </p>
          </div>

          {/* Diagnosis & Care Plan */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 text-blue-900">
              <User className="w-4 h-4" />
              <span>Kondisi & Diagnosis Anda:</span>
            </div>
            <div className="text-slate-800 font-semibold text-xs">
              {pt.primaryDiagnosis}
            </div>
            <div className="text-slate-500 text-[11px]">
              Tanggal Masuk: {pt.admissionDate} • Penanggung Jawab: {pt.dpjpName}
            </div>
          </div>

          {/* Medication Schedule */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 text-purple-900">
              <Pill className="w-4 h-4" />
              <span>Jadwal Obat Anda:</span>
            </div>
            <div className="space-y-1.5">
              {meds.length > 0 ? (
                meds.map((m) => (
                  <div key={m.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{m.medicationName}</div>
                      <div className="text-slate-500 text-[11px]">{m.dosage} • {m.frequency}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {m.instructions}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">Tidak ada jadwal obat saat ini.</div>
              )}
            </div>
          </div>

          {/* Dietary Menu */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 text-emerald-900">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Jadwal Makanan & Gizi:</span>
            </div>
            <div className="space-y-1.5">
              {diets.length > 0 ? (
                diets.map((d) => (
                  <div key={d.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="font-bold text-slate-900">{d.dietType} ({d.caloriesTarget})</div>
                    <div className="text-slate-600 text-[11px]">{d.textureModification} • {d.schedule}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">Catatan: {d.specialInstructions}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">Diet normal Puskesmas.</div>
              )}
            </div>
          </div>

          {/* Friendly Education & Guidance */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Petunjuk Keselamatan Pasien Rawat Inap:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Pastikan gelang barcode selalu terpasang di pergelangan tangan Anda selama dirawat.</li>
              <li>Jangan ragu menekan bel panggil atau meminta bantuan perawat jika ingin ke kamar mandi untuk mencegah risiko jatuh.</li>
              <li>Tanyakan kepada perawat bila ada obat atau tindakan yang belum Anda pahami.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#123B63] hover:bg-blue-900 text-white font-bold rounded-lg text-xs"
          >
            Tutup Portal Pasien
          </button>
        </div>
      </div>
    </div>
  );
};
