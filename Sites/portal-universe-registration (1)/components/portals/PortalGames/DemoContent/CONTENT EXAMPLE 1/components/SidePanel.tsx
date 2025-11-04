import React from 'react';

interface SidePanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SidePanel: React.FC<SidePanelProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-slate-900/70 backdrop-blur-sm border border-[var(--border-color)] p-3 flex flex-col shadow-lg shadow-cyan-950/50 relative ${className}`}>
      {/* Corner Brackets */}
      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[var(--primary-glow)] opacity-70"></div>
      <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-[var(--primary-glow)] opacity-70"></div>
      <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-[var(--primary-glow)] opacity-70"></div>
      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[var(--primary-glow)] opacity-70"></div>

      <h2 className="text-lg font-display text-[var(--primary-glow)] border-b-2 border-[var(--border-color)] pb-1.5 mb-2 tracking-widest text-center">
        {title}
      </h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {children}
      </div>
    </div>
  );
};

export default SidePanel;
