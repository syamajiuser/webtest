import React, { useState } from 'react';
import {
  TestTube2,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  Filter,
  Check,
  Send,
  FileCheck,
  Plus,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { PrintableBarcode } from '../common/PrintableBarcode';

export const LaboratoryManagementView: React.FC = () => {
  const {
    labOrders,
    labResults,
    updateLabStatus,
    saveLabResult,
    currentUser,
    patients,
  } = useEMR();

  const [activeTab, setActiveTab] = useState<'orders' | 'results'>('orders');
  const [selectedOrderForInput, setSelectedOrderForInput] = useState<any | null>(null);

  // Result entry form state
  const [param1Name, setParam1Name] = useState('Hemoglobin');
  const [param1Val, setParam1Val] = useState('13.8');
  const [param1Unit, setParam1Unit] = useState('g/dL');
  const [param1Range, setParam1Range] = useState('13.2 - 17.3');

  const [param2Name, setParam2Name] = useState('Trombosit');
  const [param2Val, setParam2Val] = useState('85.000');
  const [param2Unit, setParam2Unit] = useState('/uL');
  const [param2Range, setParam2Range] = useState('150.000 - 450.000');

  const [labNotes, setLabNotes] = useState('Hasil telah divalidasi validator laboratorium Puskesmas.');
  const [isCritical, setIsCritical] = useState(false);

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForInput) return;

    saveLabResult({
      orderId: selectedOrderForInput.id,
      patientId: selectedOrderForInput.patientId,
      testName: selectedOrderForInput.testName,
      category: selectedOrderForInput.category,
      verifiedBy: currentUser.name,
      clinicalNotes: labNotes,
      isCritical,
      items: [
        {
          parameter: param1Name,
          value: param1Val,
          unit: param1Unit,
          referenceRange: param1Range,
          flag: 'Normal',
        },
        {
          parameter: param2Name,
          value: param2Val,
          unit: param2Unit,
          referenceRange: param2Range,
          flag: Number(param2Val.replace('.', '')) < 100000 ? 'Low' : 'Normal',
        },
      ],
    });

    setSelectedOrderForInput(null);
    alert('Hasil laboratorium berhasil divalidasi dan otomatis terintegrasi ke EMR pasien!');
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <TestTube2 className="w-5 h-5 text-teal-300" />
              </span>
              <h2 className="text-base font-extrabold tracking-wide">
                Laboratory Management (Closed-Loop Pelayanan Laboratorium)
              </h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Pelacakan tertutup spesimen laboratorium: permintaan dokter &rarr; label barcode tabung &rarr; verifikasi gelang pasien saat sampling &rarr; transportasi &rarr; penerimaan lab &rarr; rilis hasil ke EMR.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'orders' ? 'bg-white text-[#123B63]' : 'bg-white/10 text-white'
              }`}
            >
              Order & Spesimen ({labOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'results' ? 'bg-white text-[#123B63]' : 'bg-white/10 text-white'
              }`}
            >
              Hasil Rilis ({labResults.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labOrders.map((ord) => {
            const pt = patients.find((p) => p.id === ord.patientId);

            return (
              <div
                key={ord.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between text-xs space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{ord.patientName}</span>
                      <div className="text-[10px] font-mono text-slate-500">
                        {ord.mrn} • {pt?.roomName || 'Bed'} {pt?.bedNumber || ''}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        ord.priority.includes('Cito')
                          ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ord.priority}
                    </span>
                  </div>

                  <div className="pt-2 space-y-1">
                    <div className="text-base font-extrabold text-blue-950">{ord.testName}</div>
                    <div className="text-slate-700 font-semibold">
                      Kategori: {ord.category} • Spesimen: {ord.specimenType}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Indikasi: <strong>{ord.clinicalIndication}</strong>
                    </div>
                    <div className="text-teal-700 font-bold text-[11px] pt-1">
                      Status: {ord.status}
                    </div>
                  </div>
                </div>

                {/* Printable Barcode Tube Label */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                  <PrintableBarcode
                    value={ord.specimenLabelBarcode}
                    type="code128"
                    label="TABUNG SPESIMEN LAB"
                    subLabel={`${ord.testName} • ${ord.patientName}`}
                    width={180}
                    height={36}
                  />
                </div>

                {/* Status Transitions */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  {ord.status === 'Order Created' && (
                    <button
                      onClick={() => updateLabStatus(ord.id, 'Label Generated')}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                    >
                      Cetak Label & Kirim ke Perawat
                    </button>
                  )}
                  {ord.status === 'Label Generated' && (
                    <button
                      onClick={() => updateLabStatus(ord.id, 'Specimen Collected')}
                      className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold"
                    >
                      Konfirmasi Koleksi di Bedside
                    </button>
                  )}
                  {ord.status === 'Specimen Collected' && (
                    <button
                      onClick={() => updateLabStatus(ord.id, 'Received by Laboratory')}
                      className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold"
                    >
                      Konfirmasi Terima di Laboratorium
                    </button>
                  )}
                  {ord.status === 'Received by Laboratory' && (
                    <button
                      onClick={() => setSelectedOrderForInput(ord)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                    >
                      Input & Verifikasi Hasil Lab
                    </button>
                  )}
                  {ord.status === 'Result Released' && (
                    <div className="text-center text-emerald-800 font-bold py-1 bg-emerald-50 rounded border border-emerald-200">
                      Hasil Selesai & Terintegrasi ke EMR
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Result Entry Modal */}
      {selectedOrderForInput && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-[#123B63] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Input & Validasi Hasil Laboratorium</h3>
                <div className="text-xs text-blue-200">
                  {selectedOrderForInput.testName} • Pasien: <strong>{selectedOrderForInput.patientName}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForInput(null)}
                className="text-blue-200 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Parameter 1:</span>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={param1Name}
                    onChange={(e) => setParam1Name(e.target.value)}
                    className="p-1.5 border rounded"
                  />
                  <input
                    type="text"
                    value={param1Val}
                    onChange={(e) => setParam1Val(e.target.value)}
                    className="p-1.5 border rounded font-bold"
                  />
                  <input
                    type="text"
                    value={param1Unit}
                    onChange={(e) => setParam1Unit(e.target.value)}
                    className="p-1.5 border rounded"
                  />
                  <input
                    type="text"
                    value={param1Range}
                    onChange={(e) => setParam1Range(e.target.value)}
                    className="p-1.5 border rounded"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Parameter 2:</span>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={param2Name}
                    onChange={(e) => setParam2Name(e.target.value)}
                    className="p-1.5 border rounded"
                  />
                  <input
                    type="text"
                    value={param2Val}
                    onChange={(e) => setParam2Val(e.target.value)}
                    className="p-1.5 border rounded font-bold"
                  />
                  <input
                    type="text"
                    value={param2Unit}
                    onChange={(e) => setParam2Unit(e.target.value)}
                    className="p-1.5 border rounded"
                  />
                  <input
                    type="text"
                    value={param2Range}
                    onChange={(e) => setParam2Range(e.target.value)}
                    className="p-1.5 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Ekspertise Validator Lab:</label>
                <textarea
                  rows={2}
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInput(null)}
                  className="px-3 py-1.5 text-slate-600 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow"
                >
                  Validasi & Rilis Hasil ke EMR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
