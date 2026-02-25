import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Calendar, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

interface Announcement {
  id: number;
  title: string;
  body: string;
  date: string;
  category: string;
  imagePath: string | null;
}

export default function News() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const fetchAnnouncements = () => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
    setPostToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-4 mb-12">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Megaphone className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">News & Announcements</h1>
            <p className="text-slate-500">Stay updated with the latest from the Department of SLT</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading updates...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-lg">No news or announcements posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {announcements.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col md:flex-row">
                  {item.imagePath && (
                    <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                      <img 
                        src={`/uploads/${item.imagePath}`} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className={`p-8 md:p-10 flex-grow ${item.imagePath ? 'md:w-3/5' : 'w-full'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.category === 'News' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.category}
                        </span>
                        <div className="flex items-center text-xs text-slate-400 font-medium space-x-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(item.date), 'MMMM do, yyyy')}</span>
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => setPostToDelete(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h2>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-1">
                      {item.body}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <Link 
                        to={`/news/${item.id}`}
                        className="text-blue-600 font-bold text-sm flex items-center space-x-2 hover:space-x-3 transition-all"
                      >
                        <span>Read More</span>
                        <div className="h-px w-4 bg-blue-600" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {postToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Deletion</h2>
              <p className="text-slate-600 mb-6">Are you sure you want to delete this announcement? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setPostToDelete(null)}
                  className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(postToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  Delete Announcement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
