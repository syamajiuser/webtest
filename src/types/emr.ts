export type UserRole =
  | 'Doctor'
  | 'Nurse'
  | 'Pharmacist'
  | 'Laboratory'
  | 'MedicalRecords'
  | 'Admin'
  | 'Patient';

export interface UserActivityLog {
  id: string;
  timestamp: string;
  action: string;
  ipAddress?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  email: string;
  phone: string;
  sipNumber?: string; // Surat Izin Praktik / NIP
  lastLogin?: string;
  activityLogs?: UserActivityLog[];
}

export type BedStatus = 'occupied' | 'vacant' | 'maintenance';
export type ClinicalSeverity = 'critical' | 'severe' | 'moderate' | 'stable';

export interface Bed {
  id: string;
  roomName: string;
  roomCategory: 'Kelas 3' | 'Kelas 2' | 'Kelas 1' | 'Isolasi';
  bedNumber: string;
  status: BedStatus;
  severity?: ClinicalSeverity;
  patientId?: string;
  lastCleaned?: string;
}

export interface VitalSigns {
  bloodPressure: string; // e.g. "120/80 mmHg"
  heartRate: string;     // e.g. "82 x/mnt"
  respiratoryRate: string; // e.g. "20 x/mnt"
  temperature: string;   // e.g. "36.8 °C"
  oxygenSaturation: string; // e.g. "98%"
  painScore: string;     // e.g. "2/10"
  recordedAt?: string;
  recordedBy?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. "RM-2026-0412"
  name: string;
  initials: string;
  nik: string; // Indonesian ID
  birthDate: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  bloodType: 'A' | 'B' | 'AB' | 'O';
  address: string;
  phone: string;
  admissionDate: string;
  admissionReason: string;
  assignedBedId?: string;
  roomName?: string;
  bedNumber?: string;
  dpjpId: string; // Dokter Penanggung Jawab Pasien
  dpjpName: string;
  primaryNurseId: string;
  primaryNurseName: string;
  primaryDiagnosis: string;
  icd10Code: string;
  clinicalSeverity: ClinicalSeverity;
  wristbandToken: string; // Barcode token
  allergies: string[];
  clinicalFlags: {
    fallRisk?: boolean;
    pressureInjuryRisk?: boolean;
    medicationPending?: boolean;
    labPending?: boolean;
    specialDiet?: boolean;
    ivTherapy?: boolean;
    oxygenTherapy?: boolean;
    bleedingRisk?: boolean;
    alteredConsciousness?: boolean;
    isolationPrecautions?: boolean;
    criticalAttention?: boolean;
    pendingAssessment?: boolean;
  };
}

export interface CPPTEntry {
  id: string;
  patientId: string;
  encounterId: string;
  dateTime: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  vitalSigns?: Partial<VitalSigns>;
  verificationStatus: 'verified' | 'draft';
  signedBy?: string;
  signedAt?: string;
  amendmentHistory?: {
    amendedAt: string;
    amendedBy: string;
    reason: string;
  }[];
}

export interface DoctorAssessment {
  id: string;
  patientId: string;
  dateTime: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  medicationHistory: string;
  allergyHistory: string;
  familyHistory: string;
  physicalExamination: string;
  vitalSigns: VitalSigns;
  clinicalFindings: string;
  workingDiagnosis: string;
  icd10: string;
  treatmentPlan: string;
  followUpPlan: string;
  responsibleDoctorName: string;
  status: 'draft' | 'verified';
  signedAt?: string;
}

export interface MorseFallScale {
  historyOfFalling: number; // 0 or 25
  secondaryDiagnosis: number; // 0 or 15
  ambulatoryAid: number; // 0, 15, or 30
  ivHeparinLock: number; // 0 or 20
  gaitTransferring: number; // 0, 10, or 20
  mentalStatus: number; // 0 or 15
  totalScore: number;
  riskCategory: 'Rendah' | 'Sedang' | 'Tinggi';
}

export interface NurseAssessment {
  id: string;
  patientId: string;
  dateTime: string;
  consciousness: 'Compos Mentis' | 'Apatis' | 'Somnolen' | 'Sopor' | 'Koma';
  gcs: string;
  vitalSigns: VitalSigns;
  respiratoryAssessment: string;
  cardiovascularAssessment: string;
  neurologicalAssessment: string;
  gastrointestinalAssessment: string;
  genitourinaryAssessment: string;
  skinCondition: string;
  mobilityStatus: string;
  fallRiskScore: MorseFallScale;
  pressureUlcerRiskBraden: number; // Braden Score
  nursingProblemSDKI: string;
  nursingOutcomeSLKI: string;
  nursingInterventionSIKI: string;
  evaluation: string;
  responsibleNurseName: string;
  status: 'draft' | 'verified';
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  medicationName: string;
  medicationCode: string;
  strength: string;
  dosage: string;
  route: 'Oral' | 'IV Infus' | 'IV Bolus' | 'IM' | 'SC' | 'Inhalasi' | 'Topikal';
  frequency: string;
  scheduleTimes: string[]; // e.g. ["06:00", "14:00", "22:00"]
  duration: string;
  quantity: number;
  instructions: string;
  orderingDoctorName: string;
  orderDateTime: string;
  status: 'ordered' | 'verified_by_pharmacy' | 'ticket_generated' | 'administered' | 'cancelled';
  eTicketBarcode: string;
  verifiedByPharmacist?: string;
  verifiedAt?: string;
}

