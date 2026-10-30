import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, Shield, Calendar, User, FileText } from 'lucide-react';
import { Patient, MedicalResume, DoctorAssessment, CPPTEntry } from '../../types/emr';
import { PrintableBarcode } from './PrintableBarcode';
import { VeraLogo } from './VeraLogo';
import { PoltekkesRibbon } from './PoltekkesRibbon';

interface MedicalResumePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  resume?: MedicalResume;
  doctorAssessment?: DoctorAssessment;
  recentCPPT?: CPPTEntry[];
}

export const MedicalResumePDFModal: React.FC<MedicalResumePDFModalProps> = ({
  isOpen,
  onClose,
  patient,
  resume,
  doctorAssessment,
  recentCPPT = [],
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Printable view optimized for Save as PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden my-auto">
        {/* Top Action Bar (Screen Only) */}
        <div className="bg-[#123B63] text-white px-5 py-3 flex items-center justify-between border-b border-blue-900 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-teal-300" />
            <h3 className="font-extrabold text-sm sm:text-base tracking-wide">
              Pratinjau Resmi Resume Medis Pasien Pulang (PDF Ready)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-bold flex items-center space-x-1.5 shadow transition"
              title="Cetak Langsung atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow font-bold"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:bg-white print:p-0">
          <div
            ref={printAreaRef}
            className="w-full max-w-3xl bg-white shadow-lg print:shadow-none border border-slate-200 print:border-none p-6 sm:p-10 font-sans text-slate-800 text-xs space-y-5 rounded-lg print:rounded-none"
            id="printable-medical-resume"
          >
            {/* Header / Kop Puskesmas Resmi */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-full bg-teal-700 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                  +
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                    PEMERINTAH KABUPATEN BOGOR • DINAS KESEHATAN
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    PUSKESMAS RAWAT INAP SUKAMAJU SEJAHTERA
                  </h1>
                  <p className="text-[10px] text-slate-500">
                    Jl. Raya Sehat No. 102, Sukamaju • Telp: (021) 876-5432 • Email: info@puskesmas-sukamaju.go.id
                  </p>
                  <p className="text-[9px] text-teal-700 font-semibold font-mono">
                    Akreditasi Paripurna Kemenkes RI • Standar Rekam Medis Permenkes No. 24 / 2022
                  </p>
                </div>
              </div>

              <div className="text-right">
                <PrintableBarcode
                  value={patient.wristbandToken}
                  type="code128"
                  label="VERA EMR VERIFIED"
                  subLabel={patient.mrn}
                  width={140}
                  height={32}
                />
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-2 bg-slate-100 rounded border border-slate-300">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                RESUME MEDIS RAWAT INAP (DISCHARGE CLINICAL SUMMARY)
              </h2>
              <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                Nomor Berkas: RES/{patient.mrn}/{new Date().getFullYear()}
              </div>
            </div>

            {/* Section 1: Demografi Pasien */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-2 uppercase text-teal-800">
                I. Identitas Pasien Rawat Inap
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium">Nama Lengkap:</span>{' '}
                  <strong className="text-slate-900">{patient.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">No. Rekam Medis (MRN):</span>{' '}
                  <strong className="text-blue-900 font-mono">{patient.mrn}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Nomor Induk Kependudukan (NIK):</span>{' '}
                  <span className="font-mono">{patient.nik}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Tanggal Lahir / Usia:</span>{' '}
                  <span>{patient.birthDate} ({patient.age} tahun)</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Jenis Kelamin / Gol. Darah:</span>{' '}
                  <span>{patient.gender} • Golongan {patient.bloodType}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Alamat Domisili:</span>{' '}
                  <span>{patient.address}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Ruang Rawat / Bed:</span>{' '}
                  <strong className="text-slate-800">{patient.roomName || 'Ruang Melati'} Bed {patient.bedNumber || 'A01'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Tgl Masuk & Keluar:</span>{' '}
                  <span>{patient.admissionDate} s/d {new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Diagnosis & Alasan Rawat */}
            <div className="border border-slate-200 rounded p-3">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-2 uppercase text-teal-800">
                II. Riwayat & Diagnosis Klinis (ICD-10)
              </h3>
              <div className="space-y-2 text-[11px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-semibold">Diagnosis Masuk (Admission):</span>
                    <strong className="text-slate-800 text-xs">
                      {resume?.admissionDiagnosis || patient.primaryDiagnosis}
                    </strong>
                  </div>
                  <div className="bg-blue-50/60 p-2 rounded border border-blue-200">
                    <span className="text-blue-700 text-[10px] block font-semibold">Diagnosis Utama Akhir (Discharge):</span>
                    <strong className="text-blue-950 text-xs">
                      {resume?.finalDiagnosis || patient.primaryDiagnosis} (ICD-10: {resume?.icd10 || patient.icd10Code})
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block">Alasan Masuk & Keluhan Utama:</span>
                  <p className="text-slate-700 mt-0.5">
                    {patient.admissionReason || doctorAssessment?.chiefComplaint || 'Demam tinggi mendadak hari ke-4 disertai lemas dan nyeri sendi.'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block">Ringkasan Perjalanan Klinis Selama Perawatan:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                    {resume?.clinicalCourseSummary ||
                      'Pasien dirawat dengan terapi rehidrasi kristaloid intravena, evaluasi berkala tanda vital tiap 4 jam, monitoring serial trombosit dan hematokrit. Kondisi klinis berangsur membaik tanpa tanda syok maupun perdarahan masif.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Tanda Vital & Penunjang Terakhir */}
            <div className="border border-slate-200 rounded p-3">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-2 uppercase text-teal-800">
                III. Kondisi Fisik & Pemeriksaan Penunjang Terakhir
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] mb-2">
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block">Tekanan Darah</span>
                  <span className="font-bold text-slate-800 text-xs">{doctorAssessment?.vitalSigns.bloodPressure || '118/76 mmHg'}</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block">Frekuensi Nadi</span>
                  <span className="font-bold text-slate-800 text-xs">{doctorAssessment?.vitalSigns.heartRate || '80 x/mnt'}</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block">Suhu Tubuh</span>
                  <span className="font-bold text-slate-800 text-xs">{doctorAssessment?.vitalSigns.temperature || '36.8 °C'}</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block">Saturasi SpO2</span>
                  <span className="font-bold text-slate-800 text-xs">{doctorAssessment?.vitalSigns.oxygenSaturation || '99%'}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">Hasil Laboratorium Kunci: </span>
                {resume?.labFindingsSummary || 'Hemoglobin 14.1 g/dL, Hematokrit 41%, Leukosit 3.400 /uL, Trombosit 78.000 /uL (meningkat stabil), Dengue NS1 Ag Reaktif.'}
              </div>
            </div>

            {/* Section 4: Obat Pulang & Rencana Kontrol */}
            <div className="border border-slate-200 rounded p-3">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 mb-2 uppercase text-teal-800">
                IV. Terapi Obat Pulang & Edukasi Pasien
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-800 block mb-1">Daftar Obat Dibawa Pulang:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    {resume?.medicationsAtDischarge.map((m, i) => (
                      <li key={i}>{m}</li>
                    )) || (
                      <>
                        <li>Paracetamol 500mg tab — 3 x 1 tablet (prn demam/pusing)</li>
                        <li>Curcuma tablet — 3 x 1 tablet sesudah makan</li>
                        <li>Oralit sachet — 1 bungkus bila lemas / diare</li>
                      </>
                    )}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block mb-1">Kondisi & Jadwal Kontrol:</span>
                  <div className="text-slate-700 space-y-1">
                    <div>
                      Keadaan Keluar:{' '}
                      <strong className="text-emerald-700 font-bold">{resume?.conditionAtDischarge || 'Membaik (Sembuh)'}</strong>
                    </div>
                    <div>
                      Tanggal Kontrol:{' '}
                      <strong className="text-blue-900">{resume?.followUpClinicDate || '5 hari ke Poli Penyakit Dalam / Poli Umum'}</strong>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      Instruksi: {resume?.dischargeInstructions || 'Banyak minum air putih 2-2.5L/hari, hindari aktivitas berat, segera ke UGD jika demam tinggi berulang atau timbul perdarahan.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Tanda Tangan & Otorisasi Sah */}
            <div className="pt-4 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-700 border-t border-slate-200">
              <div>
                <div className="text-slate-500 mb-1">Pasien / Keluarga Pasien</div>
                <div className="h-14 flex items-center justify-center text-slate-400 italic">
                  (Tanda Tangan)
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  {patient.name}
                </div>
                <div className="text-slate-500">Penerima Resume Medis</div>
              </div>

              <div>
                <div className="text-slate-500 mb-1">Perekam Medis & Admisi</div>
                <div className="h-14 flex flex-col items-center justify-center">
                  <div className="text-teal-700 font-mono text-[9px] font-bold border border-teal-500/50 px-2 py-0.5 rounded bg-teal-50">
                    VERIFIED E-RM
                  </div>
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  Zefan Adiputra Golo, S.KM., M.Kes
                </div>
                <div className="text-slate-500">SIPRMIK.445/009/RM/2023</div>
              </div>

              <div>
                <div className="text-slate-500 mb-1">Dokter Penanggung Jawab (DPJP)</div>
                <div className="h-14 flex flex-col items-center justify-center">
                  <div className="text-blue-800 font-mono text-[9px] font-bold border border-blue-500/50 px-2 py-0.5 rounded bg-blue-50">
                    DIGITALLY SIGNED
                  </div>
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  dr. Budi Santoso, Sp.PD
                </div>
                <div className="text-slate-500">SIP.446/012/DPJP-PKM/2024</div>
              </div>
            </div>

            {/* Bottom Poltekkes Decorative Border */}
            <div className="pt-4 border-t border-slate-100">
              <PoltekkesRibbon height={24} />
            </div>
          </div>
        </div>

        {/* Modal Footer (Screen Only) */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs print:hidden">
          <span className="text-slate-500">
            Dokumen resmi rekam medis Puskesmas Rawat Inap Sukamaju Sejahtera.
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg shadow flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
