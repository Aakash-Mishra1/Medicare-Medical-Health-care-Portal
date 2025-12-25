
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Clock } from 'lucide-react';

const DoctorsList: React.FC = () => {
  const doctors = [
    { id: '1', name: 'Mohit', specialty: 'Cardiology', loc: 'Downtown', exp: 12, rating: 4.9, img: 'https://picsum.photos/200/200?random=1' },
    { id: '2', name: 'Shubham', specialty: 'Neurology', loc: 'North Wing', exp: 8, rating: 4.8, img: 'https://picsum.photos/200/200?random=2' },
    { id: '3', name: 'Vikash', specialty: 'Dermatology', loc: 'West Plaza', exp: 15, rating: 4.7, img: 'https://picsum.photos/200/200?random=3' },
    { id: '4', name: 'Aryan', specialty: 'Pediatrics', loc: 'Childrens Hospital', exp: 10, rating: 5.0, img: 'https://picsum.photos/200/200?random=4' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Find Your Specialist</h1>
        <p className="text-slate-500">Access top-tier healthcare professionals in your area.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-4 text-slate-400" />
          <input className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500" placeholder="Search by name or specialty..." />
        </div>
        <select className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 appearance-none">
          <option>All Locations</option>
          <option>Downtown</option>
          <option>North Wing</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {doctors.map(doc => (
          <div key={doc.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative mb-6">
              <img src={doc.img} alt={doc.name} className="w-full aspect-square object-cover rounded-2xl grayscale group-hover:grayscale-0 transition duration-500" />
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-black shadow-sm">
                <Star size={12} className="text-amber-500 fill-amber-500" /> {doc.rating}
              </div>
            </div>
            <h3 className="font-black text-slate-900 text-xl leading-tight mb-1">Dr. {doc.name}</h3>
            <p className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-4">{doc.specialty}</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <MapPin size={14} /> {doc.loc}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Clock size={14} /> {doc.exp} Years Exp.
              </div>
            </div>

            <Link to="/book" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-center hover:bg-teal-600 transition shadow-lg shadow-slate-100">
              Book Appointment
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
