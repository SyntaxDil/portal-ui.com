

import React, { useState } from 'react';
import SpaceGrid from './SpaceGrid';
import SidePanel from './SidePanel';
import { Ship, GridCell, TravelInfo, InteractiveEvent, Achievement, ShipUpgrades, ShipType } from '../types';
import { ScanIcon, TrophyIcon } from './IconComponents';
import SectorDetailsPanel from './SectorDetailsPanel';
import ShipyardPanel from './ShipyardPanel';
import TypewriterText from './TypewriterText';
import ScanResultsPanel from './ScanResultsPanel';
import { generateScanResult } from '../services/geminiService';

const formatTime = (ms: number): string => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TravelProgress: React.FC<{ travelInfo: TravelInfo | null, isPaused: boolean }> = ({ travelInfo, isPaused }) => {
    const [progress, setProgress] = useState(0);
    const [eta, setEta] = useState(0);
    React.useEffect(() => {
        if (!travelInfo) {
            setProgress(0);
            setEta(0);
            return;
        }
        const updateProgress = () => {
            const now = Date.now();
            const elapsed = isPaused ? (travelInfo.duration - travelInfo.timeRemaining) : now - travelInfo.startTime;
            const currentProgress = Math.min(100, (elapsed / travelInfo.duration) * 100);
            setProgress(currentProgress);
            setEta(travelInfo.duration - elapsed);
        };
        updateProgress();
        const interval = setInterval(() => { if (!isPaused) updateProgress(); }, 1000);
        return () => clearInterval(interval);
    }, [travelInfo, isPaused]);
    if (!travelInfo) return null;
    return (
        <div>
            <div className="w-full bg-cyan-900/50 rounded-full h-2 my-2 border border-cyan-700/50">
                <div className="bg-[var(--secondary-glow)] h-full rounded-full shadow-[0_0_8px_var(--secondary-glow)]" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-yellow-400 text-right">ETA: {formatTime(eta)}</p>
        </div>
    );
};

