
import React from 'react';
import { MessageCircle } from 'lucide-react';

const CTAFinal: React.FC = () => {
  const whatsappLink = "https://wa.me/+5592992411099?text=Ol%C3%A1%2C%20Seja%20Bem%20Vindo%20ao%20HubCare.%20Somos%20um%20hub%20de%20cuidado%20que%20conecta%20fam%C3%ADlias%20a%20profissionais%20qualificados%2C%20oferecendo%20seguran%C3%A7a%2C%20confian%C3%A7a%20e%20cuidado%20sob%20demanda.";

  return (
    <div className="py-24 md:py-40 relative overflow-hidden bg-blue-900">
      <div className="absolute inset-0 z-0 opacity-20 bg-blue-800">
        <img 
          src="https://images.unsplash.com/photo-1516307364728-25b1ea4c6c74?auto=format&fit=crop&q=60&w=1200" 
          alt="Família feliz" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent z-10"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Precisa de ajuda agora?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 opacity-90 leading-relaxed font-medium">
            Nossa equipe está pronta para te atender. Não deixe para depois o cuidado que pode ser feito hoje.
          </p>
          
          <div className="flex flex-col items-center">
            <a 
              href={whatsappLink} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col sm:flex-row items-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-2xl transition-all transform hover:scale-105 shadow-[0_20px_50px_rgba(16,185,129,0.3)] group"
            >
              <span className="px-10 py-5 text-xl md:text-2xl font-black text-center">
                Fale com a HUBCARE no WhatsApp
              </span>
              <span className="bg-white/20 p-5 rounded-xl hidden sm:block group-hover:bg-white/30 transition-colors">
                <MessageCircle size={36} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTAFinal;