export interface MedicationAdministrationRecord {
  id: string;
  patientId: string;
  medicationOrderId: string;
  medicationName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  administeredAt?: string;
  administeredBy?: string;
  wristbandScanned: boolean;
  eTicketScanned: boolean;
  status: 'Scheduled' | 'Administered' | 'Not Administered' | 'Patient Refused' | 'Held' | 'Delayed' | 'Unavailable';
  reasonForException?: string;
  notes?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  testName: string;
  category: 'Hematologi' | 'Kimia Darah' | 'Imunoserologi' | 'Urinalisis' | 'Mikrobiologi';
  clinicalIndication: string;
  specimenType: 'Darah Vena' | 'Urin Pagi' | 'Feses' | 'Sputum' | 'Swab';
  priority: 'Cito (Darurat)' | 'Rutin';
  orderingDoctorName: string;
  orderDateTime: string;
  specimenLabelBarcode: string;
  status:
    | 'Order Created'
    | 'Order Received by Laboratory'
    | 'Label Generated'
    | 'Awaiting Collection'
    | 'Patient Verified'
    | 'Specimen Collected'
    | 'Awaiting Transportation'
    | 'In Transit'
    | 'Received by Laboratory'
    | 'Processing'
    | 'Result Available'
    | 'Result Verified'
    | 'Result Released';
  collectedByNurse?: string;
  collectedAt?: string;
  receivedByLab?: string;
  receivedAt?: string;
}

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface LabResult {
  id: string;
  orderId: string;
  patientId: string;
  testName: string;
  category: string;
  completedAt: string;
  verifiedBy: string;
  items: LabResultItem[];
  clinicalNotes: string;
  isCritical: boolean;
}

export interface DietaryOrder {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  dietType: 'Normal' | 'Lunak (Bubur)' | 'Cair' | 'Rendah Garam (RG)' | 'Diabetes Mellitus (DM)' | 'Rendah Protein' | 'Tinggi Kalori Tinggi Protein (TKTP)' | 'Puasa (NPO)';
  caloriesTarget: string;
  textureModification: string;
  allergiesFood: string[];
  schedule: 'Pagi, Siang, Sore' | 'Per Selang NGT Tiap 4 Jam' | 'Puasa Operasi';
  specialInstructions: string;
  mealTicketBarcode: string;
  orderedBy: string;
  orderDateTime: string;
  preparationStatus: 'Diterima Gizi' | 'Sedang Dimasak' | 'Siap Antar' | 'Terkirim';
  deliveredAt?: string;
  deliveredBy?: string;
  patientVerifiedAtBedside: boolean;
}

export interface ClinicalInterventionRecord {
  id: string;
  patientId: string;
  interventionType: 'Pemberian Obat' | 'Observasi TTV' | 'Perawatan Luka' | 'Pemasangan Infus' | 'Oksigenasi' | 'Pengambilan Spesimen' | 'Edukasi Pasien' | 'Pencegahan Jatuh';
  dateTime: string;
  executedBy: string;
  role: UserRole;
  status: 'Selesai' | 'Tertunda' | 'Dibatalkan';
  clinicalNotes: string;
}

export interface MRSARecord {
  id: string;
  patientId: string;
  screeningDate: string;
  status: 'Negatif' | 'Positif' | 'Belum Diperiksa' | 'Observasi';
  swabSite: 'Nasal' | 'Axilla' | 'Groin' | 'Wound' | 'Sputum';
  labReportNumber?: string;
  isolationPrecautionsActive: boolean;
  notes: string;
  updatedBy: string;
}

export interface MNARecord {
  id: string;
  patientId: string;
  screeningDate: string;
  answers: {
    foodIntakeDecline: number;
    weightLossRecent: number;
    mobility: number;
    psychologicalStress: number;
    neuropsychological: number;
    bmiScore: number;
  };
  score: number;
  category: 'Normal' | 'Risiko Malnutrisi' | 'Malnutrisi';
  assessedBy: string;
  recommendations: string;
}

export interface MedicalResume {
  id: string;
  patientId: string;
  admissionDate: string;
  dischargeDate?: string;
  admissionDiagnosis: string;
  finalDiagnosis: string;
  icd10: string;
  secondaryDiagnoses: string[];
  clinicalCourseSummary: string;
  significantProcedures: string[];
  medicationsAtDischarge: string[];
  labFindingsSummary: string;
  conditionAtDischarge: 'Sembuh' | 'Membaik' | 'Rujuk RSUD' | 'Pulang Paksa';
  dischargeInstructions: string;
  followUpClinicDate: string;
  doctorInCharge: string;
  status: 'Draft' | 'Final Disahkan';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'EMR' | 'VOICE' | 'BARCODE' | 'MEDICATION' | 'LAB' | 'DIET' | 'AUTH' | 'SECURITY';
  patientId?: string;
  patientName?: string;
  details: string;
  status: 'SUCCESS' | 'BLOCKED_SAFETY_ALERT' | 'WARNING';
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  patientId?: string;
  actionUrl?: string;
  read: boolean;
}
