
import React, { useState, useEffect } from 'react';
import { ResourcesIcon, HullIcon, EnergyIcon } from './IconComponents';
import TypewriterText from './TypewriterText';

interface ScanResult {
    description: string;
    effects: {
        resources?: number;
        energy?: number;
        hull?: number;
    };
}

interface ScanResultsPanelProps {
    isLoading: boolean;
    result: ScanResult | null;
    sectorCoords: { x: number; y: number };
    onClose: () => void;
}

const ScanResultsPanel: React.FC<ScanResultsPanelProps> = ({ isLoading, result, sectorCoords, onClose }) => {
    const [isTyping, setIsTyping] = useState(true);
    
    useEffect(() => {
        if (result) {
            setIsTyping(true);
        }
    }, [result]);

    const renderEffects = () => {
        if (!result || !result.effects) return null;

        const effectsEntries = Object.entries(result.effects).filter(([_, value]) => value !== undefined && value !== 0);
        if (effectsEntries.length === 0) {
            return <p className="text-center text-gray-400 font-mono text-sm mt-4">No significant anomalies detected.</p>
        }

        return (
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                {effectsEntries.map(([key, value]) => {
                    // FIX: Explicitly cast value to number to resolve TypeScript error.
                    const isPositive = (value as number) > 0;
                    const color = key === 'hull' && !isPositive ? 'text-red-400' : (isPositive ? 'text-green-400' : 'text-yellow-400');
                    const icon = {
                        resources: <ResourcesIcon className="w-6 h-6" />,
                        energy: <EnergyIcon className="w-6 h-6" />,
                        hull: <HullIcon className="w-6 h-6" />,
                    }[key as 'resources' | 'energy' | 'hull'];

                    return (
                        <div key={key} className={`flex flex-col items-center p-2 bg-slate-900/50 border border-slate-700 ${color}`}>
                            {icon}
                            <span className="font-display text-lg font-bold">{isPositive ? `+${value}` : value}</span>
                            <span className="text-xs font-mono uppercase">{key}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="w-full max-w-md bg-slate-900/80 border-2 border-[var(--primary-glow)] shadow-2xl shadow-cyan-900/50 p-4 relative">
                {/* Corner Brackets */}
                <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[var(--primary-glow)] opacity-70"></div>
                <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-[var(--primary-glow)] opacity-70"></div>
                <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-[var(--primary-glow)] opacity-70"></div>
                <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[var(--primary-glow)] opacity-70"></div>

                <h2 className="text-xl font-display text-center text-[var(--primary-glow)] tracking-widest pb-2 border-b-2 border-[var(--border-color)]">
                   {isLoading ? 'SCAN IN PROGRESS...' : `SCAN COMPLETE: SECTOR [${sectorCoords.x}, ${sectorCoords.y}]`}
                </h2>

                <div className="min-h-[12rem] py-4 font-mono text-sm">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                           <div className="w-24 h-24 rounded-full bg-cyan-900/20 border-2 border-cyan-500/50 relative overflow-hidden">
                               <div className="absolute w-full h-full bg-gradient-to-t from-cyan-500/50 to-transparent animate-spin-slow"></div>
                               <div className="absolute inset-1 rounded-full bg-slate-900"></div>
                           </div>
                           <p className="mt-4 text-cyan-400 animate-pulse">Analyzing sensor readings...</p>
                        </div>
                    )}
                    {!isLoading && result && (
                        <div>
                            <TypewriterText text={result.description} onFinished={() => setIsTyping(false)} className="text-gray-300 italic" />
                            {!isTyping && renderEffects()}
                        </div>
                    )}
                     {!isLoading && !result && (
                         <div className="flex items-center justify-center h-full">
                            <p className="text-red-400">Scan failed. Subspace interference is too strong.</p>
                         </div>
                     )}
                </div>

                <button
                    onClick={onClose}
                    disabled={isLoading || isTyping}
                    className="w-full mt-2 bg-cyan-800/50 border border-cyan-600 text-cyan-300 hover:bg-cyan-700/50 hover:text-white disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-1.5 transition-all duration-200 font-display tracking-widest"
                >
                    CLOSE REPORT
                </button>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-spin-slow { animation: spin 3s linear infinite; }
            `}</style>
        </div>
    )
}

export default ScanResultsPanel;
