import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Activity, Star } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Health, Our Priority</h1>
          <p className="text-xl mb-8 opacity-90">Comprehensive healthcare management for patients and doctors.</p>
          <Link to="/register" className="bg-white text-teal-600 px-8 py-3 rounded-full font-bold hover:bg-slate-100 transition">
            Get Started
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <Calendar className="w-12 h-12 text-teal-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Easy Scheduling</h3>
          <p className="text-slate-600">Book appointments with top doctors instantly.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <ShieldCheck className="w-12 h-12 text-teal-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Secure Records</h3>
          <p className="text-slate-600">Your medical history is safe and encrypted.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
          <Activity className="w-12 h-12 text-teal-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Health Tracking</h3>
          <p className="text-slate-600">Monitor your vitals and health trends.</p>
        </div>
      </section>

      {/* Testimonial Snippet */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Patients Say</h2>
          <div className="bg-slate-50 p-6 rounded-xl max-w-2xl mx-auto">
            <p className="text-lg italic text-slate-700 mb-4">"The best healthcare platform I've ever used. Booking an appointment takes literally seconds."</p>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-bold">- Priya Sharma</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
