import React from 'react';

interface AgapeLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'monochrome' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const AgapeLogo: React.FC<AgapeLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  showSubtitle = true
}) => {
  // Dimensions
  const dimMap = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-lg', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-2xl', sub: 'text-sm' }
  };

  const { icon: iconSize, text: textSize, sub: subSize } = dimMap[size];

  // Monochrome version for thermal receipt printers (clean vector lines)
  if (variant === 'monochrome') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-900 mx-auto"
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" />
          {/* Inner radiate aura */}
          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          {/* Radiant Sunburst rays */}
          <line x1="50" y1="8" x2="50" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="20" x2="30" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="80" y1="20" x2="70" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="50" x2="22" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="92" y1="50" x2="78" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Agape Dove / Paloma de Paz y Servicio */}
          <path
            d="M50 32C46 32 40 37 36 43C30 52 32 62 42 63C46 63.5 49 61 50 58C51 61 54 63.5 58 63C68 62 70 52 64 43C60 37 54 32 50 32Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Dove Wings */}
          <path
            d="M28 44C34 40 44 42 50 49C56 42 66 40 72 44C66 54 58 56 50 56C42 56 34 54 28 44Z"
            fill="currentColor"
          />
          {/* Olive Branch / Heart Accent */}
          <circle cx="50" cy="38" r="2.5" fill="currentColor" />
          <path d="M47 38C45 35 42 35 40 37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="font-extrabold tracking-wider font-sans text-xs mt-1 text-slate-900 uppercase">
          AGAPE DE EL SALVADOR
        </span>
        {showSubtitle && (
          <span className="text-[9px] text-slate-600 font-sans tracking-tight">
            Amor y Servicio • Sonsonate
          </span>
        )}
      </div>
    );
  }

  // Icon Only (Badge)
  const IconComponent = (
    <div
      style={{ width: iconSize, height: iconSize }}
      className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 p-1 shadow-md border border-amber-400/40"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="agapeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="agapeDoveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <radialGradient id="agapeSunHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sun Halo Backdrop */}
        <circle cx="50" cy="50" r="42" fill="url(#agapeSunHalo)" />

        {/* Sunburst Rays */}
        <g stroke="url(#agapeGoldGrad)" strokeWidth="3" strokeLinecap="round">
          <line x1="50" y1="12" x2="50" y2="24" />
          <line x1="22" y1="22" x2="31" y2="31" />
          <line x1="78" y1="22" x2="69" y2="31" />
          <line x1="12" y1="50" x2="24" y2="50" />
          <line x1="88" y1="50" x2="76" y2="50" />
          <line x1="24" y1="76" x2="33" y2="67" />
          <line x1="76" y1="76" x2="67" y2="67" />
        </g>

        {/* Outer Circular Ring */}
        <circle cx="50" cy="50" r="45" stroke="url(#agapeGoldGrad)" strokeWidth="2.5" />

        {/* Dove Body & Wings (White and Gold) */}
        <path
          d="M50 30C45 30 38 35 34 42C27 52 30 63 41 64C45 64.5 48.5 61.5 50 58C51.5 61.5 55 64.5 59 64C70 63 73 52 66 42C62 35 55 30 50 30Z"
          fill="url(#agapeDoveGrad)"
          filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.3))"
        />
        {/* Wing Feather Accents */}
        <path
          d="M26 43C33 39 43 41 50 48C57 41 67 39 74 43C68 53 59 55 50 55C41 55 32 53 26 43Z"
          fill="#FFFFFF"
        />
        {/* Heart / Olive Leaf Accent in Golden Glow */}
        <circle cx="50" cy="36" r="3" fill="url(#agapeGoldGrad)" />
        <path
          d="M48 37C44 34 40 35 38 37"
          stroke="url(#agapeGoldGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  if (variant === 'icon' || variant === 'badge') {
    return <div className={`inline-flex items-center ${className}`}>{IconComponent}</div>;
  }

  // Full Wordmark Version
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {IconComponent}
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-blue-900 uppercase font-sans ${textSize}`}>
            AGAPE
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            EL SALVADOR
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-medium text-slate-500 tracking-tight ${subSize}`}>
            Asociación AGAPE • Amor y Servicio
          </span>
        )}
      </div>
    </div>
  );
};
