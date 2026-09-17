
import React, { useState, useEffect } from 'react';
import { User, Patient, DailyUpdate, Task } from '../types';
import { Sparkles, Calendar, Hospital, Activity, Clock } from 'lucide-react';
/* Always use double quotes for @google/genai imports as per guidelines */
import { GoogleGenAI } from "@google/genai";

interface DashboardViewProps {
  user: User;
  patient: Patient;
  updates: DailyUpdate[];
  tasks: Task[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, patient, updates, tasks }) => {
  const [aiSummary, setAiSummary] = useState<string>('Gerando resumo inteligente...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSummary = async () => {
      try {
        /* Correct initialization of GoogleGenAI using a named parameter for the API key */
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const lastUpdatesStr = updates.slice(0, 3).map(u => u.content).join('; ');
        
        /* Using ai.models.generateContent to fetch AI summary with model and configuration */
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Aja como um assistente de saúde empático. Resuma estas últimas atualizações de um paciente hospitalizado em uma frase encorajadora e curta para a família: ${lastUpdatesStr}`,
          config: {
            systemInstruction: "Seja breve, acolhedor e foque no bem-estar emocional da família.",
          }
        });
        
        /* Accessing the text property directly (not a method) from the response */
        setAiSummary(response.text || "Continue cuidando com carinho, estamos aqui para apoiar.");
      } catch (err) {
        setAiSummary("O cuidado e a presença da família fazem toda a diferença na recuperação.");
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [updates]);

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Patient Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{patient.name}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Hospital className="w-3 h-3" /> {patient.hospital}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full">
            {patient.status}
          </span>
        </div>
      </section>

      {/* AI Smart Summary */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-100 font-medium text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Resumo Hub IA
          </div>
          <p className="text-lg font-medium leading-relaxed italic">
            "{aiSummary}"
          </p>
        </div>
      </section>

      {/* Stats / Quick Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col gap-1">
          <span className="text-blue-600 text-xs font-semibold uppercase">Tarefas Hoje</span>
          <span className="text-2xl font-bold text-blue-900">{pendingTasks.length}</span>
          <span className="text-[10px] text-blue-400">Pendente(s)</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex flex-col gap-1">
          <span className="text-amber-600 text-xs font-semibold uppercase">Próxima Visita</span>
          <span className="text-2xl font-bold text-amber-900">14:00</span>
          <span className="text-[10px] text-amber-400">Confirmado</span>
        </div>
      </div>

      {/* Recent Feed Preview */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Últimas Atualizações</h3>
        <div className="space-y-3">
          {updates.slice(0, 2).map(update => (
            <div key={update.id} className="bg-white border border-slate-100 p-3 rounded-xl flex gap-3">
              <div className="w-2 bg-emerald-400 rounded-full" />
              <div className="flex-1">
                <p className="text-sm text-slate-800 line-clamp-2">{update.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{update.user_name}</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-2 h-2" /> {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
