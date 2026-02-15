import React from 'react';

const UserSelector = ({ teamMembers, onSelect }) => {
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e1e3f, #252550)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <h2 style={{
          margin: '0 0 8px',
          fontSize: '24px',
          fontWeight: '700',
          fontFamily: "'Space Mono', monospace",
          color: '#E2E8F0',
        }}>
          Who are you?
        </h2>
        <p style={{
          margin: '0 0 24px',
          fontSize: '14px',
          color: '#64748B',
        }}>
          Select your profile to get started
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          {teamMembers.map(member => (
            <button
              key={member.id}
              onClick={() => onSelect(member.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#E2E8F0',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: member.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                {member.avatar}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600' }}>{member.name}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{member.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSelector;

