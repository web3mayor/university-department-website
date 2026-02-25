import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowLeft, Megaphone, User } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: number;
  title: string;
  body: string;
  date: string;
  category: string;
  imagePath: string | null;
}

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/announcements/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setAnnouncement(data);
        setLoading(false);
      })
      .catch(() => {
        navigate('/news');
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading article...</div>
      </div>
    );
  }

  if (!announcement) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/news" 
          className="inline-flex items-center space-x-2 text-slate-500 hover:text-blue-600 font-medium mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to News</span>
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200"
        >
          {announcement.imagePath && (
            <div className="w-full h-[400px] overflow-hidden">
              <img 
                src={`/uploads/${announcement.imagePath}`} 
                alt={announcement.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-center space-x-4 mb-8">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                announcement.category === 'News' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {announcement.category}
              </span>
              <div className="flex items-center text-sm text-slate-400 font-medium space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(announcement.date), 'MMMM do, yyyy')}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
              {announcement.title}
            </h1>

            <div className="prose prose-slate lg:prose-xl max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {announcement.body}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Department Admin</div>
                  <div className="text-xs text-slate-500">Official Communication</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-blue-600">
                <Megaphone className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">SLT Updates</span>
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
