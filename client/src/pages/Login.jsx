import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const USERS = [
  {
    username: 'timmy',
    name: 'Timmy',
    emoji: '💪',
    bg: '#0D1F0D',
    accent: '#00FF88',
    ledClass: 'led-wrapper-green',
    desc: '68 → 71 kg',
  },
  {
    username: 'andrea',
    name: 'Andrea',
    emoji: '🌸',
    bg: '#1A0D2E',
    accent: '#BF5FFF',
    ledClass: 'led-wrapper-purple',
    desc: '50 → 47 kg',
  },
];

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleSelect = async (user) => {
    if (loading) return;
    setLoading(user.username);
    await login(user.username);
    setLoading(null);
  };

  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <h1
        style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#ffffff',
          letterSpacing: '0px',
          margin: '0 0 48px 0',
          textAlign: 'center',
        }}
      >
        Elige tu perfil
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          width: '100%',
          maxWidth: '390px',
        }}
      >
        {USERS.map((user) => (
          <div key={user.username} className={user.ledClass} style={{ flex: 1 }}>
            <button
              className="profile-card"
              onClick={() => handleSelect(user)}
              disabled={!!loading}
              style={{
                width: '100%',
                height: '250px',
                background: user.bg,
                border: 'none',
                borderRadius: '22px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading ? 'default' : 'pointer',
                position: 'relative',
                zIndex: 1,
                padding: 0,
              }}
            >
              {loading === user.username ? (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `3px solid ${user.accent}25`,
                    borderTop: `3px solid ${user.accent}`,
                    animation: 'led-rotate 0.75s linear infinite',
                  }}
                />
              ) : (
                <>
                  <div style={{ fontSize: '58px', lineHeight: 1, marginBottom: '16px' }}>
                    {user.emoji}
                  </div>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: '800',
                      color: user.accent,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: `${user.accent}70`,
                      marginTop: '8px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {user.desc}
                  </div>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <p style={{ color: '#222', fontSize: '11px', marginTop: '52px' }}>
        GymApp v1.0 • Timmy & Andrea
      </p>
    </div>
  );
}
