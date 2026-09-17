
import React, { useState } from 'react';
import { User, Subscription, PaymentMethod } from '../types';
import { 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Zap, 
  Star, 
  Sparkles,
  Plus,
  Trash2,
  Check,
  X,
  Loader2
} from 'lucide-react';
import StripeCheckout from '../components/StripeCheckout';

interface ProfileViewProps {
  user: User;
  subscription: Subscription;
  onUpgrade: () => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, subscription, onUpgrade, onLogout }) => {
  const isUpgraded = subscription.plan_type !== 'free';
  const planName = user.role === 'caregiver' ? 'Plano Destaque' : 'Plano Premium';
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    // Mock payment methods
    {
      id: 'pm_1',
      user_id: user.id,
      stripe_payment_method_id: 'pm_mock_1',
      type: 'card',
      last_four: '4242',
      brand: 'visa',
      exp_month: 12,
      exp_year: 2025,
      is_default: true,
      created_at: new Date().toISOString(),
    }
  ]);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleAddPaymentMethod = () => {
    setShowAddCard(true);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Mock adding a new payment method
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      user_id: user.id,
      stripe_payment_method_id: paymentIntentId,
      type: 'card',
      last_four: '1234',
      brand: 'mastercard',
      exp_month: 6,
      exp_year: 2026,
      is_default: false,
      created_at: new Date().toISOString(),
    };
    setPaymentMethods(prev => [...prev, newMethod]);
    setShowAddCard(false);
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
  };

  const handleSetDefaultPaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.map(m => ({
      ...m,
      is_default: m.id === methodId
    })));
  };

  const getBrandIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 Amex';
      default:
        return '💳 Cartão';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Stripe Checkout Modal for Adding Card */}
      <StripeCheckout
        isOpen={showAddCard}
        onClose={() => setShowAddCard(false)}
        onSuccess={handlePaymentSuccess}
        amount={0.50} // Small verification charge
        description="Verificação de cartão"
        caregiverName="Hub Care"
      />

      {/* Profile Header */}
      <div className="bg-white p-6 border-b text-center space-y-3">
        <div className="relative inline-block">
          <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-emerald-50 mx-auto shadow-md" />
          <div className="absolute bottom-1 right-1 p-1 bg-emerald-500 text-white rounded-full border-2 border-white">
            <Settings className="w-3 h-3" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-10">
        {/* Subscription Banner */}
        <section className={`rounded-3xl border p-5 shadow-md flex items-center justify-between transition-all ${isUpgraded ? 'bg-amber-400 border-amber-300 text-amber-900' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUpgraded ? 'bg-amber-300 text-amber-900 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
              {isUpgraded ? <Sparkles className="w-6 h-6 fill-amber-900" /> : <Zap className="w-6 h-6" />}
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isUpgraded ? 'text-amber-800' : 'text-slate-400'}`}>Plano Atual</p>
              <h4 className="font-extrabold text-sm">{isUpgraded ? planName : 'Plano Gratuito'}</h4>
            </div>
          </div>
          {!isUpgraded ? (
            <button 
              onClick={onUpgrade}
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-extrabold rounded-xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
            >
              ATIVAR
            </button>
          ) : (
            <div className="bg-amber-500/20 px-4 py-1.5 rounded-full border border-amber-900/10">
               <span className="text-[10px] font-extrabold uppercase">Ativo</span>
            </div>
          )}
        </section>

        {/* Free-to-browse reminder for Families */}
        {user.role === 'family' && !isUpgraded && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
             <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
               <strong>Transparência total:</strong> Navegue à vontade! Você só paga a taxa de serviço quando um atendimento for contratado e finalizado.
             </p>
          </div>
        )}

        {/* Payment Methods Section */}
        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-400" />
              <span className="font-bold text-sm text-slate-700">Métodos de Pagamento</span>
            </div>
            <button 
              onClick={handleAddPaymentMethod}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-slate-50">
            {paymentMethods.map(method => (
              <div key={method.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm">
                    {method.brand === 'visa' ? '💙' : method.brand === 'mastercard' ? '🧡' : '💳'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {getBrandIcon(method.brand)} •••• {method.last_four}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Expira {method.exp_month?.toString().padStart(2, '0')}/{method.exp_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.is_default ? (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase">
                      Padrão
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Definir como padrão"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {!method.is_default && (
                    <button
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {paymentMethods.length === 0 && (
              <div className="p-6 text-center">
                <CreditCard className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhum cartão cadastrado</p>
                <button 
                  onClick={handleAddPaymentMethod}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Adicionar Cartão
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Caregiver Payout Info */}
        {user.role === 'caregiver' && (
          <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                💰 Dados para Recebimento
              </h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Banco</p>
                <p className="text-sm font-bold text-slate-700">Banco do Brasil</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Agência</p>
                  <p className="text-sm font-bold text-slate-700">1234-5</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Conta</p>
                  <p className="text-sm font-bold text-slate-700">••••••56-7</p>
                </div>
              </div>
              <button className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
                Atualizar Dados Bancários
              </button>
            </div>
          </section>
        )}

        {/* Menu Items */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <ProfileLink icon={<Bell />} label="Notificações e Alertas" />
          <ProfileLink icon={<Shield />} label="Segurança e Privacidade" />
          <ProfileLink icon={<Star />} label="Minhas Avaliações" />
        </div>

        <button 
          onClick={onLogout}
          className="w-full py-4 bg-white border border-red-100 text-red-500 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" /> Sair da Conta
        </button>

        <div className="text-center pt-4">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Hub Care v1.2.0</p>
          <p className="text-[10px] text-slate-300 mt-1">Navegação gratuita. Valorização profissional.</p>
        </div>
      </div>
    </div>
  );
};

const ProfileLink: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none text-left">
    <div className="flex items-center gap-3 text-slate-700">
      <div className="text-slate-400">{icon}</div>
      <span className="text-sm font-bold">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300" />
  </button>
);

export default ProfileView;
