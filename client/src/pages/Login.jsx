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
  const { loginDirect } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleSelect = async (user) => {
    if (loading) return;
    setLoading(user.username);
    await loginDirect(user.username);
    setLoading(null);
  };

  return (
    <div
      style={{
        minHeight: '100svh',
        background: '#07070F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{ fontSize: '52px', lineHeight: 1, marginBottom: '14px' }}>🏋️</div>
        <h1
          style={{
            fontSize: '30px',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            margin: 0,
          }}
        >
          GymApp
        </h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '13px', letterSpacing: '0.5px' }}>
          ¿Quién entrena hoy?
        </p>
      </div>

      {/* Profile cards */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          width: '100%',
          maxWidth: '380px',
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
                height: '220px',
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
                  <div style={{ fontSize: '52px', lineHeight: 1, marginBottom: '14px' }}>
                    {user.emoji}
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
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
                      marginTop: '7px',
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

      <p style={{ color: '#2a2a2a', fontSize: '11px', marginTop: '52px' }}>
        GymApp v1.0 • Timmy & Andrea
      </p>
    </div>
  );
}
