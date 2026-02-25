import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Search, Filter, Download, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  const showStatus = (type: string, message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    title: '',
    courseCode: '',
    level: '100',
    file: null as File | null,
  });

  const fetchMaterials = () => {
    fetch('/api/materials', {
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return;

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('courseCode', uploadData.courseCode);
    formData.append('level', uploadData.level);
    formData.append('file', uploadData.file);

    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setShowUpload(false);
      setUploadData({ title: '', courseCode: '', level: '100', file: null });
      fetchMaterials();
      showStatus('success', 'Material uploaded successfully!');
    } else {
      const errorData = await res.json();
      showStatus('error', errorData.error || 'Failed to upload material');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    const res = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchMaterials();
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                         m.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || m.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Course Materials</h1>
              <p className="text-slate-500">Access and share academic resources with your peers</p>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Material</span>
          </button>
        </div>

        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-center space-x-3 mb-8 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span className="font-medium">{status.message}</span>
          </motion.div>
        )}

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
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

        {/* Materials Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading materials...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-lg">No materials found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {m.courseCode}
                  </div>
                  <span className="text-xs text-slate-400">{m.level} Level</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{m.title}</h3>
                <p className="text-sm text-slate-500 mb-6">Uploaded by {m.uploaderName}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{format(new Date(m.uploadDate), 'MMM d, yyyy')}</span>
                  <div className="flex items-center space-x-2">
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <a
                      href={`/api/materials/download/${m.filePath}?token=${token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        fetch(`/api/materials/download/${m.filePath}`, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        })
                        .then(res => res.blob())
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = m.fileName;
                          a.click();
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative"
            >
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Upload Material</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Course Code</label>
                    <input
                      required
                      placeholder="e.g. CSC 101"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={uploadData.courseCode}
                      onChange={(e) => setUploadData({ ...uploadData, courseCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Level</label>
                    <select
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={uploadData.level}
                      onChange={(e) => setUploadData({ ...uploadData, level: e.target.value })}
                    >
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                      <option value="500">500</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">PDF File</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all mt-4"
                >
                  Upload Now
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
