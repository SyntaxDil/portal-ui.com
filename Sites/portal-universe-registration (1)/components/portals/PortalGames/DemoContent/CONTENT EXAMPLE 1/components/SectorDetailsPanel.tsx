import React from 'react';
import { GridCell, Ship } from '../types';
import SidePanel from './SidePanel';

interface SectorDetailsPanelProps {
  sector: GridCell | null;
  ship: Ship;
  onSetCourse: (x: number, y: number) => void;
  canInteract: boolean;
  className?: string;
}

const SectorDetailsPanel: React.FC<SectorDetailsPanelProps> = ({ sector, ship, onSetCourse, canInteract, className }) => {
  const isCurrentShipLocation = sector && sector.x === ship.x && sector.y === ship.y;
  return (
    <SidePanel title="SECTOR ANALYSIS" className={className}>
      {sector ? (
        <div className="font-mono text-sm space-y-3">
          <div>
            <h3 className="text-lg font-display text-center text-cyan-300">COORDINATES [{sector.x}, {sector.y}]</h3>
          </div>
          <div className="space-y-1">
            <p>TYPE: <span className="text-white font-bold float-right">{sector.type}</span></p>
            <p>STATUS: <span className="text-white font-bold float-right">{sector.isExplored ? 'EXPLORED' : 'UNEXPLORED'}</span></p>
            <p>OWNERSHIP: <span className={`font-bold float-right ${sector.owner === 'player' ? 'text-green-400' : 'text-gray-400'}`}>{sector.owner.toUpperCase()}</span></p>
          </div>
           {sector.isExplored && (
             <div className="pt-2 border-t border-[var(--border-color)]">
                <p className="text-xs text-gray-400 italic">Detailed scan data available at allied starbases.</p>
             </div>
           )}
           <div className="pt-4">
            <button 
                onClick={() => onSetCourse(sector.x, sector.y)}
                disabled={!canInteract || isCurrentShipLocation}
                className="w-full mt-2 bg-cyan-800/50 border border-cyan-600 text-cyan-300 hover:bg-cyan-700/50 hover:text-white disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-1.5 transition-all duration-200 font-display tracking-widest"
            >
                {isCurrentShipLocation ? 'CURRENT LOCATION' : 'SET COURSE'}
            </button>
           </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 font-mono text-center animate-pulse">SELECT A SECTOR FOR ANALYSIS</p>
        </div>
      )}
    </SidePanel>
  );
};

export default SectorDetailsPanel;
