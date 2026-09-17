
import React, { useState } from 'react';
import { Building2, Stethoscope, HeartPulse, UserCircle } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const PartnerNetwork: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'hospitals' | 'clinics' | 'doctors' | 'nurses'>('hospitals');

  const categories = [
    { id: 'hospitals', name: 'Hospitais', icon: <Building2 size={20} /> },
    { id: 'clinics', name: 'Clínicas', icon: <HeartPulse size={20} /> },
    { id: 'doctors', name: 'Médicos', icon: <Stethoscope size={20} /> },
    { id: 'nurses', name: 'Enfermeiros', icon: <UserCircle size={20} /> },
  ];

  const content = {
    hospitals: [
      { name: "Hospital Santa Luzia", location: "São Paulo, SP", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=60&w=400" },
      { name: "Centro Hospitalar Albert", location: "Rio de Janeiro, RJ", image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=60&w=400" },
      { name: "Hospital do Coração", location: "Curitiba, PR", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=60&w=400" },
    ],
    clinics: [
      { name: "Clínica Viva Bem", location: "Belo Horizonte, MG", image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=60&w=400" },
      { name: "Reab Centro Médico", location: "Salvador, BA", image: "https://images.unsplash.com/photo-1504813184591-01552661c87f?auto=format&fit=crop&q=60&w=400" },
    ],
    doctors: [
      { name: "Dr. André Martins", specialty: "Cardiologia", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=60&w=400" },
      { name: "Dra. Paula Souza", specialty: "Geriatria", image: "/doctor_smiling.png" },
    ],
    nurses: [
      { name: "Enf. Carla Ramos", specialty: "UTI Adulto", image: "https://images.unsplash.com/photo-1576765608598-356166e51375?auto=format&fit=crop&q=60&w=400" },
      { name: "Enf. Thiago Lima", specialty: "Home Care", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=60&w=400" },
    ]
  };

  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Nossa Rede de Parceiros</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Trabalhamos em conjunto com as melhores instituições e profissionais de saúde para garantir um ecossistema completo de cuidado.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {content[activeCategory].map((item: any, index: number) => (
            <div key={index} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900 mb-1">{item.name}</h4>
                  <p className="text-emerald-600 font-semibold text-sm">{item.location || item.specialty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerNetwork;
