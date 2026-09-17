
import React, { useEffect, useState } from 'react';
import { User, CareRequest, RequestStatus } from '../types';
import {
  Bell,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  Hospital,
  Home,
  ShieldCheck,
  ClipboardList,
  AlertCircle,
  Wallet,
  TrendingUp,
  Sparkles,
  Star,
  Loader2
} from 'lucide-react';
import { fetchPendingRequestsForCaregiver, updateCareRequestStatus } from '../services/careService';
import { subscribeToCareRequests, unsubscribe } from '../services/messageService';
import { showLocalNotification, initializePushNotifications } from '../services/pushService';
import ReviewModal from '../components/ReviewModal';
import { createReview } from '../services/careService';

interface CaregiverDashboardViewProps {
  user: User;
  requests: CareRequest[];
  onUpdateStatus: (id: string, status: RequestStatus) => void;
}

const CaregiverDashboardView: React.FC<CaregiverDashboardViewProps> = ({ user, requests: initialRequests, onUpdateStatus }) => {
  const [requests, setRequests] = useState<CareRequest[]>(initialRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<CareRequest | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeRequests = requests.filter(r => r.status === 'accepted');
  const finishedRequests = requests.filter(r => r.status === 'finished');

  const totalEarnings = activeRequests.reduce((acc, req) => acc + (req.caregiver_payout || req.agreed_value || 0), 0);

  // Fetch real requests
  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      const realRequests = await fetchPendingRequestsForCaregiver(user.id);
      
      // Merge with initial requests
      const merged = [...initialRequests];
      realRequests.forEach(rr => {
        if (!merged.find(r => r.id === rr.id)) {
          merged.push(rr);
        }
      });
      
      setRequests(merged);
      setIsLoading(false);
    };

    loadRequests();
  }, [user.id, initialRequests]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = subscribeToCareRequests(
      user.id,
      (newRequest) => {
        // New request received
        const mappedRequest: CareRequest = {
          id: newRequest.id,
          caregiver_id: newRequest.caregiver_id,
          family_id: newRequest.family_id,
          patient_name: newRequest.patient_name,
          patient_age: newRequest.patient_age,
          status: newRequest.status,
          created_at: newRequest.created_at,
          shift: newRequest.shift || 'diurno',
          care_type: newRequest.care_type || 'domiciliar',
          location_summary: `${newRequest.district || ''} - ${newRequest.city || ''}`,
          notes: newRequest.notes,
          contract_type: newRequest.contract_type,
          agreed_value: newRequest.agreed_value,
          city: newRequest.city,
          district: newRequest.district,
        };
        
        setRequests(prev => [mappedRequest, ...prev]);
        
        // Show notification
        showLocalNotification('Nova Solicitação de Atendimento!', {
          body: `${newRequest.patient_name} - ${newRequest.care_type}`,
          tag: newRequest.id,
        });
      },
      (updatedRequest) => {
        // Request status changed
        setRequests(prev => prev.map(r => 
          r.id === updatedRequest.id 
            ? { ...r, status: updatedRequest.status }
            : r
        ));
      }
    );

    return () => unsubscribe(channel);
  }, [user.id]);

  // Initialize push notifications
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        // Will ask for permission when user interacts
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const success = await initializePushNotifications(user.id);
    if (success) {
      setNotificationPermission('granted');
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: RequestStatus) => {
    // Optimistic update
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: newStatus } : r
    ));
    
    // Update in Supabase
    const success = await updateCareRequestStatus(requestId, newStatus);
    
    if (!success) {
      // Rollback on error
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'pending' } : r
      ));
    }
    
    // Call parent handler for backwards compatibility
    onUpdateStatus(requestId, newStatus);
  };

  const handleFinishRequest = (request: CareRequest) => {
    setSelectedRequestForReview(request);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedRequestForReview) return;

    await createReview({
      care_request_id: selectedRequestForReview.id,
      reviewer_id: user.id,
      reviewed_id: selectedRequestForReview.family_id,
      rating,
      comment,
      review_type: 'caregiver_to_family',
    });

    // Update request status to finished
    await handleUpdateStatus(selectedRequestForReview.id, 'finished');
    
    setShowReviewModal(false);
    setSelectedRequestForReview(null);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedRequestForReview(null);
        }}
        onSubmit={handleSubmitReview}
        caregiverName="Família"
        patientName={selectedRequestForReview?.patient_name || ''}
      />

      {/* Welcome Header */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Olá, {user.name.split(' ')[0]} 👋</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponível para trabalho</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Verificado</span>
        </div>
      </section>

      {/* Notification Permission Banner */}
      {notificationPermission === 'default' && (
        <section className="bg-blue-50 border border-blue-100 rounded-3xl p-4 flex items-center gap-4">
          <Bell className="w-8 h-8 text-blue-600" />
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 text-sm">Ativar Notificações</h4>
            <p className="text-xs text-blue-700 mt-0.5">Receba alertas quando novas solicitações chegarem.</p>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Ativar
          </button>
        </section>
      )}

      {/* Earnings Dashboard */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Wallet className="w-3 h-3" /> Meus Repasses
          </h3>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Saldo Pendente</p>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">R$ {totalEarnings.toFixed(2)}</p>
          </div>
          <p className="text-[9px] text-slate-400 italic max-w-[120px] leading-tight text-right">
            Você recebe o repasse 24h após o fim do atendimento.
          </p>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* Immediate Visual Alert Banner */}
      {!isLoading && pendingRequests.length > 0 && (
        <section className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 shadow-lg shadow-amber-100 animate-bounce-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-amber-900 text-sm">Novas Solicitações!</h4>
              <p className="text-xs text-amber-700 font-medium leading-tight mt-0.5">
                Você tem <strong>{pendingRequests.length}</strong> solicitações aguardando resposta rápida.
              </p>
            </div>
            <button
              onClick={() => document.getElementById('requests-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-2 bg-amber-900 text-white text-[10px] font-bold rounded-xl uppercase tracking-wider"
            >
              Ver Agora
            </button>
          </div>
        </section>
      )}

      {/* Freemium Upsell: Featured Plan */}
      {user.plan_type !== 'featured' && (
        <section className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-[-20px] right-[-20px] opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold tracking-tight">Seja um Cuidador de Destaque</h3>
              <p className="text-xs font-medium text-amber-50 leading-relaxed">
                Apareça no topo das buscas e receba até 3x mais solicitações.
              </p>
            </div>
            <button className="w-full py-3 bg-white text-orange-600 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-lg hover:bg-amber-50 active:scale-95 transition-all">
              Ativar Agora
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-100 opacity-80">R$ 29,90/mês</p>
          </div>
        </section>
      )}

      {/* Main Action Section: Incoming Requests */}
      <section id="requests-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" /> Solicitações Recebidas
          </h3>
          {pendingRequests.length > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-4 ring-emerald-50">
              {pendingRequests.length} NOVAS
            </span>
          )}
        </div>

        <div className="space-y-4">
          {pendingRequests.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              onAccept={() => handleUpdateStatus(req.id, 'accepted')}
              onReject={() => handleUpdateStatus(req.id, 'rejected')}
            />
          ))}

          {!isLoading && pendingRequests.length === 0 && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-xs font-medium">Sem novas solicitações no momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* Active Work Flow */}
      {activeRequests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Atendimentos Ativos</h3>
          <div className="space-y-3">
            {activeRequests.map(req => (
              <div key={req.id} className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      {req.care_type === 'hospitalar' ? <Hospital className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{req.patient_name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {req.shift} • {req.contract_type || 'Diária'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">
                      R$ {(req.agreed_value || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleFinishRequest(req)}
                    className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Finalizar Atendimento
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Finished Requests */}
      {finishedRequests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Atendimentos Finalizados
          </h3>
          <div className="space-y-3">
            {finishedRequests.slice(0, 3).map(req => (
              <div key={req.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{req.patient_name}</h4>
                  <p className="text-[10px] text-slate-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-600">
                  R$ {(req.agreed_value || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Profile & Settings Shortcuts */}
      <section className="grid grid-cols-2 gap-3 pt-4">
        <ShortcutButton icon={<Calendar className="w-5 h-5" />} label="Minha Agenda" />
        <ShortcutButton icon={<ShieldCheck className="w-5 h-5" />} label="Meus Dados" />
      </section>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const RequestCard: React.FC<{ request: CareRequest; onAccept: () => void; onReject: () => void }> = ({ request, onAccept, onReject }) => {
  const formatMoney = (val?: number) => val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val) : 'A combinar';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-md space-y-4 animate-in slide-in-from-top-4 duration-300 ring-2 ring-transparent hover:ring-emerald-100 transition-all">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-slate-800">{request.patient_name}</h4>
          <span className="text-xs font-medium text-slate-500">{request.patient_age} anos</span>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wide mt-1">
            {request.care_type === 'hospitalar' ? <Hospital className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
            {request.care_type}
          </div>
        </div>
        <div className="text-right bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
          <span className="block text-[10px] text-emerald-600 font-bold uppercase mb-0.5">Valor Proposto</span>
          <span className="text-lg font-extrabold text-emerald-700 tracking-tight">{formatMoney(request.agreed_value)}</span>
          <span className="block text-[9px] text-emerald-500 font-bold lowercase text-right">/{request.contract_type || 'período'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Início
          </span>
          <p className="text-xs font-bold text-slate-700">{new Date(request.created_at).toLocaleDateString()}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Contrato
          </span>
          <p className="text-xs font-bold text-slate-700 capitalize">{request.contract_type || 'Diária'}</p>
        </div>
        <div className="space-y-1 col-span-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Localização
          </span>
          <p className="text-xs font-bold text-slate-700 truncate">{request.district ? `${request.district} - ${request.city}` : request.location_summary}</p>
        </div>
      </div>

      {request.notes && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <ClipboardList className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Observações</span>
          </div>
          <p className="text-xs text-slate-600 italic leading-relaxed">"{request.notes}"</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onReject}
          className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
        >
          <XCircle className="w-4 h-4" /> Recusar
        </button>
        <button
          onClick={onAccept}
          className="flex-[2] py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <CheckCircle className="w-4 h-4" /> Aceitar Chamada
        </button>
      </div>
    </div>
  );
};

const ShortcutButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-emerald-200 transition-all active:scale-[0.98]">
    <div className="text-emerald-500">{icon}</div>
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
  </button>
);

export default CaregiverDashboardView;
