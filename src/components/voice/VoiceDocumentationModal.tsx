import React from 'react';
import { X } from 'lucide-react';
import { VoiceDocumentationView } from './VoiceDocumentationView';

interface VoiceDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatientId?: string;
}

export const VoiceDocumentationModal: React.FC<VoiceDocumentationModalProps> = ({
  isOpen,
  onClose,
  defaultPatientId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#123B63] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <h3 className="font-extrabold text-sm sm:text-base tracking-wide">
              VERA Hands-Free Voice Documentation (Quick Bedside Modal)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center justify-center transition shadow-md border border-red-500 font-bold cursor-pointer"
            title="Keluar / Tutup Dikte Suara Visite"
            aria-label="Tutup Dikte Suara"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <VoiceDocumentationView
            defaultPatientId={defaultPatientId}
            onSaved={() => {
              setTimeout(() => {
                onClose();
              }, 1200);
            }}
          />
        </div>
      </div>
    </div>
  );
};
