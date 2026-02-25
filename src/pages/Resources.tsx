import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

export default function Resources() {
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    fetch('/api/resources', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching resources:", err);
        setLoading(false);
      });
  }, [token]);

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
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                         r.description.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || r.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const levels = ['100', '200', '300', '400', '500'];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-12">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Academic Resources</h1>
            <p className="text-slate-500">Official department resources, lecture notes, and study guides</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-12 flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources by title or description..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-slate-400" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLevelFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  levelFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    levelFilter === level 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {level}L
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-64 rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
            <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-2xl mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 text-lg">No resources found for the selected criteria.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {levels.filter(l => levelFilter === 'all' || levelFilter === l).map(level => {
              const levelResources = filteredResources.filter(r => r.level === level);
              if (levelResources.length === 0) return null;

              return (
                <div key={level} className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-bold text-slate-900">{level} Level Resources</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levelResources.map((r, idx) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText className="h-6 w-6" />
                          </div>
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {r.fileType}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{r.title}</h3>
                        <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
                          {r.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center text-xs text-slate-400 space-x-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(r.uploadDate), 'MMM d, yyyy')}</span>
                          </div>
                          <button
                            onClick={() => handleDownload(r)}
                            className="flex items-center space-x-1 text-blue-600 font-bold text-sm hover:text-blue-700"
                          >
                            <span>Download</span>
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
