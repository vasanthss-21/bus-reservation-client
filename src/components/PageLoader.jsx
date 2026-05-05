import React from 'react';

/**
 * Full-screen page transition loader.
 * Shows a animated bus + progress bar in the TransitFlow indigo theme.
 */
export default function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: 'rgba(248,250,255,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Animated bus track */}
      <div className="relative w-64 mb-8">
        {/* Road */}
        <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg,#6366f1,#818cf8)',
              animation: 'roadProgress 1.4s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>

        {/* Bus icon sliding across */}
        <div
          style={{
            position: 'absolute',
            top: '-22px',
            animation: 'busSlide 1.4s ease-in-out infinite',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
          >
            {/* Bus SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="13" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="5" y="7" width="4" height="3" rx="0.5" fill="#6366f1" />
              <rect x="15" y="7" width="4" height="3" rx="0.5" fill="#6366f1" />
              <rect x="10" y="7" width="4" height="3" rx="0.5" fill="#6366f1" />
              <rect x="2" y="14" width="20" height="3" rx="0" fill="white" fillOpacity="0.5" />
              <circle cx="7" cy="19" r="2" fill="white" />
              <circle cx="17" cy="19" r="2" fill="white" />
              <rect x="2" y="8" width="2" height="4" rx="1" fill="white" fillOpacity="0.6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-gray-800">Transit</span>
          <span className="text-indigo-500">Flow</span>
        </span>
      </div>

      {/* Pulsing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: '#6366f1',
              animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes busSlide {
          0%   { left: 0%; opacity: 0; transform: scaleX(1); }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: calc(100% - 40px); opacity: 0; }
        }
        @keyframes roadProgress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
