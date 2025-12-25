
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../services/api';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/contact', formData);
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid lg:grid-cols-2 gap-20">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-6 leading-tight">Get in <span className="text-teal-600">Touch</span></h1>
          <p className="text-slate-600 text-lg mb-12">Our support team is available 24/7 to assist with your medical inquiries and technical difficulties.</p>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="bg-teal-50 p-4 rounded-2xl text-teal-600 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">Email Us</h4>
                <p className="text-slate-600">support@medicare.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-teal-50 p-4 rounded-2xl text-teal-600 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">Call Support</h4>
                <p className="text-slate-600">+1 (555) 010-9988</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-teal-50 p-4 rounded-2xl text-teal-600 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">Office Location</h4>
                <p className="text-slate-600">123 Healthcare Blvd, Medical Suite 500, NY 10001</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Full Name</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Email Address</label>
                <input 
                  type="email"
                  required
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Subject</label>
              <input 
                required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500" 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Message</label>
              <textarea 
                required
                rows={4}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500" 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />
            </div>
            <button 
              disabled={sending}
              className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              {sending ? 'Sending...' : <><Send size={18} /> Send Message</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
