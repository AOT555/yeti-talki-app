import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FuturisticHamRadio = () => {
  const { user, disconnect } = useAuth();
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [transmissionTime, setTransmissionTime] = useState(0);
  const [currentSender, setCurrentSender] = useState(null);
  const [frequency] = useState('147.420');
  const [signalStrength] = useState(85);
  const [activeUsers] = useState(23);

  // Sample Yeti NFT images for display
  const yetiNFTs = [
    'https://pbs.twimg.com/profile_images/1932109015816773632/VHzq_Axr_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1932591648753467392/wQRSESav_400x400.jpg'
  ];

  const handleTransmit = () => {
    if (isTransmitting) {
      setIsTransmitting(false);
      setTransmissionTime(0);
      
      // Simulate incoming message after transmission
      setTimeout(() => {
        setCurrentSender({
          tokenId: Math.floor(Math.random() * 5000) + 1,
          image: yetiNFTs[Math.floor(Math.random() * yetiNFTs.length)],
          duration: 4.2
        });
        setIsReceiving(true);
        setTimeout(() => setIsReceiving(false), 4200);
      }, 800);
    } else {
      setIsTransmitting(true);
      
      // Simulate transmission timer
      const timer = setInterval(() => {
        setTransmissionTime(prev => {
          if (prev >= 30) {
            setIsTransmitting(false);
            clearInterval(timer);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
  };

  const playMessage = () => {
    if (currentSender && !isReceiving) {
      setIsReceiving(true);
      setTimeout(() => {
        setIsReceiving(false);
        setCurrentSender(null);
      }, currentSender.duration * 1000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Scan Line Effect */}
      <div className="scan-line fixed inset-0 pointer-events-none z-10"></div>
      
      {/* Main Terminal Container */}
      <div className="retro-terminal rounded-lg p-6 relative overflow-hidden">
        {/* Grid Overlay */}
        <div className="grid-overlay absolute inset-0 opacity-30"></div>
        
        {/* Header */}
        <div className="relative z-20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-black font-bold text-sm">YT</span>
              </div>
              <h1 className="retro-text text-2xl font-bold tracking-wider">YETI TALKI</h1>
              <div className="flex items-center space-x-2 text-xs">
                <span className="retro-text-orange">Built with</span>
                <img 
                  src="https://pbs.twimg.com/profile_images/1932591648753467392/wQRSESav_400x400.jpg" 
                  alt="Yeti Tech" 
                  className="w-4 h-4 rounded-full border border-orange-500"
                />
                <span className="retro-text-orange">YETI TECH</span>
              </div>
            </div>
            <div className="text-right">
              <div className="retro-text-cyan text-sm">APE CHAIN NETWORK</div>
              <div className="retro-text text-xs">OPERATOR: YETI #{user?.tokenId}</div>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="frequency-display rounded p-2 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div>FREQ: {frequency} MHz</div>
              <div>SIGNAL: {signalStrength}%</div>
              <div>ACTIVE: {activeUsers} YETIS</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isTransmitting ? 'transmitting-light' : 
                isReceiving ? 'receiving-light' : 
                'standby-light'
              } status-light`}></div>
              <span>{
                isTransmitting ? 'TRANSMITTING' : 
                isReceiving ? 'RECEIVING' : 
                'STANDBY'
              }</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - NFT Display */}
          <div className="space-y-4">
            {/* Large NFT Display Panel */}
            <div className="nft-display-panel rounded-lg p-4 h-80">
              <div className="retro-text-cyan text-sm mb-3 text-center">
                {currentSender ? 'INCOMING TRANSMISSION' : 'CHANNEL MONITOR'}
              </div>
              
              <div className="h-full flex items-center justify-center">
                {currentSender ? (
                  <div className="text-center">
                    <img 
                      src={currentSender.image}
                      alt={`Yeti #${currentSender.tokenId}`}
                      className="w-40 h-40 rounded-lg mx-auto mb-4 nft-glow border-2 border-cyan-400"
                    />
                    <div className="retro-text-cyan text-lg font-bold">
                      YETI #{currentSender.tokenId}
                    </div>
                    <div className="retro-text text-sm">
                      DURATION: {currentSender.duration}s
                    </div>
                    {isReceiving && (
                      <div className="mt-2 retro-text-orange text-xs animate-pulse">
                        ● RECEIVING AUDIO ●
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-40 h-40 border-2 border-dashed border-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="retro-text opacity-50 text-sm">
                        NO SIGNAL
                      </div>
                    </div>
                    <div className="retro-text text-sm opacity-70">
                      AWAITING TRANSMISSION
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Signal Strength Bars */}
            <div className="control-panel rounded-lg p-4">
              <div className="retro-text-orange text-xs mb-2">SIGNAL ANALYZER</div>
              <div className="flex items-end space-x-1 h-12">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`signal-bars w-2 rounded-t transition-all duration-300 ${
                      i < (signalStrength / 5) ? 'opacity-100' : 'opacity-20'
                    }`}
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-4">
            {/* Transmission Display */}
            <div className="control-panel rounded-lg p-4">
              <div className="retro-text-orange text-sm mb-3">TRANSMISSION CONTROL</div>
              
              <div className="bg-black rounded p-3 mb-4">
                {isTransmitting ? (
                  <div>
                    <div className="retro-text text-xl font-mono text-center mb-2">
                      ● REC {transmissionTime.toFixed(1)}s
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-100"
                        style={{ width: `${(transmissionTime / 30) * 100}%` }}
                      ></div>
                    </div>
                    <div className="retro-text-orange text-xs text-center mt-1">
                      MAX: 30s
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="retro-text text-lg font-mono mb-2">
                      READY TO TRANSMIT
                    </div>
                    <div className="retro-text-cyan text-xs">
                      PRESS & HOLD PTT BUTTON
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-6">
                {/* Play Button */}
                <button
                  onClick={playMessage}
                  disabled={!currentSender || isReceiving || isTransmitting}
                  className={`play-button w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-200 ${
                    !currentSender || isReceiving || isTransmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-110 active:scale-95'
                  }`}
                >
                  {isReceiving ? '⏸' : '▶'}
                </button>

                {/* PTT Button */}
                <button
                  onClick={handleTransmit}
                  className="ptt-button w-24 h-24 rounded-full flex flex-col items-center justify-center text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="text-xs mb-1">PTT</div>
                  <div className="text-2xl">📡</div>
                  <div className="text-xs mt-1">
                    {isTransmitting ? 'XMIT' : 'PUSH'}
                  </div>
                </button>
              </div>
            </div>

            {/* Network Status */}
            <div className="control-panel rounded-lg p-4">
              <div className="retro-text-orange text-sm mb-3">NETWORK STATUS</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="retro-text">NETWORK:</span>
                  <span className="retro-text-cyan">APE CHAIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="retro-text">WALLET:</span>
                  <span className="retro-text-cyan">{user?.walletAddress?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="retro-text">NFT ID:</span>
                  <span className="retro-text-cyan">#{user?.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="retro-text">STATUS:</span>
                  <span className="text-green-400">AUTHENTICATED</span>
                </div>
              </div>
            </div>

            {/* Power Controls */}
            <div className="control-panel rounded-lg p-4">
              <div className="retro-text-orange text-sm mb-3">SYSTEM CONTROLS</div>
              <div className="space-y-2">
                <button 
                  onClick={disconnect}
                  className="retro-button w-full py-2 px-4 rounded text-sm font-bold"
                >
                  SYSTEM SHUTDOWN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticHamRadio;