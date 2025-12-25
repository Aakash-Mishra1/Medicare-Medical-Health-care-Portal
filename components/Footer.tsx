import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-teal-500 p-2 rounded-xl">
                <HeartPulse size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight italic">Medicare</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              Pioneering the future of digital healthcare management. Secure, efficient, and patient-centric solutions for modern medical needs.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer"><span className="font-bold text-xs">fb</span></div>
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer"><span className="font-bold text-xs">tw</span></div>
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer"><span className="font-bold text-xs">in</span></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6 text-teal-500">About Us</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={12} /> Our Mission</Link></li>
              <li><Link to="/team" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={12} /> Leadership Team</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={12} /> Careers</Link></li>
              <li><Link to="/press" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={12} /> Press & Media</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-teal-500">Legal</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={12} /> Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={12} /> Terms of Service</Link></li>
              <li><Link to="/cookie" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight size={12} /> Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">© 2025 Medicare. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-bold text-slate-500">
            <Link to="/support" className="hover:text-teal-500 transition-colors">Support</Link>
            <Link to="/contact" className="hover:text-teal-500 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
