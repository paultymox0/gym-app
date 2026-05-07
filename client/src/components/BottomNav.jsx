import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Apple, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/session', label: 'Sesión', icon: Dumbbell },
  { path: '/nutrition', label: 'Nutrición', icon: Apple },
  { path: '/profile', label: 'Perfil', icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const accentColor = user?.color || '#3B82F6';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E293B] border-t border-[#334155]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-90"
            >
              <Icon
                size={22}
                style={{ color: isActive ? accentColor : '#64748B' }}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? accentColor : '#64748B' }}
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
