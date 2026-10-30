import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini SDK if API key is available
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VERA Voice-Enabled EMR Server',
    geminiConfigured: !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: AI-powered Voice-to-Structured-EMR Conversion
app.post('/api/ai/structure-voice', async (req, res) => {
  const { transcript, patientContext, recordType = 'SOAP' } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'Transcription text is required.' });
  }

  // Fallback heuristic parser if Gemini API key is not provided
  const fallbackStructure = parseTranscriptHeuristically(transcript, recordType);

  if (!aiClient) {
    return res.json({
      mode: 'simulated_clinical_adapter',
      note: 'Parsed using VERA Built-in Clinical NLP rules engine (Demo Adapter)',
      data: fallbackStructure,
    });
  }

  try {
    const prompt = `Anda adalah asisten medis VERA untuk Puskesmas Rawat Inap di Indonesia.
Tugas Anda adalah mengekstraksi dan menyusun dikte suara klinis berikut ke dalam format terstruktur yang aman dan akurat.
JANGAN membuat/mengarang data yang tidak disebutkan. Jika informasi tidak ada dalam transkrip, biarkan kosong ("").
Pertahankan negasi (misal: "tidak ada demam", "alergi penisilin disangkal"), nilai angka dan satuan.

Konteks Pasien: ${JSON.stringify(patientContext || {})}
Tipe Rekam Medis: ${recordType}

Transkrip Suara Klinis:
"""${transcript}"""

Kembalikan output HANYA dalam JSON valid dengan skema berikut:
{
  "subjective": "Keluhan utama, riwayat penyakit sekarang, gejala yang dirasakan pasien",
  "objective": "Hasil pemeriksaan fisik, tanda vital jika disebutkan",
  "assessment": "Diagnosis kerja klinis atau simpulan masalah keperawatan",
  "plan": "Rencana terapi, obat, instruksi laboratorium, atau tindakan perawat",
  "vitalSigns": {
    "bloodPressure": "contoh 120/80 mmHg atau kosong",
    "heartRate": "contoh 84 x/mnt atau kosong",
    "respiratoryRate": "contoh 20 x/mnt atau kosong",
    "temperature": "contoh 36.8 C atau kosong",
    "oxygenSaturation": "contoh 98% atau kosong",
    "painScore": "contoh 2/10 atau kosong"
  },
  "extractedMedications": [
    { "name": "nama obat", "dosage": "dosis", "route": "rute", "frequency": "frekuensi" }
  ],
  "extractedLabOrders": ["nama tes lab jika ada"],
  "dietaryInstructions": "instruksi diet jika ada",
  "nursingInterventions": ["tindakan perawat jika ada"],
  "clinicalWarnings": ["peringatan penting seperti alergi atau risiko jatuh jika ada"]
}`;

    const geminiPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout - switching to fallback adapter')), 4000)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);
    const text = response.text || '';
    const parsed = JSON.parse(text);

    return res.json({
      mode: 'live_gemini',
      model: 'gemini-3.8-flash',
      data: parsed,
    });
  } catch (err: any) {
    console.error('Gemini voice structuring error:', err);
    // Return fallback with note
    return res.json({
      mode: 'simulated_clinical_adapter',
      note: 'Fallback to VERA Clinical Rule Engine due to API issue: ' + (err.message || 'Error'),
      data: fallbackStructure,
    });
  }
});

