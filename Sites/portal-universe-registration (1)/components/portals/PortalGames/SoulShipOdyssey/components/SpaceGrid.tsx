

import React, { useState, useRef } from 'react';
import { GridCell, Ship, TravelInfo, SectorType, ShipType } from '../types';
import { ShipIcon, InterceptorIcon, HaulerIcon, StarIcon, NebulaIcon, AnomalyIcon, AsteroidIcon, BlackHoleIcon, ShipyardIcon, ScanIcon, TrophyIcon } from './IconComponents';
import RadialMenu, { RadialMenuOption } from './RadialMenu';

interface SpaceGridProps {
  gridData: GridCell[][];
  ship: { x: number; y: number }; // Using visual position
  shipRotation: number;
  travelInfo: TravelInfo | null;
  onCellClick: (x: number, y: number) => void;
  canInteract: boolean;
  actualShip: Ship;
  selectedSector: GridCell | null;
  onRadialMenuAction: (action: string) => void;
}

const SectorIcon: React.FC<{ type: SectorType }> = ({ type }) => {
    const iconClass = "w-8 h-8 opacity-50 absolute transition-opacity duration-500 group-hover:opacity-100";
    switch (type) {
        case SectorType.StarSystem:
            return <StarIcon className={`${iconClass} text-yellow-300`} />;
        case SectorType.Nebula:
            return <NebulaIcon className={`${iconClass} text-purple-400`} />;
        case SectorType.AsteroidField:
            return <AsteroidIcon className={`${iconClass} text-gray-400`} />;
        case SectorType.Anomaly:
            return <AnomalyIcon className={`${iconClass} text-red-500`} />;
        case SectorType.BlackHole:
            return <BlackHoleIcon className={`${iconClass} text-indigo-400`} />;
        default:
            return null;
    }
}

const ShipTypeIcon: React.FC<{shipType: ShipType, className?: string}> = ({ shipType, className }) => {
    switch(shipType) {
        case 'interceptor':
            return <InterceptorIcon className={className} />;
        case 'hauler':
            return <HaulerIcon className={className} />;
        case 'voyager':
        default:
            return <ShipIcon className={className} />;
    }
}

// Map grid coordinates to pixel coordinates for ship animation
const getPixelPosition = (x: number, y: number, cellSize: number) => {
    const hexWidth = Math.sqrt(3) * cellSize;
    const hexHeight = 2 * cellSize;
    const horizDist = hexWidth;
    const vertDist = hexHeight * 3/4;
    
    const u = x;
    const v = y;

    const px = (u * horizDist) + (v % 2 === 1 ? horizDist / 2 : 0);
    const py = v * vertDist;
    return { x: px, y: py };
}

