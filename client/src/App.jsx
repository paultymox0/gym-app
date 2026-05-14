import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import UpdateBanner from './components/UpdateBanner';

const Login    = lazy(() => import('./pages/Login'));
const Hub      = lazy(() => import('./pages/Hub'));
const Session  = lazy(() => import('./pages/Session'));
const Profile  = lazy(() => import('./pages/Profile'));
const Tasks    = lazy(() => import('./pages/Tasks'));
const Projects = lazy(() => import('./pages/Projects'));
const Habits   = lazy(() => import('./pages/Habits'));
const Notes    = lazy(() => import('./pages/Notes'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const CyclePage = lazy(() => import('./pages/CyclePage'));

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

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)' }} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
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
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="w-10 h-10 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Suspense fallback={<PageLoader />}><AnimatedPage><Login /></AnimatedPage></Suspense>} />
        <Route path="/" element={<ProtectedRoute><AnimatedPage><Hub /></AnimatedPage></ProtectedRoute>} />
        <Route path="/session" element={<ProtectedRoute><AnimatedPage><Session /></AnimatedPage></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AnimatedPage><Profile /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><AnimatedPage><Tasks /></AnimatedPage></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><AnimatedPage><Projects /></AnimatedPage></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><AnimatedPage><Habits /></AnimatedPage></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><AnimatedPage><Notes /></AnimatedPage></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><AnimatedPage><Nutrition /></AnimatedPage></ProtectedRoute>} />
        <Route path="/cycle" element={<ProtectedRoute><AnimatedPage><CyclePage /></AnimatedPage></ProtectedRoute>} />
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
