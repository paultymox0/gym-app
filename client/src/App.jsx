import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import UpdateBanner from './components/UpdateBanner';
import Login from './pages/Login';
import Hub from './pages/Hub';
import Session from './pages/Session';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Habits from './pages/Habits';
import Notes from './pages/Notes';

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const accent = user?.color || '#00FF88';

  return (
    <div
      className="max-w-md mx-auto relative min-h-screen"
      style={{ '--accent': accent, '--accent-dim': `${accent}50`, '--accent-faint': `${accent}22` }}
    >
      {children}
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07070F]">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/" element={<ProtectedRoute><AnimatedPage><Hub /></AnimatedPage></ProtectedRoute>} />
        <Route path="/session" element={<ProtectedRoute><AnimatedPage><Session /></AnimatedPage></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AnimatedPage><Profile /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><AnimatedPage><Tasks /></AnimatedPage></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><AnimatedPage><Projects /></AnimatedPage></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><AnimatedPage><Habits /></AnimatedPage></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><AnimatedPage><Notes /></AnimatedPage></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <UpdateBanner />
      </AuthProvider>
    </BrowserRouter>
  );
}
