import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Hash, 
  GraduationCap, 
  Calendar,
  X,
  Eye,
  CheckCircle,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  level: string;
  matricNumber: string;
  joinedDate: string;
}

export default function AdminUsers() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const showStatus = (type: string, message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        console.error("Failed to fetch students:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStudents();
        showStatus('success', 'Student account deleted successfully');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to delete student account');
      }
    } catch (err) {
      showStatus('error', 'An error occurred while deleting');
    } finally {
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Phone Number', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Matric Number', key: 'matricNumber', width: 20 },
    ];

    // Add rows
    filteredStudents.forEach(s => {
      worksheet.addRow({
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        email: s.email,
        level: s.level,
        matricNumber: s.matricNumber
      });
    });

    // Style the header row (bold)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Generate buffer and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'registered_students.xlsx');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Management</h1>
          <p className="text-slate-500">Manage and monitor registered student accounts</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-emerald-200 transition-all"
        >
          <Download className="h-5 w-5" />
          <span>Export to Excel</span>
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
            placeholder="Search by name or email..."
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

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Matric No.</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No students found</td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{s.firstName} {s.lastName}</div>
                          <div className="text-sm text-slate-500">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.matricNumber}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                        {s.level} Level
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {format(new Date(s.joinedDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setSelectedStudent(s)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => setStudentToDelete(s.id)}
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

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-10"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="bg-slate-900 p-8 text-white">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                    <p className="text-slate-400">{selectedStudent.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>Phone Number</span>
                  </div>
                  <div className="text-slate-900 font-medium">{selectedStudent.phone}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Hash className="h-3 w-3" />
                    <span>Matric Number</span>
                  </div>
                  <div className="text-slate-900 font-medium">{selectedStudent.matricNumber}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>Academic Level</span>
                  </div>
                  <div className="text-slate-900 font-medium">{selectedStudent.level} Level</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined Date</span>
                  </div>
                  <div className="text-slate-900 font-medium">{format(new Date(selectedStudent.joinedDate), 'MMMM d, yyyy')}</div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">Confirm Deletion</h2>
              <p className="text-slate-600 mb-6">Are you sure you want to delete this student account? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setStudentToDelete(null)}
                  className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(studentToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  Delete Student
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
