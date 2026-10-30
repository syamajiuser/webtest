import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Printer,
  QrCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { PrintableBarcode } from '../common/PrintableBarcode';
import { getSeverityStyle } from '../../utils/clinicalCalculations';
import { Patient } from '../../types/emr';

interface PatientManagementViewProps {
  onNavigateToEMR?: (patientId: string) => void;
}

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({ onNavigateToEMR }) => {
  const {
    patients,
    setSelectedPatient,
    admitPatient,
    beds,
  } = useEMR();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedWristbandPatient, setSelectedWristbandPatient] = useState<Patient | null>(null);

  // New Registration form
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [birthDate, setBirthDate] = useState('1990-05-15');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'AB' | 'O'>('O');
  const [phone, setPhone] = useState('0812-');
  const [address, setAddress] = useState('Kecamatan Puskesmas');
  const [diagnosis, setDiagnosis] = useState('');
  const [allergies, setAllergies] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');

  const vacantBeds = beds.filter((b) => b.status === 'vacant');

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.nik.includes(q) ||
      (p.roomName && p.roomName.toLowerCase().includes(q))
    );
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !diagnosis.trim()) return;

    const targetBed = selectedBedId || (vacantBeds[0]?.id ?? 'BED-A03');

    const newPt = admitPatient(
      {
        name: name.trim(),
        nik: nik.trim() || '3201000000000000',
        birthDate,
        age: new Date().getFullYear() - new Date(birthDate).getFullYear(),
        gender,
        bloodType,
        phone,
        address,
        primaryDiagnosis: diagnosis.trim(),
        allergies: allergies.trim() ? allergies.split(',').map((s) => s.trim()) : [],
        clinicalSeverity: 'stable',
      },
      targetBed
    );

    setShowRegModal(false);
    setSelectedWristbandPatient(newPt);
    alert(`Pasien ${newPt.name} berhasil didaftarkan! Gelang barcode ${newPt.wristbandToken} siap dicetak.`);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <Users className="w-5 h-5 text-teal-300" />
              </span>
              <h2 className="text-base font-extrabold tracking-wide">
                Patient Management (Registrasi & Penerbitan Gelang Pasien)
              </h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Manajemen data induk demografis pasien rawat inap, penerbitan gelang barcode identitas tahan air (waterproof wristband), dan integrasi alokasi bed bangsal.
            </p>
          </div>

          <button
            onClick={() => setShowRegModal(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrasi Pasien Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Metrics */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pasien, no. RM, NIK, ruangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-600">
          Total Terdaftar: <strong>{patients.length} Pasien</strong> • Tempat Tidur Kosong:{' '}
          <strong className="text-blue-600">{vacantBeds.length} Bed</strong>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 border-b">
              <th className="p-3 font-bold">Pasien & No. RM</th>
              <th className="p-3 font-bold">Usia / Gender</th>
              <th className="p-3 font-bold">Alokasi Ruang / Bed</th>
              <th className="p-3 font-bold">Diagnosis Primer</th>
              <th className="p-3 font-bold">Tingkat Kegawatan</th>
              <th className="p-3 font-bold text-center">Gelang Barcode</th>
              <th className="p-3 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((p) => {
              const sev = getSeverityStyle(p.clinicalSeverity);

              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{p.mrn}</div>
                  </td>
                  <td className="p-3 text-slate-700">
                    {p.age} th • {p.gender === 'Laki-laki' ? 'L' : 'P'} (Gol. {p.bloodType})
                  </td>
                  <td className="p-3">
                    {p.roomName ? (
                      <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {p.roomName} {p.bedNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400">Belum ada bed</span>
                    )}
                  </td>
                  <td className="p-3 font-medium text-slate-800">{p.primaryDiagnosis}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${sev.badgeClass}`}>
                      {sev.label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedWristbandPatient(p)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono text-[10px] border border-slate-300 inline-flex items-center space-x-1"
                    >
                      <QrCode className="w-3 h-3 text-blue-600" />
                      <span>{p.wristbandToken}</span>
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedPatient(p);
                        if (onNavigateToEMR) onNavigateToEMR(p.id);
                      }}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white rounded font-bold text-xs shadow-xs transition cursor-pointer"
                      title={`Buka Berkas EMR ${p.name}`}
                    >
                      Buka EMR
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Printable Wristband Modal */}
      {selectedWristbandPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#123B63] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Cetak Gelang Barcode Pasien</h3>
                <div className="text-xs text-blue-200">{selectedWristbandPatient.name}</div>
              </div>
              <button
                onClick={() => setSelectedWristbandPatient(null)}
                className="text-blue-200 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center">
                <PrintableBarcode
                  value={selectedWristbandPatient.wristbandToken}
                  type="code128"
                  label="GELANG IDENTITAS PASIEN RAWAT INAP"
                  subLabel={`${selectedWristbandPatient.name} • ${selectedWristbandPatient.mrn}`}
                  width={240}
                  height={50}
                />
                <div className="text-[11px] text-slate-600 mt-2">
                  {selectedWristbandPatient.gender}, {selectedWristbandPatient.age} th • Alergi:{' '}
                  {selectedWristbandPatient.allergies.join(', ') || 'Nihil'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedWristbandPatient(null)}
                  className="px-3 py-1.5 text-slate-600 text-xs font-medium"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow flex items-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Label Thermal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-[#123B63] text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">Registrasi Pasien Rawat Inap Baru</h3>
              <button onClick={() => setShowRegModal(false)} className="text-blue-200 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap sesuai KTP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Golongan Darah</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value as any)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="O">O</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alokasi Bed</label>
                  <select
                    value={selectedBedId}
                    onChange={(e) => setSelectedBedId(e.target.value)}
                    className="w-full p-2 border rounded bg-white font-bold"
                  >
                    {vacantBeds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.roomName} {b.bedNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosis Masuk *</label>
                <input
                  type="text"
                  required
                  placeholder="Diagnosis primer masuk rawat inap..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Riwayat Alergi (jika ada)</label>
                <input
                  type="text"
                  placeholder="contoh: Amoxicillin, Paracetamol, Seafood..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded shadow"
                >
                  Daftarkan & Terbitkan Gelang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
