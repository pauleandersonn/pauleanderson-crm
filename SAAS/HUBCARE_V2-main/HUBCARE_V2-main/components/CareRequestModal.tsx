import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Home, 
  Hospital,
  FileText,
  DollarSign,
  Send,
  Navigation
} from 'lucide-react';
import { CaregiverProfile, ShiftType, CareType, ContractType } from '../types';

interface CareRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CareRequestFormData) => void;
  caregiver: CaregiverProfile;
  userLocation?: { latitude: number; longitude: number } | null;
}

export interface CareRequestFormData {
  patient_name: string;
  patient_age: number;
  care_type: CareType;
  shift: ShiftType;
  contract_type: ContractType;
  city: string;
  district: string;
  address: string;
  notes: string;
  agreed_value?: number;
}

const CareRequestModal: React.FC<CareRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  caregiver,
  userLocation,
}) => {
  const [formData, setFormData] = useState<CareRequestFormData>({
    patient_name: '',
    patient_age: 0,
    care_type: 'domiciliar',
    shift: 'diurno',
    contract_type: 'diaria',
    city: '',
    district: '',
    address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patient_name.trim()) {
      newErrors.patient_name = 'Nome do paciente é obrigatório';
    }
    if (!formData.patient_age || formData.patient_age < 0) {
      newErrors.patient_age = 'Idade inválida';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }
    if (!formData.district.trim()) {
      newErrors.district = 'Bairro é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const estimatedValue = (() => {
    const baseRate = caregiver.price_hour || 45;
    switch (formData.contract_type) {
      case 'diaria':
        return formData.shift === '24h' ? baseRate * 24 : baseRate * 12;
      case 'semanal':
        return baseRate * 12 * 7;
      case 'mensal':
        return baseRate * 12 * 30;
      default:
        return baseRate * 12;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <img 
              src={caregiver.avatar} 
              alt={caregiver.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-bold text-slate-800">{caregiver.name}</h3>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                R$ {caregiver.price_hour}/hora
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Patient Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dados do Paciente
            </h4>
            
            <div className="space-y-2">
              <input
                type="text"
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                placeholder="Nome completo do paciente"
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                  errors.patient_name ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.patient_name && (
                <span className="text-xs text-red-500">{errors.patient_name}</span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="number"
                value={formData.patient_age || ''}
                onChange={(e) => setFormData({ ...formData, patient_age: parseInt(e.target.value) || 0 })}
                placeholder="Idade"
                min={0}
                max={120}
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                  errors.patient_age ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {errors.patient_age && (
                <span className="text-xs text-red-500">{errors.patient_age}</span>
              )}
            </div>
          </div>

          {/* Care Type */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tipo de Atendimento
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, care_type: 'domiciliar' })}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.care_type === 'domiciliar'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Home className={`w-6 h-6 ${formData.care_type === 'domiciliar' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${formData.care_type === 'domiciliar' ? 'text-emerald-700' : 'text-slate-600'}`}>
                  Domiciliar
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, care_type: 'hospitalar' })}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.care_type === 'hospitalar'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Hospital className={`w-6 h-6 ${formData.care_type === 'hospitalar' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${formData.care_type === 'hospitalar' ? 'text-emerald-700' : 'text-slate-600'}`}>
                  Hospitalar
                </span>
              </button>
            </div>
          </div>

          {/* Shift & Contract */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Turno
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as ShiftType })}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="diurno">Diurno</option>
                <option value="noturno">Noturno</option>
                <option value="24h">24 horas</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Contrato
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as ContractType })}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="diaria">Diária</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localização
              </h4>
              {userLocation && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Localização detectada
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cidade"
                  className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    errors.city ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Bairro"
                  className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    errors.district ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
              </div>
            </div>
            
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Endereço completo (opcional)"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações importantes sobre o paciente, condições especiais, etc."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          {/* Estimated Value */}
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Valor Estimado</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-emerald-700">
                  R$ {estimatedValue.toFixed(2)}
                </span>
                <span className="block text-[10px] text-emerald-600 font-bold">
                  /{formData.contract_type}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-emerald-600 mt-2">
              * Valor sugerido baseado na taxa horária. Valor final a combinar.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Solicitação
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            O cuidador receberá sua solicitação e poderá aceitar ou recusar.
            <br />Você só paga após a confirmação do atendimento.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CareRequestModal;
