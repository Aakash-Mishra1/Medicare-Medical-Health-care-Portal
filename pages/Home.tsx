
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Calendar, 
  Activity, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  HeartPulse, 
  Stethoscope, 
  Clock,
  Smartphone,
  User,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      text: "The best healthcare platform I've ever used. Booking an appointment takes literally seconds.",
      author: "Priya Sharma",
      role: "Patient",
    },
    {
      id: 2,
      text: "As a cardiologist, having all patient records in one secure place has transformed my practice.",
      author: "Dr. Rajesh Verma",
      role: "Cardiologist",
    },
    {
      id: 3,
      text: "Incredible support team and a very intuitive interface. Highly recommended for families.",
      author: "Anjali Gupta",
      role: "Mother of 2",
    }
  ]);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ author: '', role: '', text: '' });

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.author || !newFeedback.text) return;
    
    const newReview = {
      id: Date.now(),
      ...newFeedback
    };
    
    setReviews([newReview, ...reviews]);
    setShowModal(false);
    setNewFeedback({ author: '', role: '', text: '' });
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section with Modern Gradient & Glassmorphism */}
      <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:flex lg:items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 font-bold text-xs uppercase tracking-widest animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                The Future of Healthcare
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Healthcare <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 whitespace-nowrap">Re-imagined</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                Experience the next generation of medical care. Connect with top-tier specialists, access your records instantly, and take control of your well-being.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/register" className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 hover:-translate-y-1">
                  Get Started Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link to="/doctors" className="group bg-white text-teal-600 border-2 border-teal-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-teal-50 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
                  Find a Doctor
                  <SearchIcon className="group-hover:scale-110 transition-transform" />
                </Link>
              </div>

              <div className="pt-8 flex items-center gap-8 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-teal-500" size={18} />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-teal-500" size={18} />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-teal-500" size={18} />
                  <span>Top Specialists</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:w-1/2 relative group perspective-1000">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-teal-900/20 border-8 border-white transform rotate-2 group-hover:rotate-0 transition-all duration-700 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center h-[600px] group-hover:scale-[1.02] group-hover:shadow-teal-500/30">
                <Stethoscope size={300} className="text-white/20 animate-pulse group-hover:text-white/30 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={150} className="text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                {/* Floating Card 1 */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-4 animate-bounce-slow">
                  <div className="bg-green-100 p-3 rounded-xl text-green-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Patient Recovery</p>
                    <p className="text-lg font-black text-slate-900">+24%</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-400 rounded-full blur-2xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
            <div className="p-4 group cursor-default">
              <p className="text-4xl lg:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-teal-400">10k+</p>
              <p className="text-slate-400 font-medium group-hover:text-white transition-colors">Active Patients</p>
            </div>
            <div className="p-4 group cursor-default">
              <p className="text-4xl lg:text-5xl font-black text-teal-400 mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-white">500+</p>
              <p className="text-slate-400 font-medium group-hover:text-white transition-colors">Specialists</p>
            </div>
            <div className="p-4 group cursor-default">
              <p className="text-4xl lg:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-blue-400">98%</p>
              <p className="text-slate-400 font-medium group-hover:text-white transition-colors">Satisfaction Rate</p>
            </div>
            <div className="p-4 group cursor-default">
              <p className="text-4xl lg:text-5xl font-black text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:text-white">24/7</p>
              <p className="text-slate-400 font-medium group-hover:text-white transition-colors">Emergency Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">Why Choose Us</h2>
            <h3 className="text-4xl font-black text-slate-900 mb-6">Complete Healthcare Ecosystem</h3>
            <p className="text-slate-600 text-lg">We've built a platform that puts your health first, with tools designed for modern life.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Calendar size={32} />, 
                title: "Instant Scheduling", 
                desc: "Book appointments in seconds. No more waiting on hold.",
                color: "bg-blue-500",
                bg: "bg-blue-50"
              },
              { 
                icon: <ShieldCheck size={32} />, 
                title: "Secure Records", 
                desc: "Bank-grade encryption for your entire medical history.",
                color: "bg-teal-500",
                bg: "bg-teal-50"
              },
              { 
                icon: <Smartphone size={32} />, 
                title: "Telemedicine", 
                desc: "Consult with top doctors from the comfort of your home.",
                color: "bg-purple-500",
                bg: "bg-purple-50"
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 hover:border-teal-200">
                <div className={`h-32 ${feature.bg} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700`}>
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <div className={`${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {feature.icon}
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed mb-6">{feature.desc}</p>
                  <Link to="/register" className="inline-flex items-center gap-2 text-slate-900 font-bold group-hover:text-teal-600 transition-colors">
                    Learn more <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="grid lg:grid-cols-2">
              <div className="p-12 lg:p-20 flex flex-col justify-center relative z-10">
                <h3 className="text-4xl font-black text-white mb-6">For Patients</h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Take control of your health journey. Book appointments, view lab results, and chat with your doctor - all in one app.
                </p>
                <ul className="space-y-4 mb-10">
                  {['24/7 Access to Records', 'Instant Prescription Refills', 'Family Health Management'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white font-medium">
                      <div className="bg-teal-500/20 p-1 rounded-full">
                        <CheckCircle2 size={16} className="text-teal-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-center hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/25 hover:scale-105 active:scale-95">
                  Join as Patient
                </Link>
              </div>
              
              <div className="bg-slate-800 p-12 lg:p-20 flex flex-col justify-center relative z-10 border-t lg:border-t-0 lg:border-l border-slate-700">
                <h3 className="text-4xl font-black text-white mb-6">For Doctors</h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Streamline your practice. Manage appointments, patient records, and billing with our comprehensive suite of tools.
                </p>
                <ul className="space-y-4 mb-10">
                  {['Automated Scheduling', 'Digital Health Records (EHR)', 'Secure Patient Messaging'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white font-medium">
                      <div className="bg-blue-500/20 p-1 rounded-full">
                        <CheckCircle2 size={16} className="text-blue-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95">
                  Join as Doctor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-600 font-bold text-[10px] uppercase tracking-widest mb-4">
              <Star size={12} fill="currentColor" /> Community Trust
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Join the growing community of patients and providers transforming healthcare together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Calendar size={24} />, 
                title: "Instant Scheduling", 
                desc: "Book appointments in seconds. No more waiting on hold.",
                color: "bg-blue-500",
                link: "/appointments"
              },
              { 
                icon: <ShieldCheck size={24} />, 
                title: "Secure Records", 
                desc: "Bank-grade encryption for your entire medical history.",
                color: "bg-teal-500",
                link: "/records"
              },
              { 
                icon: <Smartphone size={24} />, 
                title: "Telemedicine", 
                desc: "Consult with top doctors from the comfort of your home.",
                color: "bg-purple-500",
                link: "/telemedicine"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
                <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-6">{feature.desc}</p>
                <Link to={feature.link} className="inline-flex items-center gap-2 text-slate-900 font-bold group-hover:gap-3 transition-all">
                  Learn more <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const SearchIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default Home;
