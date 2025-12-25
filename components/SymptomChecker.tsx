import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Stethoscope, 
  ArrowRight,
  X,
  Activity
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  options?: string[];
}

interface SymptomCheckerProps {
  onClose: () => void;
}

const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: "Hello! I'm your AI Health Assistant. I can help analyze your symptoms and suggest potential causes. Please describe what you're feeling, or choose from common symptoms below.",
      options: ['Headache', 'Fever', 'Stomach Pain', 'Fatigue', 'Cough']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Handle Navigation Actions
    if (text === 'Book Appointment') {
      onClose();
      navigate('/book');
      return;
    }
    if (text === 'Back to start' || text === 'Check another symptom') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'user',
        text: text
      }, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: "Okay, let's start over. What symptoms are you experiencing?",
        options: ['Headache', 'Fever', 'Stomach Pain', 'Fatigue', 'Cough']
      }]);
      return;
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateResponse(text);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase();
    let responseText = "";
    let options: string[] | undefined = undefined;

    // --- HEADACHE BRANCH ---
    if (lowerInput.includes('headache')) {
      responseText = "Headaches can be caused by stress, dehydration, or lack of sleep. Is the pain throbbing, or is it a dull pressure?";
      options = ['Throbbing', 'Dull Pressure', 'Sharp Pain', 'Back of head'];
    } 
    else if (lowerInput.includes('throbbing')) {
      responseText = "⚠️ **Possible Cause:** Migraine\n\n" +
                     "🩺 **Recommended Action:** Rest in a dark, quiet room. Apply a cold compress to your forehead. Drink plenty of water.\n\n" +
                     "💊 **Common Medicines:** Ibuprofen (Advil), Excedrin Migraine.\n\n" +
                     "If symptoms persist for >24 hours, please see a doctor.";
      options = ['Book Appointment', 'Check another symptom'];
    }
    else if (lowerInput.includes('dull pressure')) {
      responseText = "⚠️ **Possible Cause:** Tension Headache\n\n" +
                     "🩺 **Recommended Action:** Gentle neck stretching, reduce screen time, and manage stress levels.\n\n" +
                     "💊 **Common Medicines:** Acetaminophen (Tylenol), Aspirin.\n\n" +
                     "Massage your temples gently to relieve pressure.";
      options = ['Book Appointment', 'Check another symptom'];
    }
    else if (lowerInput.includes('sharp pain')) {
      responseText = "⚠️ **Possible Cause:** Cluster Headache\n\n" +
                     "🩺 **Recommended Action:** Avoid alcohol and strong smells. Deep breathing exercises may help.\n\n" +
                     "💊 **Common Medicines:** Triptans (Prescription needed), Melatonin.\n\n" +
                     "❗ **Advice:** These can be severe. Consulting a specialist is highly recommended.";
      options = ['Book Appointment', 'Check another symptom'];
    }
    else if (lowerInput.includes('back of head')) {
      responseText = "⚠️ **Possible Cause:** Hypertension or Cervicogenic Headache\n\n" +
                     "🩺 **Recommended Action:** Check your blood pressure immediately. Improve posture.\n\n" +
                     "💊 **Common Medicines:** Muscle relaxants (if prescribed), Pain relievers.\n\n" +
                     "❗ **Warning:** If accompanied by vision changes, seek emergency care.";
      options = ['Book Appointment', 'Check another symptom'];
    }

    // --- FEVER BRANCH ---
    else if (lowerInput.includes('fever')) {
      responseText = "A fever often indicates your body is fighting an infection. Do you have other symptoms like chills, body aches, or a sore throat?";
      options = ['Yes, chills/aches', 'Sore throat', 'Just fever', 'Nausea'];
    }
    else if (lowerInput.includes('chills') || lowerInput.includes('aches')) {
      responseText = "⚠️ **Possible Cause:** Viral Influenza (Flu)\n\n" +
                     "🩺 **Recommended Action:** Complete bed rest, stay hydrated with electrolytes/soup.\n\n" +
                     "💊 **Common Medicines:** Paracetamol (for fever), Ibuprofen (for aches).\n\n" +
                     "Isolate yourself to prevent spreading the virus.";
      options = ['Book Appointment', 'Check another symptom'];
    }
    else if (lowerInput.includes('sore throat')) {
      responseText = "⚠️ **Possible Cause:** Strep Throat or Tonsillitis\n\n" +
                     "🩺 **Recommended Action:** Gargle with warm salt water. Drink warm tea with honey.\n\n" +
                     "💊 **Common Medicines:** Throat lozenges, Ibuprofen (for inflammation).\n\n" +
                     "❗ **Advice:** If white patches appear in throat, you may need antibiotics.";
      options = ['Book Appointment', 'Check another symptom'];
    }

    // --- STOMACH BRANCH ---
    else if (lowerInput.includes('stomach') || lowerInput.includes('pain')) {
      responseText = "Stomach pain can range from indigestion to more serious issues. Is the pain sharp or cramping, and have you eaten anything unusual recently?";
      options = ['Sharp pain', 'Cramping', 'Bloating', 'Nausea'];
    }
    else if (lowerInput.includes('cramping')) {
      responseText = "⚠️ **Possible Cause:** Indigestion, Gas, or Menstrual Cramps\n\n" +
                     "🩺 **Recommended Action:** Use a heating pad on your abdomen. Sip peppermint tea.\n\n" +
                     "💊 **Common Medicines:** Antacids (Tums), Buscopan (for cramps).\n\n" +
                     "Avoid spicy or heavy foods for 24 hours.";
      options = ['Book Appointment', 'Check another symptom'];
    }
    else if (lowerInput.includes('bloating')) {
      responseText = "⚠️ **Possible Cause:** Gastritis or IBS\n\n" +
                     "🩺 **Recommended Action:** Avoid dairy, gluten, and carbonated drinks temporarily.\n\n" +
                     "💊 **Common Medicines:** Simethicone (Gas-X), Probiotics.\n\n" +
                     "Eat smaller, more frequent meals.";
      options = ['Book Appointment', 'Check another symptom'];
    }

    // --- COUGH BRANCH ---
    else if (lowerInput.includes('cough') || lowerInput.includes('cold')) {
      responseText = "A cough can be viral or bacterial. Is it a dry cough or are you producing phlegm? How long have you had it?";
      options = ['Dry cough', 'Wet/Phlegm', 'More than a week', 'Just started'];
    }
    else if (lowerInput.includes('dry cough')) {
      responseText = "⚠️ **Possible Cause:** Allergies or Viral Infection\n\n" +
                     "🩺 **Recommended Action:** Use a humidifier. Avoid smoke and dust triggers.\n\n" +
                     "💊 **Common Medicines:** Antihistamines (Claritin), Cough Suppressants.\n\n" +
                     "Honey and lemon tea can soothe the throat.";
      options = ['Book Appointment', 'Check another symptom'];
    }
    else if (lowerInput.includes('wet') || lowerInput.includes('phlegm')) {
      responseText = "⚠️ **Possible Cause:** Bronchitis or Chest Infection\n\n" +
                     "🩺 **Recommended Action:** Steam inhalation. Stay upright while sleeping.\n\n" +
                     "💊 **Common Medicines:** Expectorants (Mucinex) to clear mucus.\n\n" +
                     "❗ **Advice:** If mucus is green/yellow or bloody, see a doctor immediately.";
      options = ['Book Appointment', 'Check another symptom'];
    }

    // --- FALLBACK ---
    else {
      responseText = "I see. While I can't provide a definitive diagnosis, persistent symptoms should be checked by a professional. Would you like to check another symptom or book a consultation?";
      options = ['Check another symptom', 'Book Appointment'];
    }

    return {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      text: responseText,
      options: options
    };
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
              <Bot className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tight flex items-center gap-2">
                AI Symptom Checker <Sparkles className="text-indigo-400" size={20} />
              </h2>
              <p className="text-slate-400 text-sm">Powered by Advanced Health Algorithms</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.type === 'user' ? 'bg-teal-600' : 'bg-indigo-600'
                }`}>
                  {msg.type === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                </div>
                
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.type === 'user' 
                      ? 'bg-teal-600/20 border border-teal-500/30 text-teal-100 rounded-tr-none' 
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  
                  {msg.options && (
                    <div className="flex flex-wrap gap-2">
                      {msg.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(option)}
                          className="px-4 py-2 bg-slate-800 border border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-300 text-sm font-semibold rounded-full transition-all flex items-center gap-2"
                        >
                          {option} <ArrowRight size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="animate-spin text-indigo-400" size={16} />
                  <span className="text-slate-400 text-sm font-medium">Analyzing symptoms...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(inputText)}
              placeholder="Describe your symptoms (e.g., 'I have a headache and fever')..."
              className="flex-1 bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-6 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Send size={20} />
              <span className="hidden sm:inline">Analyze</span>
            </button>
          </div>
          <p className="text-center text-slate-500 text-xs mt-4 flex items-center justify-center gap-2">
            <AlertCircle size={12} />
            Disclaimer: This is an AI assistant, not a doctor. For medical emergencies, call emergency services immediately.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SymptomChecker;
