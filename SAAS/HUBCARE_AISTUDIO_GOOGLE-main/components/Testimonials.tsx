
import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const feedbackList = [
    {
      name: "Mariana Costa",
      role: "Filha de paciente",
      content: "A HUBCARE foi nossa salvação quando meu pai precisou de acompanhamento hospitalar urgente. O parceiro cuidador foi extremamente atencioso e nos manteve informados o tempo todo.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Roberto Almeida",
      role: "Paciente em recuperação",
      content: "O cuidado domiciliar superou minhas expectativas. Mais do que ajuda técnica, recebi companhia e carinho através do parceiro indicado. Recomendo a todos.",
      image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Juliana Mendes",
      role: "Neta de assistida",
      content: "Encontrar alguém de confiança para cuidar da minha avó era um desafio. Com a HUBCARE, o processo foi rápido e a parceira selecionada é um anjo em nossas vidas.",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200"
    }
  ];

  return (
    <div className="py-20 md:py-32 bg-slate-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 opacity-5 -mr-20">
        <Quote size={400} className="text-blue-900" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">O que dizem sobre nós</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            A satisfação das famílias que atendemos é o nosso maior diferencial. Veja o feedback de quem já utilizou a HUBCARE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbackList.map((feedback, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-slate-600 italic leading-relaxed mb-8 flex-grow">
                "{feedback.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex-shrink-0">
                  <img 
                    src={feedback.image} 
                    alt={feedback.name} 
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">{feedback.name}</h4>
                  <p className="text-sm text-emerald-600 font-medium">{feedback.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
