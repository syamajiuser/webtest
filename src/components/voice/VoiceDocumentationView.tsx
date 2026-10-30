import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
  Save,
  Check,
  FileText,
  Volume2,
  HelpCircle,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';

interface VoiceDocumentationViewProps {
  onSaved?: () => void;
  defaultPatientId?: string;
}

export const VoiceDocumentationView: React.FC<VoiceDocumentationViewProps> = ({
  onSaved,
  defaultPatientId,
}) => {
  const {
    currentUser,
    patients,
    selectedPatient,
    setSelectedPatient,
    addCPPTEntry,
    saveDoctorAssessment,
    logAudit,
  } = useEMR();

  const [targetPatientId, setTargetPatientId] = useState<string>(
    defaultPatientId || selectedPatient?.id || (patients[0]?.id ?? 'PT-001')
  );

  const activePatient = patients.find((p) => p.id === targetPatientId) || patients[0];

  // Voice recording states: IDLE | RECORDING | PROCESSING
  const [recordState, setRecordState] = useState<'IDLE' | 'RECORDING' | 'PROCESSING'>('IDLE');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [destinationType, setDestinationType] = useState<'CPPT' | 'DOCTOR_ASSESSMENT'>('CPPT');

  // Structured clinical fields output by Gemini / rules engine
  const [structuredData, setStructuredData] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    vitalSigns: {
      bloodPressure: string;
      heartRate: string;
      respiratoryRate: string;
      temperature: string;
      oxygenSaturation: string;
      painScore: string;
    };
    extractedMedications: { name: string; dosage: string; route: string; frequency: string }[];
    extractedLabOrders: string[];
    clinicalWarnings: string[];
  } | null>(null);

  const [isVerifiedByClinician, setIsVerifiedByClinician] = useState(false);
  const [aiEngineNote, setAiEngineNote] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Web Speech API ref
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Sample clinical dictations for fast demo and hardware-independent testing
  const sampleDictations = [
    {
      label: 'Visite DPJP DBD (DHF)',
      text: 'Visite dr. Budi untuk pasien Agus Setiawan Bed A01. Subjektif: Pasien melaporkan demam sudah reda sejak semalam, mual masih terasa terutama jika minum cepat, bintik merah petekie di lengan mulai pudar. Nyeri kepala retro-orbital berkurang. Objektif: Keadaan umum sedang, compos mentis. Tekanan darah 118/76 mmHg, Nadi 80 x/menit, Suhu 37.1 C, Pernafasan 18 x/menit, SpO2 99%. Pemeriksaan fisik hepar tidak teraba membesar. Asesmen: DHF Grade II Hari ke-3 fase pemulihan. Plan: Kurangi tetesan infus RL menjadi 14 tetes per menit, teruskan Paracetamol 500mg 3 kali 1 tablet hanya jika suhu di atas 38 derajat celsius, teruskan Curcuma 3 kali 1, jadwalkan Darah Lengkap serial besok pagi.',
    },
    {
      label: 'Visite Hipertensi Urgensi',
      text: 'Visite bangsal Mawar bed B01 pasien Bambang Sudarmono. Keluhan sakit kepala tengkuk sudah berkurang banyak, tidak ada pandangan kabur atau kebas separuh badan. Tekanan darah saat ini 150/90 mmHg, Nadi 76 x/menit, Suhu 36.6 C, RR 18 x/menit. Asesmen: Hipertensi Urgensi dalam perbaikan respon terapi Amlodipine. Rencana: Teruskan Amlodipine 10mg malam hari, diet rendah garam 1500 mg natrium, edukasi kontrol pola makan dan tirah baring.',
    },
    {
      label: 'Asesmen Pasien GEA Dehidrasi',
      text: 'Visite pasien Rudi Hermawan bed A04. Keluhan BAB cair berkurang menjadi 2 kali konsistensi ampas, mual berkurang, sudah mau makan bubur 3 sendok. TD 110/70 mmHg, HR 84 x/menit, Temp 36.8 C, RR 20 x/menit, turgor kulit kembali cepat, mata tidak cekung. Asesmen: GEA dehidrasi ringan membaik. Rencana: Teruskan Zinc 20mg 1x1, oralit 1 sachet per BAB cair, infus RL 20 tpm maintained.',
    },
  ];

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID'; // Indonesian

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript((prev) => prev + ' ' + currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notification:', event.error);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Speech recognition initialization error:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    setRecordState('RECORDING');
    setRecordSeconds(0);
    setIsVerifiedByClinician(false);
    setSaveSuccess(false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition already started or permission required:', e);
      }
    }
  };

  const stopRecording = () => {
    setRecordState('IDLE');
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const processWithAI = async (textToProcess?: string) => {
    const text = textToProcess || transcript;
    if (!text.trim()) return;

    setRecordState('PROCESSING');
    stopRecording();

    try {
      const res = await fetch('/api/ai/structure-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          patientContext: {
            name: activePatient?.name,
            mrn: activePatient?.mrn,
            diagnosis: activePatient?.primaryDiagnosis,
            allergies: activePatient?.allergies,
            bed: `${activePatient?.roomName} ${activePatient?.bedNumber}`,
          },
          recordType: destinationType,
        }),
      });

      const data = await res.json();
      if (data && data.data) {
        setStructuredData(data.data);
        setAiEngineNote(
          data.mode === 'live_gemini'
            ? 'Dianalisis menggunakan Google Gemini 3.8 Flash Server-Side'
            : (data.note || 'Diproses dengan VERA Clinical Rule Engine Adapter')
        );
      }
    } catch (err) {
      console.error('Voice processing request failed:', err);
    } finally {
      setRecordState('IDLE');
    }
  };

  const handleApplySample = (sampleText: string) => {
    setTranscript(sampleText);
    processWithAI(sampleText);
  };

  const handleSaveToEMR = () => {
    if (!structuredData || !isVerifiedByClinician) return;
    setIsSaving(true);

    if (destinationType === 'CPPT') {
      addCPPTEntry({
        patientId: activePatient.id,
        encounterId: 'ENC-2026-ACTIVE',
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        subjective: structuredData.subjective,
        objective: structuredData.objective,
        assessment: structuredData.assessment,
        plan: structuredData.plan,
        vitalSigns: structuredData.vitalSigns,
        verificationStatus: 'verified',
      });
    } else {
      saveDoctorAssessment({
        id: `DOC-ASS-${Date.now()}`,
        patientId: activePatient.id,
        dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        chiefComplaint: structuredData.subjective,
        historyOfPresentIllness: structuredData.subjective,
        pastMedicalHistory: 'Sesuai rekam medis sebelumnya',
        medicationHistory: structuredData.extractedMedications.map((m) => `${m.name} ${m.dosage}`).join(', ') || '-',
        allergyHistory: activePatient.allergies.join(', ') || 'Disangkal',
        familyHistory: 'Tidak ada riwayat keluarga yang relevan',
        physicalExamination: structuredData.objective,
        vitalSigns: {
          bloodPressure: structuredData.vitalSigns.bloodPressure || '120/80 mmHg',
          heartRate: structuredData.vitalSigns.heartRate || '80 x/mnt',
          respiratoryRate: structuredData.vitalSigns.respiratoryRate || '20 x/mnt',
          temperature: structuredData.vitalSigns.temperature || '36.8 °C',
          oxygenSaturation: structuredData.vitalSigns.oxygenSaturation || '98%',
          painScore: structuredData.vitalSigns.painScore || '0/10',
        },
        clinicalFindings: structuredData.objective,
        workingDiagnosis: structuredData.assessment,
        icd10: activePatient.icd10Code || 'Z03.8',
        treatmentPlan: structuredData.plan,
        followUpPlan: 'Evaluasi visite berikutnya q24h',
        responsibleDoctorName: currentUser.name,
        status: 'verified',
        signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Simpan Dikte Suara Terstruktur (VERA Voice)',
      category: 'VOICE',
      patientId: activePatient.id,
      patientName: activePatient.name,
      details: `Catatan klinis dari dikte suara berhasil diverifikasi oleh ${currentUser.name} dan disimpan ke ${destinationType}.`,
      status: 'SUCCESS',
    });

    setIsSaving(false);
    setSaveSuccess(true);
    if (onSaved) onSaved();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner explaining Therapeutic Communication & Screen Distraction Reduction */}
      <div className="bg-gradient-to-r from-[#123B63] to-[#2563EB] text-white p-4 rounded-xl shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <Mic className="w-5 h-5 text-teal-300" />
              </span>
              <h2 className="text-base font-extrabold tracking-wide">
                VERA Voice Recognition & Clinical Structuring Engine
              </h2>
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Teknologi rekam medis berbasis pengenalan suara untuk mengoptimalkan kontak mata, mendengarkan aktif, dan menjaga komunikasi terapeutik dokter/perawat kepada pasien di bedside Puskesmas tanpa distraksi menatap layar komputer terus-menerus.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-lg border border-white/20 text-xs">
            <div className="text-[10px] text-teal-200 uppercase font-bold">Prinsip Keselamatan:</div>
            <div className="font-semibold text-white">Wajib Verifikasi Nakes (Human-in-the-Loop)</div>
          </div>
        </div>
      </div>

      {/* Target Patient & Record Destination Selector */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Pasien Sasaran:</span>
            <select
              value={targetPatientId}
              onChange={(e) => {
                setTargetPatientId(e.target.value);
                const pt = patients.find((p) => p.id === e.target.value);
                if (pt) setSelectedPatient(pt);
              }}
              className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn} • {p.roomName || 'Bed'} {p.bedNumber || ''})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Tujuan Catatan:</span>
            <select
              value={destinationType}
              onChange={(e) => setDestinationType(e.target.value as any)}
              className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="CPPT">CPPT (Catatan Perkembangan Terintegrasi SOAP)</option>
              <option value="DOCTOR_ASSESSMENT">Asesmen Awal / Harian Dokter</option>
            </select>
          </div>
        </div>

        {activePatient && (
          <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            Diagnosis: <strong>{activePatient.primaryDiagnosis}</strong> • Alergi:{' '}
            <span className="text-rose-600 font-bold">
              {activePatient.allergies.length ? activePatient.allergies.join(', ') : 'Nihil'}
            </span>
          </div>
        )}
      </div>

      {/* Flagship Microphone Control Section: 3 States (IDLE, RECORDING, PROCESSING) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
        {/* Large Central Mic Button */}
        <div className="relative mb-4">
          {recordState === 'RECORDING' && (
            <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping" />
          )}

          <button
            onClick={() => {
              if (recordState === 'RECORDING') {
                stopRecording();
              } else if (recordState === 'IDLE') {
                startRecording();
              }
            }}
            disabled={recordState === 'PROCESSING'}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 ${
              recordState === 'RECORDING'
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-8 ring-rose-200 animate-pulse'
                : recordState === 'PROCESSING'
                ? 'bg-amber-500 text-white cursor-wait'
                : 'bg-[#123B63] hover:bg-[#2563EB] text-white hover:scale-105'
            }`}
          >
            {recordState === 'RECORDING' ? (
              <>
                <Square className="w-8 h-8 text-white fill-white mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Hentikan</span>
              </>
            ) : recordState === 'PROCESSING' ? (
              <>
                <Sparkles className="w-8 h-8 text-white animate-spin mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Memproses...</span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9 text-white mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mulai Dikte</span>
              </>
            )}
          </button>
        </div>

        {/* State Indicator Text & Timer */}
        <div className="space-y-1">
          {recordState === 'RECORDING' && (
            <div className="flex items-center justify-center space-x-2 text-rose-600 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>SEDANG MEREKAM SUARA KLINIS ({String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:{String(recordSeconds % 60).padStart(2, '0')})</span>
            </div>
          )}
          {recordState === 'PROCESSING' && (
            <div className="text-amber-600 font-bold text-sm flex items-center justify-center space-x-1.5">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
              <span>Gemini AI sedang menstrukturkan transkrip ke format SOAP & Tanda Vital...</span>
            </div>
          )}
          {recordState === 'IDLE' && (
            <div className="text-slate-600 font-medium text-xs">
              Klik tombol mikrofon di atas, lalu bicaralah dengan wajar saat visite di samping tempat tidur pasien.
            </div>
          )}
        </div>

        {/* Preset Clinical Dikte Buttons for Easy Demonstration without Mic */}
        <div className="mt-4 pt-4 border-t border-slate-100 w-full max-w-2xl">
          <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-center space-x-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Atau Muat Contoh Dikte Suara Visite Puskesmas (Simulasi Cepat):</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {sampleDictations.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySample(sample.text)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold flex items-center space-x-1 transition"
              >
                <Play className="w-3 h-3 text-blue-600" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transcription Editor and AI Processing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Raw Transcription */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Hasil Transkripsi Suara (Speech-to-Text)</span>
              </span>
              <button
                onClick={() => setTranscript('')}
                className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Kosongkan</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Transkrip suara klinis akan muncul otomatis di sini saat Anda berbicara. Anda juga dapat mengetik atau mengedit teks secara manual kapan saja..."
              className="w-full p-3 text-xs leading-relaxed border border-slate-200 rounded-lg bg-slate-50/50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {transcript.length > 0 ? `${transcript.split(/\s+/).filter(Boolean).length} kata terdeteksi` : 'Menunggu input audio'}
            </span>

            <button
              onClick={() => processWithAI()}
              disabled={!transcript.trim() || recordState === 'PROCESSING'}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white text-xs font-bold rounded-lg shadow disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Strukturkan dengan Gemini AI &rarr;</span>
            </button>
          </div>
        </div>

        {/* Right: AI Structured Clinical Draft */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Draft Terstruktur (Format SOAP & TTV)</span>
              </span>
              {aiEngineNote && (
                <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-medium">
                  {aiEngineNote}
                </span>
              )}
            </div>

            {structuredData ? (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
                {/* Subjective */}
                <div>
                  <span className="font-bold text-slate-700 block text-[11px] text-blue-900">
                    S (Subjektif / Keluhan & Riwayat):
                  </span>
                  <textarea
                    rows={2}
                    value={structuredData.subjective}
                    onChange={(e) =>
                      setStructuredData({ ...structuredData, subjective: e.target.value })
                    }
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-xs text-slate-800"
                  />
                </div>

                {/* Objective */}
                <div>
                  <span className="font-bold text-slate-700 block text-[11px] text-blue-900">
                    O (Objektif / Pemeriksaan Fisik & TTV):
                  </span>
                  <textarea
                    rows={2}
                    value={structuredData.objective}
                    onChange={(e) =>
                      setStructuredData({ ...structuredData, objective: e.target.value })
                    }
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-xs text-slate-800"
                  />
                </div>

                {/* Vital Signs Grid */}
                <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                  <span className="font-bold text-[10px] text-blue-900 uppercase block mb-1">
                    Tanda-Tanda Vital Terekstraksi:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Tekanan Darah:</span>
                      <span className="font-bold text-slate-800">
                        {structuredData.vitalSigns.bloodPressure || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Nadi:</span>
                      <span className="font-bold text-slate-800">
                        {structuredData.vitalSigns.heartRate || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Suhu Tubuh:</span>
                      <span className="font-bold text-slate-800">
                        {structuredData.vitalSigns.temperature || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Pernafasan (RR):</span>
                      <span className="font-bold text-slate-800">
                        {structuredData.vitalSigns.respiratoryRate || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SpO2:</span>
                      <span className="font-bold text-slate-800">
                        {structuredData.vitalSigns.oxygenSaturation || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Skala Nyeri:</span>
                      <span className="font-bold text-slate-800">
                        {structuredData.vitalSigns.painScore || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assessment */}
                <div>
                  <span className="font-bold text-slate-700 block text-[11px] text-blue-900">
                    A (Asesmen / Diagnosis Kerja):
                  </span>
                  <input
                    type="text"
                    value={structuredData.assessment}
                    onChange={(e) =>
                      setStructuredData({ ...structuredData, assessment: e.target.value })
                    }
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-xs font-bold text-slate-900"
                  />
                </div>

                {/* Plan */}
                <div>
                  <span className="font-bold text-slate-700 block text-[11px] text-blue-900">
                    P (Plan / Rencana Terapi & Instruksi):
                  </span>
                  <textarea
                    rows={2}
                    value={structuredData.plan}
                    onChange={(e) =>
                      setStructuredData({ ...structuredData, plan: e.target.value })
                    }
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-xs text-slate-800"
                  />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Belum ada draft terstruktur. Mulai rekam suara atau pilih contoh dikte.</p>
              </div>
            )}
          </div>

          {/* Mandatory Clinician Verification & Save Section */}
          {structuredData && (
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
              {/* Mandatory Human Verification Checkbox */}
              <label className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isVerifiedByClinician}
                  onChange={(e) => setIsVerifiedByClinician(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-[11px]">
                  <strong className="block text-amber-900 font-bold">
                    Konfirmasi & Verifikasi Tenaga Medis (Wajib Permenkes 24/2022)
                  </strong>
                  <span>
                    Saya selaku nakes bertanggung jawab telah memeriksa kesesuaian draf AI dengan kondisi nyata pasien {activePatient.name}. Data tidak dibuat-buat dan siap disimpan secara sah.
                  </span>
                </div>
              </label>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Penandatangan: <strong>{currentUser.name}</strong> ({currentUser.role})
                </span>

                <button
                  onClick={handleSaveToEMR}
                  disabled={!isVerifiedByClinician || isSaving}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md disabled:opacity-40 flex items-center space-x-1.5 transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Tandatangani EMR</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Catatan klinis berhasil disimpan ke rekam medis {activePatient.name}!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
