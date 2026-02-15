import React from 'react';

const UserSelector = ({ teamMembers, onSelect }) => {
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(236, 72, 153, 0.15)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #FFFFFF, #FDF2F8)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        border: '1px solid rgba(236, 72, 153, 0.2)',
        boxShadow: '0 20px 60px rgba(236, 72, 153, 0.2)',
      }}>
        <h2 style={{
          margin: '0 0 8px',
          fontSize: '24px',
          fontWeight: '700',
          fontFamily: "'Space Mono', monospace",
          color: '#831843',
        }}>
          Who are you?
        </h2>
        <p style={{
          margin: '0 0 24px',
          fontSize: '14px',
          color: '#9D174D',
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
                background: 'rgba(236, 72, 153, 0.06)',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(236, 72, 153, 0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(236, 72, 153, 0.06)';
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
                <div style={{ fontSize: '12px', color: '#9D174D' }}>{member.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSelector;

