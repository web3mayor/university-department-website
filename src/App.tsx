import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Materials from './pages/Materials';
import Contact from './pages/Contact';
import Resources from './pages/Resources';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMaterials from './pages/admin/AdminMaterials';
import AdminNews from './pages/admin/AdminNews';
import AdminResources from './pages/admin/AdminResources';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Login - Completely separate */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Panel - Protected */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/materials" element={<AdminMaterials />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/news" element={<AdminNews />} />
            </Route>
          </Route>

          {/* Student Facing Website */}
          <Route path="*" element={
            <div className="min-h-screen bg-slate-50 flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Protected Student Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/materials" element={<Materials />} />
                    <Route path="/resources" element={<Resources />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <p>&copy; {new Date().getFullYear()} Department of Science Laboratory Technology. All rights reserved.</p>
                  <p className="text-xs mt-2">Empowering the next generation of laboratory scientists.</p>
                </div>
              </footer>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
