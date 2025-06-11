import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 border-4 border-white/20 rounded-full"></div>
        {/* Inner spinning ring */}
        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        {/* Center ice crystal */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 rounded-lg rotate-45 animate-pulse"></div>
      </div>
      
      <div className="mt-6 text-center">
        <h2 className="text-white text-xl font-semibold mb-2">Loading Yeti Talki...</h2>
        <p className="text-white/70 text-sm">Connecting to the frozen frequencies</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
