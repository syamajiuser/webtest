import React, { useState } from 'react';
import {
  FolderClock,
  Search,
  Printer,
  ShieldAlert,
  Apple,
  FileCheck2,
  ChevronRight,
  User,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { PrintableBarcode } from '../common/PrintableBarcode';
import { calculateMNAScore, getSeverityStyle } from '../../utils/clinicalCalculations';
import { MedicalResumePDFModal } from '../common/MedicalResumePDFModal';

export const MedicalRecordsView: React.FC = () => {
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    mnaRecords,
    mrsaRecords,
    medicalResumes,
    doctorAssessments,
    cpptEntries,
  } = useEMR();

  const [activePatientId, setActivePatientId] = useState(
    selectedPatient?.id || patients[0]?.id || 'PT-001'
  );
  const [showPDF, setShowPDF] = useState(false);
  const pt = patients.find((p) => p.id === activePatientId) || patients[0];

  const mna = mnaRecords[pt.id];
  const mrsa = mrsaRecords[pt.id];
  const resume = medicalResumes[pt.id];
  const cppt = cpptEntries.filter((c) => c.patientId === pt.id);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <FolderClock className="w-5 h-5 text-teal-300" />
              </span>
              <h2 className="text-base font-extrabold tracking-wide">
                Medical Records (Rekam Medis Longitudinal & Arsip Klinis)
              </h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Penyimpanan rekam medis elektronik berkesinambungan sesuai Permenkes No. 24 Tahun 2022, dilengkapi modul surveilans MRSA, skrining MNA, dan Resume Medis.
            </p>
          </div>

          <button
            onClick={() => setShowPDF(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow flex items-center space-x-1.5 transition cursor-pointer"
            title="Cetak & Unduh Resume Medis PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Resume (PDF)</span>
          </button>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 text-xs">
        <span className="font-bold text-slate-700">Pilih Berkas Rekam Medis Pasien:</span>
        <select
          value={pt.id}
          onChange={(e) => {
            setActivePatientId(e.target.value);
            const found = patients.find((p) => p.id === e.target.value);
            if (found) setSelectedPatient(found);
          }}
          className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-bold"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.mrn} — {p.name} ({p.roomName || 'Bed'} {p.bedNumber || ''})
            </option>
          ))}
        </select>
      </div>

      {/* Main Longitudinal Record Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Demographics & Wristband */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">Identitas Pasien</h3>
            <div className="space-y-1.5 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Lengkap:</span>
                <span className="font-bold text-slate-900 text-sm">{pt.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nomor Rekam Medis (MRN):</span>
                <span className="font-mono font-bold text-blue-900">{pt.mrn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">NIK:</span>
                <span className="font-mono">{pt.nik}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Usia & Jenis Kelamin:</span>
                <span>{pt.age} tahun, {pt.gender} (Gol. Darah {pt.bloodType})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Alamat:</span>
                <span>{pt.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kontak:</span>
                <span>{pt.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t flex flex-col items-center">
              <PrintableBarcode
                value={pt.wristbandToken}
                type="code128"
                label="TOKEN REKAM MEDIS"
                subLabel={pt.mrn}
                width={180}
                height={40}
              />
            </div>
          </div>

          {/* MRSA Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between border-b pb-1">
              <span className="font-bold text-slate-900">Surveilans MRSA</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                mrsa?.status === 'Positif' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {mrsa?.status || 'Negatif'}
              </span>
            </div>
            <div className="text-slate-600 text-[11px]">
              {mrsa?.notes || 'Tidak ditemukan kolonisasi MRSA.'}
            </div>
          </div>

          {/* MNA Score */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between border-b pb-1">
              <span className="font-bold text-slate-900">Skor Gizi MNA-SF</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                {mna ? `${mna.score}/14 (${mna.category})` : '13/14 (Normal)'}
              </span>
            </div>
            <div className="text-slate-600 text-[11px]">
              {mna?.recommendations || 'Status gizi terpantau baik.'}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Clinical History & Resume Medis */}
        <div className="lg:col-span-2 space-y-4">
          {/* Resume Medis Pulang */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-1">
              <h3 className="font-bold text-slate-900 text-sm">Resume Medis (Ringkasan Pulang Pasien)</h3>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Status: {resume?.status || 'Draft'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Diagnosis Admisi Masuk:</span>
                <span className="font-semibold">{resume?.admissionDiagnosis || pt.primaryDiagnosis}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Diagnosis Akhir:</span>
                <span className="font-bold text-blue-900">{resume?.finalDiagnosis || pt.primaryDiagnosis} ({pt.icd10Code})</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Perjalanan Klinis Selama Dirawat:</span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                {resume?.clinicalCourseSummary || 'Pasien dirawat dengan terapi standar dan observasi hemodinamik stabil.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-bold block mb-1">Obat Pulang:</span>
                <ul className="list-disc pl-4 text-slate-700">
                  {resume?.medicationsAtDischarge.map((m, i) => (
                    <li key={i}>{m}</li>
                  )) || <li>Paracetamol 500mg 3x1 prn</li>}
                </ul>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">Kondisi Saat Pulang:</span>
                <span className="font-bold text-emerald-800">{resume?.conditionAtDischarge || 'Membaik'}</span>
                <div className="text-slate-600 mt-1">
                  Kontrol: {resume?.followUpClinicDate || 'Dalam 5 hari'}
                </div>
              </div>
            </div>
          </div>

          {/* Chronological CPPT History */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1">
              Catatan CPPT Historis Terintegrasi ({cppt.length})
            </h3>
            <div className="space-y-2">
              {cppt.map((c) => (
                <div key={c.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                    <span>{c.authorName} ({c.authorRole})</span>
                    <span className="text-slate-400 font-mono">{c.dateTime}</span>
                  </div>
                  <div className="text-slate-700 text-xs">
                    <strong>S:</strong> {c.subjective}
                  </div>
                  <div className="text-slate-700 text-xs">
                    <strong>O:</strong> {c.objective}
                  </div>
                  <div className="text-slate-700 text-xs">
                    <strong>A:</strong> {c.assessment}
                  </div>
                  <div className="text-slate-700 text-xs">
                    <strong>P:</strong> {c.plan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Medical Resume PDF Modal */}
      <MedicalResumePDFModal
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        patient={pt}
        resume={resume}
        doctorAssessment={doctorAssessments[pt.id]}
        recentCPPT={cppt}
      />
    </div>
  );
};
