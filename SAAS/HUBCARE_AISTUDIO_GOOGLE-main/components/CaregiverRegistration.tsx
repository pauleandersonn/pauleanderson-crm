
import React, { useState } from 'react';
import { Send, User, Briefcase, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CaregiverRegistration: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    specialty: '',
    whatsapp: '',
    experience_summary: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from('caregivers')
        .insert([
          { 
            full_name: formData.full_name,
            specialty: formData.specialty,
            whatsapp: formData.whatsapp,
            experience_summary: formData.experience_summary
          }
        ]);

      if (supabaseError) throw supabaseError;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Erro ao salvar no Supabase:', err);
      setError('Ocorreu um erro ao enviar sua candidatura. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-stretch">
          
          <div className="flex-1">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 h-full">
              <div className="mb-10">
                <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3 block">Recrutamento</span>
                <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Seja um Parceiro Cuidador HUBCARE</h2>
                <p className="text-slate-500">
                  Faça parte da rede de parceiros que está transformando o atendimento humanizado no Brasil. Preencha seus dados e nossa equipe entrará em contato.
                </p>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600">
                      <AlertCircle size={20} />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          required
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          type="text" 
                          placeholder="Ex: João Silva" 
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Especialidade Principal</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select 
                          required
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                        >
                          <option value="">Selecione...</option>
                          <option value="acompanhante">Acompanhante Hospitalar</option>
                          <option value="cuidador">Cuidador de Idosos</option>
                          <option value="apoio">Apoio Domiciliar</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">WhatsApp de Contato</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        required
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        type="tel" 
                        placeholder="(00) 00000-0000" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Resumo da Experiência</label>
                    <textarea 
                      required
                      name="experience_summary"
                      value={formData.experience_summary}
                      onChange={handleChange}
                      rows={4} 
                      placeholder="Conte-nos brevemente sobre sua trajetória como parceiro cuidador..." 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                    ></textarea>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={20} />
                        Enviar Candidatura
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Candidatura Enviada!</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-8">
                    Seus dados foram salvos. Nossa equipe entrará em contato em breve.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Enviar outra candidatura
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 hidden lg:block">
            <div className="h-full flex flex-col gap-6">
              <div className="flex-1 rounded-[2.5rem] overflow-hidden shadow-xl relative bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                  alt="Parceiros HUBCARE" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="grid grid-cols-2 gap-6 h-1/3">
                 <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white flex flex-col justify-center">
                   <p className="text-4xl font-black mb-1">500+</p>
                   <p className="text-sm font-bold opacity-80 uppercase tracking-tighter">Parceiros Ativos</p>
                 </div>
                 <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-center">
                   <p className="text-4xl font-black mb-1">24h</p>
                   <p className="text-sm font-bold opacity-80 uppercase tracking-tighter">Suporte ao Parceiro</p>
                 </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CaregiverRegistration;
