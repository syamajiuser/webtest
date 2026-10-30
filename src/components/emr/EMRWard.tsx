import React, { useState } from 'react';
import {
  FileText,
  UserCheck,
  Stethoscope,
  Activity,
  ClipboardList,
  Pill,
  TestTube2,
  FileCheck2,
  History,
  ShieldAlert,
  Apple,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Save,
  Printer,
  Mic,
  ChevronDown,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { CPPTEntry, DoctorAssessment, NurseAssessment } from '../../types/emr';
import { calculateMNAScore, getSeverityStyle } from '../../utils/clinicalCalculations';
import { PrintableBarcode } from '../common/PrintableBarcode';
import { MedicalResumePDFModal } from '../common/MedicalResumePDFModal';

interface EMRWardProps {
  initialTab?: string;
  onOpenVoiceModal?: () => void;
}

export const EMRWard: React.FC<EMRWardProps> = ({ initialTab = 'summary', onOpenVoiceModal }) => {
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    currentUser,
    doctorAssessments,
    nurseAssessments,
    cpptEntries,
    medicationOrders,
    marRecords,
    labOrders,
    labResults,
    dietaryOrders,
    mnaRecords,
    mrsaRecords,
    medicalResumes,
    saveDoctorAssessment,
    saveNurseAssessment,
    addCPPTEntry,
    createMedicationOrder,
    createLabOrder,
    saveMNARecord,
    saveMRSARecord,
    saveResumeMedis,
  } = useEMR();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [showResumePDF, setShowResumePDF] = useState<boolean>(false);

  const patient = selectedPatient || patients[0];

  // Forms states
  // New CPPT Form State
  const [showNewCPPT, setShowNewCPPT] = useState(false);
  const [cpptS, setCpptS] = useState('');
  const [cpptO, setCpptO] = useState('');
  const [cpptA, setCpptA] = useState('');
  const [cpptP, setCpptP] = useState('');

  // Doctor Assessment Form State
  const docAss = patient ? doctorAssessments[patient.id] : null;
  const [docComplaint, setDocComplaint] = useState(docAss?.chiefComplaint || '');
  const [docHPI, setDocHPI] = useState(docAss?.historyOfPresentIllness || '');
  const [docExam, setDocExam] = useState(docAss?.physicalExamination || '');
  const [docBP, setDocBP] = useState(docAss?.vitalSigns.bloodPressure || '120/80 mmHg');
  const [docHR, setDocHR] = useState(docAss?.vitalSigns.heartRate || '80 x/mnt');
  const [docRR, setDocRR] = useState(docAss?.vitalSigns.respiratoryRate || '20 x/mnt');
  const [docTemp, setDocTemp] = useState(docAss?.vitalSigns.temperature || '36.8 °C');
  const [docSpO2, setDocSpO2] = useState(docAss?.vitalSigns.oxygenSaturation || '98%');
  const [docPain, setDocPain] = useState(docAss?.vitalSigns.painScore || '0/10');
  const [docDiag, setDocDiag] = useState(docAss?.workingDiagnosis || patient?.primaryDiagnosis || '');
  const [docPlan, setDocPlan] = useState(docAss?.treatmentPlan || '');

  // Nurse Assessment Form State
  const nurseAss = patient ? nurseAssessments[patient.id] : null;
  const [nConscious, setNConscious] = useState(nurseAss?.consciousness || 'Compos Mentis');
  const [nProblem, setNProblem] = useState(nurseAss?.nursingProblemSDKI || 'D.0130 Hipertermia');
  const [nOutcome, setNOutcome] = useState(nurseAss?.nursingOutcomeSLKI || 'Termoregulasi Membaik (L.14134)');
  const [nIntervention, setNIntervention] = useState(nurseAss?.nursingInterventionSIKI || 'Manajemen Hipertermia (I.15506)');
  const [nEvaluation, setNEvaluation] = useState(nurseAss?.evaluation || 'Pasien merasa lebih nyaman setelah tirah baring.');

  // MNA Interactive State
  const currentMNA = patient ? mnaRecords[patient.id] : null;
  const [mnaAnswers, setMnaAnswers] = useState(
    currentMNA?.answers || {
      foodIntakeDecline: 2,
      weightLossRecent: 3,
      mobility: 2,
      psychologicalStress: 2,
      neuropsychological: 2,
      bmiScore: 2,
    }
  );

  // New E-Prescription Form State
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [rxName, setRxName] = useState('');
  const [rxStrength, setRxStrength] = useState('500 mg');
  const [rxDosage, setRxDosage] = useState('1 tablet');
  const [rxRoute, setRxRoute] = useState<'Oral' | 'IV Infus' | 'IV Bolus' | 'IM' | 'SC' | 'Inhalasi' | 'Topikal'>('Oral');
  const [rxFrequency, setRxFrequency] = useState('3 x 1 tablet');
  const [rxDuration, setRxDuration] = useState('3 hari');
  const [rxQuantity, setRxQuantity] = useState(10);
  const [rxInstructions, setRxInstructions] = useState('Diminum sesudah makan');

  // New Lab Order Form State
  const [showNewLabOrder, setShowNewLabOrder] = useState(false);
  const [labTestName, setLabTestName] = useState('Darah Lengkap (DL)');
  const [labCategory, setLabCategory] = useState<'Hematologi' | 'Kimia Darah' | 'Imunoserologi' | 'Urinalisis' | 'Mikrobiologi'>('Hematologi');
  const [labPriority, setLabPriority] = useState<'Cito (Darurat)' | 'Rutin'>('Rutin');
  const [labIndication, setLabIndication] = useState('Monitoring klinis rawat inap Puskesmas');

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        Tidak ada pasien terpilih. Silakan pilih pasien dari Inpatient Bed Dashboard.
      </div>
    );
  }

  const patientCPPT = cpptEntries.filter((c) => c.patientId === patient.id);
  const patientMeds = medicationOrders.filter((m) => m.patientId === patient.id);
  const patientMAR = marRecords.filter((m) => m.patientId === patient.id);
  const patientLabs = labOrders.filter((l) => l.patientId === patient.id);
  const patientLabResults = labResults.filter((r) => r.patientId === patient.id);
  const patientDiets = dietaryOrders.filter((d) => d.patientId === patient.id);
  const patientMRSA = mrsaRecords[patient.id];
  const patientResume = medicalResumes[patient.id];
  const severityStyle = getSeverityStyle(patient.clinicalSeverity);

  const tabs = [
    { id: 'summary', label: '1. Patient Summary', icon: UserCheck },
    { id: 'doctor', label: '2. Doctor Assessment', icon: Stethoscope },
    { id: 'nurse', label: '3. Nurse Assessment', icon: Activity },
    { id: 'cppt', label: '4. CPPT (SOAP)', icon: ClipboardList, count: patientCPPT.length },
    { id: 'orders', label: '5. Order Entry (Rx & Lab)', icon: Pill },
    { id: 'lab-results', label: '6. Laboratory Results', icon: TestTube2, count: patientLabResults.length },
    { id: 'mar', label: '7. Medication Admin (MAR)', icon: CheckCircle2, count: patientMAR.length },
    { id: 'history', label: '8. Medical History', icon: History },
    { id: 'resume', label: '9. Resume Medis', icon: FileCheck2 },
    { id: 'screening', label: '10. MRSA & MNA Screening', icon: ShieldAlert },
    { id: 'interventions', label: '11. Intervention History', icon: Clock },
  ];

  const handleSaveDocAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    saveDoctorAssessment({
      id: docAss?.id || `DOC-ASS-${Date.now()}`,
      patientId: patient.id,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      chiefComplaint: docComplaint,
      historyOfPresentIllness: docHPI,
      pastMedicalHistory: 'Gastritis, Hipertensi terkontrol',
      medicationHistory: 'Obat rutin sesuai riwayat',
      allergyHistory: patient.allergies.join(', ') || 'Nihil',
      familyHistory: 'Tidak ada penyakit menular spesifik di keluarga',
      physicalExamination: docExam,
      vitalSigns: {
        bloodPressure: docBP,
        heartRate: docHR,
        respiratoryRate: docRR,
        temperature: docTemp,
        oxygenSaturation: docSpO2,
        painScore: docPain,
      },
      clinicalFindings: docExam,
      workingDiagnosis: docDiag,
      icd10: patient.icd10Code || 'Z03.8',
      treatmentPlan: docPlan,
      followUpPlan: 'Visite q24h, monitoring tanda vital',
      responsibleDoctorName: currentUser.name,
      status: 'verified',
      signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    alert('Asesmen dokter berhasil disimpan dan ditandatangani secara elektronik!');
  };

  const handleSaveNurseAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    saveNurseAssessment({
      id: nurseAss?.id || `NURSE-ASS-${Date.now()}`,
      patientId: patient.id,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      consciousness: nConscious as any,
      gcs: '15 (E4M6V5)',
      vitalSigns: {
        bloodPressure: docBP,
        heartRate: docHR,
        respiratoryRate: docRR,
        temperature: docTemp,
        oxygenSaturation: docSpO2,
        painScore: docPain,
      },
      respiratoryAssessment: 'Vesikuler, nafas teratur',
      cardiovascularAssessment: 'BJ I-II reguler, akral hangat',
      neurologicalAssessment: 'Pupil isokor, tidak ada defisit fokal',
      gastrointestinalAssessment: 'Peristaltik baik, nyeri tekan minimal',
      genitourinaryAssessment: 'BAK spontan adekuat',
      skinCondition: 'Turgor elastis, kebersihan kulit baik',
      mobilityStatus: 'Mobilisasi terbatas di tempat tidur',
      fallRiskScore: {
        historyOfFalling: 0,
        secondaryDiagnosis: 15,
        ambulatoryAid: 0,
        ivHeparinLock: 20,
        gaitTransferring: 10,
        mentalStatus: 0,
        totalScore: 45,
        riskCategory: 'Sedang',
      },
      pressureUlcerRiskBraden: 18,
      nursingProblemSDKI: nProblem,
      nursingOutcomeSLKI: nOutcome,
      nursingInterventionSIKI: nIntervention,
      evaluation: nEvaluation,
      responsibleNurseName: currentUser.name,
      status: 'verified',
    });
    alert('Asesmen keperawatan SDKI/SLKI/SIKI berhasil disimpan!');
  };

  const handleCreateCPPT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpptS || !cpptA) return;

    addCPPTEntry({
      patientId: patient.id,
      encounterId: 'ENC-2026-ACTIVE',
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      subjective: cpptS,
      objective: cpptO || 'TTV stabil',
      assessment: cpptA,
      plan: cpptP || 'Lanjutkan terapi',
      vitalSigns: { bloodPressure: docBP, heartRate: docHR, temperature: docTemp },
      verificationStatus: 'verified',
    });

    setCpptS('');
    setCpptO('');
    setCpptA('');
    setCpptP('');
    setShowNewCPPT(false);
  };

  const handleCreateRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxName.trim()) return;

    // Check allergy
    const matchAllergy = patient.allergies.some((a) =>
      rxName.toLowerCase().includes(a.toLowerCase().split(' ')[0])
    );
    if (matchAllergy) {
      if (
        !window.confirm(
          `PERINGATAN ALERGI: Pasien memiliki riwayat alergi yang cocok dengan obat ini (${patient.allergies.join(
            ', '
          )}). Lanjutkan resep dengan override klinis?`
        )
      ) {
        return;
      }
    }

    createMedicationOrder({
      patientId: patient.id,
      patientName: patient.name,
      mrn: patient.mrn,
      medicationName: rxName.trim(),
      strength: rxStrength,
      dosage: rxDosage,
      route: rxRoute,
      frequency: rxFrequency,
      duration: rxDuration,
      quantity: Number(rxQuantity) || 1,
      instructions: rxInstructions,
    });

    setRxName('');
    setShowNewPrescription(false);
    alert('Resep elektronik berhasil dibuat dan dikirim ke Instalasi Farmasi!');
  };

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault();
    createLabOrder({
      patientId: patient.id,
      patientName: patient.name,
      mrn: patient.mrn,
      testName: labTestName,
      category: labCategory,
      priority: labPriority,
      clinicalIndication: labIndication,
      specimenType: labCategory === 'Hematologi' ? 'Darah Vena' : 'Urin Pagi',
    });

    setShowNewLabOrder(false);
    alert('Order laboratorium berhasil dikirim. Barcode label spesimen telah diterbitkan!');
  };

  return (
    <div className="space-y-4">
      {/* Patient Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#123B63] text-white flex items-center justify-center font-extrabold text-base shadow">
              {patient.initials}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                  {patient.roomName || 'Admisi'} • Bed {patient.bedNumber || '-'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${severityStyle.badgeClass}`}>
                  {severityStyle.label}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                No. RM: <strong className="text-slate-800">{patient.mrn}</strong> • NIK: {patient.nik} • {patient.gender}, {patient.age} th • Gol. Darah: {patient.bloodType}
              </div>
            </div>
          </div>

          {/* Quick Doctor / Nurse & Allergy */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] block">DPJP & Perawat:</span>
              <span className="font-bold text-slate-800">{patient.dpjpName}</span>
              <span className="text-slate-500 text-[11px] block">/ {patient.primaryNurseName}</span>
            </div>

            <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <span className="text-amber-800 font-bold text-[10px] block flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>Status Alergi:</span>
              </span>
              <span className="font-bold text-amber-950">
                {patient.allergies.length ? patient.allergies.join(', ') : 'Nihil'}
              </span>
            </div>

            {/* Quick Voice button for this patient */}
            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow flex items-center space-x-1.5"
              >
                <Mic className="w-4 h-4 text-white" />
                <span>Dikte Suara Pasien Ini</span>
              </button>
            )}
          </div>
        </div>

        {/* Patient Switcher Dropdown */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Pilih Pasien Lain:</span>
            <select
              value={patient.id}
              onChange={(e) => {
                const found = patients.find((p) => p.id === e.target.value);
                if (found) setSelectedPatient(found);
              }}
              className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-medium"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn} • {p.roomName || 'Admisi'} {p.bedNumber || ''})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-500">
            Diagnosis: <strong className="text-slate-800">{patient.primaryDiagnosis}</strong> ({patient.icd10Code})
          </div>
        </div>
      </div>

      {/* Navigation Tabs (11 Functional Tabs) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB] bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-4">
          {/* TAB 1: PATIENT SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Vitals Summary Card */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-xs mb-2 flex items-center justify-between">
                    <span>Tanda-Tanda Vital Terakhir</span>
                    <span className="text-[10px] text-teal-600 font-mono">Hari ini</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Tekanan Darah</span>
                      <span className="font-extrabold text-slate-900">{docAss?.vitalSigns.bloodPressure || '118/76 mmHg'}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Frekuensi Nadi</span>
                      <span className="font-extrabold text-slate-900">{docAss?.vitalSigns.heartRate || '82 x/mnt'}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Suhu Tubuh</span>
                      <span className="font-extrabold text-slate-900">{docAss?.vitalSigns.temperature || '37.1 °C'}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Saturasi O2</span>
                      <span className="font-extrabold text-slate-900">{docAss?.vitalSigns.oxygenSaturation || '98%'}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Barcode Wristband Card */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center">
                  <div className="font-bold text-slate-900 text-xs">Gelang Identitas Pasien (Barcode)</div>
                  <PrintableBarcode
                    value={patient.wristbandToken}
                    type="code128"
                    label="GELANG PASIEN PUSKESMAS"
                    subLabel={`${patient.name} • ${patient.mrn}`}
                  />
                  <div className="text-[10px] text-slate-500">
                    Wajib dipindai sebelum pemberian obat dan pengambilan spesimen lab
                  </div>
                </div>

                {/* Active Clinical Flags */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-xs mb-2">Simbol & Status Peringatan Aktif</div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {patient.clinicalFlags.fallRisk && (
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-[11px]">
                        ⚠️ Risiko Jatuh Morse (Sedang/Tinggi)
                      </span>
                    )}
                    {patient.clinicalFlags.ivTherapy && (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-900 border border-blue-300 font-semibold text-[11px]">
                        💉 Jalur Infus IV Aktif
                      </span>
                    )}
                    {patient.clinicalFlags.oxygenTherapy && (
                      <span className="px-2 py-1 rounded bg-teal-100 text-teal-900 border border-teal-300 font-semibold text-[11px]">
                        🫁 Terapi Oksigen Kanul/Masker
                      </span>
                    )}
                    {patient.clinicalFlags.specialDiet && (
                      <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[11px]">
                        🍽️ Diet Medis Terjadwal
                      </span>
                    )}
                    {patient.clinicalFlags.bleedingRisk && (
                      <span className="px-2 py-1 rounded bg-rose-100 text-rose-900 border border-rose-300 font-semibold text-[11px]">
                        🩸 Waspada Tanda Perdarahan
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Care Summary */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-900 mb-2">Rencana Terapi Aktif Saat Ini:</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {docAss?.treatmentPlan || '1. IVFD Ringer Lactate 20 tetes/menit\n2. Paracetamol 500mg 3x1 prn\n3. Observasi tanda vital per 4 jam'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DOCTOR ASSESSMENT */}
          {activeTab === 'doctor' && (
            <form onSubmit={handleSaveDocAssessment} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Asesmen Awal & Harian Dokter (DPJP)</h3>
                  <p className="text-slate-500">Formulir pemeriksaan klinis terstruktur dokter penanggung jawab pasien.</p>
                </div>
                <div className="flex items-center space-x-2">
                  {onOpenVoiceModal && (
                    <button
                      type="button"
                      onClick={onOpenVoiceModal}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold flex items-center space-x-1"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Diktekan Voice</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-bold shadow flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Verifikasi & Tanda Tangani</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">1. Keluhan Utama (Chief Complaint)</label>
                  <input
                    type="text"
                    required
                    value={docComplaint}
                    onChange={(e) => setDocComplaint(e.target.value)}
                    placeholder="Keluhan utama yang dirasakan pasien..."
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Riwayat Penyakit Sekarang (RPS)</label>
                  <textarea
                    rows={2}
                    value={docHPI}
                    onChange={(e) => setDocHPI(e.target.value)}
                    placeholder="Kronologis onset, durasi, faktor yang memperberat/meringankan..."
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Vital Signs Grid */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-2">3. Pemeriksaan Tanda-Tanda Vital</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">TD (mmHg)</label>
                    <input
                      type="text"
                      value={docBP}
                      onChange={(e) => setDocBP(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Nadi (x/mnt)</label>
                    <input
                      type="text"
                      value={docHR}
                      onChange={(e) => setDocHR(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">RR (x/mnt)</label>
                    <input
                      type="text"
                      value={docRR}
                      onChange={(e) => setDocRR(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Suhu (°C)</label>
                    <input
                      type="text"
                      value={docTemp}
                      onChange={(e) => setDocTemp(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">SpO2 (%)</label>
                    <input
                      type="text"
                      value={docSpO2}
                      onChange={(e) => setDocSpO2(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Nyeri (0-10)</label>
                    <input
                      type="text"
                      value={docPain}
                      onChange={(e) => setDocPain(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">4. Pemeriksaan Fisik (Head-to-Toe / Status Lokalis)</label>
                <textarea
                  rows={2}
                  value={docExam}
                  onChange={(e) => setDocExam(e.target.value)}
                  placeholder="Mata, THT, Cor/Pulmo, Abdomen, Ekstremitas..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">5. Diagnosis Kerja / Banding</label>
                  <input
                    type="text"
                    required
                    value={docDiag}
                    onChange={(e) => setDocDiag(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">6. Rencana Terapi & Tindak Lanjut</label>
                  <textarea
                    rows={2}
                    value={docPlan}
                    onChange={(e) => setDocPlan(e.target.value)}
                    placeholder="Instruksi cairan, obat-obatan, diet, pemeriksaan penunjang..."
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-slate-500 text-[11px]">
                <span>Status Asesmen: <strong>{docAss?.status || 'Draft'}</strong></span>
                <span>Dokter Bertanggung Jawab: <strong>{docAss?.responsibleDoctorName || currentUser.name}</strong></span>
              </div>
            </form>
          )}

          {/* TAB 3: NURSE ASSESSMENT */}
          {activeTab === 'nurse' && (
            <form onSubmit={handleSaveNurseAssessment} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Asesmen Keperawatan & Rencana Asuhan (SDKI/SLKI/SIKI)</h3>
                  <p className="text-slate-500">Standar dokumentasi keperawatan Indonesia terintegrasi.</p>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold shadow flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Asesmen Keperawatan</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kesadaran</label>
                  <select
                    value={nConscious}
                    onChange={(e) => setNConscious(e.target.value as any)}
                    className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="Compos Mentis">Compos Mentis</option>
                    <option value="Apatis">Apatis</option>
                    <option value="Somnolen">Somnolen</option>
                    <option value="Sopor">Sopor</option>
                    <option value="Koma">Koma</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skor Risiko Jatuh Morse</label>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 block text-center">
                    {nurseAss?.fallRiskScore.totalScore || 45} (Risiko Sedang)
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skala Braden (Dekubitus)</label>
                  <span className="font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block text-center">
                    {nurseAss?.pressureUlcerRiskBraden || 19} (Risiko Rendah)
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perawat Penanggung Jawab</label>
                  <span className="font-semibold text-slate-800 block py-1">{nurseAss?.responsibleNurseName || currentUser.name}</span>
                </div>
              </div>

              {/* SDKI, SLKI, SIKI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Masalah Keperawatan (SDKI)</label>
                  <textarea
                    rows={3}
                    value={nProblem}
                    onChange={(e) => setNProblem(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Luaran Keperawatan (SLKI)</label>
                  <textarea
                    rows={3}
                    value={nOutcome}
                    onChange={(e) => setNOutcome(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Intervensi Keperawatan (SIKI)</label>
                  <textarea
                    rows={3}
                    value={nIntervention}
                    onChange={(e) => setNIntervention(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evaluasi Keperawatan (SOAP Keperawatan)</label>
                <textarea
                  rows={2}
                  value={nEvaluation}
                  onChange={(e) => setNEvaluation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </form>
          )}

          {/* TAB 4: CPPT (CATATAN PERKEMBANGAN PASIEN TERINTEGRASI) */}
          {activeTab === 'cppt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Catatan Perkembangan Pasien Terintegrasi (CPPT)</h3>
                  <p className="text-xs text-slate-500">
                    Kronologis catatan perkembangan SOAP dokter, perawat, dan farmasi dalam satu rekam medis bersama.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {onOpenVoiceModal && (
                    <button
                      onClick={onOpenVoiceModal}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Diktekan CPPT Suara</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowNewCPPT(!showNewCPPT)}
                    className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tulis CPPT Manual</span>
                  </button>
                </div>
              </div>

              {/* New CPPT Manual Form Modal/Collapse */}
              {showNewCPPT && (
                <form onSubmit={handleCreateCPPT} className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3 text-xs animate-in fade-in">
                  <div className="font-bold text-blue-900 text-sm">Entri Catatan CPPT Baru:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">S (Subjektif / Keluhan)</label>
                      <textarea
                        required
                        rows={2}
                        value={cpptS}
                        onChange={(e) => setCpptS(e.target.value)}
                        placeholder="Keluhan yang disampaikan pasien..."
                        className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">O (Objektif / Hasil Pemeriksaan & TTV)</label>
                      <textarea
                        rows={2}
                        value={cpptO}
                        onChange={(e) => setCpptO(e.target.value)}
                        placeholder="Hasil observasi fisik, tanda vital..."
                        className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">A (Asesmen / Perkembangan Klinis)</label>
                      <input
                        required
                        type="text"
                        value={cpptA}
                        onChange={(e) => setCpptA(e.target.value)}
                        placeholder="Diagnosis atau evaluasi masalah..."
                        className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">P (Plan / Tindak Lanjut)</label>
                      <textarea
                        rows={2}
                        value={cpptP}
                        onChange={(e) => setCpptP(e.target.value)}
                        placeholder="Rencana terapi, obat, diet, atau instruksi..."
                        className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-blue-200">
                    <button
                      type="button"
                      onClick={() => setShowNewCPPT(false)}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-bold shadow flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simpan & Verifikasi CPPT</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Chronological CPPT Entries Timeline */}
              <div className="space-y-3">
                {patientCPPT.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada catatan CPPT untuk pasien ini.
                  </div>
                ) : (
                  patientCPPT.map((cppt) => (
                    <div
                      key={cppt.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cppt.authorRole === 'Doctor'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : 'bg-teal-100 text-teal-900 border border-teal-200'
                            }`}
                          >
                            {cppt.authorRole === 'Doctor' ? 'Dokter DPJP' : 'Perawat Ruangan'}
                          </span>
                          <span className="font-bold text-slate-900">{cppt.authorName}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">{cppt.dateTime} WIB</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 text-slate-800">
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-bold text-blue-900 block text-[10px] uppercase mb-0.5">S (Subjektif):</span>
                          <p className="leading-relaxed">{cppt.subjective}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-bold text-blue-900 block text-[10px] uppercase mb-0.5">O (Objektif):</span>
                          <p className="leading-relaxed">{cppt.objective}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-bold text-blue-900 block text-[10px] uppercase mb-0.5">A (Asesmen):</span>
                          <p className="leading-relaxed font-semibold">{cppt.assessment}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-bold text-blue-900 block text-[10px] uppercase mb-0.5">P (Plan):</span>
                          <p className="leading-relaxed whitespace-pre-line">{cppt.plan}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <span>
                          Status Tanda Tangan: <strong className="text-emerald-700">Terverifikasi Sah ({cppt.signedBy || cppt.authorName})</strong>
                        </span>
                        <span className="font-mono">{cppt.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ORDER ENTRY (E-PRESCRIPTION & LAB ORDERS) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* SECTION 1: E-PRESCRIPTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">1. E-Prescription (Resep Elektronik Obat)</h3>
                    <p className="text-xs text-slate-500">Pemberian instruksi obat dengan pemeriksaan alergi otomatis dan penerbitan e-tiket barcode.</p>
                  </div>
                  <button
                    onClick={() => setShowNewPrescription(!showNewPrescription)}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tulis Resep Obat Baru</span>
                  </button>
                </div>

                {showNewPrescription && (
                  <form onSubmit={handleCreateRx} className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3 text-xs animate-in fade-in">
                    <div className="font-bold text-blue-900 text-sm">Formulir Peresepan Elektronik:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nama Obat *</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Paracetamol / Ceftriaxone / Amlodipine"
                          value={rxName}
                          onChange={(e) => setRxName(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kekuatan & Dosis</label>
                        <input
                          type="text"
                          value={rxStrength}
                          onChange={(e) => setRxStrength(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Rute Pemberian</label>
                        <select
                          value={rxRoute}
                          onChange={(e) => setRxRoute(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                        >
                          <option value="Oral">Oral</option>
                          <option value="IV Infus">IV Infus</option>
                          <option value="IV Bolus">IV Bolus</option>
                          <option value="IM">IM (Intramuskular)</option>
                          <option value="SC">SC (Subkutan)</option>
                          <option value="Inhalasi">Inhalasi</option>
                          <option value="Topikal">Topikal</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Frekuensi</label>
                        <input
                          type="text"
                          value={rxFrequency}
                          onChange={(e) => setRxFrequency(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Durasi</label>
                        <input
                          type="text"
                          value={rxDuration}
                          onChange={(e) => setRxDuration(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Jumlah</label>
                        <input
                          type="number"
                          min={1}
                          value={rxQuantity}
                          onChange={(e) => setRxQuantity(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Petunjuk Khusus</label>
                      <input
                        type="text"
                        value={rxInstructions}
                        onChange={(e) => setRxInstructions(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-blue-200">
                      <button
                        type="button"
                        onClick={() => setShowNewPrescription(false)}
                        className="px-3 py-1 text-slate-600 hover:text-slate-800 font-medium"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-bold shadow"
                      >
                        Kirim Resep ke Farmasi
                      </button>
                    </div>
                  </form>
                )}

                {/* Medication List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {patientMeds.map((med) => (
                    <div
                      key={med.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">{med.medicationName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                          {med.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        {med.dosage} • {med.route} • {med.frequency} • {med.duration}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Petunjuk: <strong>{med.instructions}</strong>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-500">{med.eTicketBarcode}</span>
                        <PrintableBarcode
                          value={med.eTicketBarcode}
                          type="code128"
                          showText={false}
                          width={120}
                          height={28}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: LABORATORY ORDER */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">2. Laboratory Orders (Permintaan Laboratorium)</h3>
                    <p className="text-xs text-slate-500">Permintaan tes lab dengan penerbitan barcode tabung spesimen.</p>
                  </div>
                  <button
                    onClick={() => setShowNewLabOrder(!showNewLabOrder)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Buat Permintaan Lab</span>
                  </button>
                </div>

                {showNewLabOrder && (
                  <form onSubmit={handleCreateLab} className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 space-y-3 text-xs animate-in fade-in">
                    <div className="font-bold text-teal-900 text-sm">Permintaan Pemeriksaan Lab:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nama Pemeriksaan Lab</label>
                        <select
                          value={labTestName}
                          onChange={(e) => setLabTestName(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                        >
                          <option value="Darah Lengkap (DL)">Darah Lengkap (DL)</option>
                          <option value="Gula Darah Sewaktu (GDS)">Gula Darah Sewaktu (GDS)</option>
                          <option value="Widal / Dengue NS1">Widal / Dengue NS1</option>
                          <option value="Urinalisis Rutin">Urinalisis Rutin</option>
                          <option value="BTA Sputum">BTA Sputum</option>
                          <option value="Ureum / Kreatinin">Ureum / Kreatinin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                        <select
                          value={labCategory}
                          onChange={(e) => setLabCategory(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                        >
                          <option value="Hematologi">Hematologi</option>
                          <option value="Kimia Darah">Kimia Darah</option>
                          <option value="Imunoserologi">Imunoserologi</option>
                          <option value="Urinalisis">Urinalisis</option>
                          <option value="Mikrobiologi">Mikrobiologi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Prioritas</label>
                        <select
                          value={labPriority}
                          onChange={(e) => setLabPriority(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-bold"
                        >
                          <option value="Rutin">Rutin</option>
                          <option value="Cito (Darurat)">Cito (Darurat)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Indikasi Klinis</label>
                      <input
                        type="text"
                        value={labIndication}
                        onChange={(e) => setLabIndication(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-teal-200">
                      <button
                        type="button"
                        onClick={() => setShowNewLabOrder(false)}
                        className="px-3 py-1 text-slate-600 hover:text-slate-800 font-medium"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold shadow"
                      >
                        Kirim Permintaan Lab & Buat Label Barcode
                      </button>
                    </div>
                  </form>
                )}

                {/* Lab Orders List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {patientLabs.map((lab) => (
                    <div
                      key={lab.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">{lab.testName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            lab.priority.includes('Cito')
                              ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {lab.priority}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Kategori: <strong>{lab.category}</strong> • Spesimen: {lab.specimenType}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Status Alur: <strong className="text-teal-700">{lab.status}</strong>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-500">{lab.specimenLabelBarcode}</span>
                        <PrintableBarcode
                          value={lab.specimenLabelBarcode}
                          type="code128"
                          showText={false}
                          width={120}
                          height={28}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LABORATORY RESULTS */}
          {activeTab === 'lab-results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Hasil Pemeriksaan Laboratorium Pasien</h3>
                  <p className="text-xs text-slate-500">Tabel terstruktur dengan nilai rujukan baku dan penanda abnormalitas.</p>
                </div>
              </div>

              {patientLabResults.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada hasil laboratorium yang dirilis untuk pasien ini.
                </div>
              ) : (
                patientLabResults.map((res) => (
                  <div key={res.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">{res.testName}</span>
                        <div className="text-slate-500 text-[11px]">
                          Kategori: {res.category} • Diverifikasi oleh: <strong>{res.verifiedBy}</strong> ({res.completedAt})
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Hasil Sah Diverifikasi
                      </span>
                    </div>

                    {/* Results Table */}
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-700 border-b">
                          <th className="p-2 font-bold">Parameter Pemeriksaan</th>
                          <th className="p-2 font-bold">Hasil Pengukuran</th>
                          <th className="p-2 font-bold">Satuan</th>
                          <th className="p-2 font-bold">Nilai Rujukan Normal</th>
                          <th className="p-2 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {res.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-medium text-slate-800">{item.parameter}</td>
                            <td className="p-2 font-extrabold text-slate-900">{item.value}</td>
                            <td className="p-2 text-slate-500 font-mono">{item.unit}</td>
                            <td className="p-2 text-slate-600 font-mono">{item.referenceRange}</td>
                            <td className="p-2">
                              {item.flag === 'Low' && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                  Rendah (L)
                                </span>
                              )}
                              {item.flag === 'High' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                                  Tinggi (H)
                                </span>
                              )}
                              {item.flag === 'Critical' && (
                                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px] animate-pulse">
                                  KRITIS
                                </span>
                              )}
                              {item.flag === 'Normal' && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[10px]">
                                  Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 text-[11px]">
                      <strong>Catatan Klinis Laboratorium:</strong> {res.clinicalNotes}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: MEDICATION ADMINISTRATION RECORD (MAR) */}
          {activeTab === 'mar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Medication Administration Record (MAR)</h3>
                  <p className="text-xs text-slate-500">
                    Catatan pemberian obat closed-loop bedside terverifikasi barcode gelang dan e-tiket.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {patientMAR.map((mar) => (
                  <div
                    key={mar.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{mar.medicationName}</span>
                        <span className="font-semibold text-slate-500">({mar.dosage} • {mar.route})</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Jadwal: <strong>{mar.scheduledTime}</strong> • Eksekusi: {mar.administeredAt || 'Belum diberikan'}
                      </div>
                      {mar.notes && (
                        <div className="text-slate-700 text-[11px] mt-1 bg-slate-50 p-1.5 rounded">
                          Catatan: {mar.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            mar.status === 'Administered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {mar.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {mar.administeredBy ? `Oleh ${mar.administeredBy}` : 'Menunggu Perawat'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MEDICAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b">
                <h3 className="font-extrabold text-sm text-slate-900">Riwayat Medis Longitudinal Pasien</h3>
                <p className="text-slate-500">Penyakit terdahulu, alergi, dan riwayat pengobatan sebelumnya.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 text-sm block border-b pb-1">Riwayat Penyakit Dahulu (RPD)</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Demam Tifoid (dirawat 2 tahun lalu)</li>
                    <li>Gastritis Erosif berulang</li>
                    <li>Hipertensi derajat 1 sejak 2023</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 text-sm block border-b pb-1">Riwayat Alergi Terdokumentasi</span>
                  <div className="space-y-1 text-slate-700">
                    {patient.allergies.length ? (
                      patient.allergies.map((alg, i) => (
                        <div key={i} className="flex items-center space-x-2 text-rose-700 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{alg}</span>
                        </div>
                      ))
                    ) : (
                      <span>Tidak ada riwayat alergi obat maupun makanan.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: RESUME MEDIS (DISCHARGE SUMMARY) */}
          {activeTab === 'resume' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Resume Medis Rawat Inap (Ringkasan Pulang)</h3>
                  <p className="text-slate-500">Ringkasan perawatan pasien untuk kontinuitas asuhan atau rujukan faskes lanjutan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResumePDF(true)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
                  title="Cetak & Unduh Resume Medis PDF Resmi"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Resume (PDF)</span>
                </button>
              </div>

              {patientResume ? (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Diagnosis Masuk:</span>
                      <span className="font-bold text-slate-800">{patientResume.admissionDiagnosis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Diagnosis Akhir:</span>
                      <span className="font-bold text-blue-900">{patientResume.finalDiagnosis} ({patientResume.icd10})</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold block mb-1">Ringkasan Perjalanan Penyakit:</span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                      {patientResume.clinicalCourseSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-bold block mb-1">Obat Pulang:</span>
                      <ul className="list-disc pl-4 text-slate-700">
                        {patientResume.medicationsAtDischarge.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block mb-1">Instruksi & Tanggal Kontrol:</span>
                      <p className="text-slate-700">{patientResume.dischargeInstructions}</p>
                      <div className="mt-1 font-bold text-teal-800">Kontrol: {patientResume.followUpClinicDate}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400">
                  Resume medis belum disahkan. Dapat dibuat saat proses pemulangan pasien.
                </div>
              )}
            </div>
          )}

          {/* TAB 10: ASSESSMENT & SCREENING (MRSA & MNA MINI NUTRITIONAL ASSESSMENT) */}
          {activeTab === 'screening' && (
            <div className="space-y-6 text-xs">
              {/* SECTION A: MRSA SCREENING */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">A. Skrining & Status Infeksi MRSA</h4>
                    <p className="text-slate-500">Methicillin-Resistant Staphylococcus Aureus Surveillance.</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold border ${
                      patientMRSA?.status === 'Positif'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    Status: {patientMRSA?.status || 'Negatif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Tanggal Skrining</span>
                    <span className="font-semibold text-slate-800">{patientMRSA?.screeningDate || '2026-10-28'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Lokasi Swab</span>
                    <span className="font-semibold text-slate-800">{patientMRSA?.swabSite || 'Nasal'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Protokol Isolasi</span>
                    <span className="font-semibold text-slate-800">
                      {patientMRSA?.isolationPrecautionsActive ? 'Aktif' : 'Tidak Perlu'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Petugas Pemeriksa</span>
                    <span className="font-semibold text-slate-800">{patientMRSA?.updatedBy || 'Hendra Gunawan'}</span>
                  </div>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Catatan: {patientMRSA?.notes || 'Tidak ditemukan pertumbuhan MRSA pada kultur spesimen.'}
                </div>
              </div>

              {/* SECTION B: MNA (MINI NUTRITIONAL ASSESSMENT) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">B. Mini Nutritional Assessment (MNA-SF) Screening</h4>
                    <p className="text-slate-500">Instrumen tervalidasi skrining gizi geriatri & pasien rawat inap.</p>
                  </div>
                  {(() => {
                    const mnaCalc = calculateMNAScore(mnaAnswers);
                    return (
                      <div
                        className="px-3 py-1 rounded text-xs font-bold border"
                        style={{ backgroundColor: `${mnaCalc.color}15`, borderColor: mnaCalc.color, color: mnaCalc.color }}
                      >
                        Skor: {mnaCalc.score}/14 • {mnaCalc.category}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. Penurunan asupan makanan dalam 3 bulan terakhir karena nafsu makan berkurang / masalah cerna:
                    </label>
                    <select
                      value={mnaAnswers.foodIntakeDecline}
                      onChange={(e) => setMnaAnswers({ ...mnaAnswers, foodIntakeDecline: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>0 = Penurunan asupan berat</option>
                      <option value={1}>1 = Penurunan asupan sedang</option>
                      <option value={2}>2 = Tidak ada penurunan asupan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. Penurunan berat badan dalam 3 bulan terakhir:
                    </label>
                    <select
                      value={mnaAnswers.weightLossRecent}
                      onChange={(e) => setMnaAnswers({ ...mnaAnswers, weightLossRecent: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>0 = Penurunan BB &gt; 3 kg</option>
                      <option value={1}>1 = Tidak tahu</option>
                      <option value={2}>2 = Penurunan BB antara 1 - 3 kg</option>
                      <option value={3}>3 = Tidak ada penurunan berat badan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">3. Mobilitas:</label>
                    <select
                      value={mnaAnswers.mobility}
                      onChange={(e) => setMnaAnswers({ ...mnaAnswers, mobility: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>0 = Hanya di tempat tidur / kursi roda</option>
                      <option value={1}>1 = Mampu bangun dari tempat tidur tapi tidak keluar</option>
                      <option value={2}>2 = Mampu keluar ruangan / jalan sendiri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      4. Menderita stres psikologis atau penyakit akut dalam 3 bulan terakhir:
                    </label>
                    <select
                      value={mnaAnswers.psychologicalStress}
                      onChange={(e) => setMnaAnswers({ ...mnaAnswers, psychologicalStress: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>0 = Ya</option>
                      <option value={2}>2 = Tidak</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">5. Masalah neuropsikologis:</label>
                    <select
                      value={mnaAnswers.neuropsychological}
                      onChange={(e) => setMnaAnswers({ ...mnaAnswers, neuropsychological: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>0 = Demensia berat atau depresi berat</option>
                      <option value={1}>1 = Demensia ringan</option>
                      <option value={2}>2 = Tidak ada masalah psikologis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">6. Indeks Massa Tubuh (BMI / IMT):</label>
                    <select
                      value={mnaAnswers.bmiScore}
                      onChange={(e) => setMnaAnswers({ ...mnaAnswers, bmiScore: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>0 = BMI &lt; 19</option>
                      <option value={1}>1 = 19 &le; BMI &lt; 21</option>
                      <option value={2}>2 = 21 &le; BMI &lt; 23</option>
                      <option value={3}>3 = BMI &ge; 23</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {(() => {
                      const res = calculateMNAScore(mnaAnswers);
                      return (
                        <div className="text-slate-600">
                          Rekomendasi: <strong>{res.recommendation}</strong>
                        </div>
                      );
                    })()}

                    <button
                      type="button"
                      onClick={() => {
                        const res = calculateMNAScore(mnaAnswers);
                        saveMNARecord({
                          id: `MNA-${Date.now()}`,
                          patientId: patient.id,
                          screeningDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                          answers: mnaAnswers,
                          score: res.score,
                          category: res.category,
                          assessedBy: currentUser.name,
                          recommendations: res.recommendation,
                        });
                        alert('Skrining MNA berhasil disimpan ke rekam medis!');
                      }}
                      className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-bold shadow"
                    >
                      Simpan Skor MNA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: INTERVENTION HISTORY */}
          {activeTab === 'interventions' && (
            <div className="space-y-4 text-xs">
              <div className="pb-2 border-b">
                <h3 className="font-extrabold text-sm text-slate-900">Riwayat Intervensi & Tindakan Klinis Pasien</h3>
                <p className="text-slate-500">Rekam jejak setiap prosedur keperawatan dan medis yang telah dijalankan.</p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    type: 'Pemasangan Infus',
                    time: '2026-10-28 15:00',
                    by: 'Ns. Dewi Sartika, S.Kep',
                    notes: 'Pemasangan IV catheter 20G di vena metacarpal sinistra, fiksasi rapi, tetesan lancar.',
                  },
                  {
                    type: 'Pengambilan Spesimen Lab',
                    time: '2026-10-30 06:50',
                    by: 'Ns. Dewi Sartika, S.Kep',
                    notes: 'Pengambilan darah vena 3cc via vacuum tube EDTA ungu, verifikasi barcode gelang pasien.',
                  },
                  {
                    type: 'Pemberian Obat IV',
                    time: '2026-10-30 00:05',
                    by: 'Ns. Dewi Sartika, S.Kep',
                    notes: 'Ganti kolf IVFD RL 500ml botol ke-4, tetesan 20 tpm.',
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{item.type}</div>
                      <div className="text-slate-600 mt-0.5">{item.notes}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 shrink-0 ml-4 font-mono">
                      <div>{item.time}</div>
                      <div className="text-slate-700 font-semibold">{item.by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Medical Resume PDF Modal */}
      <MedicalResumePDFModal
        isOpen={showResumePDF}
        onClose={() => setShowResumePDF(false)}
        patient={patient}
        resume={patientResume}
        doctorAssessment={docAss || undefined}
        recentCPPT={patientCPPT}
      />
    </div>
  );
};
