
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, X, MessageSquare, Sparkles, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Message } from '../types';
import { Socket } from 'socket.io-client';
import api from '../services/api';

interface ChatHubProps {
  socket: Socket | null;
  receiverEmail: string;
  receiverName: string;
  onClose: () => void;
  isOnline: boolean;
}

const ChatHub: React.FC<ChatHubProps> = ({ socket, receiverEmail, receiverName, onClose, isOnline }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate a unified key for the clinical vault so both doctor and patient access the same data
  const getVaultKey = () => {
    if (!user?.email || !receiverEmail) return 'chat_guest';
    const participants = [user.email, receiverEmail].sort();
    return `clinical_vault_chat_${participants[0]}_${participants[1]}`;
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      const vaultKey = getVaultKey();
      
      // 1. Try to sync with Global Vault (localStorage acting as simulated DB)
      const globalVault = JSON.parse(localStorage.getItem(vaultKey) || '[]');
      
      // 2. Placeholder for real API synchronization
      try {
        // Attempt to fetch from backend if endpoint exists (standard WhatsApp/MERN behavior)
        const res = await api.get(`/messages/${receiverEmail}`);
        if (res.data && res.data.messages) {
          const apiMessages = res.data.messages;
          // Merge and de-duplicate
          const combined = [...globalVault, ...apiMessages];
          const unique = Array.from(new Map(combined.map(m => [m._id, m])).values());
          setMessages(unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
          localStorage.setItem(vaultKey, JSON.stringify(unique));
          return;
        }
      } catch (e) {
        // Fallback to local vault if network/API fails
        setMessages(globalVault);
      }
    };

    fetchChatHistory();
  }, [receiverEmail, user?.email]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      // Check if message belongs to this conversation
      const isRelevant = 
        (msg.senderEmail === receiverEmail && msg.receiverEmail === user?.email) ||
        (msg.senderEmail === user?.email && msg.receiverEmail === receiverEmail);

      if (isRelevant) {
        setMessages(prev => {
          // Prevent duplicates from multiple event triggers
          if (prev.find(m => m._id === msg._id)) return prev;
          
          const updated = [...prev, msg].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          localStorage.setItem(getVaultKey(), JSON.stringify(updated));
          return updated;
        });
      }
    };

    socket.on('receive_direct_message', handleNewMessage);
    return () => { socket.off('receive_direct_message'); };
  }, [socket, receiverEmail, user?.email]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const newMsg: Message = {
      _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderEmail: user.email,
      senderName: user.username,
      receiverEmail: receiverEmail,
      text: inputText,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Emit via Socket for real-time delivery
    if (socket && isOnline) {
      socket.emit('send_direct_message', newMsg);
    }

    // Attempt API persistence
    try {
      await api.post('/messages', newMsg);
    } catch (e) {
      console.warn("API Persistence unavailable. Securing in local clinical vault.");
    }

    // Persist to unified local vault immediately for "switch account" visibility
    const vaultKey = getVaultKey();
    setMessages(prev => {
      const updated = [...prev, newMsg];
      localStorage.setItem(vaultKey, JSON.stringify(updated));
      return updated;
    });

    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 w-[280px] sm:w-[310px] h-[400px] bg-white rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(15,23,42,0.3)] border border-slate-100 flex flex-col z-[300] overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-teal-500 p-2 rounded-xl text-white">
              <User size={16} />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
          </div>
          <div>
            <h4 className="text-white font-black text-xs italic tracking-tight truncate max-w-[120px]">{receiverName}</h4>
            <p className="text-[7px] font-black text-teal-400 uppercase tracking-widest">{isOnline ? 'Link Active' : 'Sync Latency'}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="bg-white p-3 rounded-2xl mb-3 shadow-sm border border-slate-100">
              <MessageSquare className="text-teal-500" size={24} />
            </div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Secure Link Established</p>
            <p className="text-slate-500 text-[10px] leading-relaxed font-medium italic">Chat history is synchronized via clinical vault.</p>
          </div>
        )}
        
        {messages.map((m) => {
          const isMe = m.senderEmail === user?.email;
          return (
            <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] p-3 rounded-[1.2rem] text-[11px] font-medium shadow-sm leading-relaxed ${
                isMe 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {m.text}
                <div className={`text-[7px] mt-1 font-black uppercase tracking-widest opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-[1.5rem] border-2 border-transparent focus-within:border-teal-500 focus-within:bg-white transition-all shadow-inner">
          <input 
            type="text" 
            placeholder="Secure message..." 
            className="flex-1 bg-transparent border-none outline-none px-3 py-1.5 text-[11px] font-bold text-slate-800 placeholder:text-slate-400"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="bg-teal-600 text-white p-2 rounded-xl hover:bg-teal-700 transition disabled:opacity-30 shadow-md active:scale-95"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHub;
