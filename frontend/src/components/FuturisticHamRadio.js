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
  const [activityLog, setActivityLog] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPhonePad, setShowPhonePad] = useState(false);
  const [dialedNumber, setDialedNumber] = useState('');
  const [isRecordingVoicemail, setIsRecordingVoicemail] = useState(false);
  const [voicemailTime, setVoicemailTime] = useState(0);
  const [callingNumber, setCallingNumber] = useState(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  // Google Drive folder integration - latest audio file
  const [currentAudioFile, setCurrentAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [lastChecked, setLastChecked] = useState(null);
  // Store current audio instance for stop functionality
  const [currentAudio, setCurrentAudio] = useState(null);
  
  // Local audio file path - your King Yeti audio
  const KING_YETI_AUDIO = '/audio/king_yeti_audio.mp3';

  // NFT Images - Frosty Ape YETI Mob logos
  const frostyApeYetiMobLogo = 'https://pbs.twimg.com/profile_images/1932109015816773632/VHzq_Axr_400x400.jpg'; // #1003 logo
  const yetiTechLogo = 'https://pbs.twimg.com/profile_images/1932591648753467392/wQRSESav_400x400.jpg'; // #2559 logo

  // Generate mock activity log entries
  const generateLogEntry = (id) => {
    const now = new Date();
    const randomMinutesAgo = Math.floor(Math.random() * 1440); // Up to 24 hours ago
    const timestamp = new Date(now.getTime() - randomMinutesAgo * 60000);
    const types = ['normal', 'emergency', 'voicemail', 'yeti_tech'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: id,
      tokenId: Math.floor(Math.random() * 5000) + 1,
      image: type === 'yeti_tech' ? yetiTechLogo : frostyApeYetiMobLogo,
      timestamp: timestamp,
      duration: (Math.random() * 25 + 2).toFixed(1), // 2-27 seconds
      type: type,
      calledNumber: type === 'voicemail' ? Math.floor(Math.random() * 5000) + 1 : null,
      isYetiTech: type === 'yeti_tech'
    };
  };

  // Check for new audio files from Google Drive folder
  const checkForNewAudio = async () => {
    try {
      // For now, we'll use a direct file approach since Google Drive API requires authentication
      // You'll need to put a file in your folder and get its direct link
      // This is a simplified approach - for production, you'd use Google Drive API with proper auth
      
      // Example: If you put a file in your folder, you can get its direct link like this:
      // 1. Right-click the file in your folder → "Get link" 
      // 2. Change the sharing to "Anyone with the link can view"
      // 3. Convert the link format from: https://drive.google.com/file/d/FILE_ID/view
      // 4. To: https://drive.google.com/uc?export=download&id=FILE_ID
      
      // For demo purposes, let's check if there's a test file
      // You'll need to replace this with your actual file ID when you upload an audio file
      const testFileId = '1toEiG7tvIjkxV_6hTrAaRGcUOmhNaa_G'; // This is actually your folder ID
      const testFileUrl = `https://drive.google.com/uc?export=download&id=${testFileId}`;
      
      setCurrentAudioFile(testFileUrl);
      setAudioFileName('Google Drive Audio');
      setLastChecked(new Date());
      console.log('Checking Google Drive folder for audio files...');
      
    } catch (error) {
      console.log('Checking for audio files...', error);
    }
  };

  // Initialize with default King Yeti audio
  useEffect(() => {
    // Always set the King Yeti audio as default
    setCurrentAudioFile(KING_YETI_AUDIO);
    setAudioFileName('King Yeti Broadcast Audio');
    setLastChecked(new Date());
  }, []);

  // Periodically check for new audio (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(checkForNewAudio, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize activity log
  useEffect(() => {
    const initialLog = Array.from({ length: 50 }, (_, i) => generateLogEntry(i));
    setActivityLog(initialLog);
  }, []);

  // Animate frequency bars only when receiving audio
  useEffect(() => {
    let interval;
    
    if (isReceiving || isTransmitting || isRecordingVoicemail) {
      // Animate when audio is active
      interval = setInterval(() => {
        setFrequencyBars(prevBars => 
          prevBars.map(() => Math.random() * 100)
        );
      }, 150);
    } else {
      // Set bars to zero when no audio
      setFrequencyBars(Array(30).fill(0));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReceiving, isTransmitting, isRecordingVoicemail]);

  // Load more activity log entries
  const loadMoreEntries = () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      const newEntries = Array.from({ length: 20 }, (_, i) => 
        generateLogEntry(activityLog.length + i)
      );
      setActivityLog(prev => [...prev, ...newEntries]);
      setLoadingMore(false);
    }, 500);
  };

  // Handle scroll for infinite loading
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop === clientHeight) {
      loadMoreEntries();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'TODAY';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return 'YESTERDAY';
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Phone pad functions
  const handleNumberClick = (num) => {
    if (dialedNumber.length < 4) {
      setDialedNumber(prev => prev + num);
    }
  };

  const clearNumber = () => {
    setDialedNumber('');
  };

  const backspace = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const makeCall = () => {
    const number = parseInt(dialedNumber);
    if (number >= 1 && number <= 5000) {
      setCallingNumber(number);
      setShowPhonePad(false);
      setIsRecordingVoicemail(true);
      setVoicemailTime(0);
      
      // Start voicemail timer
      const timer = setInterval(() => {
        setVoicemailTime(prev => {
          if (prev >= 30) {
            setIsRecordingVoicemail(false);
            clearInterval(timer);
            
            // Add voicemail to activity log
            const voicemailEntry = {
              id: activityLog.length,
              tokenId: user?.tokenId,
              image: frostyApeYetiMobLogo,
              timestamp: new Date(),
              duration: prev.toFixed(1),
              type: 'voicemail',
              calledNumber: number
            };
            setActivityLog(prev => [voicemailEntry, ...prev]);
            setCallingNumber(null);
            setDialedNumber('');
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
  };

  const hangUp = () => {
    setIsRecordingVoicemail(false);
    setVoicemailTime(0);
    setCallingNumber(null);
    setDialedNumber('');
  };

  const handleTransmit = () => {
    // Show access denied popup instead of transmitting
    setShowAccessDenied(true);
  };

  const stopAudio = () => {
    console.log('Stop button clicked!');
    
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    setIsReceiving(false);
    setCurrentSender(null);
    console.log('Audio stopped and display cleared');
  };

  const playMessage = () => {
    console.log('Play button clicked!', { isReceiving, currentAudioFile });
    
    if (!isReceiving) {
      console.log('Setting isReceiving to true and showing King Yeti message');
      setIsReceiving(true);
      
      // Show the King Yeti Broadcast message
      setCurrentSender({
        tokenId: 'KING YETI',
        image: frostyApeYetiMobLogo,
        duration: 'BROADCAST',
        isKingYeti: true
      });

      // Always try to play audio (either saved or default)
      const audioToPlay = currentAudioFile || KING_YETI_AUDIO;
      console.log('Playing audio from:', audioToPlay);
      
      try {
        const audio = new Audio(audioToPlay);
        audio.crossOrigin = "anonymous"; // Help with CORS issues
        setCurrentAudio(audio); // Store audio instance for stop functionality
        
        audio.onloadstart = () => {
          console.log('Audio load started');
        };
        
        audio.oncanplay = () => {
          console.log('Audio can play');
        };
        
        audio.onended = () => {
          console.log('Audio ended');
          setIsReceiving(false);
          setCurrentSender(null);
          setCurrentAudio(null);
        };

        audio.onerror = (e) => {
          console.log('Audio error', e);
          console.error('Audio error details:', audio.error);
          // Show the message for 5 seconds if audio fails
          setTimeout(() => {
            console.log('5 seconds up, clearing message (audio error)');
            setIsReceiving(false);
            setCurrentSender(null);
            setCurrentAudio(null);
          }, 5000);
        };

        // Attempt to play the audio
        audio.play().then(() => {
          console.log('Audio playing successfully');
        }).catch(error => {
          console.error('Error playing audio:', error);
          // Show the message for 5 seconds if play fails
          setTimeout(() => {
            console.log('5 seconds up, clearing message (play error)');
            setIsReceiving(false);
            setCurrentSender(null);
            setCurrentAudio(null);
          }, 5000);
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
        // Just show the message for 5 seconds
        setTimeout(() => {
          console.log('5 seconds up, clearing message (setup error)');
          setIsReceiving(false);
          setCurrentSender(null);
          setCurrentAudio(null);
        }, 5000);
      }
    } else {
      console.log('Already receiving, ignoring click');
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col">
      {/* Scan Line Effect */}
      <div className="scan-line fixed inset-0 pointer-events-none z-10"></div>
      
      {/* Access Denied Popup */}
      {showAccessDenied && (
        <div className="fixed inset-0 bg-red-900/80 flex items-center justify-center z-50 animate-pulse">
          <div className="bg-black border-4 border-red-500 rounded-lg p-8 max-w-md text-center shadow-2xl">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <div className="text-red-400 text-3xl font-bold mb-4 animate-pulse">
              ACCESS DENIED
            </div>
            <img 
              src={frostyApeYetiMobLogo}
              alt="Frosty Ape YETI Mob" 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-red-500"
            />
            <div className="text-red-300 text-xl font-bold mb-4">
              MUST HAVE
            </div>
            <div className="text-red-200 text-lg font-bold mb-6">
              FROSTY APE YETI MOB NFT
            </div>
            <div className="space-y-3">
              <a
                href="https://x.com/FrostyApeYeti"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded font-bold transition-colors"
              >
                🐦 GET FROSTY APE YETI MOB
              </a>
              <button
                onClick={() => setShowAccessDenied(false)}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-6 rounded"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Phone Pad Modal */}
      {showPhonePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="nft-display-panel rounded-lg p-6 w-80">
            <div className="retro-text-cyan text-lg mb-4 text-center font-bold">
              YETI MOB CALL PAD
            </div>
            
            {/* NFT Preview Box */}
            {dialedNumber && parseInt(dialedNumber) >= 1 && parseInt(dialedNumber) <= 5000 && (
              <div className="bg-black rounded-lg p-4 mb-4 text-center border border-cyan-400/50">
                <div className="retro-text-cyan text-sm mb-3">CALLING:</div>
                <img 
                  src={frostyApeYetiMobLogo}
                  alt={`Frosty Ape YETI Mob #${dialedNumber}`}
                  className="w-24 h-24 rounded-lg mx-auto mb-3 border-2 border-cyan-400 nft-glow"
                />
                <div className="retro-text-cyan text-lg font-bold">
                  YETI MOB #{dialedNumber}
                </div>
                <div className="retro-text text-xs mt-1 opacity-70">
                  Ready to leave voicemail
                </div>
              </div>
            )}
            
            {/* Number Display */}
            <div className="bg-black rounded p-4 mb-4 text-center">
              <div className="retro-text text-2xl font-mono">
                {dialedNumber || '____'}
              </div>
              <div className="retro-text-orange text-xs mt-1">
                ENTER YETI MOB ID (1-5000)
              </div>
            </div>
            
            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map((key) => (
                <button
                  key={key}
                  onClick={() => key !== '*' && key !== '#' && handleNumberClick(key.toString())}
                  disabled={key === '*' || key === '#'}
                  className={`retro-button h-12 font-bold text-lg ${
                    key === '*' || key === '#' ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            
            {/* Controls */}
            <div className="flex space-x-3">
              <button
                onClick={backspace}
                className="retro-button flex-1 py-2 text-sm font-bold"
              >
                ⌫ BACK
              </button>
              <button
                onClick={clearNumber}
                className="retro-button flex-1 py-2 text-sm font-bold"
              >
                CLEAR
              </button>
              <button
                onClick={makeCall}
                disabled={!dialedNumber || parseInt(dialedNumber) < 1 || parseInt(dialedNumber) > 5000}
                className={`w-16 h-12 rounded font-bold ${
                  dialedNumber && parseInt(dialedNumber) >= 1 && parseInt(dialedNumber) <= 5000
                    ? 'bg-green-500 hover:bg-green-400 text-white'
                    : 'bg-gray-500 opacity-50 cursor-not-allowed text-gray-300'
                }`}
              >
                📞
              </button>
            </div>
            
            <button
              onClick={() => setShowPhonePad(false)}
              className="w-full mt-4 py-2 text-sm retro-text-cyan hover:text-white transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Voicemail Recording Modal */}
      {isRecordingVoicemail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="nft-display-panel rounded-lg p-8 w-96">
            <div className="retro-text-cyan text-lg mb-4 text-center font-bold">
              VOICEMAIL TO YETI MOB #{callingNumber}
            </div>
            
            <div className="bg-black rounded p-6 mb-6 text-center">
              <div className="retro-text text-xl font-mono mb-4">
                ● REC {voicemailTime.toFixed(1)}s
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-100"
                  style={{ width: `${(voicemailTime / 30) * 100}%` }}
                ></div>
              </div>
              <div className="retro-text-orange text-sm">
                RECORDING VOICEMAIL MESSAGE
              </div>
              <div className="retro-text-cyan text-xs mt-2">
                MAX: 30 seconds
              </div>
            </div>
            
            <button
              onClick={hangUp}
              className="w-full bg-red-500 hover:bg-red-400 text-white py-3 rounded font-bold text-lg"
            >
              📞 HANG UP
            </button>
          </div>
        </div>
      )}
      
      {/* Main Terminal Container */}
      <div className="retro-terminal flex-1 p-8 relative overflow-hidden">
        {/* Grid Overlay */}
        <div className="grid-overlay absolute inset-0 opacity-30"></div>
        
        {/* Header */}
        <div className="relative z-20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <img 
                src={frostyApeYetiMobLogo}
                alt="Frosty Ape YETI Mob" 
                className="w-12 h-12 rounded-full border-2 border-cyan-400 nft-glow"
              />
              <h1 className="retro-text-green text-4xl font-bold tracking-wider">YETI // TECH</h1>
              <div className="flex items-center space-x-3 text-sm">
                <span className="retro-text-orange">// POWERED BY</span>
                <img 
                  src={yetiTechLogo}
                  alt="Yeti Tech" 
                  className="w-6 h-6 rounded-full border border-orange-500"
                />
                <span className="retro-text-orange">YETI TECH PROTOCOL</span>
              </div>
            </div>
            <div className="text-right">
              <div className="retro-text-cyan text-lg">// APE CHAIN NETWORK</div>
              <div className="retro-text">// OPERATOR: YETI MOB #{user?.tokenId}</div>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="frequency-display rounded p-4 flex items-center justify-between">
            <div className="flex items-center space-x-8 text-lg">
              <div>FREQ: {frequency} MHz</div>
              <div>SIGNAL: {signalStrength}%</div>
              <div>ACTIVE: {activeUsers} YETI MOBS</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                isTransmitting ? 'transmitting-light' : 
                isReceiving ? 'receiving-light' : 
                isRecordingVoicemail ? 'transmitting-light' :
                'standby-light'
              } status-light`}></div>
              <span className="text-lg font-bold">{
                isTransmitting ? 'TRANSMITTING' : 
                isReceiving ? 'RECEIVING' : 
                isRecordingVoicemail ? 'VOICEMAIL' :
                'STANDBY'
              }</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-2 gap-8 h-[calc(50vh-100px)]">
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
                      alt={currentSender.isKingYeti ? 'King Yeti' : `Frosty Ape YETI Mob #${currentSender.tokenId}`}
                      className="w-48 h-48 rounded-lg mx-auto mb-6 nft-glow border-3 border-cyan-400"
                    />
                    {currentSender.isKingYeti ? (
                      <div>
                        <div className="retro-text-cyan text-2xl font-bold mb-2">
                          ACCESS GRANTED
                        </div>
                        <div className="retro-text text-lg font-bold">
                          KING YETI BROADCAST
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="retro-text-cyan text-2xl font-bold">
                          YETI MOB #{currentSender.tokenId}
                        </div>
                        <div className="retro-text text-lg">
                          DURATION: {currentSender.duration}s
                        </div>
                      </div>
                    )}
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
            <div className="control-panel rounded-lg p-6">
              <div className="retro-text-orange text-lg mb-4 font-bold">FREQUENCY ANALYZER</div>
              <div className="flex items-end space-x-1 h-32">
                {frequencyBars.map((height, i) => (
                  <div
                    key={i}
                    className="signal-bars w-4 rounded-t transition-all duration-150"
                    style={{ 
                      height: `${height}%`,
                      opacity: isTransmitting || isReceiving || isRecordingVoicemail ? 1 : 0.3
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

            {/* Call Button */}
            <button
              onClick={() => setShowPhonePad(true)}
              disabled={isTransmitting || isReceiving || isRecordingVoicemail}
              className={`control-panel w-full py-4 rounded-lg font-bold text-xl transition-all duration-200 flex items-center justify-center space-x-3 ${
                isTransmitting || isReceiving || isRecordingVoicemail
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95 hover:shadow-xl'
              }`}
            >
              <span className="text-2xl">📞</span>
              <span className="retro-text-orange">CALL</span>
            </button>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-6">
            {/* Transmission Display */}
            <div className="control-panel rounded-lg p-6">
              <div className="retro-text-orange text-lg mb-4 font-bold">TRANSMISSION CONTROL</div>
              
              <div className="bg-black rounded p-4 mb-6">
                <div className="text-center">
                  <div className="retro-text text-xl font-mono mb-3">
                    🎵 KING YETI AUDIO READY
                  </div>
                  <div className="retro-text-cyan">
                    CLICK PLAY TO BROADCAST
                  </div>
                </div>
              </div>



              {/* Control Buttons */}
              <div className="flex justify-center space-x-8">
                {/* Play/Stop Button */}
                <button
                  onClick={isReceiving ? stopAudio : playMessage}
                  disabled={isTransmitting || isRecordingVoicemail}
                  className={`play-button w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl transition-all duration-200 ${
                    isTransmitting || isRecordingVoicemail
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-110 active:scale-95'
                  }`}
                  style={{ width: '80px', height: '80px' }}
                >
                  {isReceiving ? '■' : '▶'}
                </button>

                {/* PTT Button */}
                <button
                  onClick={handleTransmit}
                  className="ptt-button w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  📡
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
                  <span className="text-red-400">RESTRICTED</span>
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

      {/* Activity Log */}
      <div className="control-panel border-t-4 border-orange-500 p-6 h-[calc(50vh-100px)]">
        <div className="retro-text-orange text-lg mb-4 font-bold">FROSTY APE YETI MOB COMMUNICATION LOG</div>
        <div 
          className="h-full overflow-y-auto custom-scrollbar"
          onScroll={handleScroll}
        >
          <div className="space-y-3">
            {activityLog.map((entry) => (
              <div 
                key={entry.id} 
                className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/5 ${
                  entry.type === 'own' ? 'bg-blue-500/10 border border-blue-500/30' :
                  entry.type === 'emergency' ? 'bg-red-500/10 border border-red-500/30' :
                  entry.type === 'voicemail' ? 'bg-purple-500/10 border border-purple-500/30' :
                  entry.isYetiTech ? 'bg-orange-500/10 border border-orange-500/30' :
                  'bg-gray-500/10 border border-gray-500/20'
                }`}
              >
                <img 
                  src={entry.image}
                  alt={entry.isYetiTech ? `Yeti Tech` : `Frosty Ape YETI Mob #${entry.tokenId}`}
                  className="w-12 h-12 rounded-full border-2 border-cyan-400/50"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="retro-text-cyan font-bold">
                      {entry.isYetiTech ? 'YETI TECH' : `YETI MOB #${entry.tokenId}`}
                    </span>
                    <span className="retro-text text-sm">{formatDate(entry.timestamp)}</span>
                    <span className="retro-text text-sm">{formatTime(entry.timestamp)}</span>
                    <span className="retro-text-orange text-sm">{entry.duration}s</span>
                    {entry.type === 'own' && (
                      <span className="text-blue-400 text-xs font-bold">YOUR TRANSMISSION</span>
                    )}
                    {entry.type === 'emergency' && (
                      <span className="text-red-400 text-xs font-bold animate-pulse">EMERGENCY</span>
                    )}
                    {entry.type === 'voicemail' && (
                      <span className="text-purple-400 text-xs font-bold">
                        📧 VOICEMAIL → #{entry.calledNumber}
                      </span>
                    )}
                    {entry.isYetiTech && (
                      <span className="text-orange-400 text-xs font-bold">YETI TECH COMM</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loadingMore && (
              <div className="text-center py-4">
                <div className="retro-text-cyan text-sm animate-pulse">LOADING MORE TRANSMISSIONS...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticHamRadio;