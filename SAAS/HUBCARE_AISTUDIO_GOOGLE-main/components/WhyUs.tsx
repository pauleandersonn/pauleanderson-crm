
import React from 'react';
import { MousePointerClick, UserCheck, Heart, Search, FastForward } from 'lucide-react';

const WhyUs: React.FC = () => {
  const differentials = [
    {
      icon: <MousePointerClick />,
      title: "Atendimento sob demanda",
      description: "Estamos disponíveis quando você precisa, sem burocracias excessivas."
    },
    {
      icon: <UserCheck />,
      title: "Profissionais selecionados",
      description: "Rigoroso processo de escolha para garantir quem entra em sua casa ou acompanha seu familiar."
    },
    {
      icon: <Heart />,
      title: "Atendimento humano",
      description: "Priorizamos a empatia e o carinho em cada interação e cuidado prestado."
    },
    {
      icon: <Search />,
      title: "Transparência",
      description: "Informação clara e acompanhamento do que está sendo feito, sempre."
    },
    {
      icon: <FastForward />,
      title: "Agilidade em momentos críticos",
      description: "Sabemos que em saúde, cada minuto conta. Agimos rápido."
    }
  ];

  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">Por que a HUBCARE?</h2>
            
            <div className="space-y-8">
              {differentials.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm md:text-base">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 order-1 lg:order-2 w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] rotate-3 -z-10 opacity-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800" 
                alt="Mão cuidadora" 
                className="w-full h-auto rounded-[2rem] shadow-xl aspect-square lg:aspect-auto"
                loading="lazy"
              />
              <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-8 rounded-2xl shadow-xl hidden sm:block">
                <p className="text-3xl font-bold mb-1">100%</p>
                <p className="text-sm opacity-90 uppercase tracking-wider font-semibold">Foco no Cuidado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUs;
