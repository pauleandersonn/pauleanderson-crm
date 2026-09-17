
import React, { useState, useEffect, useRef } from 'react';
import { CareRequest, CaregiverProfile, ChatMessage, User } from '../types';
import { Send, ChevronLeft, MessageCircle, Bell, Loader2 } from 'lucide-react';
import { 
  fetchMessages, 
  sendMessage, 
  subscribeToMessages, 
  markMessagesAsRead,
  getUnreadMessageCount,
  unsubscribe 
} from '../services/messageService';

interface MessagesViewProps {
  requests: CareRequest[];
  caregivers: CaregiverProfile[];
  messages: ChatMessage[];
  onSendMessage: (reqId: string, text: string) => void;
  user?: User;
}

const MessagesView: React.FC<MessagesViewProps> = ({ 
  requests, 
  caregivers, 
  messages: initialMessages, 
  onSendMessage,
  user 
}) => {
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRequests = requests.filter(r => r.status === 'accepted');

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for active request
  useEffect(() => {
    if (activeRequestId) {
      const loadMessages = async () => {
        setIsLoading(true);
        const realMessages = await fetchMessages(activeRequestId);
        
        if (realMessages.length > 0) {
          setMessages(realMessages);
        } else {
          // Fall back to initial messages for this request
          setMessages(initialMessages.filter(m => m.request_id === activeRequestId));
        }
        
        // Mark as read
        if (user) {
          await markMessagesAsRead(activeRequestId, user.id);
          setUnreadCounts(prev => ({ ...prev, [activeRequestId]: 0 }));
        }
        
        setIsLoading(false);
      };
      
      loadMessages();
    }
  }, [activeRequestId, initialMessages, user]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!activeRequestId) return;

    const channel = subscribeToMessages(activeRequestId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      
      // Show notification if message is from other user
      if (user && newMessage.sender_id !== user.id) {
        setHasNewMessage(true);
        
        // Play notification sound (optional)
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}
        
        // Mark as read since we're viewing the chat
        markMessagesAsRead(activeRequestId, user.id);
      }
    });

    return () => unsubscribe(channel);
  }, [activeRequestId, user]);

  // Load unread counts
  useEffect(() => {
    const loadUnreadCounts = async () => {
      if (!user) return;
      
      const counts: Record<string, number> = {};
      for (const req of activeRequests) {
        const count = await getUnreadMessageCount(user.id, [req.id]);
        if (count > 0) {
          counts[req.id] = count;
        }
      }
      setUnreadCounts(counts);
    };

    loadUnreadCounts();
  }, [activeRequests, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRequestId || !user) return;

    setIsSending(true);
    
    // Optimistic update
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      request_id: activeRequestId,
      sender_id: user.id,
      text: inputText,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);
    setInputText('');

    // Send to Supabase
    const { data, error } = await sendMessage(activeRequestId, user.id, inputText);
    
    if (data) {
      // Replace temp message with real one
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? data : m
      ));
    } else if (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      console.error('Failed to send message:', error);
    }

    // Call parent handler for backwards compatibility
    onSendMessage(activeRequestId, tempMessage.text);
    
    setIsSending(false);
  };

  if (activeRequestId) {
    const currentRequest = requests.find(r => r.id === activeRequestId);
    const caregiver = caregivers.find(c => c.id === currentRequest?.caregiver_id || c.user_id === currentRequest?.caregiver_id);
    const chatHistory = messages.filter(m => m.request_id === activeRequestId);

    // Determine if current user is caregiver or family
    const isCaregiver = user?.id === currentRequest?.caregiver_id;
    const chatPartnerName = isCaregiver ? 'Família' : caregiver?.name || 'Cuidador';
    const chatPartnerAvatar = isCaregiver 
      ? `https://ui-avatars.com/api/?name=Familia` 
      : caregiver?.avatar || `https://ui-avatars.com/api/?name=C`;

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 animate-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="p-4 bg-white border-b flex items-center gap-3 shadow-sm sticky top-0 z-10">
          <button onClick={() => setActiveRequestId(null)} className="p-1 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <img src={chatPartnerAvatar} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-sm">{chatPartnerName}</h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              {currentRequest?.patient_name}
            </span>
          </div>
          {hasNewMessage && (
            <div className="p-2 bg-emerald-100 rounded-full animate-pulse">
              <Bell className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">Nenhuma mensagem ainda.</p>
              <p className="text-slate-300 text-xs">Comece a conversa!</p>
            </div>
          ) : (
            <>
              {chatHistory.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender_id === user?.id 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.text}
                    <div className={`text-[9px] mt-1 opacity-60 text-right ${
                      msg.sender_id === user?.id ? 'text-emerald-100' : 'text-slate-400'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setHasNewMessage(false);
            }}
            placeholder="Mensagem..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
          <button 
            type="submit" 
            disabled={isSending || !inputText.trim()}
            className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Mensagens</h2>
        <p className="text-xs text-slate-500">Converse com cuidadores contratados</p>
      </div>

      <div className="space-y-3">
        {activeRequests.length > 0 ? (
          activeRequests.map(req => {
            const caregiver = caregivers.find(c => c.id === req.caregiver_id || c.user_id === req.caregiver_id);
            const lastMsg = initialMessages.filter(m => m.request_id === req.id).pop();
            const unreadCount = unreadCounts[req.id] || 0;
            
            return (
              <button 
                key={req.id} 
                onClick={() => setActiveRequestId(req.id)}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:border-emerald-200 transition-all text-left relative"
              >
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                  </div>
                )}
                <img src={caregiver?.avatar || `https://ui-avatars.com/api/?name=C`} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-slate-800">{caregiver?.name || 'Cuidador'}</h4>
                    <span className="text-[10px] text-slate-400">
                      {lastMsg ? new Date(lastMsg.created_at).toLocaleDateString() : 'Hoje'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 italic font-medium">
                    {lastMsg ? lastMsg.text : 'Nenhuma mensagem ainda.'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    Paciente: {req.patient_name}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="px-10">
              <h4 className="text-slate-800 font-bold">Nenhum chat ativo</h4>
              <p className="text-slate-400 text-xs mt-1">O chat é liberado automaticamente assim que o cuidador aceita sua solicitação.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
