
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  History,
  CheckSquare,
  Users,
  MessageSquare,
  Heart,
  BellRing
} from 'lucide-react';
import { User, Patient, DailyUpdate, Task, CaregiverProfile, Subscription, CareRequest, ChatMessage, Role, RequestStatus, PlanType } from './types';
import DashboardView from './views/DashboardView';
import CaregiverDashboardView from './views/CaregiverDashboardView';
import TimelineView from './views/TimelineView';
import TasksView from './views/TasksView';
import MarketplaceView from './views/MarketplaceView';
import ProfileView from './views/ProfileView';
import MessagesView from './views/MessagesView';
import OnboardingView from './views/OnboardingView';
import { supabase } from './supabaseClient';
import { useGeolocation } from './hooks/useGeolocation';
import { updateUserLocation, fetchCareRequests } from './services/careService';
import { initializePushNotifications, showLocalNotification } from './services/pushService';
import { subscribeToCareRequests, unsubscribe } from './services/messageService';

// --- MOCK DATA ---
// Mocks are kept for non-user data until fully integrated
const MOCK_PATIENT: Patient = {
  id: 'p1',
  name: 'Dona Maria Oliveira',
  hospital: 'Hospital Santa Luzia',
  status: 'internado',
  created_by: 'u1',
  age: 72
};

const MOCK_UPDATES: DailyUpdate[] = [
  { id: 'd1', patient_id: 'p1', user_id: 'u1', user_name: 'Ana Silva', content: 'Dona Maria acordou bem hoje, tomou todo o café da manhã.', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'd2', patient_id: 'p1', user_id: 'u2', user_name: 'Dr. Roberto', content: 'Exames de sangue estáveis. Aguardando fisioterapia.', created_at: new Date().toISOString() },
];

const MOCK_TASKS: Task[] = [
  { id: 't1', patient_id: 'p1', title: 'Comprar fraldas G', status: 'done' },
  { id: 't2', patient_id: 'p1', title: 'Levar documentos para o convênio', status: 'pending' },
  { id: 't3', patient_id: 'p1', title: 'Acompanhar banho do leito', status: 'pending' },
];

