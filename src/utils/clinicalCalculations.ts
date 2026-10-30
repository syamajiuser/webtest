/**
 * VERA Clinical Calculations and Validation Logic
 * Decoupled, pure functions for clinical indicators, closed-loop safety checks,
 * nutritional screening (MNA), bed occupancy, and research metrics.
 */

export interface BedItem {
  id: string;
  roomName: string;
  bedNumber: string;
  status: 'occupied' | 'vacant' | 'maintenance';
  severity?: 'critical' | 'severe' | 'moderate' | 'stable';
  patientId?: string;
}

export interface BedOccupancyResult {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  occupancyRate: number; // percentage rounded to 1 decimal
}

/**
 * Calculates bed occupancy statistics based on active room and bed records.
 */
export function calculateBedOccupancy(beds: BedItem[]): BedOccupancyResult {
  const totalBeds = beds.length;
  if (totalBeds === 0) {
    return {
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      maintenanceBeds: 0,
      occupancyRate: 0,
    };
  }

  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'vacant').length;
  const maintenanceBeds = beds.filter((b) => b.status === 'maintenance').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 1000) / 10;

  return {
    totalBeds,
    occupiedBeds,
    availableBeds,
    maintenanceBeds,
    occupancyRate,
  };
}

export interface MNAQuestions {
  foodIntakeDecline: number; // 0: severe, 1: moderate, 2: no decline
  weightLossRecent: number;  // 0: >3kg, 1: does not know, 2: 1-3kg, 3: no weight loss
  mobility: number;          // 0: bed/chair bound, 1: able to get out of bed, 2: goes out
  psychologicalStress: number; // 0: yes, 2: no
  neuropsychological: number; // 0: severe dementia/depression, 1: mild dementia, 2: no psychological problems
  bmiScore: number;          // 0: BMI < 19, 1: 19 <= BMI < 21, 2: 21 <= BMI < 23, 3: BMI >= 23
}

export interface MNAResult {
  score: number;
  category: 'Normal' | 'Risiko Malnutrisi' | 'Malnutrisi';
  color: string;
  recommendation: string;
}

/**
 * Mini Nutritional Assessment (MNA-SF) Screening Score Calculation
 * Validated scoring:
 * 12-14 points: Normal nutritional status
 * 8-11 points: At risk of malnutrition
 * 0-7 points: Malnourished
 */
export function calculateMNAScore(answers: MNAQuestions): MNAResult {
  const score =
    (answers.foodIntakeDecline || 0) +
    (answers.weightLossRecent || 0) +
    (answers.mobility || 0) +
    (answers.psychologicalStress || 0) +
    (answers.neuropsychological || 0) +
    (answers.bmiScore || 0);

  if (score >= 12) {
    return {
      score,
      category: 'Normal',
      color: '#16A34A',
      recommendation: 'Status gizi baik. Monitor asupan makan harian secara berkala.',
    };
  } else if (score >= 8) {
    return {
      score,
      category: 'Risiko Malnutrisi',
      color: '#FACC15',
      recommendation: 'Risiko malnutrisi terdeteksi. Kolaborasi dietisien/ahli gizi untuk diet ekstra TKTP.',
    };
  } else {
    return {
      score,
      category: 'Malnutrisi',
      color: '#DC2626',
      recommendation: 'Malnutrisi klinis. Rencanakan intervensi nutrisi enteral/parenteral intensif dan evaluasi harian.',
    };
  }
}

/**
 * Closed-Loop Barcode Safety Verification
 * Ensures that:
 * 1. The scanned wristband barcode token matches the active patient.
 * 2. The item (medication e-ticket, lab specimen, meal ticket) is actually intended for that exact patient.
 */
export interface VerificationCheckResult {
  isValid: boolean;
  errorCode?: 'WRONG_PATIENT' | 'WRONG_ITEM_RECIPIENT' | 'TOKEN_MISMATCH' | 'NONE';
  message: string;
}

export function verifyClosedLoopMatch(
  expectedPatientToken: string,
  scannedWristbandToken: string,
  itemTargetPatientToken?: string
): VerificationCheckResult {
  if (!scannedWristbandToken || !expectedPatientToken) {
    return {
      isValid: false,
      errorCode: 'TOKEN_MISMATCH',
      message: 'Barcode gelang pasien tidak valid atau belum dipindai.',
    };
  }

  if (expectedPatientToken.trim() !== scannedWristbandToken.trim()) {
    return {
      isValid: false,
      errorCode: 'WRONG_PATIENT',
      message: 'PERINGATAN KESELAMATAN: Gelang pasien tidak sesuai dengan rekam medis pasien yang dipilih! Transaksi dibatalkan.',
    };
  }

  if (itemTargetPatientToken && itemTargetPatientToken.trim() !== expectedPatientToken.trim()) {
    return {
      isValid: false,
      errorCode: 'WRONG_ITEM_RECIPIENT',
      message: 'PERINGATAN FATAL: Item (Obat/Spesimen/Diet) bukan untuk pasien ini! Transaksi diblokir untuk mencegah insiden keselamatan pasien.',
    };
  }

  return {
    isValid: true,
    errorCode: 'NONE',
    message: 'Verifikasi identitas pasien dan item berhasil (Closed-Loop Verified).',
  };
}

/**
 * Mapping clinical severity to mandatory standard color codes:
 * Dark Burgundy (#7F1D1D) = Very severe / Critical / Palliative
 * Red (#DC2626) = Severe
 * Yellow (#FACC15) = Moderate
 * Green (#16A34A) = Stable / Controlled
 */
export function getSeverityStyle(severity?: string): { color: string; label: string; bgClass: string; textClass: string; badgeClass: string } {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return {
        color: '#7F1D1D',
        label: 'Kritis / Paliatif',
        bgClass: 'bg-[#7F1D1D]',
        textClass: 'text-[#7F1D1D]',
        badgeClass: 'bg-rose-950 text-rose-200 border-rose-800',
      };
    case 'severe':
      return {
        color: '#DC2626',
        label: 'Berat (Severe)',
        bgClass: 'bg-[#DC2626]',
        textClass: 'text-[#DC2626]',
        badgeClass: 'bg-red-900 text-red-200 border-red-700',
      };
    case 'moderate':
      return {
        color: '#FACC15',
        label: 'Sedang (Moderate)',
        bgClass: 'bg-[#FACC15]',
        textClass: 'text-[#FACC15]',
        badgeClass: 'bg-amber-900 text-amber-200 border-amber-600',
      };
    case 'stable':
    default:
      return {
        color: '#16A34A',
        label: 'Stabil / Terkontrol',
        bgClass: 'bg-[#16A34A]',
        textClass: 'text-[#16A34A]',
        badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      };
  }
}
