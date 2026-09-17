
import React, { useState, useEffect } from 'react';
import { CaregiverProfile, CareRequest, User, Coordinates } from '../types';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Sparkles, 
  HeartHandshake,
  Navigation,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useGeolocation, calculateDistance, formatDistance } from '../hooks/useGeolocation';
import { createCareRequest, fetchCaregivers } from '../services/careService';
import CareRequestModal, { CareRequestFormData } from '../components/CareRequestModal';

interface MarketplaceViewProps {
  caregivers: CaregiverProfile[];
  requests: CareRequest[];
  onSelectItem: (caregiverId: string) => void;
  isPremium: boolean;
  user?: User;
  onRequestCreated?: (request: CareRequest) => void;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ 
  caregivers: initialCaregivers, 
  requests, 
  onSelectItem, 
  isPremium,
  user,
  onRequestCreated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'search' | 'requests'>('search');
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>(initialCaregivers);
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverProfile | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Geolocation hook
  const { coordinates, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  // Fetch real caregivers and calculate distances
  useEffect(() => {
    const loadCaregivers = async () => {
      setIsLoading(true);
      const realCaregivers = await fetchCaregivers();
      
      // Merge with initial mock data for demo
      const merged = [...initialCaregivers];
      realCaregivers.forEach(rc => {
        if (!merged.find(c => c.id === rc.id)) {
          merged.push(rc);
        }
      });

      // Calculate distances if we have user location
      if (coordinates) {
        const withDistances = merged.map(c => ({
          ...c,
          distance: c.latitude && c.longitude
            ? calculateDistance(coordinates.latitude, coordinates.longitude, c.latitude, c.longitude)
            : undefined
        }));
        setCaregivers(withDistances);
      } else {
        setCaregivers(merged);
      }
      
      setIsLoading(false);
    };

    loadCaregivers();
  }, [initialCaregivers, coordinates]);

  // Sort: Featured first, then by distance (if available), then by rating
  const sortedCaregivers = [...caregivers].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    
    // If both have distances, sort by distance
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    
    // If only one has distance, prioritize it
    if (a.distance !== undefined) return -1;
    if (b.distance !== undefined) return 1;
    
    return b.rating - a.rating;
  });

  const filtered = sortedCaregivers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return { label: 'Pendente', color: 'bg-amber-100 text-amber-700' };
      case 'accepted': return { label: 'Aceito', color: 'bg-emerald-100 text-emerald-700' };
      case 'rejected': return { label: 'Recusado', color: 'bg-red-100 text-red-700' };
      case 'finished': return { label: 'Finalizado', color: 'bg-blue-100 text-blue-700' };
      default: return { label: 'Cancelado', color: 'bg-slate-100 text-slate-700' };
    }
  };

  const handleRequestCaregiver = (caregiver: CaregiverProfile) => {
    setSelectedCaregiver(caregiver);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (formData: CareRequestFormData) => {
    if (!user || !selectedCaregiver) return;

    const { data, error } = await createCareRequest({
      caregiver_id: selectedCaregiver.user_id,
      family_id: user.id,
      patient_name: formData.patient_name,
      patient_age: formData.patient_age,
      shift: formData.shift,
      care_type: formData.care_type,
      contract_type: formData.contract_type,
      agreed_value: formData.agreed_value,
      city: formData.city,
      district: formData.district,
      address: formData.address,
      notes: formData.notes,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    });

    if (data && onRequestCreated) {
      onRequestCreated(data);
    }

    setShowRequestModal(false);
    setSelectedCaregiver(null);

    // Fallback to original handler for backwards compatibility
    if (!data) {
      onSelectItem(selectedCaregiver.id);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Request Modal */}
      {selectedCaregiver && (
        <CareRequestModal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedCaregiver(null);
          }}
          onSubmit={handleSubmitRequest}
          caregiver={selectedCaregiver}
          userLocation={coordinates}
        />
      )}

      <div className="p-4 bg-white sticky top-0 z-20 space-y-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setTab('search')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'search' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
          >
            Buscar Cuidadores
          </button>
          <button 
            onClick={() => setTab('requests')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'requests' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
          >
            Minhas Solicitações
          </button>
        </div>

        {tab === 'search' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, hospital ou especialidade..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Geolocation Status */}
            <div className={`rounded-2xl p-3 flex items-center gap-3 border ${
              coordinates 
                ? 'bg-emerald-50 border-emerald-100' 
                : geoError 
                  ? 'bg-amber-50 border-amber-100' 
                  : 'bg-slate-50 border-slate-100'
            }`}>
              {geoLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  <p className="text-[10px] text-slate-600 font-bold leading-tight">
                    Obtendo sua localização...
                  </p>
                </>
              ) : coordinates ? (
                <>
                  <Navigation className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-[10px] text-emerald-800 font-bold leading-tight">
                    Localização ativa! Cuidadores ordenados por proximidade.
                  </p>
                </>
              ) : geoError ? (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-amber-800 font-bold leading-tight">
                      {geoError}
                    </p>
                  </div>
                  <button 
                    onClick={requestLocation}
                    className="px-3 py-1 bg-amber-200 text-amber-800 text-[10px] font-bold rounded-lg"
                  >
                    Tentar novamente
                  </button>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-[10px] text-emerald-800 font-bold leading-tight">
                    Navegação gratuita. Você só paga quando o atendimento for confirmado!
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : tab === 'search' ? (
          filtered.map(caregiver => (
            <div key={caregiver.id} className={`bg-white border rounded-3xl p-4 shadow-sm space-y-4 relative overflow-hidden group transition-all ${caregiver.is_featured ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-200 hover:border-emerald-200'}`}>
              
              {caregiver.is_featured && (
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-amber-900" />
                  <span className="text-[9px] font-extrabold uppercase tracking-widest">Destaque</span>
                </div>
              )}

              <div className="flex gap-4">
                <div className="relative">
                  <img src={caregiver.avatar} alt={caregiver.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                  {caregiver.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-lg shadow-md border border-slate-50">
                       <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{caregiver.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {caregiver.rating.toFixed(1)}
                        </div>
                        {caregiver.review_count !== undefined && caregiver.review_count > 0 && (
                          <span className="text-[10px] text-slate-400">
                            ({caregiver.review_count} avaliações)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-emerald-600 font-bold text-sm">R$ {caregiver.price_hour}/h</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{caregiver.experience} exp.</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {caregiver.bio}
              </p>

              {/* Distance indicator */}
              {caregiver.distance !== undefined && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                  <MapPin className="w-3.5 h-3.5" />
                  {formatDistance(caregiver.distance)} de você
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => handleRequestCaregiver(caregiver)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  Solicitar Atendimento
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const caregiver = caregivers.find(c => c.id === req.caregiver_id || c.user_id === req.caregiver_id);
              const status = getStatusLabel(req.status);
              return (
                <div key={req.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex gap-4 items-center">
                    <img src={caregiver?.avatar || `https://ui-avatars.com/api/?name=${req.patient_name}`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{caregiver?.name || 'Cuidador'}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-bold">
                        <Calendar className="w-3 h-3" /> {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-600">
                      <strong>Paciente:</strong> {req.patient_name}, {req.patient_age} anos
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Local:</strong> {req.location_summary || `${req.district} - ${req.city}`}
                    </p>
                  </div>
                  
                  {req.status === 'accepted' && req.agreed_value && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Valor Acordado</span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        R$ {req.agreed_value.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            {requests.length === 0 && (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Clock className="w-8 h-8" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Nenhuma solicitação ativa.</p>
              </div>
            )}
          </div>
        )}

        {!isPremium && tab === 'search' && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-xl text-center mt-4">
            <h3 className="text-lg font-bold">Acesso Premium</h3>
            <p className="text-sm text-slate-300 leading-relaxed px-4">Filtros avançados (melhores avaliados, localização próxima) e histórico completo de cuidados.</p>
            <button className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-md hover:bg-emerald-500 transition-all">
              Ativar Plano Premium
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">A partir de R$ 19,90/mês</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceView;
