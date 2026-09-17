
import React from 'react';
import { Star, Award, ShieldCheck } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const TopRatedCaregivers: React.FC = () => {
  const caregivers = [
    {
      name: "Dra. Helena Silva",
      specialty: "Acompanhante Hospitalar",
      rating: 5.0,
      reviews: 124,
      image: "https://i.pinimg.com/736x/34/d6/44/34d64474952faea72f8cdec9a8d8b24f.jpg"
    },
    {
      name: "Marcos Oliveira",
      specialty: "Cuidador de Idosos",
      rating: 4.9,
      reviews: 98,
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=70&w=160&h=160"
    },
    {
      name: "Ana Beatriz",
      specialty: "Apoio Domiciliar",
      rating: 5.0,
      reviews: 86,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=70&w=160&h=160"
    },
    {
      name: "Ricardo Santos",
      specialty: "Acompanhante Especializado",
      rating: 4.8,
      reviews: 112,
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=70&w=160&h=160"
    }
  ];

  return (
    <div className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-4">
            <Award size={18} />
            Excelência Comprovada
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Parceiros em Destaque</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Conheça alguns dos nossos parceiros cuidadores mais bem avaliados pela comunidade HUBCARE.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {caregivers.map((person, index) => (
            <div key={index} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-6 relative rounded-full bg-slate-200 overflow-hidden">
                  <ImageWithFallback
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full border-4 border-white shadow-lg object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-md">
                    <ShieldCheck size={14} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-blue-900 mb-1">{person.name}</h3>
                <p className="text-emerald-600 font-semibold text-sm mb-4">{person.specialty}</p>

                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(person.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                  ))}
                  <span className="text-slate-900 font-bold ml-1">{person.rating}</span>
                </div>

                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                  {person.reviews} avaliações
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopRatedCaregivers;
