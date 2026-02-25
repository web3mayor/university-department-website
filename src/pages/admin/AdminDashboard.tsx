import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileText, 
  Megaphone, 
  Bell,
  TrendingUp,
  History,
  Save,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  totalStudents: number;
  totalMaterials: number;
  totalNews: number;
  totalAnnouncements: number;
  totalResources: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const historyRes = await fetch('/api/history');
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData.history);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, [token]);

  const handleUpdateHistory = async () => {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ history })
    });
    if (res.ok) {
      showStatus('success', 'Department history updated successfully!');
    }
  };

  const showStatus = (type: string, message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const statCards = [
    { name: 'Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500' },
    { name: 'Resources', value: stats?.totalResources || 0, icon: FileText, color: 'bg-emerald-500' },
    { name: 'Materials', value: stats?.totalMaterials || 0, icon: FileText, color: 'bg-indigo-500' },
    { name: 'News Posts', value: stats?.totalNews || 0, icon: Megaphone, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back to the SLT Admin Portal</p>
      </div>

      {status.message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center space-x-3 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">{status.message}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-xl shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-slate-300" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{card.value}</div>
            <div className="text-sm text-slate-500 font-medium">{card.name}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <History className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Department History</h2>
            </div>
            <textarea
              className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none mb-4"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="Write the department history here..."
            />
            <button
              onClick={handleUpdateHistory}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
            >
              <Save className="h-5 w-5" />
              <span>Update History</span>
            </button>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between group">
                <span className="font-medium text-slate-700">Export Student List</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between group">
                <span className="font-medium text-slate-700">System Logs</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
