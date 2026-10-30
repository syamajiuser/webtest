import React, { useState } from 'react';
import { EMRProvider, useEMR } from './context/EMRContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { InpatientBedDashboard } from './components/beds/InpatientBedDashboard';
import { EMRWard } from './components/emr/EMRWard';
import { PatientManagementView } from './components/patients/PatientManagementView';
import { VoiceDocumentationView } from './components/voice/VoiceDocumentationView';
import { VoiceDocumentationModal } from './components/voice/VoiceDocumentationModal';
import { BarcodeScannerView } from './components/scanner/BarcodeScannerView';
import { MedicationManagementView } from './components/medication/MedicationManagementView';
import { LaboratoryManagementView } from './components/laboratory/LaboratoryManagementView';
import { NutritionManagementView } from './components/nutrition/NutritionManagementView';
import { MedicalRecordsView } from './components/records/MedicalRecordsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { UserManagementView } from './components/users/UserManagementView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { GeminiClinicalChat } from './components/chat/GeminiClinicalChat';
import { PatientPortalModal } from './components/patient/PatientPortalModal';


const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('beds');
  const [emrInitialTab, setEmrInitialTab] = useState<string>('summary');
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showPatientPortal, setShowPatientPortal] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const { setSelectedPatient, patients } = useEMR();

  const handleNavigateToEMR = (patientId?: string, targetTab: string = 'summary') => {
    if (patientId) {
      const found = patients.find((p) => p.id === patientId);
      if (found) setSelectedPatient(found);
    }
    setEmrInitialTab(targetTab);
    setActiveTab('emr');
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] text-[#172B4D] flex flex-col font-sans antialiased select-none">


      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onOpenVoiceModal={() => setShowVoiceModal(true)}
        onOpenChatModal={() => setShowChatModal(true)}
        onOpenPatientPortal={() => setShowPatientPortal(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Body: Sidebar + Main Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F3F6FA]">
          {activeTab === 'overview' && (
            <OverviewDashboard
              onNavigate={(tab, ptId) => {
                if (tab === 'emr') handleNavigateToEMR(ptId);
                else setActiveTab(tab);
              }}
              onOpenVoiceModal={() => setShowVoiceModal(true)}
            />
          )}

          {activeTab === 'beds' && (
            <InpatientBedDashboard onNavigateToEMR={handleNavigateToEMR} />
          )}

          {activeTab === 'emr' && (
            <EMRWard
              initialTab={emrInitialTab}
              onOpenVoiceModal={() => setShowVoiceModal(true)}
            />
          )}

          {activeTab === 'patients' && (
            <PatientManagementView onNavigateToEMR={handleNavigateToEMR} />
          )}

          {activeTab === 'voice' && <VoiceDocumentationView />}

          {activeTab === 'scanner' && <BarcodeScannerView />}

          {activeTab === 'medication' && <MedicationManagementView />}

          {activeTab === 'laboratory' && <LaboratoryManagementView />}

          {activeTab === 'nutrition' && <NutritionManagementView />}

          {activeTab === 'records' && <MedicalRecordsView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'users' && <UserManagementView />}

          {activeTab === 'settings' && <SystemSettingsView />}
        </main>
      </div>



      {/* Quick Bedside Voice Modal */}
      <VoiceDocumentationModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />

      {/* Gemini AI Multi-Turn Chat Drawer */}
      <GeminiClinicalChat
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />

      {/* Patient & Family Portal Modal */}
      <PatientPortalModal
        isOpen={showPatientPortal}
        onClose={() => setShowPatientPortal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <EMRProvider>
      <AppContent />
    </EMRProvider>
  );
}

export default App;
