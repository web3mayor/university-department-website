import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  FileText,
  User,
  Calendar,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface Material {
  id: number;
  title: string;
  courseCode: string;
  level: string;
  fileName: string;
  filePath: string;
  uploaderName: string;
  uploadDate: string;
}

export default function AdminMaterials() {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [status, setStatus] = useState({ type: '', message: '' });

  const showStatus = (type: string, message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const fetchMaterials = () => {
    fetch('/api/admin/materials', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMaterials(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMaterials();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMaterials();
        showStatus('success', 'Material deleted successfully');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to delete material');
      }
    } catch (err) {
      showStatus('error', 'An error occurred while deleting');
    }
  };

  const handleDownload = async (m: Material) => {
    const res = await fetch(`/api/materials/download/${m.filePath}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = m.fileName;
    a.click();
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                         m.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || m.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Course Materials Management</h1>
        <p className="text-slate-500">Moderate and manage all academic resources</p>
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

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or course code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="500">500 Level</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Material</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Uploader</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading materials...</td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No materials found</td>
                </tr>
              ) : (
                filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{m.title}</div>
                          <div className="text-xs text-slate-400 font-mono">{m.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{m.courseCode}</span>
                        <span className="text-xs text-slate-400">{m.level} Level</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{m.uploaderName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(m.uploadDate), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleDownload(m)}
                          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
