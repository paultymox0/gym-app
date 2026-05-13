import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Briefcase, Zap, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Hub', icon: Home },
  { path: '/tasks', label: 'Tareas', icon: CheckSquare },
  { path: '/projects', label: 'Proyectos', icon: Briefcase },
  { path: '/habits', label: 'Hábitos', icon: Zap },
  { path: '/notes', label: 'Notas', icon: FileText },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const accentColor = user?.color || '#3B82F6';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#0A0A14',
        borderTop: `1px solid ${accentColor}18`,
        boxShadow: `0 -4px 32px ${accentColor}10`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all active:scale-90"
            >
              <div style={{ filter: isActive ? `drop-shadow(0 0 6px ${accentColor})` : 'none', transition: 'filter 0.2s ease' }}>
                <Icon size={20} style={{ color: isActive ? accentColor : '#3D4A5C' }} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? accentColor : '#3D4A5C', textShadow: isActive ? `0 0 8px ${accentColor}80` : 'none' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