const MOCK_CAREGIVERS: CaregiverProfile[] = [
  {
    id: 'c1', user_id: 'u3', name: 'João Técnico',
    bio: 'Especialista em pacientes críticos e pós-operatório.',
    experience: '10 anos', location: 'São Paulo, SP',
    availability: 'Integral', rating: 4.8, review_count: 127, price_hour: 45,
    avatar: 'https://picsum.photos/seed/joao/100',
    is_verified: true,
    is_featured: true,
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    id: 'c2', user_id: 'u4', name: 'Carla Enfermagem',
    bio: 'Cuidado humanizado para idosos com Alzheimer.',
    experience: '5 anos', location: 'São Paulo, SP',
    availability: 'Noturno', rating: 5.0, review_count: 89, price_hour: 55,
    avatar: 'https://picsum.photos/seed/carla/100',
    is_verified: true,
    is_featured: false,
    latitude: -23.5605,
    longitude: -46.6433,
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'm1', request_id: 'r1', sender_id: 'u3', text: 'Bom dia Ana, já estou a caminho do hospital.', created_at: new Date().toISOString() }
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dash' | 'timeline' | 'tasks' | 'market' | 'messages' | 'profile'>('dash');
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient>(MOCK_PATIENT);
  const [updates, setUpdates] = useState<DailyUpdate[]>(MOCK_UPDATES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [subscription, setSubscription] = useState<Subscription>({ id: 's1', user_id: 'u1', plan_type: 'free', status: 'inactive' });
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [showToast, setShowToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Geolocation
  const { coordinates } = useGeolocation();

  // Update user location when coordinates change
  useEffect(() => {
    if (user && coordinates) {
      updateUserLocation(user.id, coordinates.latitude, coordinates.longitude);
    }
  }, [user, coordinates]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setActiveTab('dash');
        setRequests([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const userData: User = {
          id: data.id,
          name: data.name,
          email: email || '',
          role: data.role as Role,
          avatar: data.avatar_url,
          is_verified: data.is_verified,
          plan_type: (data.plan_type || 'free') as PlanType,
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setUser(userData);
        setIsLoggedIn(true);
        setSubscription({
          id: `sub_${userId}`,
          user_id: userId,
          plan_type: (data.plan_type || 'free') as PlanType,
          status: 'active'
        });

        // Fetch real requests
        fetchUserRequests(userId, data.role);

        // Initialize push notifications
        initializePushNotifications(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRequests = async (userId: string, role: 'family' | 'caregiver') => {
    const realRequests = await fetchCareRequests(userId, role);
    setRequests(realRequests);
  };

  // Subscribe to real-time care request updates
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToCareRequests(
      user.id,
      (newRequest) => {
        // New request received (for caregiver)
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
        
        setRequests(prev => [mappedRequest, ...prev.filter(r => r.id !== mappedRequest.id)]);
        
        if (user.role === 'caregiver') {
          setShowToast({ message: 'Nova solicitação de atendimento recebida!', type: 'info' });
          showLocalNotification('Nova Solicitação!', {
            body: `${newRequest.patient_name} - ${newRequest.care_type}`,
          });
        }
      },
      (updatedRequest) => {
        // Request status changed
        setRequests(prev => prev.map(r => 
          r.id === updatedRequest.id 
            ? { ...r, status: updatedRequest.status }
            : r
        ));

        if (user.role === 'family' && updatedRequest.status === 'accepted') {
          setShowToast({ message: 'Sua solicitação foi aceita!', type: 'success' });
          showLocalNotification('Solicitação Aceita!', {
            body: 'Um cuidador aceitou seu pedido de atendimento.',
          });
        }
      }
    );

    return () => unsubscribe(channel);
  }, [user]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleLogin = (role: Role) => {
    // Handled by auth listener
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleRequestCare = (caregiverId: string) => {
    // Legacy handler - now handled by MarketplaceView with real DB
    if (!user) return;
    const newRequest: CareRequest = {
      id: `r${Date.now()}`,
      caregiver_id: caregiverId,
      family_id: user.id,
      patient_id: patient.id,
      patient_name: patient.name,
      patient_age: patient.age || 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      shift: 'diurno',
      care_type: 'hospitalar',
      location_summary: patient.hospital
    };
    setRequests([...requests, newRequest]);
    setShowToast({ message: 'Solicitação enviada! Zero custo para iniciar.', type: 'success' });
  };

  const handleRequestCreated = (newRequest: CareRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    setShowToast({ message: 'Solicitação enviada com sucesso!', type: 'success' });
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    // Optimistic update
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));

    if (newStatus === 'accepted') {
      setShowToast({ message: 'Chamada aceita! Vinculando ao paciente...', type: 'success' });
    } else if (newStatus === 'rejected') {
      setShowToast({ message: 'Chamada recusada.', type: 'info' });
    }

    // Update in Supabase
    try {
      const { error } = await supabase
        .from('care_requests')
        .update({ 
          status: newStatus,
          ...(newStatus === 'accepted' && { accepted_at: new Date().toISOString() }),
          ...(newStatus === 'finished' && { finished_at: new Date().toISOString() }),
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err);
      setShowToast({ message: 'Erro ao sincronizar status. Verifique conexão.', type: 'info' });
    }
  };

  const renderView = () => {
    if (!user) return null;

    if (user.role === 'caregiver' && activeTab === 'dash') {
      const caregiverRequests = requests.filter(r => 
        r.caregiver_id === user.id || r.caregiver_id === 'c1'
      );
      return (
        <CaregiverDashboardView
          user={user}
          requests={caregiverRequests}
          onUpdateStatus={handleUpdateRequestStatus}
        />
      );
    }

    switch (activeTab) {
      case 'dash': 
        return <DashboardView user={user} patient={patient} updates={updates} tasks={tasks} />;
      
      case 'timeline': 
        return <TimelineView patient={patient} updates={updates} onAddUpdate={(content) => {
          setUpdates([{ id: `d${Date.now()}`, patient_id: patient.id, user_id: user.id, user_name: user.name, content, created_at: new Date().toISOString() }, ...updates]);
        }} />;
      
      case 'tasks': 
        return <TasksView tasks={tasks} onToggleTask={(id) => {
          setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
        }} onAddTask={(title) => {
          setTasks([...tasks, { id: `t${Date.now()}`, patient_id: patient.id, title, status: 'pending' }]);
        }} />;
      
      case 'market': 
        return (
          <MarketplaceView 
            caregivers={MOCK_CAREGIVERS} 
            requests={requests.filter(r => r.family_id === user.id)} 
            onSelectItem={handleRequestCare} 
            isPremium={user.plan_type === 'premium'}
            user={user}
            onRequestCreated={handleRequestCreated}
          />
        );
      
      case 'messages': 
        return (
          <MessagesView 
            requests={requests} 
            caregivers={MOCK_CAREGIVERS} 
            messages={messages} 
            onSendMessage={(reqId, text) => {
              setMessages([...messages, { id: `m${Date.now()}`, request_id: reqId, sender_id: user.id, text, created_at: new Date().toISOString() }]);
            }}
            user={user}
          />
        );
      
      case 'profile': 
        return (
          <ProfileView
            user={user}
            subscription={subscription}
            onUpgrade={() => {
              const newPlan = user.role === 'caregiver' ? 'featured' : 'premium';
              setUser({ ...user, plan_type: newPlan });
              setSubscription({ ...subscription, plan_type: newPlan, status: 'active' });
              setShowToast({ message: 'Plano atualizado com sucesso!', type: 'success' });
            }}
            onLogout={handleLogout}
          />
        );
      
      default: 
        return <DashboardView user={user} patient={patient} updates={updates} tasks={tasks} />;
    }
  };

  if (!isLoggedIn) {
    return <OnboardingView onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs animate-in slide-in-from-top-10 duration-500">
          <div className={`flex items-center gap-3 p-4 rounded-3xl shadow-2xl border ${showToast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
            <div className="bg-white/20 p-2.5 rounded-2xl">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">{showToast.message}</p>
              <p className="text-[10px] opacity-70 mt-0.5 font-medium">Toque para ver detalhes</p>
            </div>
          </div>
        </div>
      )}

      <header className="bg-emerald-600 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 fill-white" />
          <h1 className="text-xl font-bold tracking-tight">Hub Care</h1>
        </div>
        <button onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-full border-2 border-emerald-400 overflow-hidden hover:scale-105 transition-transform shadow-sm">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`} alt="User" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around p-3 z-50 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={<LayoutDashboard />} label="Início" />
        {user?.role === 'family' && (
          <>
            <NavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<History />} label="Linha" />
            <NavButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={<Users />} label="Cuidados" />
          </>
        )}
        <NavButton 
          active={activeTab === 'messages'} 
          onClick={() => setActiveTab('messages')} 
          icon={<MessageSquare />} 
          label="Chat"
          badge={unreadMessages > 0 ? unreadMessages : undefined}
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactElement; 
  label: string;
  badge?: number;
}> = ({ active, onClick, icon, label, badge }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
    <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-emerald-100 scale-110' : ''}`}>
      {React.cloneElement(icon, { className: 'w-6 h-6' } as any)}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    {badge && (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-[8px] text-white font-bold">{badge > 9 ? '9+' : badge}</span>
      </div>
    )}
  </button>
);

export default App;
