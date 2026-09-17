
import React from 'react';
import { MessageSquare, ClipboardCheck, Users, Zap } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <MessageSquare size={32} />,
      title: "Você entra em contato",
      description: "Fale conosco pelo WhatsApp de forma simples e direta.",
      image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=60&w=400"
    },
    {
      icon: <ClipboardCheck size={32} />,
      title: "Entendemos sua necessidade",
      description: "Escutamos sua situação para oferecer o suporte correto.",
      image: "https://i.pinimg.com/736x/e7/0e/cb/e70ecbc92c9849319ebcde8e6b1a632c.jpg"
    },
    {
      icon: <Users size={32} />,
      title: "Selecionamos o parceiro ideal",
      description: "Escolhemos o perfil de parceiro cuidador mais adequado para o seu caso.",
      image: "https://i.pinimg.com/736x/26/b8/9e/26b89e89f98818c9eb31b4e5afe7e81e.jpg"
    },
    {
      icon: <Zap size={32} />,
      title: "Atendimento imediato",
      description: "O suporte chega até você com rapidez e agilidade.",
      image: "https://i.pinimg.com/1200x/ca/f6/f4/caf6f40f87859edfbde82e52da5ee757.jpg"
    }
  ];

  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Como Funciona</h2>
          <p className="text-slate-600 max-w-xl mx-auto text-lg">Tudo desenhado para ser rápido e eficiente quando a urgência bate à porta.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="w-full aspect-video mb-6 overflow-hidden rounded-2xl shadow-md border border-slate-100 bg-slate-100">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 left-full w-full h-[1px] bg-slate-100 -z-10 -ml-10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
