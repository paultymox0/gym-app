import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Zap, CheckSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/',        label: 'Hub',     icon: Home },
  { path: '/session', label: 'Sesión',  icon: Dumbbell },
  { path: '/habits',  label: 'Hábitos', icon: Zap },
  { path: '/tasks',   label: 'Tareas',  icon: CheckSquare },
  { path: '/profile', label: 'Perfil',  icon: User },
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
        background: 'rgba(29, 26, 36, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid #4a4455`,
        boxShadow: `0 -4px 32px rgba(0,0,0,0.4)`,
        borderRadius: '12px 12px 0 0',
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
