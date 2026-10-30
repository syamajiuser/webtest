import React, { useState, useEffect } from 'react';
import {
  Mic,
  Bell,
  Search,
  Wifi,
  User,
  Sparkles,
  LogOut,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  QrCode,
  Menu,
  Mail,
  Phone,
  KeyRound,
  ShieldCheck,
  History,
  Check,
  X,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { VeraLogo } from '../common/VeraLogo';

interface NavbarProps {
  activeTab: string;
  onOpenVoiceModal: () => void;
  onOpenChatModal: () => void;
  onOpenPatientPortal: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenVoiceModal,
  onOpenChatModal,
  onOpenPatientPortal,
  onToggleMobileSidebar,
}) => {
  const {
    currentUser,
    patients,
    selectedPatient,
    setSelectedPatient,
    notifications,
    markNotificationRead,
  } = useEMR();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Change password local state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' WIB'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.roomName && p.roomName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.bedNumber && p.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'overview': return 'Overview Dashboard — Operasional Puskesmas';
      case 'beds': return 'Inpatient Bed Dashboard (EMR Ward Visual)';
      case 'emr': return 'EMR Ward — Rekam Medis Elektronik Terintegrasi';
      case 'patients': return 'Patient Management — Registrasi & Gelang Pasien';
      case 'voice': return 'Voice Documentation Engine — VERA Speech AI';
      case 'scanner': return 'Barcode & QR Scanner — Mobile Bedside';
      case 'medication': return 'Medication Management — Closed-Loop Farmasi';
      case 'laboratory': return 'Laboratory Management — Closed-Loop Spesimen';
      case 'nutrition': return 'Nutrition & Dietary Management — Pelayanan Gizi';
      case 'records': return 'Medical Records — Longitudinal, MRSA & MNA';
      case 'analytics': return 'Reports & Analytics — Indikator Klinis & Riset VERA';
      case 'users': return 'User Management & Audit Trail — RBAC Puskesmas';
      case 'settings': return 'System Settings — Konfigurasi VERA';
      case 'patient-portal': return 'Portal Pasien & Keluarga — Komunikasi Terapeutik';
      default: return 'VERA Electronic Medical Record';
    }
  };

  return (
    <header className="sticky top-0 z-60 flex items-center justify-between h-16 px-4 bg-[#123B63] text-white shadow-md select-none border-b border-blue-900/60">
      {/* Left: Brand Identity & Active Page */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded text-blue-200 hover:text-white hover:bg-blue-800"
            title="Buka Menu VERA"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center">
          <VeraLogo height={38} showTagline={true} />
        </div>

        <div className="h-6 w-px bg-blue-800 mx-2 hidden md:block" />

        <div className="hidden lg:block">
          <div className="text-xs font-semibold text-slate-100">{getPageTitle(activeTab)}</div>
          {selectedPatient && (
            <div className="text-[11px] text-teal-300 flex items-center space-x-1.5">
              <span>Pasien Aktif:</span>
              <span className="font-bold underline">{selectedPatient.name}</span>
              <span className="text-blue-300">({selectedPatient.mrn} • {selectedPatient.roomName || 'Admisi'} {selectedPatient.bedNumber || ''})</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Patient Search & Quick Voice Mic */}
      <div className="flex items-center space-x-2 max-w-md w-full mx-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-blue-300" />
          </div>
          <input
            type="text"
            placeholder="Cari pasien (Nama, No RM, Bed)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-blue-950/60 border border-blue-800/80 rounded-md text-white placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-blue-950"
          />

          {showSearchResults && filteredPatients.length > 0 && (
            <div className="absolute left-0 right-0 top-10 bg-white text-slate-800 rounded-md shadow-2xl border border-slate-200 py-1 z-50 max-h-64 overflow-y-auto">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 border-b">
                Hasil Pencarian Pasien ({filteredPatients.length})
              </div>
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between border-b border-slate-100 last:border-b-0"
                >
                  <div>
                    <span className="font-bold text-slate-900">{p.name}</span>{' '}
                    <span className="text-slate-500 font-mono text-[11px]">({p.mrn})</span>
                    <div className="text-[10px] text-slate-500">
                      {p.roomName || 'Belum ada bed'} {p.bedNumber || ''} • DPJP: {p.dpjpName}
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    p.clinicalSeverity === 'critical' ? 'bg-rose-100 text-rose-800' :
                    p.clinicalSeverity === 'severe' ? 'bg-red-100 text-red-800' :
                    p.clinicalSeverity === 'moderate' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {p.clinicalSeverity}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating Quick Voice Button */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold rounded-md shadow-md transition-transform active:scale-95 animate-pulse"
          title="Buka Dikte Suara Klinis (VERA Voice)"
        >
          <Mic className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Dikte Suara</span>
        </button>

        {/* Gemini Clinical Chatbot Button */}
        <button
          onClick={onOpenChatModal}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-md shadow transition"
          title="Tanya VERA AI Assistant (Gemini 3.8 Flash)"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-200" />
          <span className="hidden md:inline">VERA AI</span>
        </button>
      </div>

      {/* Right: Status, Clock, Notifs, and Role Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Network status */}
        <div className="hidden xl:flex items-center space-x-1 px-2 py-1 bg-blue-950/40 rounded border border-blue-800/50 text-[11px] text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>Sistem Aktif</span>
        </div>

        {/* Clock */}
        <div className="hidden lg:block text-right">
          <div className="text-[11px] font-mono text-blue-200">{currentTime}</div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-md hover:bg-blue-800 text-blue-100 hover:text-white transition"
            title="Pusat Notifikasi Klinis"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 text-slate-800 z-50">
              <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Notifikasi & Peringatan Klinis</span>
                <span className="text-[10px] text-slate-500">{unreadCount} baru</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-2.5 text-xs cursor-pointer hover:bg-slate-50 transition ${
                      !notif.read ? 'bg-blue-50/50 font-medium' : 'text-slate-600'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {notif.type === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-[11px]">{notif.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.message}</div>
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">{notif.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* dr. Budi Santoso Dedicated Single Account Button */}
        <div className="relative">
          <button
            onClick={() => setShowAccountModal(!showAccountModal)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 transition text-left cursor-pointer shadow-xs"
            title="Buka Pengaturan Akun dr. Budi Santoso"
          >
            <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center font-bold text-xs text-white shadow">
              BS
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold leading-tight text-white truncate max-w-[140px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-teal-300 font-medium leading-tight">
                DPJP Rawat Inap (1 Akun)
              </div>
            </div>
          </button>

          {/* dr. Budi Santoso Single Account Menu & Profile Modal */}
          {showAccountModal && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 px-4 text-slate-800 z-50 text-xs animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    BS
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs leading-tight">
                      {currentUser.name}
                    </h4>
                    <span className="text-[10px] text-teal-700 font-semibold font-mono">
                      {currentUser.sipNumber || 'SIP.446/012/DPJP-PKM/2024'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status 1 Akun Aktif */}
              <div className="my-2.5 bg-blue-50/80 border border-blue-200/80 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-700 block font-bold uppercase tracking-wider">
                    Sesi Akun Aktif
                  </span>
                  <span className="font-bold text-blue-950 text-xs">
                    1 Akun Terautentikasi (Dokter DPJP)
                  </span>
                </div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Aktif</span>
                </span>
              </div>

              {/* Email & WhatsApp Terdaftar */}
              <div className="space-y-2 py-2 border-b border-slate-100 text-[11px]">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Email Terdaftar:</span>
                    <span className="font-mono text-slate-900 font-medium">
                      {currentUser.email || 'dr.budi.santoso@puskesmas.go.id'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Nomor WhatsApp Terdaftar:</span>
                    <span className="font-mono text-slate-900 font-medium">
                      {currentUser.phone || '+62 812-9876-5432'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Ganti Password */}
              <div className="py-2.5 border-b border-slate-100">
                <div className="flex items-center space-x-1.5 mb-2 font-bold text-slate-800 text-[11px]">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ganti Password Akun</span>
                </div>

                {passwordSuccess && (
                  <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px] flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Password berhasil diperbarui!</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[10px]">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-1.5 text-[11px]">
                  <input
                    type="password"
                    placeholder="Kata Sandi Lama"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Kata Sandi Baru (min. 8 karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Konfirmasi Kata Sandi Baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentPassword || !newPassword || !confirmPassword) {
                        setPasswordError('Mohon lengkapi semua kolom password.');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
                        return;
                      }
                      setPasswordError('');
                      setPasswordSuccess(true);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setTimeout(() => setPasswordSuccess(false), 3000);
                    }}
                    className="w-full py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded text-xs transition cursor-pointer"
                  >
                    Simpan Password Baru
                  </button>
                </div>
              </div>

              {/* Log Aktivitas Akun Terdaftar */}
              <div className="pt-2">
                <div className="flex items-center space-x-1.5 mb-1.5 font-bold text-slate-800 text-[11px]">
                  <History className="w-3.5 h-3.5 text-teal-600" />
                  <span>Log Aktivitas Akun Terakhir</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {(currentUser.activityLogs || [
                    { id: '1', timestamp: '2026-10-30 08:30', action: 'Autentikasi SSO Puskesmas Berhasil', ipAddress: '192.168.1.104' },
                    { id: '2', timestamp: '2026-10-30 08:45', action: 'Input CPPT SOAP Visite Pasien Agus Setiawan (Melati A01)', ipAddress: '192.168.1.104' },
                    { id: '3', timestamp: '2026-10-30 09:15', action: 'Otorisasi Resep Elektronik & Order Lab', ipAddress: '192.168.1.104' },
                    { id: '4', timestamp: '2026-10-30 10:00', action: 'Dikte Suara VERA: Bedside Visite Ruang Mawar B01', ipAddress: '192.168.1.104' },
                  ]).map((log: { action: string; timestamp: string; ipAddress?: string }, idx: number) => (
                    <div key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-100 text-[10px]">
                      <div className="text-slate-800 font-semibold leading-tight">{log.action}</div>
                      <div className="flex items-center justify-between text-slate-400 mt-0.5 font-mono text-[9px]">
                        <span>{log.timestamp}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
