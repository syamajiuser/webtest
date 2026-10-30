import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  Bed,
  Patient,
  DoctorAssessment,
  NurseAssessment,
  CPPTEntry,
  MedicationOrder,
  MedicationAdministrationRecord,
  LabOrder,
  LabResult,
  DietaryOrder,
  MRSARecord,
  MNARecord,
  MedicalResume,
  AuditLog,
  SystemNotification,
  ClinicalSeverity,
} from '../types/emr';
import {
  DEMO_USERS,
  INITIAL_BEDS,
  INITIAL_PATIENTS,
  INITIAL_DOCTOR_ASSESSMENTS,
  INITIAL_NURSE_ASSESSMENTS,
  INITIAL_CPPT_ENTRIES,
  INITIAL_MEDICATION_ORDERS,
  INITIAL_MAR_RECORDS,
  INITIAL_LAB_ORDERS,
  INITIAL_LAB_RESULTS,
  INITIAL_DIETARY_ORDERS,
  INITIAL_MNA_RECORDS,
  INITIAL_MRSA_RECORDS,
  INITIAL_RESUMES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface EMRContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  availableUsers: UserProfile[];
  beds: Bed[];
  patients: Patient[];
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  selectedBed: Bed | null;
  setSelectedBed: (bed: Bed | null) => void;
  doctorAssessments: Record<string, DoctorAssessment>;
  nurseAssessments: Record<string, NurseAssessment>;
  cpptEntries: CPPTEntry[];
  medicationOrders: MedicationOrder[];
  marRecords: MedicationAdministrationRecord[];
  labOrders: LabOrder[];
  labResults: LabResult[];
  dietaryOrders: DietaryOrder[];
  mnaRecords: Record<string, MNARecord>;
  mrsaRecords: Record<string, MRSARecord>;
  medicalResumes: Record<string, MedicalResume>;
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  
  // Actions
  admitPatient: (patientData: Partial<Patient>, bedId: string) => Patient;
  dischargePatient: (patientId: string) => void;
  updateBedSeverity: (bedId: string, severity: ClinicalSeverity) => void;
  saveDoctorAssessment: (assessment: DoctorAssessment) => void;
  saveNurseAssessment: (assessment: NurseAssessment) => void;
  addCPPTEntry: (entry: Omit<CPPTEntry, 'id' | 'dateTime'>) => void;
  createMedicationOrder: (order: Partial<MedicationOrder>) => void;
  verifyMedicationOrderPharmacy: (orderId: string) => void;
  administerMedication: (
    marId: string,
    status: MedicationAdministrationRecord['status'],
    notes?: string,
    exceptionReason?: string
  ) => void;
  createLabOrder: (order: Partial<LabOrder>) => void;
  updateLabStatus: (orderId: string, status: LabOrder['status']) => void;
  saveLabResult: (result: Omit<LabResult, 'id' | 'completedAt'>) => void;
  createDietaryOrder: (order: Partial<DietaryOrder>) => void;
  updateDietStatus: (dietId: string, status: DietaryOrder['preparationStatus'], verifiedAtBedside?: boolean) => void;
  saveMNARecord: (record: MNARecord) => void;
  saveMRSARecord: (record: MRSARecord) => void;
  saveResumeMedis: (resume: MedicalResume) => void;
  logAudit: (entry: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  resetToDemoData: () => void;
}

const EMRContext = createContext<EMRContextType | undefined>(undefined);

export const EMRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Ensure pristine v1.0 initial data state
  const isV1Init = typeof window !== 'undefined' && localStorage.getItem('vera_v1_ready') === 'true';
  if (typeof window !== 'undefined' && !isV1Init) {
    localStorage.clear();
    localStorage.setItem('vera_v1_ready', 'true');
  }

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Default to dr. Budi Santoso
  const [beds, setBeds] = useState<Bed[]>(() => {
    const saved = localStorage.getItem('vera_v1_beds');
    return saved ? JSON.parse(saved) : INITIAL_BEDS;
  });
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('vera_v1_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(INITIAL_PATIENTS[0]);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(INITIAL_BEDS[0]);

  const [doctorAssessments, setDoctorAssessments] = useState<Record<string, DoctorAssessment>>(() => {
    const saved = localStorage.getItem('vera_v1_doc_ass');
    return saved ? JSON.parse(saved) : INITIAL_DOCTOR_ASSESSMENTS;
  });
  const [nurseAssessments, setNurseAssessments] = useState<Record<string, NurseAssessment>>(() => {
    const saved = localStorage.getItem('vera_v1_nurse_ass');
    return saved ? JSON.parse(saved) : INITIAL_NURSE_ASSESSMENTS;
  });
  const [cpptEntries, setCpptEntries] = useState<CPPTEntry[]>(() => {
    const saved = localStorage.getItem('vera_v1_cppt');
    return saved ? JSON.parse(saved) : INITIAL_CPPT_ENTRIES;
  });
  const [medicationOrders, setMedicationOrders] = useState<MedicationOrder[]>(() => {
    const saved = localStorage.getItem('vera_v1_med_orders');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATION_ORDERS;
  });
  const [marRecords, setMarRecords] = useState<MedicationAdministrationRecord[]>(() => {
    const saved = localStorage.getItem('vera_v1_mar');
    return saved ? JSON.parse(saved) : INITIAL_MAR_RECORDS;
  });
  const [labOrders, setLabOrders] = useState<LabOrder[]>(() => {
    const saved = localStorage.getItem('vera_v1_lab_orders');
    return saved ? JSON.parse(saved) : INITIAL_LAB_ORDERS;
  });
  const [labResults, setLabResults] = useState<LabResult[]>(() => {
    const saved = localStorage.getItem('vera_v1_lab_results');
    return saved ? JSON.parse(saved) : INITIAL_LAB_RESULTS;
  });
  const [dietaryOrders, setDietaryOrders] = useState<DietaryOrder[]>(() => {
    const saved = localStorage.getItem('vera_v1_diet_orders');
    return saved ? JSON.parse(saved) : INITIAL_DIETARY_ORDERS;
  });
  const [mnaRecords, setMnaRecords] = useState<Record<string, MNARecord>>(() => {
    const saved = localStorage.getItem('vera_v1_mna');
    return saved ? JSON.parse(saved) : INITIAL_MNA_RECORDS;
  });
  const [mrsaRecords, setMrsaRecords] = useState<Record<string, MRSARecord>>(() => {
    const saved = localStorage.getItem('vera_v1_mrsa');
    return saved ? JSON.parse(saved) : INITIAL_MRSA_RECORDS;
  });
  const [medicalResumes, setMedicalResumes] = useState<Record<string, MedicalResume>>(() => {
    const saved = localStorage.getItem('vera_v1_resumes');
    return saved ? JSON.parse(saved) : INITIAL_RESUMES;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('vera_v1_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('vera_v1_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vera_beds', JSON.stringify(beds));
    localStorage.setItem('vera_patients', JSON.stringify(patients));
    localStorage.setItem('vera_cppt', JSON.stringify(cpptEntries));
    localStorage.setItem('vera_med_orders', JSON.stringify(medicationOrders));
    localStorage.setItem('vera_mar', JSON.stringify(marRecords));
    localStorage.setItem('vera_lab_orders', JSON.stringify(labOrders));
    localStorage.setItem('vera_lab_results', JSON.stringify(labResults));
    localStorage.setItem('vera_diet_orders', JSON.stringify(dietaryOrders));
    localStorage.setItem('vera_audit', JSON.stringify(auditLogs));
    localStorage.setItem('vera_notifs', JSON.stringify(notifications));
  }, [beds, patients, cpptEntries, medicationOrders, marRecords, labOrders, labResults, dietaryOrders, auditLogs, notifications]);

  // Keep selectedPatient and selectedBed in sync
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find((p) => p.id === selectedPatient.id);
      if (updated) setSelectedPatient(updated);
    }
  }, [patients]);

  const logAudit = (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newEntry: AuditLog = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const admitPatient = (patientData: Partial<Patient>, bedId: string): Patient => {
    const targetBed = beds.find((b) => b.id === bedId);
    if (!targetBed) throw new Error('Bed tidak ditemukan');

    const newPatientId = `PT-${String(patients.length + 1).padStart(3, '0')}`;
    const initials = (patientData.name || 'NN')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newPatient: Patient = {
      id: newPatientId,
      mrn: patientData.mrn || `RM-2026-${String(patients.length + 850).padStart(4, '0')}`,
      name: patientData.name || 'Pasien Baru',
      initials,
      nik: patientData.nik || '3201000000000000',
      birthDate: patientData.birthDate || '1985-01-01',
      age: patientData.age || 40,
      gender: patientData.gender || 'Laki-laki',
      bloodType: patientData.bloodType || 'O',
      address: patientData.address || 'Kecamatan Puskesmas',
      phone: patientData.phone || '0812-0000-0000',
      admissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      admissionReason: patientData.admissionReason || 'Rawat inap rujukan poli/IGD',
      assignedBedId: bedId,
      roomName: targetBed.roomName,
      bedNumber: targetBed.bedNumber,
      dpjpId: currentUser.role === 'Doctor' ? currentUser.id : DEMO_USERS[0].id,
      dpjpName: currentUser.role === 'Doctor' ? currentUser.name : DEMO_USERS[0].name,
      primaryNurseId: DEMO_USERS[2].id,
      primaryNurseName: DEMO_USERS[2].name,
      primaryDiagnosis: patientData.primaryDiagnosis || 'Observasi Klinis Rawat Inap',
      icd10Code: patientData.icd10Code || 'Z03.8',
      clinicalSeverity: patientData.clinicalSeverity || 'stable',
      wristbandToken: `VERA-WB-${newPatientId}-${initials}`,
      allergies: patientData.allergies || [],
      clinicalFlags: patientData.clinicalFlags || { ivTherapy: true, specialDiet: true },
    };

    // Update patient list
    setPatients((prev) => [...prev, newPatient]);

    // Update bed status: BLUE -> BLACK (Occupied)
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'occupied',
              patientId: newPatientId,
              severity: newPatient.clinicalSeverity,
            }
          : b
      )
    );

    setSelectedPatient(newPatient);
    setSelectedBed({ ...targetBed, status: 'occupied', patientId: newPatientId, severity: newPatient.clinicalSeverity });

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Admisi Rawat Inap Pasien',
      category: 'EMR',
      patientId: newPatient.id,
      patientName: newPatient.name,
      details: `Pasien ${newPatient.name} dialokasikan ke ${targetBed.roomName} ${targetBed.bedNumber}. Gelang barcode ${newPatient.wristbandToken} diaktifkan.`,
      status: 'SUCCESS',
    });

    return newPatient;
  };

  const dischargePatient = (patientId: string) => {
    const pt = patients.find((p) => p.id === patientId);
    if (!pt) return;

    // Free the bed: BLACK -> BLUE (Vacant)
    setBeds((prev) =>
      prev.map((b) =>
        b.patientId === patientId
          ? { ...b, status: 'vacant', patientId: undefined, severity: undefined }
          : b
      )
    );

    // Update patient bed assignment
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, assignedBedId: undefined, roomName: undefined, bedNumber: undefined }
          : p
      )
    );

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pemulangan Pasien (Discharge & Bed Release)',
      category: 'EMR',
      patientId: pt.id,
      patientName: pt.name,
      details: `Pasien ${pt.name} telah dipulangkan. Tempat tidur ${pt.roomName || ''} ${pt.bedNumber || ''} resmi dikosongkan dan siap untuk admisi baru.`,
      status: 'SUCCESS',
    });
  };

  const updateBedSeverity = (bedId: string, severity: ClinicalSeverity) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, severity } : b))
    );
    const targetBed = beds.find((b) => b.id === bedId);
    if (targetBed?.patientId) {
      setPatients((prev) =>
        prev.map((p) => (p.id === targetBed.patientId ? { ...p, clinicalSeverity: severity } : p))
      );
    }
    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Perubahan Tingkat Kegawatan Pasien',
      category: 'EMR',
      details: `Bed ${targetBed?.bedNumber} diubah ke tingkat ${severity.toUpperCase()} oleh ${currentUser.name}.`,
      status: 'SUCCESS',
    });
  };

  const saveDoctorAssessment = (assessment: DoctorAssessment) => {
    setDoctorAssessments((prev) => ({
      ...prev,
      [assessment.patientId]: assessment,
    }));
    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Simpan & Verifikasi Asesmen Dokter',
      category: 'EMR',
      patientId: assessment.patientId,
      details: `Asesmen dokter untuk pasien ${assessment.patientId} berhasil disimpan dengan status ${assessment.status}.`,
      status: 'SUCCESS',
    });
  };

  const saveNurseAssessment = (assessment: NurseAssessment) => {
    setNurseAssessments((prev) => ({
      ...prev,
      [assessment.patientId]: assessment,
    }));
    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Simpan Asesmen Keperawatan',
      category: 'EMR',
      patientId: assessment.patientId,
      details: `Asesmen keperawatan dan pengkajian risiko jatuh Morse disimpan oleh ${currentUser.name}.`,
      status: 'SUCCESS',
    });
  };

  const addCPPTEntry = (entry: Omit<CPPTEntry, 'id' | 'dateTime'>) => {
    const newEntry: CPPTEntry = {
      ...entry,
      id: `CPPT-${Date.now()}`,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      signedBy: entry.verificationStatus === 'verified' ? currentUser.name : undefined,
      signedAt: entry.verificationStatus === 'verified' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
    };
    setCpptEntries((prev) => [newEntry, ...prev]);

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pembuatan Catatan Perkembangan (CPPT)',
      category: 'EMR',
      patientId: entry.patientId,
      details: `CPPT SOAP baru dicatat oleh ${currentUser.name} (${currentUser.role}). Status: ${entry.verificationStatus}.`,
      status: 'SUCCESS',
    });
  };

  const createMedicationOrder = (order: Partial<MedicationOrder>) => {
    const orderId = `MED-ORD-${Date.now().toString().slice(-4)}`;
    const eTicket = `VERA-MED-ETKT-${orderId}`;
    const newOrder: MedicationOrder = {
      id: orderId,
      patientId: order.patientId || selectedPatient?.id || 'PT-001',
      patientName: order.patientName || selectedPatient?.name || 'Pasien',
      mrn: order.mrn || selectedPatient?.mrn || 'RM-0000',
      medicationName: order.medicationName || 'Obat Baru',
      medicationCode: order.medicationCode || 'MED-NEW',
      strength: order.strength || '500 mg',
      dosage: order.dosage || '1 tablet',
      route: order.route || 'Oral',
      frequency: order.frequency || '3 x 1',
      scheduleTimes: order.scheduleTimes || ['06:00', '14:00', '22:00'],
      duration: order.duration || '3 hari',
      quantity: order.quantity || 10,
      instructions: order.instructions || 'Diminum sesudah makan',
      orderingDoctorName: currentUser.name,
      orderDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'ordered',
      eTicketBarcode: eTicket,
    };
    setMedicationOrders((prev) => [newOrder, ...prev]);

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'E-Prescription Dibuat',
      category: 'MEDICATION',
      patientId: newOrder.patientId,
      details: `Dokter ${currentUser.name} meresepkan ${newOrder.medicationName} (${newOrder.dosage}) untuk ${newOrder.patientName}.`,
      status: 'SUCCESS',
    });
  };

  const verifyMedicationOrderPharmacy = (orderId: string) => {
    setMedicationOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'ticket_generated',
              verifiedByPharmacist: currentUser.name,
              verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : ord
      )
    );

    const ord = medicationOrders.find((o) => o.id === orderId);
    if (ord) {
      // Create scheduled MAR record
      const newMar: MedicationAdministrationRecord = {
        id: `MAR-${Date.now()}`,
        patientId: ord.patientId,
        medicationOrderId: ord.id,
        medicationName: ord.medicationName,
        dosage: ord.dosage,
        route: ord.route,
        scheduledTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Scheduled',
        wristbandScanned: false,
        eTicketScanned: false,
      };
      setMarRecords((prev) => [newMar, ...prev]);
    }

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Verifikasi Resep & Terbit E-Tiket Barcode',
      category: 'MEDICATION',
      details: `Apoteker ${currentUser.name} memverifikasi resep ${orderId}. E-Tiket barcode diterbitkan.`,
      status: 'SUCCESS',
    });
  };

  const administerMedication = (
    marId: string,
    status: MedicationAdministrationRecord['status'],
    notes?: string,
    exceptionReason?: string
  ) => {
    setMarRecords((prev) =>
      prev.map((m) =>
        m.id === marId
          ? {
              ...m,
              status,
              administeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              administeredBy: currentUser.name,
              wristbandScanned: true,
              eTicketScanned: true,
              notes,
              reasonForException: exceptionReason,
            }
          : m
      )
    );

    const targetMar = marRecords.find((m) => m.id === marId);

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Closed-Loop Pemberian Obat (Bedside MAR)',
      category: 'MEDICATION',
      patientId: targetMar?.patientId,
      details: `Pemberian ${targetMar?.medicationName} dikonfirmasi oleh perawat ${currentUser.name}. Status: ${status}. Catatan: ${notes || '-'}.`,
      status: 'SUCCESS',
    });
  };

  const createLabOrder = (order: Partial<LabOrder>) => {
    const id = `LAB-ORD-${Date.now().toString().slice(-4)}`;
    const barcode = `VERA-LAB-SPM-${id}`;
    const newLab: LabOrder = {
      id,
      patientId: order.patientId || selectedPatient?.id || 'PT-001',
      patientName: order.patientName || selectedPatient?.name || 'Pasien',
      mrn: order.mrn || selectedPatient?.mrn || 'RM-0000',
      testName: order.testName || 'Pemeriksaan Darah',
      category: order.category || 'Hematologi',
      clinicalIndication: order.clinicalIndication || 'Klinis Puskesmas',
      specimenType: order.specimenType || 'Darah Vena',
      priority: order.priority || 'Rutin',
      orderingDoctorName: currentUser.name,
      orderDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      specimenLabelBarcode: barcode,
      status: 'Order Created',
    };
    setLabOrders((prev) => [newLab, ...prev]);

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Permintaan Pemeriksaan Laboratorium Baru',
      category: 'LAB',
      patientId: newLab.patientId,
      details: `Order lab ${newLab.testName} (${newLab.priority}) dibuat oleh ${currentUser.name}. Label barcode ${barcode} disiapkan.`,
      status: 'SUCCESS',
    });
  };

  const updateLabStatus = (orderId: string, status: LabOrder['status']) => {
    setLabOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updated = { ...ord, status };
        if (status === 'Specimen Collected') {
          updated.collectedByNurse = currentUser.name;
          updated.collectedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
        } else if (status === 'Received by Laboratory') {
          updated.receivedByLab = currentUser.name;
          updated.receivedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
        }
        return updated;
      })
    );

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pembaruan Status Spesimen Lab',
      category: 'LAB',
      details: `Order lab ${orderId} diubah statusnya menjadi ${status} oleh ${currentUser.name}.`,
      status: 'SUCCESS',
    });
  };

  const saveLabResult = (result: Omit<LabResult, 'id' | 'completedAt'>) => {
    const newRes: LabResult = {
      ...result,
      id: `LAB-RES-${Date.now().toString().slice(-4)}`,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setLabResults((prev) => [newRes, ...prev]);

    // Also update associated lab order to 'Result Released'
    setLabOrders((prev) =>
      prev.map((ord) => (ord.id === result.orderId ? { ...ord, status: 'Result Released' } : ord))
    );

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Validasi & Rilis Hasil Pemeriksaan Laboratorium',
      category: 'LAB',
      patientId: result.patientId,
      details: `Hasil lab untuk tes ${result.testName} diverifikasi oleh ${currentUser.name}. Hasil otomatis terintegrasi ke EMR pasien.`,
      status: 'SUCCESS',
    });
  };

  const createDietaryOrder = (order: Partial<DietaryOrder>) => {
    const id = `DIET-${Date.now().toString().slice(-4)}`;
    const barcode = `VERA-DIET-TKT-${id}`;
    const newDiet: DietaryOrder = {
      id,
      patientId: order.patientId || selectedPatient?.id || 'PT-001',
      patientName: order.patientName || selectedPatient?.name || 'Pasien',
      mrn: order.mrn || selectedPatient?.mrn || 'RM-0000',
      dietType: order.dietType || 'Normal',
      caloriesTarget: order.caloriesTarget || '2000 kkal',
      textureModification: order.textureModification || 'Biasa',
      allergiesFood: order.allergiesFood || ['Tidak ada'],
      schedule: order.schedule || 'Pagi, Siang, Sore',
      specialInstructions: order.specialInstructions || 'Sajikan hangat',
      mealTicketBarcode: barcode,
      orderedBy: currentUser.name,
      orderDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      preparationStatus: 'Diterima Gizi',
      patientVerifiedAtBedside: false,
    };
    setDietaryOrders((prev) => [newDiet, ...prev]);

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Instruksi Diet Pasien Baru',
      category: 'DIET',
      patientId: newDiet.patientId,
      details: `Diet ${newDiet.dietType} (${newDiet.caloriesTarget}) dipesan oleh ${currentUser.name}. Tiket makanan ${barcode} dibuat.`,
      status: 'SUCCESS',
    });
  };

  const updateDietStatus = (
    dietId: string,
    status: DietaryOrder['preparationStatus'],
    verifiedAtBedside: boolean = false
  ) => {
    setDietaryOrders((prev) =>
      prev.map((d) =>
        d.id === dietId
          ? {
              ...d,
              preparationStatus: status,
              patientVerifiedAtBedside: verifiedAtBedside,
              deliveredAt: status === 'Terkirim' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : d.deliveredAt,
              deliveredBy: status === 'Terkirim' ? currentUser.name : d.deliveredBy,
            }
          : d
      )
    );

    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pembaruan Distribusi Makanan Pasien',
      category: 'DIET',
      details: `Status diet ${dietId} diubah ke ${status}. Verifikasi bedside: ${verifiedAtBedside ? 'Cocok' : 'Belum'}.`,
      status: 'SUCCESS',
    });
  };

  const saveMNARecord = (record: MNARecord) => {
    setMnaRecords((prev) => ({ ...prev, [record.patientId]: record }));
    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pengkajian Skrining Gizi MNA-SF',
      category: 'EMR',
      patientId: record.patientId,
      details: `Skor MNA dihitung: ${record.score} (${record.category}) oleh ${currentUser.name}.`,
      status: 'SUCCESS',
    });
  };

  const saveMRSARecord = (record: MRSARecord) => {
    setMrsaRecords((prev) => ({ ...prev, [record.patientId]: record }));
    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pencatatan Status Skrining MRSA',
      category: 'EMR',
      patientId: record.patientId,
      details: `Status MRSA diperbarui: ${record.status}. Protokol isolasi: ${record.isolationPrecautionsActive ? 'Aktif' : 'Non-aktif'}.`,
      status: 'SUCCESS',
    });
  };

  const saveResumeMedis = (resume: MedicalResume) => {
    setMedicalResumes((prev) => ({ ...prev, [resume.patientId]: resume }));
    logAudit({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Penyusunan Resume Medis / Ringkasan Pulang',
      category: 'EMR',
      patientId: resume.patientId,
      details: `Resume medis pasien ${resume.patientId} disahkan oleh ${currentUser.name}.`,
      status: 'SUCCESS',
    });
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setBeds(INITIAL_BEDS);
    setPatients(INITIAL_PATIENTS);
    setSelectedPatient(INITIAL_PATIENTS[0]);
    setSelectedBed(INITIAL_BEDS[0]);
    setDoctorAssessments(INITIAL_DOCTOR_ASSESSMENTS);
    setNurseAssessments(INITIAL_NURSE_ASSESSMENTS);
    setCpptEntries(INITIAL_CPPT_ENTRIES);
    setMedicationOrders(INITIAL_MEDICATION_ORDERS);
    setMarRecords(INITIAL_MAR_RECORDS);
    setLabOrders(INITIAL_LAB_ORDERS);
    setLabResults(INITIAL_LAB_RESULTS);
    setDietaryOrders(INITIAL_DIETARY_ORDERS);
    setMnaRecords(INITIAL_MNA_RECORDS);
    setMrsaRecords(INITIAL_MRSA_RECORDS);
    setMedicalResumes(INITIAL_RESUMES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(DEMO_USERS[0]);
  };

  return (
    <EMRContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: DEMO_USERS,
        beds,
        patients,
        selectedPatient,
        setSelectedPatient,
        selectedBed,
        setSelectedBed,
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
        auditLogs,
        notifications,
        admitPatient,
        dischargePatient,
        updateBedSeverity,
        saveDoctorAssessment,
        saveNurseAssessment,
        addCPPTEntry,
        createMedicationOrder,
        verifyMedicationOrderPharmacy,
        administerMedication,
        createLabOrder,
        updateLabStatus,
        saveLabResult,
        createDietaryOrder,
        updateDietStatus,
        saveMNARecord,
        saveMRSARecord,
        saveResumeMedis,
        logAudit,
        markNotificationRead,
        resetToDemoData,
      }}
    >
      {children}
    </EMRContext.Provider>
  );
};

export const useEMR = () => {
  const context = useContext(EMRContext);
  if (!context) {
    throw new Error('useEMR must be used within an EMRProvider');
  }
  return context;
};
