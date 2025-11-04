
import React, { ReactNode } from 'react';

export interface RadialMenuOption {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface RadialMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  options: RadialMenuOption[];
  onClose: () => void;
}

const RadialMenu: React.FC<RadialMenuProps> = ({ isOpen, position, options, onClose }) => {
  if (!isOpen) return null;

  const radius = 80; // The radius of the circle on which icons are placed
  const angleStep = options.length > 0 ? (2 * Math.PI) / options.length : 0;

  return (
    <div
      className="fixed inset-0 z-50"
      onMouseDown={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className="absolute w-20 h-20 rounded-full bg-slate-900/50 backdrop-blur-sm border-2 border-cyan-500/50"
        style={{ left: position.x - 40, top: position.y - 40, pointerEvents: 'none' }}
      >
        {/* Center circle */}
      </div>
      {options.map((option, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <button
            key={index}
            className={`absolute flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-200 
                        ${option.disabled ? 'bg-slate-700/80 cursor-not-allowed' : 'bg-cyan-800/80 hover:bg-cyan-700 hover:scale-110'}
                        border border-cyan-600`}
            style={{
              left: position.x + x,
              top: position.y + y,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent overlay click from firing
              if (!option.disabled) {
                option.onClick();
              }
              onClose();
            }}
            disabled={option.disabled}
          >
            <div className="w-6 h-6 text-white">{option.icon}</div>
            <span className="text-xs font-display text-white mt-1">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RadialMenu;
