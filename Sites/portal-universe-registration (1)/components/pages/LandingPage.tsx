import React from 'react';

const LandingPage: React.FC<{ onAnimationComplete: () => void }> = ({ onAnimationComplete }) => {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 text-gray-200 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900/50 to-gray-900 z-0"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
      <div className="absolute w-[500px] h-[500px] flex items-center justify-center">
        <div className="portal-ring ring1"></div>
        <div className="portal-ring ring2"></div>
        <div className="portal-ring ring3"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center p-8 animate-[fadeIn_3s_ease-out]">
        <h1 
          className="font-orbitron text-6xl md:text-8xl font-bold text-cyan-300 tracking-widest uppercase"
          style={{ animation: 'flicker 2s linear infinite' }}
        >
          Portal.UI
        </h1>
        <p className="text-gray-400 mt-4 text-lg md:text-xl max-w-lg">
          Your gateway to the new universe is initializing. Prepare for calibration.
        </p>
        <button
          onClick={onAnimationComplete}
          className="font-orbitron mt-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-10 rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 tracking-widest uppercase"
        >
          Initiate Connection
        </button>
      </div>
    </main>
  );
};

export default LandingPage;
