import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useEMR } from '../../context/EMRContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiClinicalChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiClinicalChat: React.FC<GeminiClinicalChatProps> = ({ isOpen, onClose }) => {
  const { currentUser, selectedPatient } = useEMR();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Halo ${currentUser.name}! Saya **VERA AI Clinical Assistant** (Didukung Google Gemini 3.8 Flash).
Saya siap membantu Anda selama visite bangsal rawat inap Puskesmas:
- Mengecek interaksi obat & dosis rekomendasi PPK Kemenkes
- Panduan komunikasi terapeutik 3 fase (Orientasi, Kerja, Terminasi)
- Perhitungan kebutuhan cairan dehidrasi / infus
- Pengorganisasian catatan klinis SOAP
Ada yang bisa saya bantu terkait pasien aktif (${selectedPatient?.name || 'Umum'})?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userRole: currentUser.role,
          currentPatient: selectedPatient
            ? {
                name: selectedPatient.name,
                mrn: selectedPatient.mrn,
                diagnosis: selectedPatient.primaryDiagnosis,
                allergies: selectedPatient.allergies,
                bed: `${selectedPatient.roomName} ${selectedPatient.bedNumber}`,
              }
            : null,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Maaf, tidak ada respon yang diterima.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Terjadi kendala saat menghubungi server VERA AI. Silakan coba kembali.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Tips komunikasi terapeutik saat visite pasien DBD',
    'Cek dosis Ceftriaxone & Paracetamol',
    'Alur Closed-Loop pengambilan spesimen lab',
  ];

  return (
    <div className="fixed bottom-4 right-4 w-[95vw] sm:w-[440px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-300 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="bg-[#123B63] text-white p-3.5 flex items-center justify-between border-b border-blue-900">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm">VERA AI Clinical Assistant</span>
              <span className="text-[9px] bg-teal-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded">
                Gemini 3.8
              </span>
            </div>
            <div className="text-[10px] text-blue-200">
              Konteks: {selectedPatient?.name || 'Pasien Umum'} ({currentUser.role})
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              setMessages([messages[0]]);
            }}
            title="Bersihkan Percakapan"
            className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2 ${
              m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] shadow ${
                m.role === 'user' ? 'bg-[#2563EB]' : 'bg-teal-600'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] p-3 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-[#2563EB] text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              {m.content}
              <div
                className={`text-[9px] mt-1 text-right font-mono ${
                  m.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs py-1">
            <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
            <span>VERA AI sedang memikirkan rekomendasi klinis...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex overflow-x-auto gap-1.5 scrollbar-none text-[11px]">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => setInput(qp)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 border border-slate-300 whitespace-nowrap"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Tanyakan dosis, interaksi obat, komunikasi terapeutik..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow disabled:opacity-40 transition active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
