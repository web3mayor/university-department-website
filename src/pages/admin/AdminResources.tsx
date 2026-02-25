import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Download, 
  FileText, 
  X, 
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface Resource {
  id: number;
  title: string;
  description: string;
  level: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadDate: string;
}

export default function AdminResources() {
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '100',
    file: null as File | null,
  });

  const showStatus = (type: string, message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const fetchResources = () => {
    fetch('/api/admin/resources', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResources();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('level', formData.level);
    if (formData.file) data.append('file', formData.file);

    const url = editingResource 
      ? `/api/admin/resources/${editingResource.id}` 
      : '/api/admin/resources';
    const method = editingResource ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (res.ok) {
        showStatus('success', `Resource ${editingResource ? 'updated' : 'uploaded'} successfully`);
        setIsModalOpen(false);
        setEditingResource(null);
        setFormData({ title: '', description: '', level: '100', file: null });
        fetchResources();
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.error || 'Failed to save resource');
      }
    } catch (err) {
      showStatus('error', 'An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchResources();
        showStatus('success', 'Resource deleted successfully');
      } else {
        showStatus('error', 'Failed to delete resource');
      }
    } catch (err) {
      showStatus('error', 'An error occurred');
    }
  };

  const handleEdit = (r: Resource) => {
    setEditingResource(r);
    setFormData({
      title: r.title,
      description: r.description,
      level: r.level,
      file: null
    });
    setIsModalOpen(true);
  };

  const handleDownload = async (r: Resource) => {
    const res = await fetch(`/api/materials/download/${r.filePath}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = r.fileName;
    a.click();
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || r.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Resources</h1>
          <p className="text-slate-500">Upload and manage official department resources</p>
        </div>
        <button
          onClick={() => {
            setEditingResource(null);
            setFormData({ title: '', description: '', level: '100', file: null });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span>Upload New</span>
        </button>
      </div>

      {status.message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center space-x-3 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{status.message}</span>
        </motion.div>
      )}

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
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

      {/* Resources Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading resources...</td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No resources found</td>
                </tr>
              ) : (
                filteredResources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{r.title}</div>
                          <div className="text-xs text-slate-400 max-w-[200px] truncate">{r.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                        {r.level} Level
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">{r.fileType}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {format(new Date(r.uploadDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleDownload(r)}
                          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(r)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
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

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingResource ? 'Edit Resource' : 'Upload New Resource'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Resource Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. SLT 101 Lecture Notes"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    placeholder="Briefly describe what this resource is about..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Academic Level</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {editingResource ? 'Replace File (Optional)' : 'Select File'}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required={!editingResource}
                      onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      className="hidden"
                      id="resource-file"
                    />
                    <label
                      htmlFor="resource-file"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-600 font-medium">
                        {formData.file ? formData.file.name : 'Click to choose file'}
                      </span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Supported: PDF, DOC, DOCX, PPT, PPTX, Images</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>{editingResource ? 'Update Resource' : 'Start Upload'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
