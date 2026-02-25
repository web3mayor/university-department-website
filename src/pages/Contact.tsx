import { motion } from 'motion/react';
import { MessageCircle, Users, ShieldCheck, ExternalLink, Phone } from 'lucide-react';

export default function Contact() {
  const whatsappLinks = [
    {
      title: 'WhatsApp Community',
      description: 'Join our broad department community for general updates and networking.',
      link: 'https://chat.whatsapp.com/example-community',
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      title: 'WhatsApp Group',
      description: 'Dedicated group for students to discuss academic matters and share resources.',
      link: 'https://chat.whatsapp.com/example-group',
      icon: MessageCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Contact Admin',
      description: 'Direct line to the department administrator for urgent inquiries and support.',
      link: 'https://wa.me/2348000000000',
      icon: ShieldCheck,
      color: 'bg-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4"
          >
            <Phone className="h-8 w-8 text-blue-600" />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Connect with the Department of SLT through our official WhatsApp channels for real-time updates and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whatsappLinks.map((item, index) => (
            <motion.a
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-100`}>
                <item.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {item.description}
              </p>
              <div className="flex items-center text-blue-600 font-bold text-sm space-x-2">
                <span>Connect Now</span>
                <ExternalLink className="h-4 w-4" />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-20 bg-slate-900 rounded-3xl p-10 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Need further assistance?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Our administrative office is open Monday to Friday, 8:00 AM - 4:00 PM. You can also visit us physically at the Science Laboratory Technology Building.
            </p>
            <div className="inline-flex items-center space-x-2 text-blue-400 font-medium">
              <MessageCircle className="h-5 w-5" />
              <span>Response time is usually within 24 hours.</span>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
