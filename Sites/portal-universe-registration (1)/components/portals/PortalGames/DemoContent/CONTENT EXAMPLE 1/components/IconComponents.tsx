
import React from 'react';

export const ShipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L4 22h16L12 2zm0 3.55L16.2 20H7.8L12 5.55zM12 12.5l-2 4h4l-2-4z"/>
  </svg>
);

export const InterceptorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 22h7l3-7 3 7h7L12 2z"/>
    </svg>
);

export const HaulerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20 18v-5l-8-5-8 5v5h2v-4.48l6-3.75 6 3.75V18h2zM4 20v-3h16v3H4z"/>
    </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

export const NebulaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.5 10c-2.31 0-4.16 1.63-4.43 3.73-.23 1.77 1.14 3.45 2.86 3.84.21.05.42.07.64.07 1.82 0 3.39-1.33 3.61-3.14.28-2.3-1.52-4.5-3.68-4.5zM4.34 7.34C3.19 8.49 2.5 10.15 2.5 12c0 2.31 1.05 4.36 2.7 5.71.19-.24.36-.5.51-.77-.42-.77-.66-1.65-.66-2.58 0-1.25.56-2.38 1.45-3.12.35-.29.74-.53 1.15-.71-1.33-1.63-2.52-2.92-3.31-3.49zm8.16 1.16c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zM12 2.5C9.88 2.5 8.05 4.05 7.6 6.05c-1.38.31-2.55 1.2-3.15 2.37C5.42 7.23 7.02 6.5 8.75 6.5c1.94 0 3.65.91 4.78 2.32.9-.62 1.95-1 3.09-1 1.05 0 2.03.31 2.84.85-1.3-2.92-4.11-5.17-7.46-5.17z"/>
    </svg>
);

export const AnomalyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
);

export const AsteroidIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <circle cx="12" cy="12" r="3"/>
        <circle cx="5" cy="8" r="1.5"/>
        <circle cx="19" cy="16" r="1.5"/>
        <circle cx="8" cy="18" r="2"/>
        <circle cx="17" cy="6" r="2"/>
    </svg>
);

export const BlackHoleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
    </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
);

export const ScanIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8c.34 0 .68-.02 1.01-.07-.15-.6-.26-1.22-.32-1.85-.08-.82.1-1.63.44-2.35.63-1.34 1.98-2.28 3.55-2.28.36 0 .72.06 1.06.16 1.43.43 2.58 1.58 3.01 3.01.1.34.16.7.16 1.06 0 1.57-.94 2.92-2.28 3.55-.72.34-1.53.52-2.35.44-.63-.06-1.25-.17-1.85-.32C12.02 19.32 12 18.66 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6zM2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z"/>
    </svg>
);

export const XpIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="m14.4 6-1.4 1.4 1.6 1.6H10v2h4.6l-1.6 1.6 1.4 1.4 4-4-4-4zM4 3h12v2H4zM4 19h12v2H4z"/>
    </svg>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
    </svg>
);

export const HullIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z"/>
    </svg>
);

export const EngineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15l-4-4h8l-4 4z"/>
    </svg>
);

export const EnergyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M7 2v11h3v9l7-12h-4l4-8H7z"/>
    </svg>
);

export const ResourcesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
    </svg>
);

export const ShipyardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
    </svg>
);
