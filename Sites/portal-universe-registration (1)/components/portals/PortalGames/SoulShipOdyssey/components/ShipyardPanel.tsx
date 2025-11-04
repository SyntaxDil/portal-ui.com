import React from 'react';
import { Ship, ShipUpgrades, ShipType } from '../types';
import { UPGRADE_COSTS } from '../constants';
import { EngineIcon, HullIcon, ResourcesIcon, ScanIcon, ShipIcon, InterceptorIcon, HaulerIcon } from './IconComponents';

interface ShipyardPanelProps {
    ship: Ship;
    onUpgrade: (system: keyof ShipUpgrades) => void;
    onShipTypeChange: (newType: ShipType) => void;
}

const UPGRADE_DETAILS = {
    hullPlating: { name: 'Hull Plating', description: 'Increases maximum hull integrity.', icon: HullIcon },
    engineEfficiency: { name: 'Engine Efficiency', description: 'Reduces travel time.', icon: EngineIcon },
    resourceExtraction: { name: 'Resource Extraction', description: 'Boosts resource gains.', icon: ResourcesIcon },
    scannerProbes: { name: 'Scanner Probes', description: 'Increases max scanner probes.', icon: ScanIcon }
};

const ShipyardPanel: React.FC<ShipyardPanelProps> = ({ ship, onUpgrade, onShipTypeChange }) => {
    return (
        <div className="shipyard-background p-2 -m-2 h-[calc(100%+1rem)]">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-display text-center text-cyan-300 border-b border-cyan-700/50 pb-1">SHIP UPGRADES</h3>
                    <p className="text-right text-sm mt-1">RESOURCES: <span className="font-bold text-yellow-400">{ship.resources}</span></p>
                </div>
                <div className="space-y-3">
                    {Object.keys(UPGRADE_DETAILS).map(key => {
                        const system = key as keyof ShipUpgrades;
                        const details = UPGRADE_DETAILS[system];
                        const currentLevel = ship.upgrades[system];
                        const maxLevel = UPGRADE_COSTS[system].length;
                        const isMaxed = currentLevel >= maxLevel;
                        const cost = isMaxed ? 0 : UPGRADE_COSTS[system][currentLevel];
                        const canAfford = ship.resources >= cost;

                        return (
                            <div key={system} className="bg-slate-900/60 p-2 border border-cyan-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <details.icon className="w-5 h-5 mr-3 text-cyan-400" />
                                        <h4 className="font-bold font-display tracking-wide text-white">{details.name}</h4>
                                    </div>
                                    <span className="text-xs font-mono">LVL: <span className="font-bold text-white">{currentLevel}</span>/{maxLevel}</span>
                                </div>
                                <p className="text-xs text-gray-400 italic my-1">{details.description}</p>
                                <button
                                    onClick={() => onUpgrade(system)}
                                    disabled={isMaxed || !canAfford}
                                    className="w-full text-sm mt-1 bg-cyan-800/50 border border-cyan-600 text-cyan-300 hover:bg-cyan-700/50 hover:text-white disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-1 transition-all duration-200 font-display"
                                >
                                    {isMaxed ? 'MAX LEVEL' : `UPGRADE (${cost} RES)`}
                                </button>
                            </div>
                        )
                    })}
                </div>
                <div className="pt-2">
                    <h3 className="text-lg font-display text-center text-cyan-300 border-b border-cyan-700/50 pb-1">CHASSIS CONFIG</h3>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {(['voyager', 'interceptor', 'hauler'] as ShipType[]).map(type => {
                           const isActive = ship.customization.shipType === type;
                           return (
                             <button key={type} onClick={() => onShipTypeChange(type)} className={`p-2 border transition-colors ${isActive ? 'bg-cyan-700/50 border-cyan-400' : 'bg-slate-800/50 border-slate-700 hover:bg-cyan-900/50'}`}>
                                {type === 'voyager' && <ShipIcon className={`w-8 h-8 mx-auto ${isActive ? 'text-white' : 'text-cyan-500'}`} />}
                                {type === 'interceptor' && <InterceptorIcon className={`w-8 h-8 mx-auto ${isActive ? 'text-white' : 'text-cyan-500'}`} />}
                                {type === 'hauler' && <HaulerIcon className={`w-8 h-8 mx-auto ${isActive ? 'text-white' : 'text-cyan-500'}`} />}
                               <p className={`text-xs font-display mt-1 ${isActive ? 'text-white' : 'text-cyan-500'}`}>{type.toUpperCase()}</p>
                             </button>
                           )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ShipyardPanel;