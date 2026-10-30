import React, { useState } from 'react';
import {
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Check,
  Printer,
  Apple,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { PrintableBarcode } from '../common/PrintableBarcode';

export const NutritionManagementView: React.FC = () => {
  const {
    dietaryOrders,
    createDietaryOrder,
    updateDietStatus,
    patients,
    currentUser,
  } = useEMR();

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'PT-001');
  const [dietType, setDietType] = useState<any>('Lunak (Bubur)');
  const [calories, setCalories] = useState('1900 kkal');
  const [texture, setTexture] = useState('Bubur halus + lauk cincang');
  const [schedule, setSchedule] = useState<any>('Pagi, Siang, Sore');
  const [instructions, setInstructions] = useState('Sajikan dalam kondisi hangat, hindari makanan pedas dan bergas');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const pt = patients.find((p) => p.id === selectedPatientId);
    if (!pt) return;

    createDietaryOrder({
      patientId: pt.id,
      patientName: pt.name,
      mrn: pt.mrn,
      dietType,
      caloriesTarget: calories,
      textureModification: texture,
      schedule,
      specialInstructions: instructions,
    });

    setShowNewOrder(false);
    alert('Order diet berhasil dikirim ke Instalasi Gizi Puskesmas!');
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <UtensilsCrossed className="w-5 h-5 text-teal-300" />
              </span>
              <h2 className="text-base font-extrabold tracking-wide">
                Nutrition & Dietary Management (Pelayanan Gizi Terpadu)
              </h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Integrasi preskripsi diet medis dokter dengan persiapan dapur gizi, pencetakan tiket makan barcode, dan konfirmasi pengantaran makanan di bedside pasien.
            </p>
          </div>

          <button
            onClick={() => setShowNewOrder(!showNewOrder)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Instruksi Diet Baru</span>
          </button>
        </div>
      </div>

      {/* New Diet Order Form */}
      {showNewOrder && (
        <form onSubmit={handleCreateOrder} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs animate-in fade-in">
          <div className="font-bold text-slate-900 text-sm">Instruksi Diet Pasien Baru:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pasien Sasaran</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn} • {p.roomName || 'Bed'} {p.bedNumber || ''})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Diet</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="Normal">Normal</option>
                <option value="Lunak (Bubur)">Lunak (Bubur)</option>
                <option value="Cair">Cair</option>
                <option value="Rendah Garam (RG)">Rendah Garam (RG)</option>
                <option value="Diabetes Mellitus (DM)">Diabetes Mellitus (DM)</option>
                <option value="Tinggi Kalori Tinggi Protein (TKTP)">Tinggi Kalori Tinggi Protein (TKTP)</option>
                <option value="Puasa (NPO)">Puasa (NPO)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Kalori</label>
              <input
                type="text"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Modifikasi Tekstur</label>
              <input
                type="text"
                value={texture}
                onChange={(e) => setTexture(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jadwal Pemberian</label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Petunjuk Khusus & Alergi Makanan</label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowNewOrder(false)}
              className="px-3 py-1.5 text-slate-600 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-bold shadow"
            >
              Simpan & Cetak Tiket Makanan
            </button>
          </div>
        </form>
      )}

      {/* Dietary Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dietaryOrders.map((ord) => {
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
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.preparationStatus === 'Terkirim'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {ord.preparationStatus}
                  </span>
                </div>

                <div className="pt-2 space-y-1">
                  <div className="text-base font-extrabold text-teal-900">{ord.dietType}</div>
                  <div className="text-slate-700 font-semibold">
                    Target: {ord.caloriesTarget} • Tekstur: {ord.textureModification}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Jadwal: {ord.schedule}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Petunjuk: <strong>{ord.specialInstructions}</strong>
                  </div>
                </div>
              </div>

              {/* Barcode Meal Ticket */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                <PrintableBarcode
                  value={ord.mealTicketBarcode}
                  type="code128"
                  label="TIKET MAKANAN PASIEN"
                  subLabel={`${ord.dietType} • ${ord.patientName}`}
                  width={180}
                  height={36}
                />
              </div>

              {/* Status Update Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {ord.deliveredAt ? `Terkirim: ${ord.deliveredAt}` : 'Menunggu Pengantaran'}
                </span>

                {ord.preparationStatus !== 'Terkirim' && (
                  <button
                    onClick={() => updateDietStatus(ord.id, 'Terkirim', true)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                  >
                    Konfirmasi Antar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
