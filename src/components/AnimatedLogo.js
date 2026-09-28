import React from 'react';

export default function AnimatedLogo({ isMobile = false, isDark = true }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isMobile ? 12 : 18,
        cursor: 'pointer',
        userSelect: 'none',
        marginBottom: 8
      }}
    >
      <style>{`
        @keyframes laserSweep {
          0% {
            top: 6px;
            opacity: 0.9;
          }
          50% {
            top: 48px;
            opacity: 1;
          }
          100% {
            top: 6px;
            opacity: 0.9;
          }
        }
        @keyframes cornerGlow {
          0%, 100% {
            stroke: #38bdf8;
            filter: drop-shadow(0 0 3px #38bdf8);
          }
          50% {
            stroke: #ec4899;
            filter: drop-shadow(0 0 6px #ec4899);
          }
        }
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1deg);
          }
        }
        @keyframes auraPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(168, 85, 247, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(56, 189, 248, 0.4);
          }
        }
        .animated-logo-container:hover .laser-beam {
          animation-duration: 1.2s;
        }
      `}</style>

      {/* Futuristic Animated QR Badge */}
      <div
        className="animated-logo-container"
        style={{
          position: 'relative',
          width: isMobile ? 48 : 58,
          height: isMobile ? 48 : 58,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          animation: 'logoFloat 4s ease-in-out infinite, auraPulse 3s ease-in-out infinite',
          flexShrink: 0
        }}
      >
        {/* Animated Laser Beam */}
        <div
          className="laser-beam"
          style={{
            position: 'absolute',
            left: 4,
            right: 4,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #38bdf8 20%, #a855f7 50%, #ec4899 80%, transparent)',
            boxShadow: '0 0 8px #38bdf8, 0 0 12px #ec4899',
            animation: 'laserSweep 2.2s ease-in-out infinite',
            zIndex: 3
          }}
        />

        {/* Laser Sweep Gradient Trail */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15), transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Vector QR Cyber Matrix */}
        <svg
          width={isMobile ? 32 : 38}
          height={isMobile ? 32 : 38}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ zIndex: 2 }}
        >
          {/* Top Left Finder */}
          <rect
            x="4"
            y="4"
            width="14"
            height="14"
            rx="3"
            strokeWidth="2.5"
            style={{ animation: 'cornerGlow 3s ease-in-out infinite' }}
          />
          <rect x="8" y="8" width="6" height="6" rx="1.5" fill="#38bdf8" />

          {/* Top Right Finder */}
          <rect
            x="30"
            y="4"
            width="14"
            height="14"
            rx="3"
            strokeWidth="2.5"
            style={{ animation: 'cornerGlow 3s ease-in-out infinite 0.5s' }}
          />
          <rect x="34" y="8" width="6" height="6" rx="1.5" fill="#a855f7" />

          {/* Bottom Left Finder */}
          <rect
            x="4"
            y="30"
            width="14"
            height="14"
            rx="3"
            strokeWidth="2.5"
            style={{ animation: 'cornerGlow 3s ease-in-out infinite 1s' }}
          />
          <rect x="8" y="34" width="6" height="6" rx="1.5" fill="#ec4899" />

          {/* Center Holographic Sparkle Nodes */}
          <circle cx="24" cy="24" r="3" fill="#38bdf8" />
          <circle cx="34" cy="34" r="2.5" fill="#a855f7" />
          <circle cx="24" cy="14" r="2" fill="#e2e8f0" opacity="0.8" />
          <circle cx="14" cy="24" r="2" fill="#e2e8f0" opacity="0.8" />
          <circle cx="34" cy="24" r="2" fill="#ec4899" />
          <circle cx="24" cy="34" r="2" fill="#38bdf8" />
        </svg>
      </div>

      {/* Animated Brand Typography */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: isMobile ? '1.8rem' : '2.4rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: isDark ? '#ffffff' : '#0f172a',
              textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            QR Studio
          </span>
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #ec4899)',
              color: '#ffffff',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 8,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 10px rgba(236, 72, 153, 0.4)'
            }}
          >
            PRO
          </span>
        </div>
      </div>
    </div>
  );
}
