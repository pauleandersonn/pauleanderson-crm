
import React, { useState } from 'react';
import { Patient, DailyUpdate } from '../types';
import { MessageCircle, Send, Clock, User, Plus } from 'lucide-react';

interface TimelineViewProps {
  patient: Patient;
  updates: DailyUpdate[];
  onAddUpdate: (content: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ patient, updates, onAddUpdate }) => {
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.trim()) {
      onAddUpdate(newContent);
      setNewContent('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="p-4 bg-white border-b sticky top-0 z-20">
        <h2 className="text-lg font-bold text-slate-800">Linha do Tempo</h2>
        <p className="text-xs text-slate-500 tracking-tight">Registro de cuidado para {patient.name}</p>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {updates.map((update, idx) => (
          <div key={update.id} className="relative pl-8 group animate-in slide-in-from-left-2 fade-in duration-300">
            {/* Thread line */}
            {idx !== updates.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-slate-200 group-last:hidden" />
            )}
            
            {/* Dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center z-10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <User className="w-3 h-3" /> {update.user_name}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {new Date(update.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">
                {update.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Input */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
            <textarea
              autoFocus
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Descreva como o paciente está agora..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-md hover:bg-emerald-700 active:scale-95 transition-all uppercase tracking-widest"
              >
                Postar <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Nova Atualização
          </button>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
