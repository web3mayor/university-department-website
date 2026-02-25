import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, Award } from 'lucide-react';

export default function Home() {
  const [history, setHistory] = useState('');

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setHistory(data.history));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-slate-900 z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1920")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Department of SLT</h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 font-light">
            Empowering the next generation of leaders, thinkers, and innovators through world-class education and research.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span>Academic Rigor</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span>Vibrant Community</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-400" />
              <span>Global Recognition</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* History Section */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="md:w-1/3 sticky top-24">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-4">Our Legacy</h2>
            <p className="text-slate-500 italic">A journey through time, shaping the future of our discipline.</p>
          </div>
          <div className="md:w-2/3">
            <div className="prose prose-slate lg:prose-xl max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {history}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">3+</div>
            <div className="text-slate-500 uppercase text-xs tracking-widest font-semibold">Years of History</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">600+</div>
            <div className="text-slate-500 uppercase text-xs tracking-widest font-semibold">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
            <div className="text-slate-500 uppercase text-xs tracking-widest font-semibold">Expert Faculty</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-slate-500 uppercase text-xs tracking-widest font-semibold">Graduate Success</div>
          </div>
        </div>
      </section>
    </div>
  );
}