// Endpoint: Multi-turn Gemini Clinical Chatbot
app.post('/api/ai/chat', async (req, res) => {
  const { messages, userRole = 'Doctor', currentPatient } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const lastUserMessage = messages[messages.length - 1]?.content || '';

  if (!aiClient) {
    // High quality medical simulation response
    const demoReply = generateDemoChatResponse(lastUserMessage, userRole, currentPatient);
    return res.json({
      mode: 'simulated_clinical_adapter',
      reply: demoReply,
    });
  }

  try {
    const systemInstruction = `Anda adalah VERA AI Clinical Assistant, asisten kecerdasan klinis terintegrasi pada Rekam Medis Elektronik Puskesmas Rawat Inap di Indonesia.
Identitas Pengguna saat ini: Role [${userRole}].
Pasien aktif saat ini: ${JSON.stringify(currentPatient || 'Tidak ada pasien terpilih')}.
Fokus Anda:
1. Membantu dokter dan perawat dalam penegakan alur klinis Puskesmas (PPK / Panduan Praktik Klinis Puskesmas).
2. Mengecek interaksi obat, dosis geriatri/pediatri, dan kontraindikasi alergi.
3. Mendukung komunikasi terapeutik (fase orientasi, kerja, terminasi) agar nakes fokus menatap pasien, bukan layar.
4. Menyediakan rekomendasi standar keperawatan Indonesia (SDKI, SLKI, SIKI).
5. Bahasa: Bahasa Indonesia baku dan profesional medis, ringkas, mudah dipahami, berorientasi keselamatan pasien (patient safety).
PENTING: Jangan mengklaim telah mengesahkan tindakan medis secara otonom. Setiap tindakan harus diverifikasi oleh DPJP/nakes yang bertugas.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chatPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Chat API timeout - switching to fallback adapter')), 4000)
    );

    const response = await Promise.race([chatPromise, timeoutPromise]);

    return res.json({
      mode: 'live_gemini',
      model: 'gemini-3.8-flash',
      reply: response.text || 'Tidak ada respon yang dihasilkan.',
    });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    const demoReply = generateDemoChatResponse(lastUserMessage, userRole, currentPatient);
    return res.json({
      mode: 'simulated_clinical_adapter',
      reply: `${demoReply}\n\n*(Catatan: Mode asistensi lokal aktif)*`,
    });
  }
});

// Heuristic fallback parser for voice dictation
function parseTranscriptHeuristically(transcript: string, recordType: string) {
  const lower = transcript.toLowerCase();
  
  // Extract BP
  const bpMatch = transcript.match(/(\d{2,3}\s*\/\s*\d{2,3})\s*(mmhg)?/i);
  // Extract HR / nadi
  const hrMatch = transcript.match(/(?:nadi|hr|detak)\s*:?\s*(\d{2,3})/i) || transcript.match(/(\d{2,3})\s*(?:x\/menit|bpm|kali per menit)/i);
  // Extract Temp / suhu
  const tempMatch = transcript.match(/(?:suhu|t|temp)\s*:?\s*(\d{2}(?:[.,]\d+)?)\s*(?:c|derajat)?/i);
  // Extract RR / nafas
  const rrMatch = transcript.match(/(?:rr|respirasi|nafas|pernafasan)\s*:?\s*(\d{1,2})\s*(?:x\/menit|kali per menit)?/i);
  // Extract SpO2
  const spo2Match = transcript.match(/(?:spo2|saturasi)\s*:?\s*(\d{2,3})\s*%?/i);

  let subjective = '';
  let objective = '';
  let assessment = '';
  let plan = '';

  if (lower.includes('subjektif') || lower.includes('keluhan')) {
    subjective = transcript;
  } else {
    subjective = `Pasien mengeluhkan: "${transcript.slice(0, 150)}..."`;
  }

  objective = `Pemeriksaan fisik dalam batas toleransi. Kesadaran compos mentis.`;
  if (bpMatch) objective += ` TD ${bpMatch[1]} mmHg.`;
  if (hrMatch) objective += ` Nadi ${hrMatch[1]} x/mnt.`;
  if (tempMatch) objective += ` Suhu ${tempMatch[1]} °C.`;
  if (rrMatch) objective += ` RR ${rrMatch[1]} x/mnt.`;
  if (spo2Match) objective += ` SpO2 ${spo2Match[1]}%.`;

  assessment = lower.includes('febris') ? 'Febris H-3 e.c. Susp. DHF / Infeksi Bakterial' :
               lower.includes('batuk') || lower.includes('sesak') ? 'ISPA / Bronkopneumonia' :
               lower.includes('diare') ? 'Gastroenteritis Akut Dehidrasi Ringan-Sedang' :
               lower.includes('pusing') || lower.includes('hipertensi') ? 'Hipertensi Grade II' :
               'Observasi Klinis Rawat Inap Puskesmas';

  plan = 'Monitoring tanda vital q4h, hidrasi adekuat, terapi simptomatis sesuai instruksi DPJP.';

  return {
    subjective,
    objective,
    assessment,
    plan,
    vitalSigns: {
      bloodPressure: bpMatch ? `${bpMatch[1]} mmHg` : '',
      heartRate: hrMatch ? `${hrMatch[1]} x/mnt` : '',
      respiratoryRate: rrMatch ? `${rrMatch[1]} x/mnt` : '',
      temperature: tempMatch ? `${tempMatch[1]} °C` : '',
      oxygenSaturation: spo2Match ? `${spo2Match[1]}%` : '',
      painScore: lower.includes('nyeri') ? '3/10' : '0/10',
    },
    extractedMedications: [
      { name: 'Paracetamol 500mg', dosage: '1 tab', route: 'Oral', frequency: '3x sehari prn' },
      { name: 'Ringer Lactate', dosage: '500 ml', route: 'IV Infus', frequency: '20 tpm' },
    ],
    extractedLabOrders: lower.includes('darah') || lower.includes('lab') ? ['Darah Lengkap (DL)', 'Widal / Dengue NS1'] : [],
    dietaryInstructions: 'Diet Makanan Lunak Tinggi Kalori Tinggi Protein (TKTP)',
    nursingInterventions: ['Observasi TTV tiap 4 jam', 'Beri kompres hangat bila demam', 'Edukasi tirah baring'],
    clinicalWarnings: lower.includes('alergi') ? ['Periksa riwayat alergi obat secara detail'] : [],
  };
}

function generateDemoChatResponse(query: string, role: string, patient: any): string {
  const q = query.toLowerCase();
  const ptName = patient?.name || 'Pasien Rawat Inap';

  if (q.includes('dosis') || q.includes('obat') || q.includes('paracetamol') || q.includes('antibiotik')) {
    return `Berdasarkan Formularium Puskesmas dan PPK Kemenkes:
1. **Paracetamol Oral**: Dewasa 500-1000 mg tiap 4-6 jam (maks. 4000 mg/hari). Pediatri 10-15 mg/kgBB/kali.
2. **Ceftriaxone IV**: 1-2 gram IV sekali sehari (atau dibagi 2 dosis). Lakukan skin test sebelum pemberian pertama jika ada riwayat atopik/alergi.
3. **Peringatan Keamanan**: Pastikan cek status alergi di gelang barcode sebelum perawat memberikan obat via e-ticket.`;
  }

  if (q.includes('distraksi') || q.includes('komunikasi') || q.includes('terapeutik')) {
    return `Panduan Komunikasi Terapeutik Berbasis VERA:
- **Fase Orientasi**: Sapalah pasien dengan menyebut nama (${ptName}), lakukan kontak mata hangat, perkenalkan diri, dan jelaskan tujuan visite.
- **Fase Kerja**: Aktifkan tombol mikrofon VERA, letakkan ponsel/tablet di dekat Anda tanpa menatap terus ke layar. Ajak pasien bercerita sambil sistem merekam dan mentranskripsi secara aman.
- **Fase Terminasi**: Berikan kesempatan bertanya, validasi pemahaman pasien, dan bacakan ringkasan tindakan sebelum pamit.`;
  }

  if (q.includes('lab') || q.includes('spesimen') || q.includes('darah')) {
    return `Alur Closed-Loop Laboratorium VERA:
1. DPJP membuat Permintaan Lab Elektronik.
2. Petugas Lab mencetak label barcode spesimen unik.
3. Di bedside, perawat WAJIB scan Gelang Pasien (${ptName}) lalu scan Label Tabung Spesimen untuk verifikasi identitas (mencegah salah tabung).
4. Hasil lab akan otomatis terintegrasi ke tab Laboratorium EMR pasien setelah divalidasi validator laboratorium.`;
  }

  return `Halo Rekan ${role}. Saya VERA Clinical AI Assistant.
Terkait pasien aktif (${ptName}), saya siap membantu Anda untuk:
- Konfirmasi pedoman klinis Puskesmas (PPK Kemenkes)
- Perhitungan kebutuhan cairan dehidrasi / infus
- Pengecekan kontraindikasi obat dan peringatan alergi
- Tips komunikasi terapeutik 3 fase untuk mengurangi screen-driven distraction.
Silakan ajukan pertanyaan klinis Anda!`;
}

// Vite middleware in dev or static server in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`VERA Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
