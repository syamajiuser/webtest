import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  ZapOff,
  RotateCcw,
  Check,
  X,
  Pill,
  TestTube2,
  UtensilsCrossed,
  Info,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { verifyClosedLoopMatch } from '../../utils/clinicalCalculations';

export const BarcodeScannerView: React.FC = () => {
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    medicationOrders,
    marRecords,
    labOrders,
    dietaryOrders,
    administerMedication,
    updateLabStatus,
    updateDietStatus,
    logAudit,
    currentUser,
  } = useEMR();

  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatient?.id || patients[0]?.id || 'PT-001'
  );
  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Scanned tokens
  const [scannedWristband, setScannedWristband] = useState<string>('');
  const [scannedItemToken, setScannedItemToken] = useState<string>('');
  const [itemType, setItemType] = useState<'MEDICATION' | 'LAB_SPECIMEN' | 'MEAL'>('MEDICATION');
  const [manualInput, setManualInput] = useState<string>('');

  // Closed loop verification results
  const [verificationResult, setVerificationResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    message: string;
    targetName?: string;
  }>({ status: 'IDLE', message: 'Silakan pindai gelang pasien dan item barcode.' });

  const [confirmStatus, setConfirmStatus] = useState<string>('Administered');
  const [exceptionReason, setExceptionReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [transactionCompleted, setTransactionCompleted] = useState<boolean>(false);

  // Start real camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera not available or access denied:', err);
      setCameraError('Kamera tidak dapat diakses (Izin ditolak atau perangkat tidak memiliki kamera). Gunakan Mode Uji Coba Demo Barcode di bawah.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Demo scan presets for easy testing
  const demoTokens = [
    {
      category: 'Gelang Pasien (Cocok)',
      label: `Gelang ${activePatient.name}`,
      token: activePatient.wristbandToken,
      type: 'WRISTBAND',
      isCorrect: true,
    },
    {
      category: 'Gelang Pasien (SALAH / Wrong Patient Alert)',
      label: 'Gelang Pasien Lain (PT-004)',
      token: 'VERA-WB-PT004-BS',
      type: 'WRISTBAND',
      isCorrect: false,
    },
    {
      category: 'E-Tiket Obat (Cocok)',
      label: 'E-Tiket Paracetamol (PT-001)',
      token: 'VERA-MED-ETKT-001',
      type: 'ITEM_MED',
      itemType: 'MEDICATION',
      isCorrect: true,
    },
    {
      category: 'E-Tiket Obat (SALAH / Wrong Med Alert)',
      label: 'E-Tiket Ceftriaxone (Milik Pasien PT-002)',
      token: 'VERA-MED-ETKT-003',
      type: 'ITEM_MED',
      itemType: 'MEDICATION',
      isCorrect: false,
    },
    {
      category: 'Spesimen Lab',
      label: 'Tabung Lab DL (PT-001)',
      token: 'VERA-LAB-SPM-001',
      type: 'ITEM_LAB',
      itemType: 'LAB_SPECIMEN',
      isCorrect: true,
    },
    {
      category: 'Tiket Makanan Gizi',
      label: 'Tiket Diet TKTP (PT-001)',
      token: 'VERA-DIET-TKT-001',
      type: 'ITEM_DIET',
      itemType: 'MEAL',
      isCorrect: true,
    },
  ];

  const handleApplyToken = (token: string, type: string) => {
    if (type === 'WRISTBAND') {
      setScannedWristband(token);
      evaluateVerification(token, scannedItemToken);
    } else {
      setScannedItemToken(token);
      evaluateVerification(scannedWristband, token);
    }
  };

  const evaluateVerification = (wristband: string, itemToken: string) => {
    setTransactionCompleted(false);

    if (!wristband) {
      setVerificationResult({
        status: 'IDLE',
        message: 'Langkah 1: Silakan pindai Gelang Pasien terlebih dahulu.',
      });
      return;
    }

    // Step 1: Verify wristband matches active patient
    const wristbandCheck = verifyClosedLoopMatch(activePatient.wristbandToken, wristband);
    if (!wristbandCheck.isValid) {
      setVerificationResult({
        status: 'ERROR',
        message: wristbandCheck.message,
      });
      logAudit({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'PERINGATAN KESELAMATAN: Gelang Pasien Tidak Cocok (Wrong Patient Alert)',
        category: 'BARCODE',
        patientId: activePatient.id,
        details: `Scan gelang [${wristband}] ditolak karena bukan milik ${activePatient.name}. Transaksi diblokir demi keselamatan pasien.`,
        status: 'BLOCKED_SAFETY_ALERT',
      });
      return;
    }

    if (!itemToken) {
      setVerificationResult({
        status: 'IDLE',
        message: `Gelang Pasien ${activePatient.name} terverifikasi cocok! Sekarang silakan pindai barcode item (E-Tiket Obat / Label Tabung Lab / Tiket Makanan).`,
      });
      return;
    }

    // Step 2: Verify item recipient
    let itemBelongsToPatient = false;
    let targetName = '';

    if (itemToken.includes('MED')) {
      setItemType('MEDICATION');
      const med = medicationOrders.find((m) => m.eTicketBarcode === itemToken);
      if (med) {
        targetName = med.medicationName;
        itemBelongsToPatient = med.patientId === activePatient.id;
      }
    } else if (itemToken.includes('LAB')) {
      setItemType('LAB_SPECIMEN');
      const lab = labOrders.find((l) => l.specimenLabelBarcode === itemToken);
      if (lab) {
        targetName = lab.testName;
        itemBelongsToPatient = lab.patientId === activePatient.id;
      }
    } else if (itemToken.includes('DIET')) {
      setItemType('MEAL');
      const diet = dietaryOrders.find((d) => d.mealTicketBarcode === itemToken);
      if (diet) {
        targetName = `${diet.dietType} (${diet.caloriesTarget})`;
        itemBelongsToPatient = diet.patientId === activePatient.id;
      }
    }

    if (!itemBelongsToPatient) {
      setVerificationResult({
        status: 'ERROR',
        message: `PERINGATAN FATAL: Item barcode [${itemToken}] (${targetName || 'Obat/Spesimen'}) BUKAN untuk pasien ${activePatient.name}! Transaksi DIBLOKIR.`,
        targetName,
      });
      logAudit({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'PERINGATAN KESELAMATAN: Item Tidak Sesuai Pasien (Mismatch Blocked)',
        category: 'MEDICATION',
        patientId: activePatient.id,
        details: `Scan item [${itemToken}] diblokir karena tidak terdaftar untuk pasien ${activePatient.name}. Pencegahan Medication Error berhasil.`,
        status: 'BLOCKED_SAFETY_ALERT',
      });
    } else {
      setVerificationResult({
        status: 'SUCCESS',
        message: `CLOSED-LOOP VERIFIKASI BERHASIL 100%! Pasien ${activePatient.name} cocok dengan item [${targetName}]. Siap untuk konfirmasi tindakan.`,
        targetName,
      });
    }
  };

  const handleExecuteTransaction = () => {
    if (verificationResult.status !== 'SUCCESS') return;

    if (itemType === 'MEDICATION') {
      const targetMar = marRecords.find((m) => m.patientId === activePatient.id);
      if (targetMar) {
        administerMedication(
          targetMar.id,
          confirmStatus as any,
          notes,
          confirmStatus !== 'Administered' ? exceptionReason : undefined
        );
      }
    } else if (itemType === 'LAB_SPECIMEN') {
      const targetLab = labOrders.find((l) => l.specimenLabelBarcode === scannedItemToken);
      if (targetLab) {
        updateLabStatus(targetLab.id, 'Specimen Collected');
      }
    } else if (itemType === 'MEAL') {
      const targetDiet = dietaryOrders.find((d) => d.mealTicketBarcode === scannedItemToken);
      if (targetDiet) {
        updateDietStatus(targetDiet.id, 'Terkirim', true);
      }
    }

    setTransactionCompleted(true);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <QrCode className="w-5 h-5 text-teal-300" />
              </span>
              <h2 className="text-base font-extrabold tracking-wide">
                Mobile Bedside Barcode & QR Scanner (Closed-Loop Safety)
              </h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Verifikasi identitas pasien dengan pemindaian gelang barcode sebelum pemberian obat, pengambilan spesimen darah laboratorium, dan distribusi makanan di bedside.
            </p>
          </div>

          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/20 text-xs">
            <span className="text-[10px] uppercase font-bold text-teal-200 block">Metode:</span>
            <span className="font-semibold text-white">7-Benar Keselamatan Pasien</span>
          </div>
        </div>
      </div>

      {/* Target Patient Context */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">Pasien yang Sedang Dilayani di Bedside:</span>
          <select
            value={activePatient.id}
            onChange={(e) => {
              setActivePatientId(e.target.value);
              const found = patients.find((p) => p.id === e.target.value);
              if (found) setSelectedPatient(found);
              setScannedWristband('');
              setScannedItemToken('');
              setVerificationResult({ status: 'IDLE', message: 'Silakan pindai gelang pasien dan barcode item.' });
            }}
            className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn} • {p.roomName || 'Bed'} {p.bedNumber || ''})
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          Token Gelang Valid: <strong className="font-mono text-teal-700">{activePatient.wristbandToken}</strong>
        </div>
      </div>

      {/* Main 2-Column Grid: Scanner Camera & Closed-Loop Verification Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Mobile Camera Scanner Interface */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Pemindai Kamera Smartphone / Tablet</span>
              </span>

              <div className="flex items-center space-x-2">
                {cameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold"
                  >
                    Tutup Kamera
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded text-[11px] font-bold shadow flex items-center space-x-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Aktifkan Kamera</span>
                  </button>
                )}
              </div>
            </div>

            {/* Camera Viewport or Placeholder */}
            <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-300">
              {cameraActive ? (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                  {/* Targeting Crosshair */}
                  <div className="absolute inset-8 border-2 border-teal-400 rounded-lg pointer-events-none animate-pulse">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 shadow-sm" />
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 text-center text-white text-[10px] bg-black/60 py-1">
                    Arahkan kamera ke barcode gelang pasien atau e-tiket
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-slate-400 space-y-2">
                  <Camera className="w-10 h-10 mx-auto opacity-50 text-slate-300" />
                  <div className="text-xs font-semibold text-slate-300">Kamera Belum Aktif</div>
                  <div className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Klik tombol "Aktifkan Kamera" di atas untuk mengakses kamera perangkat, atau gunakan simulasi barcode di bawah.
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-2 p-2 bg-amber-50 text-amber-900 border border-amber-200 rounded text-xs">
                {cameraError}
              </div>
            )}

            {/* Manual Code Entry */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ketik barcode token manual..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (manualInput.includes('WB')) {
                    handleApplyToken(manualInput, 'WRISTBAND');
                  } else {
                    handleApplyToken(manualInput, 'ITEM');
                  }
                  setManualInput('');
                }}
                className="px-3 py-2 bg-slate-800 text-white rounded text-xs font-bold"
              >
                Scan Manual
              </button>
            </div>
          </div>

          {/* Preset Demo Tokens for Immediate Testing of Safety Features */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
              <span>Uji Coba Cepat Token Barcode (Simulasi Bedside):</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono font-medium">DEMO ADAPTER</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {demoTokens.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyToken(t.token, t.type)}
                  className={`p-2 rounded-lg border text-left font-semibold text-[11px] transition ${
                    t.isCorrect
                      ? 'bg-blue-50/70 hover:bg-blue-100 text-blue-950 border-blue-200'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-300'
                  }`}
                >
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">{t.category}</div>
                  <div className="truncate font-bold">{t.label}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{t.token}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Closed-Loop Verification & Safety Confirmation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Pusat Verifikasi Closed-Loop (7-Benar)</span>
              </span>
              <button
                onClick={() => {
                  setScannedWristband('');
                  setScannedItemToken('');
                  setVerificationResult({ status: 'IDLE', message: 'Silakan pindai kembali.' });
                  setTransactionCompleted(false);
                }}
                className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Scan</span>
              </button>
            </div>

            {/* Current Scanned State */}
            <div className="space-y-3">
              {/* Step 1: Gelang Pasien */}
              <div
                className={`p-3 rounded-xl border transition ${
                  scannedWristband
                    ? scannedWristband === activePatient.wristbandToken
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold flex items-center space-x-1">
                    <span>1. Barcode Gelang Pasien Bedside:</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold">
                    {scannedWristband ? (scannedWristband === activePatient.wristbandToken ? 'MATCH' : 'MISMATCH') : 'MENUNGGU'}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold truncate">
                  {scannedWristband || 'Belum dipindai (Scan gelang pasien terlebih dahulu)'}
                </div>
              </div>

              {/* Step 2: Barcode Item */}
              <div
                className={`p-3 rounded-xl border transition ${
                  scannedItemToken
                    ? verificationResult.status === 'SUCCESS'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">2. Barcode Item (E-Tiket Obat / Lab / Diet):</span>
                  <span className="font-mono text-[10px] font-bold">
                    {scannedItemToken ? itemType : 'MENUNGGU'}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold truncate">
                  {scannedItemToken || 'Belum dipindai (Scan barcode obat atau tabung lab)'}
                </div>
                {verificationResult.targetName && (
                  <div className="text-[11px] font-bold text-slate-800 mt-1">
                    Item Terdeteksi: {verificationResult.targetName}
                  </div>
                )}
              </div>

              {/* Status Box */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  verificationResult.status === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                    : verificationResult.status === 'ERROR'
                    ? 'bg-rose-100 text-rose-950 border-rose-400 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {verificationResult.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : verificationResult.status === 'ERROR' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>{verificationResult.message}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Confirmation Section (Perawat Wajib Mengonfirmasi Sebelum Simpan) */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
            <div className="text-[11px] text-slate-500">
              *Syarat Keamanan VERA: Sistem tidak pernah mencatat pemberian obat otomatis hanya dari scan barcode. Perawat pelaksana wajib mengonfirmasi tindakan nyata secara sadar.
            </div>

            {verificationResult.status === 'SUCCESS' && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Pemberian:</label>
                    <select
                      value={confirmStatus}
                      onChange={(e) => setConfirmStatus(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold"
                    >
                      <option value="Administered">Diberikan Lengkap (Administered)</option>
                      <option value="Patient Refused">Pasien Menolak (Refused)</option>
                      <option value="Held">Ditunda Dokter (Held)</option>
                      <option value="Unavailable">Obat Habis di Depo (Unavailable)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catatan / Alasan Pengecualian:</label>
                    <input
                      type="text"
                      placeholder="Catatan respon pasien / alasan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteTransaction}
                  disabled={transactionCompleted}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-md flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {transactionCompleted
                      ? 'Transaksi Berhasil Didokumentasikan ke EMR!'
                      : 'Konfirmasi Nyata & Catat ke EMR Pasien'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