const SpaceGrid: React.FC<SpaceGridProps> = ({ gridData, ship, shipRotation, travelInfo, onCellClick, canInteract, actualShip, selectedSector, onRadialMenuAction }) => {
  const cellSize = 48; // Adjust this to scale the grid
  const hexWidth = Math.sqrt(3) * cellSize;
  const hexHeight = 2 * cellSize;
  
  const shipPixelPos = getPixelPosition(ship.x, ship.y, cellSize);
  const [radialMenu, setRadialMenu] = useState<{ isOpen: boolean; x: number; y: number; target: 'ship' | 'sector';} | null>(null);
  // FIX: Explicitly type useRef to allow undefined, which is the default initial value.
  const longPressTimer = useRef<number | undefined>();

  const handleOpenRadialMenu = (e: React.MouseEvent, target: 'ship' | 'sector') => {
    e.preventDefault();
    e.stopPropagation();
    setRadialMenu({ isOpen: true, x: e.clientX, y: e.clientY, target });
  };
  
  const handleCloseRadialMenu = () => {
    setRadialMenu(null);
  };

  const handleMouseDown = (e: React.MouseEvent, cell: GridCell) => {
    const isShipLocation = cell.x === actualShip.x && cell.y === actualShip.y && !travelInfo;
    if (isShipLocation) {
        longPressTimer.current = window.setTimeout(() => {
            handleOpenRadialMenu(e, 'ship');
        }, 500);
    }
  };
  
  // FIX: Add check for undefined before calling clearTimeout to prevent potential errors.
  const handleMouseUp = () => {
    if (longPressTimer.current !== undefined) {
        clearTimeout(longPressTimer.current);
    }
  };
  
  const shipOptions: RadialMenuOption[] = [
    {
        label: 'SHIPYARD',
        icon: <ShipyardIcon />,
        onClick: () => onRadialMenuAction('shipyard'),
    },
    {
        label: 'SCAN',
        icon: <ScanIcon />,
        onClick: () => onRadialMenuAction('scan'),
        disabled: actualShip.scans <= 0 || actualShip.status !== 'IDLE',
    },
    {
        label: 'FILES',
        icon: <TrophyIcon />,
        onClick: () => onRadialMenuAction('achievements'),
    },
  ];

  return (
    <div className="relative" style={{ width: `${(gridData[0].length + 0.5) * hexWidth}px`, height: `${(gridData.length * hexHeight * 0.75) + (hexHeight * 0.25)}px` }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Travel Path Line */}
      <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none', zIndex: 10 }}>
          {travelInfo && (
              <line 
                x1={getPixelPosition(actualShip.x, actualShip.y, cellSize).x + hexWidth/2} 
                y1={getPixelPosition(actualShip.x, actualShip.y, cellSize).y + hexHeight/2} 
                x2={getPixelPosition(travelInfo.destinationX, travelInfo.destinationY, cellSize).x + hexWidth/2} 
                y2={getPixelPosition(travelInfo.destinationX, travelInfo.destinationY, cellSize).y + hexHeight/2} 
                stroke="rgba(255, 255, 0, 0.5)" 
                strokeWidth="2" 
                strokeDasharray="5, 5"
              >
                 <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
              </line>
          )}
      </svg>
      

      {/* Ship Icon */}
      <div 
        className="absolute"
        style={{
            width: hexWidth,
            height: hexHeight,
            left: `${shipPixelPos.x}px`,
            top: `${shipPixelPos.y}px`,
            zIndex: 20,
            pointerEvents: 'none',
            transform: `rotate(${shipRotation}deg)`,
            transition: 'transform 0.5s ease-out',
        }}
      >
        <ShipTypeIcon shipType={actualShip.customization.shipType} className="w-1/2 h-1/2 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
      </div>

      {/* Hex Grid */}
      {gridData.flat().map((cell) => {
        const isShipLocation = cell.x === actualShip.x && cell.y === actualShip.y;
        const isDestination = travelInfo && cell.x === travelInfo.destinationX && cell.y === travelInfo.destinationY;
        const isSelected = selectedSector && cell.x === selectedSector.x && cell.y === selectedSector.y;
        const isClickable = canInteract;
        const pos = getPixelPosition(cell.x, cell.y, cellSize);
        
        return (
          <div
            key={`${cell.x}-${cell.y}`}
            className="absolute group"
            style={{ 
              left: `${pos.x}px`, 
              top: `${pos.y}px`,
              width: `${hexWidth}px`,
              height: `${hexHeight}px`,
            }}
            onClick={() => isClickable && onCellClick(cell.x, cell.y)}
            onContextMenu={(e) => {
                const isShipCell = cell.x === actualShip.x && cell.y === actualShip.y && !travelInfo;
                if(isShipCell) handleOpenRadialMenu(e, 'ship');
            }}
            onMouseDown={(e) => handleMouseDown(e, cell)}
          >
            <div
              className={`w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out relative ${isClickable ? 'cursor-pointer' : ''}`}
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <div className={`absolute inset-0 transition-colors duration-300 ${cell.owner === 'player' ? 'bg-cyan-900/30' : (cell.isExplored ? 'bg-cyan-900/10' : 'bg-black/50')} ${isClickable ? 'group-hover:bg-cyan-900/40' : ''}`}/>
              
              {/* Border */}
              <div className={`absolute inset-0 transition-opacity duration-300 opacity-20 group-hover:opacity-60 
                ${isShipLocation ? 'opacity-100' : ''} 
                ${isDestination ? 'opacity-100' : ''}
                ${isSelected && !isDestination ? 'opacity-80' : ''}
                `}
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%, 50% 0%, 48% 2%, 2% 26%, 2% 74%, 48% 98%, 98% 74%, 98% 26%, 48% 2%)',
                  background: isDestination ? 'var(--secondary-glow)' : (isSelected ? 'white' : 'var(--primary-glow)'),
                  animation: isDestination ? 'pulse 2s infinite' : ''
                }}
              />
              
              {isDestination && (
                  <div className="absolute inset-0 bg-yellow-500/20 animate-pulse"/>
              )}
               {isSelected && !isDestination && (
                  <div className="absolute inset-0 bg-white/10"/>
              )}
              {isShipLocation && !travelInfo && (
                  <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"/>
              )}

              {cell.isExplored && !isShipLocation && <SectorIcon type={cell.type} />}
              {!cell.isExplored && <span className="text-gray-600 font-mono text-2xl font-bold group-hover:text-cyan-400 transition-colors">?</span>}
            </div>
            <style>
            {`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}
            </style>
          </div>
        );
      })}
       {radialMenu?.isOpen && (
        <RadialMenu
            isOpen={radialMenu.isOpen}
            position={{ x: radialMenu.x, y: radialMenu.y }}
            options={radialMenu.target === 'ship' ? shipOptions : []}
            onClose={handleCloseRadialMenu}
        />
      )}
    </div>
  );
};

export default SpaceGrid;