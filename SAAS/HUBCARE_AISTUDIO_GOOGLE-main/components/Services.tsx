
import React from 'react';
import { Building2, Home, HeartHandshake, Baby, AlertCircle } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const Services: React.FC = () => {
  const services = [
    {
      title: "Acompanhamento hospitalar",
      description: "Suporte contínuo ao paciente durante a internação, garantindo companhia e auxílio nas necessidades básicas.",
      icon: <Building2 className="text-blue-600" />,
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Cuidado domiciliar",
      description: "Apoio no dia a dia da residência, auxiliando na rotina, alimentação e bem-estar do assistido.",
      icon: <Home className="text-emerald-500" />,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Companhia e apoio ao paciente",
      description: "Presença amiga e suporte emocional para quem precisa de atenção extra e diálogo no cotidiano.",
      icon: <HeartHandshake className="text-blue-500" />,
      image: "https://i.pinimg.com/1200x/25/69/83/25698366181f03c1102edc69c8233780.jpg"
    },
    {
      title: "Apoio a idosos e famílias",
      description: "Cuidado dedicado à terceira idade, proporcionando tranquilidade para os familiares.",
      icon: <Baby className="text-emerald-600" />,
      image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=400"
    }
  ];

  return (
    <div className="py-20 md:py-32 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">O Que Fazemos</h2>
            <p className="text-slate-600 text-lg">Oferecemos tranquilidade para sua família através de um suporte humano dedicado e profissional.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-48 flex-shrink-0">
                <ImageWithFallback
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
              </div>
              <div className="flex-grow py-2">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  {React.cloneElement(service.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 max-w-lg mx-auto md:mx-0">
          <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">Aviso:</span> Não realizamos procedimentos médicos invasivos. Nosso foco é cuidado, apoio e acompanhamento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Services;
