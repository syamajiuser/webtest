import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  FileSpreadsheet,
  Users,
  Mic,
  QrCode,
  Pill,
  TestTube2,
  UtensilsCrossed,
  FolderClock,
  BarChart3,
  ShieldCheck,
  Settings,
  HeartHandshake,
  ChevronRight,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';
import { calculateBedOccupancy } from '../../utils/clinicalCalculations';
import { PoltekkesRibbon } from '../common/PoltekkesRibbon';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge: string | null;
  highlight?: boolean;
  roles: string[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { currentUser, beds } = useEMR();
  const occupancy = calculateBedOccupancy(beds);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, badge: null, roles: ['*'] },
    { id: 'beds', label: 'Inpatient Bed Dashboard', icon: BedDouble, badge: `${occupancy.occupiedBeds}/${occupancy.totalBeds}`, roles: ['*'] },
    { id: 'emr', label: 'EMR Ward', icon: FileSpreadsheet, badge: 'Main', roles: ['Doctor', 'Nurse', 'MedicalRecords', 'Admin'] },
    { id: 'patients', label: 'Patient Management', icon: Users, badge: null, roles: ['*'] },
    { id: 'scanner', label: 'Barcode Scanner', icon: QrCode, badge: 'Mobile', roles: ['*'] },
    { id: 'medication', label: 'Medication Management', icon: Pill, badge: 'Closed-Loop', roles: ['Doctor', 'Nurse', 'Pharmacist', 'Admin'] },
    { id: 'laboratory', label: 'Laboratory Management', icon: TestTube2, badge: null, roles: ['Doctor', 'Nurse', 'Laboratory', 'Admin'] },
    { id: 'nutrition', label: 'Nutrition & Dietary', icon: UtensilsCrossed, badge: null, roles: ['Doctor', 'Nurse', 'Admin'] },
    { id: 'records', label: 'Medical Records', icon: FolderClock, badge: null, roles: ['Doctor', 'Nurse', 'MedicalRecords', 'Admin'] },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, badge: 'Riset', roles: ['Doctor', 'MedicalRecords', 'Admin'] },
    { id: 'users', label: 'User Management', icon: ShieldCheck, badge: 'RBAC', roles: ['Admin', 'MedicalRecords'] },
    { id: 'settings', label: 'System Settings', icon: Settings, badge: null, roles: ['Admin'] },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-45 md:hidden"
        />
      )}
      <aside
        className={`w-64 bg-[#172B4D] text-slate-200 flex flex-col shrink-0 border-r border-slate-700/60 shadow-xl select-none transition-transform z-50 md:z-auto ${
          mobileOpen ? 'fixed inset-y-0 left-0 flex' : 'hidden md:flex'
        }`}
      >
        {/* Sidebar Top: Puskesmas identity */}
        <div className="p-3.5 border-b border-slate-700/80 bg-slate-900/40">
          <div className="text-[10px] font-bold tracking-widest uppercase text-teal-400">
            PUSKESMAS RAWAT INAP
          </div>
          <div className="text-sm font-bold text-white tracking-wide truncate">
            Puskesmas Sukamaju Sejahtera
          </div>
          <div className="flex items-center space-x-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-[11px] text-slate-300 font-medium">VERA v1.0</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5">
            Modul Utama VERA
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAllowed = item.roles.includes('*') || item.roles.includes(currentUser.role);

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md font-semibold'
                  : item.highlight
                  ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/40'
                  : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
              } ${!isAllowed ? 'opacity-50' : ''}`}
              title={!isAllowed ? `Akses dibatasi untuk role ${currentUser.role}` : item.label}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white' : item.highlight ? 'text-rose-400' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-rose-500/30 text-rose-300'
                        : 'bg-slate-800 text-teal-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bed Occupancy Quick Summary Widget in Sidebar */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-700/80 m-2 rounded-lg">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-semibold text-slate-300">Kapasitas Tempat Tidur</span>
          <span className="font-bold text-teal-400 font-mono">{occupancy.occupancyRate}% BOR</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
          <div
            className="bg-[#111827] h-full transition-all"
            style={{ width: `${(occupancy.occupiedBeds / occupancy.totalBeds) * 100}%` }}
            title={`Terisi: ${occupancy.occupiedBeds}`}
          />
          <div
            className="bg-[#2563EB] h-full transition-all"
            style={{ width: `${(occupancy.availableBeds / occupancy.totalBeds) * 100}%` }}
            title={`Kosong: ${occupancy.availableBeds}`}
          />
          <div
            className="bg-slate-500 h-full transition-all"
            style={{ width: `${(occupancy.maintenanceBeds / occupancy.totalBeds) * 100}%` }}
            title={`Pemeliharaan: ${occupancy.maintenanceBeds}`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-sm bg-[#111827] inline-block border border-slate-600" />
            <span>Terisi: {occupancy.occupiedBeds}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-sm bg-[#2563EB] inline-block" />
            <span>Kosong: {occupancy.availableBeds}</span>
          </span>
        </div>
      </div>

      {/* Patient-Centered Care Banner */}
      <div className="p-2.5 border-t border-slate-700/70 bg-[#123B63]/60 flex items-center space-x-2">
        <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
        <div className="text-[10px] leading-tight text-blue-200">
          <span className="font-bold text-white">Komunikasi Terapeutik:</span> Fokus Pasien, biarkan VERA mencatat.
        </div>
      </div>

      {/* Hiasan Poltekkes Kemenkes di bagian paling bawah main menu */}
      <div className="w-full shrink-0">
        <PoltekkesRibbon height={26} />
      </div>
    </aside>
    </>
  );
};
