import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  caregiverName: string;
  patientName: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  caregiverName,
  patientName,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    await onSubmit(rating, comment);
    setIsSubmitting(false);
    setRating(0);
    setComment('');
  };

  const ratingLabels = [
    '',
    'Muito Ruim',
    'Ruim',
    'Regular',
    'Bom',
    'Excelente'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Avaliar Atendimento</h3>
            <p className="text-xs text-slate-500 mt-0.5">Atendimento de {patientName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Caregiver Info */}
          <div className="text-center">
            <p className="text-sm text-slate-600">Como foi o atendimento de</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{caregiverName}?</p>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoverRating || rating) > 0 && (
              <span className="text-sm font-bold text-amber-600 animate-in fade-in duration-200">
                {ratingLabels[hoverRating || rating]}
              </span>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className={`flex-[2] py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              rating === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Avaliação
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
