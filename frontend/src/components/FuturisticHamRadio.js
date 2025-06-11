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
  const [frequencyBars, setFrequencyBars] = useState(Array(30).fill(0));

  // Sample Yeti NFT images for display
  const yetiNFTs = [
    'https://pbs.twimg.com/profile_images/1932109015816773632/VHzq_Axr_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1932591648753467392/wQRSESav_400x400.jpg'
  ];

  // Animate frequency bars
  useEffect(() => {
    const interval = setInterval(() => {
      setFrequencyBars(prevBars => 
        prevBars.map(() => Math.random() * 100)
      );
    }, 150);

    return () => clearInterval(interval);
  }, []);

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
    <div className="fixed inset-0 overflow-auto">
      {/* Scan Line Effect */}
      <div className="scan-line fixed inset-0 pointer-events-none z-10"></div>
      
      {/* Main Terminal Container - Full Screen */}
      <div className="retro-terminal min-h-screen p-8 relative overflow-hidden">
        {/* Grid Overlay */}
        <div className="grid-overlay absolute inset-0 opacity-30"></div>
        
        {/* Header */}
        <div className="relative z-20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">YT</span>
              </div>
              <h1 className="retro-text text-4xl font-bold tracking-wider">YETI TALKI</h1>
              <div className="flex items-center space-x-3 text-sm">
                <span className="retro-text-orange">Built with</span>
                <img 
                  src="https://pbs.twimg.com/profile_images/1932591648753467392/wQRSESav_400x400.jpg" 
                  alt="Yeti Tech" 
                  className="w-6 h-6 rounded-full border border-orange-500"
                />
                <span className="retro-text-orange">YETI TECH</span>
              </div>
            </div>
            <div className="text-right">
              <div className="retro-text-cyan text-lg">APE CHAIN NETWORK</div>
              <div className="retro-text">OPERATOR: YETI #{user?.tokenId}</div>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="frequency-display rounded p-4 flex items-center justify-between">
            <div className="flex items-center space-x-8 text-lg">
              <div>FREQ: {frequency} MHz</div>
              <div>SIGNAL: {signalStrength}%</div>
              <div>ACTIVE: {activeUsers} YETIS</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                isTransmitting ? 'transmitting-light' : 
                isReceiving ? 'receiving-light' : 
                'standby-light'
              } status-light`}></div>
              <span className="text-lg font-bold">{
                isTransmitting ? 'TRANSMITTING' : 
                isReceiving ? 'RECEIVING' : 
                'STANDBY'
              }</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Left Panel - NFT Display */}
          <div className="space-y-6">
            {/* Large NFT Display Panel */}
            <div className="nft-display-panel rounded-lg p-6 h-96">
              <div className="retro-text-cyan text-lg mb-4 text-center font-bold">
                {currentSender ? 'INCOMING TRANSMISSION' : 'CHANNEL MONITOR'}
              </div>
              
              <div className="h-full flex items-center justify-center">
                {currentSender ? (
                  <div className="text-center">
                    <img 
                      src={currentSender.image}
                      alt={`Yeti #${currentSender.tokenId}`}
                      className="w-48 h-48 rounded-lg mx-auto mb-6 nft-glow border-3 border-cyan-400"
                    />
                    <div className="retro-text-cyan text-2xl font-bold">
                      YETI #{currentSender.tokenId}
                    </div>
                    <div className="retro-text text-lg">
                      DURATION: {currentSender.duration}s
                    </div>
                    {isReceiving && (
                      <div className="mt-3 retro-text-orange animate-pulse">
                        ● RECEIVING AUDIO ●
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-dashed border-gray-600 rounded-lg mx-auto mb-6 flex items-center justify-center">
                      <div className="retro-text opacity-50">
                        NO SIGNAL
                      </div>
                    </div>
                    <div className="retro-text text-lg opacity-70">
                      AWAITING TRANSMISSION
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Frequency Analyzer */}
            <div className="control-panel rounded-lg p-6 flex-1">
              <div className="retro-text-orange text-lg mb-4 font-bold">FREQUENCY ANALYZER</div>
              <div className="flex items-end space-x-1 h-32">
                {frequencyBars.map((height, i) => (
                  <div
                    key={i}
                    className="signal-bars w-4 rounded-t transition-all duration-150"
                    style={{ 
                      height: `${height}%`,
                      opacity: isTransmitting || isReceiving ? 1 : 0.7
                    }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs retro-text mt-2">
                <span>20Hz</span>
                <span>1kHz</span>
                <span>10kHz</span>
                <span>20kHz</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-6">
            {/* Transmission Display */}
            <div className="control-panel rounded-lg p-6">
              <div className="retro-text-orange text-lg mb-4 font-bold">TRANSMISSION CONTROL</div>
              
              <div className="bg-black rounded p-4 mb-6">
                {isTransmitting ? (
                  <div>
                    <div className="retro-text text-2xl font-mono text-center mb-4">
                      ● REC {transmissionTime.toFixed(1)}s
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-100"
                        style={{ width: `${(transmissionTime / 30) * 100}%` }}
                      ></div>
                    </div>
                    <div className="retro-text-orange text-sm text-center mt-2">
                      MAX: 30s
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="retro-text text-xl font-mono mb-3">
                      READY TO TRANSMIT
                    </div>
                    <div className="retro-text-cyan">
                      PRESS & HOLD PTT BUTTON
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-8">
                {/* Play Button */}
                <button
                  onClick={playMessage}
                  disabled={!currentSender || isReceiving || isTransmitting}
                  className={`play-button w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl transition-all duration-200 ${
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
                  className="ptt-button w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="text-sm mb-1">PTT</div>
                  <div className="text-3xl">📡</div>
                  <div className="text-sm mt-1">
                    {isTransmitting ? 'XMIT' : 'PUSH'}
                  </div>
                </button>
              </div>
            </div>

            {/* Network Status */}
            <div className="control-panel rounded-lg p-6">
              <div className="retro-text-orange text-lg mb-4 font-bold">NETWORK STATUS</div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="retro-text">NETWORK:</span>
                  <span className="retro-text-cyan">APE CHAIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="retro-text">WALLET:</span>
                  <span className="retro-text-cyan">{user?.walletAddress?.slice(0, 10)}...</span>
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
            <div className="control-panel rounded-lg p-6">
              <div className="retro-text-orange text-lg mb-4 font-bold">SYSTEM CONTROLS</div>
              <div className="space-y-3">
                <button 
                  onClick={disconnect}
                  className="retro-button w-full py-3 px-6 rounded font-bold text-lg"
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