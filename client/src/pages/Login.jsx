import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Eye, EyeOff, AlertCircle } from 'lucide-react';

const USERS = [
  { username: 'timmy', name: 'Timmy', color: '#3B82F6', emoji: '💪', desc: '68kg → 71kg • 3000 kcal/día' },
  { username: 'andrea', name: 'Andrea', color: '#EC4899', emoji: '🌸', desc: '50kg → 47-48kg • 1400 kcal/día' }
];

export default function Login() {
  const { login } = useAuth();
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectUser = (user) => {
    setSelected(user);
    setPassword('');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selected || !password) return;

    setLoading(true);
    setError('');

    const result = await login(selected.username, password);

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-[#1E293B] rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
          <Dumbbell size={40} className="text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">GymApp</h1>
        <p className="text-slate-400 mt-1">Entrena. Nutre. Mejora.</p>
      </div>

      {/* User selection */}
      <div className="w-full max-w-sm">
        <p className="text-slate-400 text-sm mb-3 text-center">¿Quién entrena hoy?</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {USERS.map(user => (
            <button
              key={user.username}
              onClick={() => handleSelectUser(user)}
              className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                selected?.username === user.username
                  ? 'border-2 bg-[#1E293B]'
                  : 'border-[#334155] bg-[#1E293B] opacity-70'
              }`}
              style={{
                borderColor: selected?.username === user.username ? user.color : '#334155'
              }}
            >
              <div className="text-3xl mb-2">{user.emoji}</div>
              <div className="font-bold text-white text-lg">{user.name}</div>
              <div className="text-xs text-slate-400 mt-1 leading-tight">{user.desc}</div>
            </button>
          ))}
        </div>

        {/* Password form */}
        {selected && (
          <form onSubmit={handleLogin} className="fade-in">
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">
                Contraseña para {selected.name}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="input-dark pr-12"
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: selected?.color || '#3B82F6' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                `Entrar como ${selected.name}`
              )}
            </button>
          </form>
        )}

        <p className="text-center text-slate-600 text-xs mt-8">
          GymApp v1.0 • Timmy & Andrea
        </p>
      </div>
    </div>
  );
}
