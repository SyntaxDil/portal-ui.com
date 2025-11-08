
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

const icons: { [key: string]: React.ReactNode } = {
  play: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />,
  pause: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h4v16H6zM14 4h4v16h-4z" />,
  logo: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />,
  search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  previous: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />,
  next: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />,
  upload: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
  heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />,
  comment: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  'chat-bubble': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M9 14h6" />,
  'x': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
  'send': <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-6z" />,
  'camera': (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
  'music-note': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />,
  'map-pin': (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
  'globe-alt': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9" />,
  'aperture': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m-2.122 2.122a5 5 0 01-7.072 0m-2.121-2.121a5 5 0 010-7.072m2.121-2.121a5 5 0 017.072 0" />,
  'map': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0 6l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m-6-2l6-3m0 0l6 3" />,
  'radio': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4.938A8.001 8.001 0 0112 4a8 8 0 017.069 4.938M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 8.062A8.001 8.001 0 0112 20a8 8 0 01-7.069-4.938M4.938 15A8.001 8.001 0 014 12a8 8 0 014.938-7.069" />,
  'spotify': <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 17.5a7.5 7.5 0 110-15 7.5 7.5 0 010 15zm-4.3-7.2a.7.7 0 00-1 .2.7.7 0 00.1 1l3.5 2a.7.7 0 001-.2.7.7 0 00-.2-1l-3.4-2zm.3-2.5a.7.7 0 00-1 .2.7.7 0 00.2 1l5.8 3.3a.7.7 0 001-.2.7.7 0 00-.2-1l-5.8-3.3zm.2-2.6a.7.7 0 00-1 .3.7.7 0 00.3 1l6.7 3.8a.7.7 0 001-.3.7.7 0 00-.3-1l-6.7-3.8z" />,
  'soundcloud': <path d="M7 12a1 1 0 00-1-1H3a1 1 0 100 2h3a1 1 0 001-1zm14-1h-3a1 1 0 100 2h3a1 1 0 100-2zm-5-3a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2zm-2 0a1 1 0 100-2 1 1 0 000 2zm14 2c0-3.9-3.1-7-7-7s-7 3.1-7 7v1h14v-1z" />,
  'youtube': <path d="M21.582 6.186A2.5 2.5 0 0020 4.5H4a2.5 2.5 0 00-2.5 2.5v10A2.5 2.5 0 004 19.5h16a2.5 2.5 0 002.5-2.5v-10a2.5 2.5 0 00-.918-1.814zM9.5 15.5v-7l7 3.5-7 3.5z" />,
  'bandcamp': <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2l4 4 4-4v8H8v-8z" />,
  'package': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />,
  'tshirt': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 4h6l2 2v2H7V6l2-2zm0 0V3a1 1 0 011-1h4a1 1 0 011 1v1m-6 0v12h6V4m-6 0H3v4l3 1 1-1h1M15 4h6v4l-3 1-1-1h-1" />,
  'crown': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l3-3 4 4 4-4 3 3V5H5v10z" />,
  'playlist': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
  'tag': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  'thumbs-up': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />,
  'thumbs-down': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 15v4a3 3 0 003 3l4-9V5H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3h4.28z" />,
  'video-camera': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
  'rss': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 11a9 9 0 019 9M4 4a16 16 0 0116 16M4 4v0" />,
  'book-open': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 1V6a4 4 0 00-4-4H5a4 4 0 00-4 4v12a4 4 0 004 4h14a4 4 0 004-4v-3m-4-1l-4-4 4-4" />,
  'download': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
  'plus': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
  'mail': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  'microphone': <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 01-14 0v-2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19v3" /></>,
  'palette': <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v2m0 18v2m9-9h-2m-2-6.364L15.364 7M4.636 17.364L7 15m12.364 0L17 15M4.636 4.636L7 7" /></>,
  'users': <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.134-1.276-.38-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.134-1.276.38-1.857m0 0a5.002 5.002 0 019.24 0M12 15a4 4 0 100-8 4 4 0 000 8z" /></>,
  'sparkles': <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M17 3v4M19 5h-4M14 17v4M16 19h-4M7.5 10.5L9 9m-1.5 3l-1.5 1.5M16.5 10.5L15 9m1.5 3l1.5 1.5" /></>,
};

export const Icon: React.FC<IconProps> = ({ name, className = 'h-6 w-6', style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
    style={style}
  >
    {icons[name]}
  </svg>
);