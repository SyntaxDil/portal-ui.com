import React from 'react';
import { PortalService } from '../../../types';
import { ChevronLeftIcon } from '../../common/Icons';

const PortalWrapper: React.FC<{ portal: PortalService; onReturn: () => void; children: React.ReactNode }> = ({ portal, onReturn, children }) => {
    return (
        <main className="relative min-h-screen w-full bg-gray-900 text-gray-300 overflow-y-auto p-4 sm:p-6 md:p-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900/20 to-black z-0"></div>
            <div className="relative z-10 max-w-7xl mx-auto">
                <button onClick={onReturn} className="font-orbitron flex items-center mb-6 text-cyan-400 hover:text-white transition-colors duration-300">
                    <ChevronLeftIcon /> Return to Hub
                </button>
                <div className="text-center mb-8 border-b-2 border-cyan-500/20 pb-4">
                    <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-cyan-300 tracking-wider uppercase">{portal.name}</h1>
                    <p className="text-gray-400 mt-2 text-lg">Developer Integration & Feature Showcase</p>
                </div>
                {children}
            </div>
        </main>
    );
};

export default PortalWrapper;
