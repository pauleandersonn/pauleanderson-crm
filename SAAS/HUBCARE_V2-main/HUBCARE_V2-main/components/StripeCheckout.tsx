import React, { useState } from 'react';
import { 
  CreditCard, 
  X, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  amount: number;
  description: string;
  caregiverName: string;
}

// Simulated Stripe Elements component
// In production, use @stripe/react-stripe-js
const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  description,
  caregiverName,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    // Validate fields
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Número do cartão inválido');
      setIsProcessing(false);
      return;
    }
    if (!expiry || expiry.length < 5) {
      setError('Data de expiração inválida');
      setIsProcessing(false);
      return;
    }
    if (!cvc || cvc.length < 3) {
      setError('CVC inválido');
      setIsProcessing(false);
      return;
    }
    if (!name) {
      setError('Nome no cartão é obrigatório');
      setIsProcessing(false);
      return;
    }

    // Simulate payment processing
    // In production, call your backend to create PaymentIntent
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    const fakePaymentIntentId = `pi_${Date.now()}_simulated`;
    setSuccess(true);
    
    setTimeout(() => {
      onSuccess(fakePaymentIntentId);
      onClose();
    }, 1500);
  };

  const platformFee = amount * 0.15; // 15% platform fee
  const netAmount = amount - platformFee;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Pagamento Confirmado!</h3>
          <p className="text-sm text-slate-500 mt-2">
            O atendimento foi contratado com sucesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Pagamento</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Transação Segura
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Atendimento</span>
              <span className="font-bold text-slate-800">{caregiverName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{description}</span>
              <span className="font-bold text-slate-800">
                R$ {amount.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600">Taxa de serviço (15%)</span>
              <span className="text-sm text-slate-500">
                R$ {platformFee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800">Total</span>
              <span className="text-lg font-extrabold text-emerald-600">
                R$ {amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Número do Cartão
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Validade
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                CVC
              </label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nome no Cartão
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pagar R$ {amount.toFixed(2)}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-medium">
              Pagamento processado com segurança via Stripe
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripeCheckout;
