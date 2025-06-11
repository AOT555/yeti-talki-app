import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const WalkieTalkieInterface = () => {
  const { user, disconnect } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePTTClick = () => {
    if (isRecording) {
      setIsRecording(false);
      console.log('Stopped recording');
    } else {
      setIsRecording(true);
      console.log('Started recording');
    }
  };

  const handlePlayClick = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      console.log('Playing last message');
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Connection Status */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-500/20 text-green-200 border border-green-500/40">
          <div className="w-2 h-2 rounded-full mr-2 bg-green-400 animate-pulse"></div>
          Connected to Channel
        </div>
      </div>

      {/* Main Walkie-Talkie Body */}
      <div className="walkie-talkie-body rounded-3xl p-8 mx-auto max-w-sm relative overflow-hidden">
        {/* Ice Crystal Effects */}
        <div className="absolute inset-0 ice-crystal rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-lg rotate-12 ice-crystal"></div>
        <div className="absolute bottom-6 left-6 w-8 h-8 bg-white/15 rounded-lg -rotate-12 ice-crystal"></div>

        {/* Speaker Grille */}
        <div className="relative mb-8">
          <div className="bg-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 30 }, (_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-150 ${
                    isRecording 
                      ? 'bg-red-400 animate-pulse' 
                      : 'bg-gray-600'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex justify-center mt-4 space-x-4">
            {isRecording && (
              <div className="transmitting-indicator w-3 h-3 rounded-full status-light"></div>
            )}
            {!isRecording && (
              <div className="w-3 h-3 rounded-full bg-yellow-400/60 status-light"></div>
            )}
          </div>
        </div>

        {/* Display Screen */}
        <div className="bg-gray-900/60 rounded-xl p-4 mb-8 backdrop-blur-sm border border-white/10">
          <div className="text-center">
            {isRecording ? (
              <div>
                <p className="text-red-300 font-mono text-lg">REC</p>
                <p className="text-white/80 text-sm">Recording...</p>
              </div>
            ) : (
              <div>
                <p className="text-white/80 font-mono">STANDBY</p>
                <p className="text-white/60 text-xs">Ready to transmit</p>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-6 mb-6">
          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            disabled={isPlaying || isRecording}
            className={`play-button w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white/30 transition-all duration-200 ${
              isPlaying || isRecording
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-110 active:scale-95 shadow-lg'
            }`}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* PTT Button */}
          <button
            onClick={handlePTTClick}
            className={`ptt-button w-20 h-20 rounded-full flex flex-col items-center justify-center text-white font-bold border-4 border-white/50 transition-all duration-200 ${
              isRecording
                ? 'scale-110 shadow-2xl'
                : 'hover:scale-105 shadow-lg'
            }`}
          >
            <span className="text-xs">PTT</span>
            <span className="text-lg">🎙</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-white/70 text-xs">
          <p className="mb-1">
            {isRecording ? 'Click to stop recording' : 'Click PTT to talk'}
          </p>
          <p>Max 30 seconds per message</p>
        </div>
      </div>

      {/* Disconnect Button */}
      <div className="text-center mt-8">
        <button
          onClick={disconnect}
          className="text-white/60 hover:text-white/80 text-sm underline transition-colors"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

export default WalkieTalkieInterface;