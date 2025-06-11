import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 border-4 border-green-500/20 rounded-full"></div>
        {/* Inner spinning ring */}
        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-green-400 rounded-full animate-spin"></div>
        {/* Center terminal */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-green-400/30 rounded border border-green-400 animate-pulse"></div>
      </div>
      
      <div className="mt-6 text-center">
        <h2 className="retro-text text-xl font-bold mb-2">INITIALIZING YETI TALKI...</h2>
        <p className="retro-text-cyan text-sm">Connecting to APE CHAIN network</p>
        <div className="flex justify-center space-x-1 mt-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
