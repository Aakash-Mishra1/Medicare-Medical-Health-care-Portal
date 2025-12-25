import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Users, FileText, HelpCircle } from 'lucide-react';

const InfoPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.substring(1); // remove leading slash

  const getContent = (path: string) => {
    switch (path) {
      case 'about':
        return {
          title: 'Our Mission',
          icon: <Users size={48} className="text-teal-500" />,
          content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>At Medicare, we are dedicated to revolutionizing the healthcare experience. Our mission is to bridge the gap between patients and providers through innovative technology.</p>
              <p>We believe that quality healthcare should be accessible, efficient, and transparent. By leveraging cutting-edge digital solutions, we empower individuals to take control of their health journey while enabling medical professionals to focus on what they do best: caring for patients.</p>
            </div>
          )
        };
      case 'team':
        return {
          title: 'Leadership Team',
          icon: <Users size={48} className="text-blue-500" />,
          content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>Our team consists of world-class medical experts, technology veterans, and compassionate care coordinators.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Dr. Rajesh Verma</strong> - Chief Medical Officer</li>
                <li><strong>Priya Sharma</strong> - Head of Patient Experience</li>
                <li><strong>Amit Patel</strong> - Chief Technology Officer</li>
              </ul>
            </div>
          )
        };
      case 'careers':
        return {
          title: 'Join Our Team',
          icon: <Users size={48} className="text-purple-500" />,
          content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>We are always looking for passionate individuals to join our mission. If you want to make a real impact in healthcare, we want to hear from you.</p>
              <p className="font-bold">Open Positions:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Senior Full Stack Developer</li>
                <li>Clinical Data Analyst</li>
                <li>Customer Success Manager</li>
              </ul>
            </div>
          )
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <ShieldCheck size={48} className="text-green-500" />,
          content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>Your privacy is our top priority. We adhere to strict HIPAA guidelines and use bank-grade encryption to protect your personal health information.</p>
              <p>We do not sell your data to third parties. Your medical records are accessible only to you and your authorized healthcare providers.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText size={48} className="text-slate-500" />,
          content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>By using Medicare, you agree to our terms of service. These terms govern your use of our platform and services.</p>
              <p>Please read these terms carefully before accessing our services.</p>
            </div>
          )
        };
      case 'support':
        return {
          title: 'Support Center',
          icon: <HelpCircle size={48} className="text-amber-500" />,
          content: (
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>Need help? Our support team is available 24/7.</p>
              <p>Email: support@medicare.com</p>
              <p>Phone: +1 (555) 010-9988</p>
            </div>
          )
        };
      default:
        return {
          title: 'Information',
          icon: <FileText size={48} className="text-slate-400" />,
          content: <p className="text-slate-600">Content coming soon.</p>
        };
    }
  };

  const { title, icon, content } = getContent(path);

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 transition-colors font-bold">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
          <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
            <div className="p-4 bg-slate-50 rounded-2xl">
              {icon}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
          </div>
          
          <div className="prose prose-slate max-w-none">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
