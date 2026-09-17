
import React from 'react';
import { Heart, Gift, Users, HandHeart } from 'lucide-react';

const DonationSection: React.FC = () => {
  return (
    <div className="py-20 md:py-32 relative overflow-hidden bg-blue-900">
      <div className="absolute inset-0 z-0 opacity-20 bg-blue-800">
        <img 
          src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=60&w=1200" 
          alt="Comunidade unida" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold mb-6">
              <HandHeart size={18} className="text-emerald-400" />
              HUBCARE Social
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Sua doação transforma vidas.
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Através do nosso fundo social, subsidiamos o atendimento para famílias de baixa renda que não podem arcar com os custos de um parceiro cuidador.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                <Heart className="text-emerald-400 mb-3" size={24} />
                <h4 className="text-white font-bold mb-1">Cuidado Solidário</h4>
                <p className="text-blue-200 text-sm">Leve esperança a quem enfrenta internações solitárias.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                <Users className="text-blue-400 mb-3" size={24} />
                <h4 className="text-white font-bold mb-1">Apoio a Idosos</h4>
                <p className="text-blue-200 text-sm">Garante companhia para idosos em situação de vulnerabilidade.</p>
              </div>
            </div>

            <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold px-10 py-5 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 w-full sm:w-auto">
              <Gift size={24} />
              Quero ser um Doador
            </button>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">Transparência HUBCARE</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Famílias auxiliadas este mês</span>
                  <span className="text-blue-600 font-black text-xl">142</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Horas de cuidado doadas</span>
                  <span className="text-blue-600 font-black text-xl">3.840h</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="text-slate-600 font-medium">Meta de arrecadação</span>
                  <div className="text-right">
                    <span className="text-emerald-600 font-black text-xl">82%</span>
                    <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div className="w-[82%] h-full bg-emerald-500"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-8 text-center leading-relaxed">
                100% das doações são destinadas diretamente aos honorários dos parceiros cuidadores em casos sociais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationSection;
