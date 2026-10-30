import React, { useState } from 'react';
import {
  Settings,
  Building2,
  BookOpen,
  Shield,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const [faskesName, setFaskesName] = useState('Puskesmas Sukamaju Sejahtera');
  const [faskesCode, setFaskesCode] = useState('PKM-3201089');
  const [retentionPolicy, setRetentionPolicy] = useState('7_DAYS');
  const [voiceLang, setVoiceLang] = useState('id-ID');
  const [saved, setSaved] = useState(false);

  const medicalDictionary = [
    { term: 'DHF', meaning: 'Dengue Hemorrhagic Fever / Demam Berdarah Dengue' },
    { term: 'GEA', meaning: 'Gastroenteritis Akut' },
    { term: 'CAP', meaning: 'Community-Acquired Pneumonia' },
    { term: 'TTV', meaning: 'Tanda-Tanda Vital (TD, Nadi, RR, Suhu, SpO2)' },
    { term: 'SDKI/SIKI', meaning: 'Standar Diagnosa & Intervensi Keperawatan Indonesia' },
    { term: 'DL', meaning: 'Darah Lengkap (Hemoglobin, Hematokrit, Leukosit, Trombosit)' },
    { term: 'GDS', meaning: 'Gula Darah Sewaktu' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <Settings className="w-5 h-5 text-teal-300" />
          </span>
          <h2 className="text-base font-extrabold tracking-wide">
            System Settings & Clinical Configuration (Pengaturan VERA)
          </h2>
        </div>
        <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
          Konfigurasi fasilitas Puskesmas, kamus kosa kata medis Bahasa Indonesia, privasi retensi audio, dan manajemen data percontohan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Puskesmas Profile */}
        <form onSubmit={handleSave} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-1 flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Identitas Fasilitas Kesehatan</span>
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Fasilitas Pelayanan Kesehatan</label>
            <input
              type="text"
              value={faskesName}
              onChange={(e) => setFaskesName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kode Faskes Kemenkes</label>
            <input
              type="text"
              value={faskesCode}
              onChange={(e) => setFaskesCode(e.target.value)}
              className="w-full p-2 border rounded font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bahasa Utama Voice Recognition</label>
            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              className="w-full p-2 border rounded bg-white"
            >
              <option value="id-ID">Bahasa Indonesia (id-ID) - Standar</option>
              <option value="en-US">English (Clinical Terms)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kebijakan Retensi Rekaman Audio Asli</label>
            <select
              value={retentionPolicy}
              onChange={(e) => setRetentionPolicy(e.target.value)}
              className="w-full p-2 border rounded bg-white"
            >
              <option value="IMMEDIATE">Segera Dihapus Setelah Verifikasi (Maksimal Privasi)</option>
              <option value="7_DAYS">Disimpan Sementara 7 Hari untuk Audit</option>
              <option value="30_DAYS">30 Hari Sesuai Standar Mutu</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded shadow flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Konfigurasi</span>
            </button>
            {saved && (
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pengaturan berhasil disimpan!</span>
              </span>
            )}
          </div>
        </form>

        {/* Medical Dictionary Reference */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b pb-1 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Kamus Kosakata Klinis Terkonfigurasi</span>
            </h3>
            <p className="text-slate-500 text-[11px] mt-1">
              Singkatan dan terminologi medis yang otomatis dipahami mesin VERA saat dokter/perawat mendiktekan catatan.
            </p>

            <div className="mt-3 space-y-1.5 max-h-56 overflow-y-auto">
              {medicalDictionary.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-blue-900 font-mono">{item.term}</span>:
                  <span className="text-slate-700 ml-1">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
