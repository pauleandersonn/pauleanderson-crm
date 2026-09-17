
import React from 'react';
import { Check, X, Zap, Calendar, Shield, Crown, Clock, AlertCircle, Info, MessageCircle, HeartPulse, ShieldCheck, Scale, TrendingUp } from 'lucide-react';

const SubscriptionPlans: React.FC = () => {
  const whatsappLink = "https://wa.me/+5592992411099?text=Ol%C3%A1%2C%20Seja%20Bem%20Vindo%20ao%20HubCare.%20Somos%20um%20hub%20de%20cuidado%20que%20conecta%20fam%C3%ADlias%20a%20profissionais%20qualificados%2C%20oferecendo%20seguran%C3%A7a%2C%20confian%C3%A7a%20e%20cuidado%20sob%20demanda.";

  return (
    <div className="py-20 md:py-32 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-900 mb-4">Planos Personalizados</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Escolha a modalidade que melhor atende às suas necessidades. Transparência total e cuidado humanizado em cada detalhe.
          </p>
        </div>

        {/* Main Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          
          {/* Bloco 1 — 🟩 ATENDIMENTO AVULSO (URGENCIAL) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
            <div className="mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                < Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Atendimento Avulso</h3>
              <p className="text-slate-500 text-sm">Ideal para situações pontuais e emergenciais.</p>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {[
                { label: "Plantão Curto", time: "4h", price: "160" },
                { label: "Plantão Médio", time: "6h", price: "240" },
                { label: "Plantão Padrão", time: "8h", price: "320" },
                { label: "Plantão Integral", time: "12h", price: "420" },
              ].map((p) => (
                <div key={p.time} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{p.label}</span>
                    <span className="text-xs text-slate-400">{p.time}</span>
                  </div>
                  <span className="text-emerald-600 font-black text-lg">R$ {p.price}</span>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-8 flex items-start gap-3">
              <span className="text-xl">🔔</span>
              <p className="text-xs text-emerald-800 font-bold leading-tight">
                Atendimento em até 2h: acréscimo de +10% no valor do plantão.
              </p>
            </div>

            <a href={whatsappLink} target="_blank" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2">
              <MessageCircle size={20} /> Solicitar atendimento
            </a>
          </div>

          {/* Bloco 2 — 🟦 ATENDIMENTO CONTÍNUO (MENSAL) */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 scale-105 z-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar size={120} />
            </div>
            <div className="mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Atendimento Contínuo</h3>
              <p className="text-blue-100 text-sm">Ideal para internações prolongadas e acompanhamento frequente.</p>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              {[
                { name: "Essencial", hours: "48h/mês", price: "1.680" },
                { name: "Conforto", hours: "96h/mês", price: "2.880" },
                { name: "Completo", hours: "144h/mês", price: "3.840" },
              ].map((plan) => (
                <div key={plan.name} className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{plan.name}</span>
                    <span className="text-xs opacity-70">{plan.hours}</span>
                  </div>
                  <span className="font-black text-xl">R$ {plan.price}</span>
                </div>
              ))}
              
              <div className="pt-4 space-y-3">
                {[
                  "Prioridade na escala",
                  "Possibilidade de cuidador recorrente",
                  "Economia de até 15%"
                ].map(benefit => (
                  <div key={benefit} className="flex items-center gap-2 text-sm font-bold">
                    <Check size={18} className="text-emerald-400" /> {benefit}
                  </div>
                ))}
              </div>
            </div>

            <a href={whatsappLink} target="_blank" className="w-full bg-white text-blue-600 hover:bg-slate-100 font-bold py-4 rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2">
              <MessageCircle size={20} /> Falar com a HUBCARE
            </a>
          </div>

          {/* Bloco 3 — 🟩 PLANO PERSONALIZADO (PREMIUM) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-blue-50 shadow-sm hover:shadow-xl transition-all flex flex-col">
            <div className="mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Crown size={28} />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Plano Personalizado</h3>
              <p className="text-slate-500 text-sm italic">Para necessidades específicas e situações especiais.</p>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {[
                "Turnos alternados",
                "Longas permanências",
                "Hospital + domicílio",
                "Idosos dependentes"
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 font-semibold list-none">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {item}
                </li>
              ))}
            </div>

            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Investimento</p>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 text-lg font-bold">💵</span>
                <span className="text-3xl font-black text-blue-900 leading-none">R$ 4.500</span>
                <span className="text-slate-400 text-sm">/mês</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Valor definido após avaliação detalhada.</p>
            </div>

            <a href={whatsappLink} target="_blank" className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2">
              Solicitar Avaliação
            </a>
          </div>
        </div>

        {/* Secondary Info Grid: Fees & Limits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-20">
          
          {/* Bloco 4 — ➕ TAXAS OPERACIONAIS (TRANSPARÊNCIA) */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Info size={20} />
              </div>
              <h4 className="text-xl font-bold text-blue-900">Taxas Operacionais</h4>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left uppercase tracking-tighter text-[10px]">Descrição</th>
                    <th className="px-4 py-3 text-right uppercase tracking-tighter text-[10px]">Acréscimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: "Troca fora do horário padrão", fee: "+5%" },
                    { label: "Hospital com regras rígidas", fee: "+5%" },
                    { label: "Madrugada (22h–6h)", fee: "+10%" },
                    { label: "Feriados", fee: "+15%" },
                  ].map(row => (
                    <tr key={row.label}>
                      <td className="px-4 py-3 text-slate-700 font-medium">{row.label}</td>
                      <td className="px-4 py-3 text-right font-black text-blue-600">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 italic">
              * Informações de transparência: taxas opcionais aplicadas conforme a complexidade da escala.
            </p>
          </div>

          {/* Bloco 5 — ⚠️ LIMITES DO SERVIÇO (IMPORTANTE) */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <h4 className="text-xl font-bold text-blue-900">Limites do Serviço</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Check size={14} /> O que está incluso
                </p>
                <ul className="space-y-3">
                  {["Presença", "Atenção", "Apoio emocional", "Comunicação com a família"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <X size={14} /> Não está incluso
                </p>
                <ul className="space-y-3">
                  {["Procedimentos médicos", "Administração de medicamentos", "Substituição de enfermagem"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
