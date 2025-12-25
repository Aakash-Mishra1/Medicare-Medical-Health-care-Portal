
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, X, Sparkles, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GeminiBot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "You are 'HealthSync AI', a helpful medical assistant for Medicare. You provide general health information, answer simple medical questions, and guide users on how to use the portal. Always remind users to consult with their actual doctors for specific medical advice. Be concise, empathetic, and professional.",
        },
      });
      
      // Initial greeting
      setMessages([{ role: 'model', text: `Hi ${user?.username}! How can I help?` }]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatRef.current) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      const text = result.text;
      setMessages(prev => [...prev, { role: 'model', text: text || "Error processing request." }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "AI Link Down." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Bubble - Micro version */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 bg-slate-900 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all z-[250] ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative">
          <Bot size={22} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full animate-ping border-2 border-slate-900"></div>
        </div>
      </button>

      {/* Chat Bot Window - Ultracompact version */}
      <div className={`fixed bottom-4 right-4 w-[280px] sm:w-[310px] h-[400px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] border border-slate-100 flex flex-col z-[400] overflow-hidden transition-all duration-500 transform ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        {/* Header - Minimalist */}
        <div className="bg-slate-900 p-4 flex justify-between items-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-teal-50 p-1.5 rounded-lg text-white shadow-lg ring-2 ring-teal-500/5">
              <Sparkles size={14} />
            </div>
            <div>
              <h4 className="text-white font-black text-sm italic tracking-tighter leading-none">HealthSync AI</h4>
              <p className="text-[7px] font-black text-teal-400 uppercase tracking-[0.1em] mt-0.5">Active</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg relative z-10">
            <X size={18} />
          </button>
        </div>

        {/* Messaging Area - Tight padding */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[92%] p-3 rounded-[1.2rem] text-[11px] font-medium shadow-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-2 rounded-[1rem] rounded-tl-none flex items-center gap-2 shadow-sm">
                <HeartPulse size={12} className="text-teal-500 animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-[0.05em] text-slate-400">Thinking</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area - Smallest workable size */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-[1.5rem] border-2 border-transparent focus-within:border-teal-500 focus-within:bg-white transition-all shadow-inner">
            <input 
              type="text" 
              placeholder="Ask me..." 
              className="flex-1 bg-transparent border-none outline-none px-3 py-1.5 text-[11px] font-bold text-slate-800 placeholder:text-slate-400"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="bg-teal-600 text-white p-2 rounded-xl hover:bg-teal-700 transition disabled:opacity-30 shadow-md active:scale-95"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[6px] text-center mt-2 text-slate-400 font-black uppercase tracking-widest opacity-60 italic leading-none">AI assistance only. Always consult medical staff.</p>
        </div>
      </div>
    </>
  );
};

export default GeminiBot;