const StatBar: React.FC<{ label: string; value: number; max?: number; color: string }> = ({ label, value, max = 100, color }) => (
    <div>
        <div className="flex justify-between text-sm">
            <span>{label}</span>
            <span className="text-white">{value}{max !== 100 ? `/${max}` : '%'}</span>
        </div>
        <div className="w-full bg-slate-800/50 rounded-full h-2 border border-slate-700/50">
            <div className={`h-full rounded-full`} style={{ width: `${(value/max)*100}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}></div>
        </div>
    </div>
);

const AchievementsPanel: React.FC<{achievements: Achievement[]}> = ({ achievements }) => (
    <div className="space-y-3">
        {achievements.map(ach => (
            <div key={ach.id} className={`p-2 border border-cyan-800/50 transition-all duration-300 ${ach.isUnlocked ? 'bg-cyan-900/40' : 'bg-slate-800/30 opacity-60'}`}>
                <div className="flex items-center">
                    <TrophyIcon className={`w-5 h-5 mr-3 ${ach.isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`} />
                    <div>
                        <h4 className={`font-bold font-display tracking-wide ${ach.isUnlocked ? 'text-white' : 'text-gray-400'}`}>{ach.name}</h4>
                        <p className="text-xs text-gray-400 italic">{ach.description}</p>
                        {ach.isUnlocked && <p className="text-xs text-green-400">REWARD: {ach.xpReward} XP</p>}
                    </div>
                </div>
            </div>
        ))}
    </div>
);


interface GamePageProps {
    ship: Ship;
    gridData: GridCell[][];
    visualShipPos: { x: number; y: number; };
    shipRotation: number;
    travelInfo: TravelInfo | null;
    activeEvent: InteractiveEvent | null;
    selectedSector: GridCell | null;
    achievements: Achievement[];
    eventLog: { id: number; message: string; isTyping: boolean; }[];
    setEventLog: React.Dispatch<React.SetStateAction<{ id: number; message: string; isTyping: boolean; }[]>>;
    isGeneratingEvent: boolean;
    isResolvingChoice: boolean;
    xpToNextLevel: () => number;
    handleSetCourse: (x: number, y: number) => void;
    onSectorSelect: (sector: GridCell) => void;
    handleChoice: (choice: string) => void;
    handleScanCurrentSector: () => void;
    saveGame: () => void;
    loadGame: () => void;
    handleUpgrade: (system: keyof ShipUpgrades) => void;
    handleShipTypeChange: (newType: ShipType) => void;
    scanResultData: { isLoading: boolean; result: Awaited<ReturnType<typeof generateScanResult>>; sectorCoords: {x:number, y:number} } | null;
    handleCloseScanPanel: () => void;
}


const GamePage: React.FC<GamePageProps> = ({
    ship, gridData, visualShipPos, shipRotation, travelInfo, activeEvent, selectedSector,
    achievements, eventLog, setEventLog, isGeneratingEvent, isResolvingChoice, xpToNextLevel,
    handleSetCourse, onSectorSelect, handleChoice, handleScanCurrentSector,
    saveGame, loadGame, handleUpgrade, handleShipTypeChange, scanResultData, handleCloseScanPanel
}) => {
    const [activeTab, setActiveTab] = useState('operations');
    const [mobileView, setMobileView] = useState<'command' | 'grid' | 'sector'>('grid');
    const xpProgress = (ship.xp / xpToNextLevel()) * 100;

    const handleRadialMenuAction = (action: string) => {
        switch(action) {
            case 'shipyard':
                setActiveTab('shipyard');
                setMobileView('command');
                break;
            case 'scan':
                handleScanCurrentSector();
                break;
            case 'achievements':
                setActiveTab('achievements');
                setMobileView('command');
                break;
            default:
                break;
        }
    };

    const CommandPanelComponent = (
        <SidePanel title="COMMAND INTERFACE" className="h-full">
            <div className="flex border-b-2 border-[var(--border-color)] mb-2">
                <button onClick={() => setActiveTab('operations')} className={`flex-1 text-xs font-display tracking-widest p-1 transition-colors ${activeTab === 'operations' ? 'text-white bg-cyan-800/40' : 'text-cyan-500 hover:bg-cyan-900/50'}`}>OPERATIONS</button>
                <button onClick={() => setActiveTab('shipyard')} className={`flex-1 text-xs font-display tracking-widest p-1 transition-colors ${activeTab === 'shipyard' ? 'text-white bg-cyan-800/40' : 'text-cyan-500 hover:bg-cyan-900/50'}`}>SHIPYARD</button>
                <button onClick={() => setActiveTab('achievements')} className={`flex-1 text-xs font-display tracking-widest p-1 transition-colors ${activeTab === 'achievements' ? 'text-white bg-cyan-800/40' : 'text-cyan-500 hover:bg-cyan-900/50'}`}>FILE</button>
            </div>
            <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
                {activeTab === 'operations' && (
                    <div className="space-y-3 font-mono text-sm">
                        <h3 className="text-lg font-display text-center text-cyan-300">SHIP SYSTEMS</h3>
                        <div>
                            <p>COORDS: <span className="text-white font-bold float-right">[{ship.x}, {ship.y}]</span></p>
                            <p>STATUS: <span className={`font-bold float-right ${ship.status === 'IDLE' ? 'text-green-400' : 'text-yellow-400'}`}>{ship.status}</span></p>
                        </div>
                        {ship.status === 'TRAVELING' && travelInfo && (
                        <div className="pt-1">
                            <p>DEST: <span className="text-white font-bold float-right">[{travelInfo.destinationX}, {travelInfo.destinationY}]</span></p>
                            <TravelProgress travelInfo={travelInfo} isPaused={!!activeEvent} />
                        </div>
                        )}
                        <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                            <StatBar label="HULL" value={ship.hull} max={ship.maxHull} color="#00ff00" />
                            <StatBar label="ENERGY" value={ship.energy} color="#00ffff" />
                            <StatBar label="RESOURCES" value={ship.resources} color="#ff9900" />
                        </div>
                        <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                            <div className="flex justify-between items-center text-sm">
                                <span>LEVEL: <span className="font-bold text-white">{ship.level}</span></span>
                                <span>XP: <span className="font-bold text-white">{ship.xp} / {xpToNextLevel()}</span></span>
                            </div>
                            <div className="w-full bg-slate-800/50 h-2 border border-slate-700/50">
                                <div className={`h-full bg-green-500 shadow-[0_0_6px_#22c55e]`} style={{ width: `${xpProgress}%`}}></div>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2 mt-2 border-t border-[var(--border-color)]">
                            <button onClick={() => saveGame()} className="flex-1 flex items-center justify-center gap-2 bg-blue-800/50 border border-blue-600 text-blue-300 hover:bg-blue-700/50 hover:text-white px-2 py-1.5 transition-all duration-200 font-display text-xs">
                                SAVE
                            </button>
                            <button onClick={loadGame} className="flex-1 flex items-center justify-center gap-2 bg-blue-800/50 border border-blue-600 text-blue-300 hover:bg-blue-700/50 hover:text-white px-2 py-1.5 transition-all duration-200 font-display text-xs">
                                LOAD
                            </button>
                        </div>
                        <button onClick={handleScanCurrentSector} disabled={ship.scans <= 0 || ship.status !== 'IDLE' || isGeneratingEvent} className="w-full mt-2 flex items-center justify-center gap-2 bg-cyan-800/50 border border-cyan-600 text-cyan-300 hover:bg-cyan-700/50 hover:text-white disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-1.5 transition-all duration-200 font-display">
                            <ScanIcon className="w-4 h-4" />
                            SCAN SECTOR ({ship.scans} left)
                        </button>
                        {activeEvent && (
                            <div className="pt-3 mt-3 border-t-2 border-yellow-400/50">
                                <h3 className="text-yellow-400 font-bold text-center font-display tracking-wider animate-pulse">DECISION REQUIRED</h3>
                                <p className="text-sm text-gray-300 my-2 italic">"{activeEvent.description}"</p>
                                <div className="flex flex-col gap-2 mt-3">
                                    {activeEvent.choices.map((choice, i) => (
                                        <button key={i} onClick={() => handleChoice(choice)} disabled={isResolvingChoice} className="w-full bg-slate-800/80 border border-yellow-500/80 text-yellow-300 hover:bg-yellow-500/20 hover:text-white disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-wait px-3 py-1.5 text-center transition-all duration-200 font-display">
                                            {isResolvingChoice ? 'PROCESSING...' : `> ${choice.toUpperCase()}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="pt-3 mt-3 border-t-2 border-cyan-400/50">
                            <h3 className="text-lg font-display text-center text-cyan-300">SYSTEM LOG</h3>
                            <div className="space-y-2 text-sm font-mono flex flex-col-reverse h-64 overflow-y-auto mt-2 bg-black/20 p-1">
                                {isGeneratingEvent && <p className="text-yellow-400 animate-pulse pb-2">Receiving transmission...</p>}
                                {eventLog.map((log) => (
                                <div key={log.id} className="text-gray-300 border-b border-cyan-900/50 pb-1.5 opacity-90 first:border-b-0">
                                    <span className="text-cyan-600 mr-1.5">[{new Date().toLocaleTimeString()}]</span>
                                    {log.isTyping ? <TypewriterText text={log.message} onFinished={() => { setEventLog(prev => prev.map(l => l.id === log.id ? {...l, isTyping: false} : l)) }} className="inline" /> : <p className="inline">{log.message}</p>}
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'shipyard' && <ShipyardPanel ship={ship} onUpgrade={handleUpgrade} onShipTypeChange={handleShipTypeChange} />}
                {activeTab === 'achievements' && <AchievementsPanel achievements={achievements} />}
            </div>
        </SidePanel>
    );

    const GridComponent = (
        <main className="w-full h-full flex items-center justify-center p-2 bg-black/30 border border-[var(--border-color)] overflow-auto">
            {gridData.length > 0 ? (
                <SpaceGrid 
                    gridData={gridData} 
                    ship={visualShipPos}
                    shipRotation={shipRotation}
                    actualShip={ship} 
                    travelInfo={travelInfo}
                    onCellClick={(x, y) => onSectorSelect(gridData[y][x])}
                    canInteract={!activeEvent}
                    selectedSector={selectedSector}
                    onRadialMenuAction={handleRadialMenuAction}
                />
            ) : (
                <p className="text-2xl font-display animate-pulse">Initializing Star Chart...</p>
            )}
        </main>
    );

    const SectorDetailsComponent = (
        <SectorDetailsPanel
            className="h-full"
            sector={selectedSector} 
            ship={ship}
            onSetCourse={handleSetCourse}
            canInteract={!activeEvent && ship.status === 'IDLE'}
        />
    );

    return (
        <div className="h-full relative">
            {/* DESKTOP VIEW */}
            <div className="hidden lg:grid grid-cols-5 gap-4 h-full">
                <div className="col-span-1 h-full">
                    {CommandPanelComponent}
                </div>
                <div className="col-span-3 h-full">
                    {GridComponent}
                </div>
                <div className="col-span-1 h-full">
                    {SectorDetailsComponent}
                </div>
            </div>

            {/* MOBILE VIEW */}
            <div className="lg:hidden flex flex-col h-full">
                <div className="flex-grow min-h-0">
                    {mobileView === 'command' && CommandPanelComponent}
                    {mobileView === 'grid' && GridComponent}
                    {mobileView === 'sector' && SectorDetailsComponent}
                </div>

                <div className="flex-shrink-0 grid grid-cols-3 border-t-2 border-[var(--border-color)] bg-slate-900/80 backdrop-blur-sm">
                    <button onClick={() => setMobileView('command')} className={`font-display text-sm p-3 transition-colors ${mobileView === 'command' ? 'text-white bg-cyan-800/40' : 'text-cyan-400 hover:bg-cyan-900/50'}`}>
                        COMMAND
                    </button>
                    <button onClick={() => setMobileView('grid')} className={`font-display text-sm p-3 transition-colors ${mobileView === 'grid' ? 'text-white bg-cyan-800/40' : 'text-cyan-400 hover:bg-cyan-900/50'}`}>
                        GRID
                    </button>
                    <button onClick={() => setMobileView('sector')} className={`font-display text-sm p-3 transition-colors ${mobileView === 'sector' ? 'text-white bg-cyan-800/40' : 'text-cyan-400 hover:bg-cyan-900/50'}`}>
                        SECTOR
                    </button>
                </div>
            </div>
            
            {scanResultData && (
                <ScanResultsPanel
                    isLoading={scanResultData.isLoading}
                    result={scanResultData.result}
                    sectorCoords={scanResultData.sectorCoords}
                    onClose={handleCloseScanPanel}
                />
            )}
        </div>
    );
};

export default GamePage;
