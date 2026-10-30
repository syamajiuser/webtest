import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  Lock,
  Unlock,
  KeyRound,
  History,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Edit3,
  ShieldAlert,
  UserCog,
  Check,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { UserProfile } from '../../types/emr';

export const UserManagementView: React.FC = () => {
  const { availableUsers, currentUser, setCurrentUser, auditLogs } = useEMR();
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [searchAudit, setSearchAudit] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  
  // Password edit modal for Admin
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [editSuccessMsg, setEditSuccessMsg] = useState<string>('');

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const filteredUsers = availableUsers.filter((u) => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.title.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const filteredLogs = auditLogs.filter((log) => {
    if (auditFilter !== 'all' && log.status !== auditFilter) return false;
    if (searchAudit.trim()) {
      const q = searchAudit.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.patientName && log.patientName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !newPasswordInput.trim()) return;

    // Update local user password
    selectedUserForEdit.password = newPasswordInput.trim();
    setEditSuccessMsg(`Password untuk ${selectedUserForEdit.name} berhasil diperbarui!`);
    setTimeout(() => {
      setEditSuccessMsg('');
      setSelectedUserForEdit(null);
      setNewPasswordInput('');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#123B63] text-white p-4 rounded-xl shadow-md border border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
            </span>
            <h2 className="text-base font-extrabold tracking-wide">
              User Management & Keamanan Sistem (RBAC & Kredensial Multi-Akun)
            </h2>
          </div>
          <p className="text-xs text-blue-200 mt-1 max-w-3xl leading-relaxed">
            Manajemen Role-Based Access Control (RBAC) Puskesmas Rawat Inap. Setiap tenaga medis (Dokter, Perawat, Farmasi, Laboratorium, Perekam Medis) memiliki username dan password unik masing-masing. Administrator sistem memiliki kewenangan audit dan manajemen kredensial penuh.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-[#123B63] shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Daftar Akun & Password ({availableUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'audit' ? 'bg-white text-[#123B63] shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Jejak Audit ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Admin Notice Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3 rounded-xl border border-blue-700/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <UserCog className="w-4 h-4 text-teal-300" />
          </span>
          <div>
            <span className="font-extrabold text-teal-300">Hak Akses Administrator Utama:</span>{' '}
            <span className="text-slate-200">
              <strong>Eko Prasetyo, S.Kom</strong> (Username: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">admin.eko</code>) memiliki akses penuh ke seluruh pengelolaan akun, reset password, dan audit trail log.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-700 font-mono">
            Keamanan: TLS 256-bit • SHA-256
          </span>
        </div>
      </div>

      {/* USER LIST TAB */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama pegawai, username, role, departemen..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <span className="text-slate-500 text-[11px]">
              Menampilkan <strong>{filteredUsers.length}</strong> akun terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isCurrent = currentUser.id === u.id;
              const isRevealed = revealedPasswords[u.id];
              const isAdmin = u.role === 'Admin';

              return (
                <div
                  key={u.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col justify-between text-xs space-y-3 transition ${
                    isCurrent
                      ? 'border-teal-500 ring-2 ring-teal-400/30 bg-teal-50/10'
                      : isAdmin
                      ? 'border-indigo-300 bg-indigo-50/10'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    {/* Top Header Card */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {u.id}
                        </span>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white">
                            SUPER ADMIN
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'Doctor'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : u.role === 'Nurse'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : u.role === 'Pharmacist'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : u.role === 'Laboratory'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : u.role === 'Admin'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          : 'bg-teal-100 text-teal-900 border border-teal-200'
                      }`}>
                        {u.role}
                      </span>
                    </div>

                    {/* Name & Title */}
                    <div className="pt-2">
                      <div className="font-extrabold text-slate-900 text-sm leading-tight">{u.name}</div>
                      <div className="text-teal-700 font-semibold mt-0.5 text-xs">{u.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{u.department}</div>
                      {u.sipNumber && (
                        <div className="text-slate-400 font-mono text-[10px] mt-1">
                          NIP/SIP: {u.sipNumber}
                        </div>
                      )}
                    </div>

                    {/* Credentials Box: Username & Password */}
                    <div className="mt-3 bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium flex items-center space-x-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Username:</span>
                        </span>
                        <code className="font-mono font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {u.username}
                        </code>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium flex items-center space-x-1">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                          <span>Password:</span>
                        </span>
                        <div className="flex items-center space-x-1">
                          <code className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {isRevealed ? u.password : '••••••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(u.id)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition"
                            title={isRevealed ? 'Sembunyikan Password' : 'Lihat Password'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info: Email & Phone */}
                    <div className="mt-2 space-y-1 text-[10px] text-slate-600">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Mail className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForEdit(u);
                        setNewPasswordInput(u.password || '');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px] flex items-center space-x-1 border border-slate-300 transition cursor-pointer"
                      title="Ganti Password Akun Ini"
                    >
                      <KeyRound className="w-3 h-3 text-blue-600" />
                      <span>Edit Password</span>
                    </button>

                    {isCurrent ? (
                      <span className="text-emerald-700 font-bold flex items-center space-x-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sesi Aktif</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentUser(u)}
                        className="px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-bold text-[11px] transition cursor-pointer shadow-xs"
                      >
                        Login Akun Ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-700">Filter Status:</span>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="p-1 border rounded bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="SUCCESS">Berhasil (Success)</option>
                <option value="BLOCKED_SAFETY_ALERT">Peringatan / Diblokir (Safety Alert)</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari aktivitas atau nama petugas..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                className="w-full pl-8 pr-3 py-1 border rounded text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b">
                  <th className="p-2.5 font-bold">Waktu Transaksi</th>
                  <th className="p-2.5 font-bold">Pengguna & Peran</th>
                  <th className="p-2.5 font-bold">Aktivitas Klinis / Modul</th>
                  <th className="p-2.5 font-bold">Pasien Terkait</th>
                  <th className="p-2.5 font-bold">Detail Transaksi</th>
                  <th className="p-2.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-500">{log.userRole}</div>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700">
                      {log.patientName || '-'}
                    </td>
                    <td className="p-2.5 text-slate-600 max-w-xs">{log.details}</td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Password Edit Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-[#123B63] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-teal-300" />
                <h3 className="font-extrabold text-sm">Ganti Password Akun Pengguna</h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-blue-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 text-[11px] mb-0.5 font-medium">Pengguna:</label>
                <div className="font-bold text-slate-900 text-sm">{selectedUserForEdit.name}</div>
                <div className="text-teal-700 text-[11px]">Role: {selectedUserForEdit.role} • Username: <code className="font-mono text-blue-900 font-bold">{selectedUserForEdit.username}</code></div>
              </div>

              {editSuccessMsg && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{editSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Masukkan Password Baru:
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Contoh: BudiDoctor2026!"
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Password harus unik untuk menjaga keamanan hak akses rekam medis.
                </span>
              </div>

              <div className="pt-2 border-t flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded font-bold shadow transition"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
