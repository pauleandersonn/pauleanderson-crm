
import React from 'react';
import { MessageCircle, ShieldCheck, HeartPulse, Clock } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const Hero: React.FC = () => {
  const whatsappLink = "https://wa.me/+5592992411099?text=Ol%C3%A1%2C%20Mais%20Informações.";

  return (
    <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-1/3 h-1/2 bg-blue-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-1/4 h-1/3 bg-emerald-100/50 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Atendimento Imediato Disponível
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 leading-tight mb-4">
              HUBCARE
              <span className="block text-2xl md:text-4xl font-medium text-blue-700 mt-2 italic">
                Quando cuidar não pode esperar
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Conectamos você a parceiros cuidadores e acompanhantes preparados, com rapidez, segurança e atenção humana — no hospital ou em casa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95"
              >
                <MessageCircle size={24} />
                Chamar no WhatsApp
              </a>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Clock size={18} className="text-blue-600" />
                Resposta em minutos
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="text-emerald-500" size={20} />
                <span>Segurança Total</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <HeartPulse className="text-blue-500" size={20} />
                <span>Cuidado Humano</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl bg-slate-200 aspect-square md:aspect-video lg:aspect-square">
              <ImageWithFallback
                src="https://i.pinimg.com/1200x/55/74/c4/5574c4b4cbf7239b30c2e91f8b9e306d.jpg"
                alt="Cuidadora segurando a mão de um idoso, demonstrando carinho e atenção"
                className="w-full h-full object-cover"
                // removed loading="lazy" for LCP optimization
                fetchPriority="high"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 md:-right-12 z-20 bg-white p-4 md:p-6 rounded-xl shadow-xl border border-slate-100 hidden sm:block max-w-[240px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <HeartPulse size={24} />
                </div>
                <span className="font-bold text-slate-800">Presença Real</span>
              </div>
              <p className="text-sm text-slate-500">Nossa missão é estar ao seu lado através de parceiros dedicados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
