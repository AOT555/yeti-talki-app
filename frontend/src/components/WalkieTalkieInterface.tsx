import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';

const WalkieTalkieInterface: React.FC = () => {
  const { user, disconnect } = useAuth();
  const { isConnected, lastMessage, hasNewMessage, markMessageAsPlayed, sendAudioMessage } = useWebSocket();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize audio context for volume detection
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (volumeAnimationRef.current) {
        cancelAnimationFrame(volumeAnimationRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up volume monitoring
      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
        
        const monitorVolume = () => {
          if (analyserRef.current && isRecording) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            setVolume(avgVolume / 255); // Normalize to 0-1
            volumeAnimationRef.current = requestAnimationFrame(monitorVolume);
          }
        };
        monitorVolume();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          if (reader.result && typeof reader.result === 'string') {
            const base64Audio = reader.result.split(',')[1]; // Remove data:audio/wav;base64, prefix
            try {
              await sendAudioMessage(base64Audio, recordingTime);
              console.log('Audio message sent successfully!');
            } catch (error) {
              console.error('Failed to send audio message:', error);
            }
          }
        };
        
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      setRecordingTime(0);
      mediaRecorderRef.current.start();

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording(); // Auto-stop at 30 seconds
            return 30;
          }
          return prev + 0.1;
        });
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    setVolume(0);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    if (volumeAnimationRef.current) {
      cancelAnimationFrame(volumeAnimationRef.current);
      volumeAnimationRef.current = null;
    }
  };

  const playLastMessage = async () => {
    if (!lastMessage || isPlaying) return;

    try {
      setIsPlaying(true);
      markMessageAsPlayed();

      // Convert base64 to audio blob
      const audioData = `data:audio/wav;base64,${lastMessage.audio_data}`;
      const audio = new Audio(audioData);
      
      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Error playing audio');
      };

      await audio.play();
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handlePTTMouseDown = () => {
    if (!isRecording && recordingTime === 0) {
      startRecording();
    }
  };

  const handlePTTMouseUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  return (
    <div className="relative">
      {/* Connection Status */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-500/20 text-green-200 border border-green-500/40' 
            : 'bg-red-500/20 text-red-200 border border-red-500/40'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          {isConnected ? 'Connected to Channel' : 'Disconnected'}
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
                    hasNewMessage 
                      ? 'bg-green-400 animate-pulse' 
                      : isRecording && volume > 0.1
                        ? `bg-red-400 opacity-${Math.min(100, Math.floor(volume * 100))}`
                        : 'bg-gray-600'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex justify-center mt-4 space-x-4">
            {hasNewMessage && (
              <div className="receiving-indicator w-3 h-3 rounded-full status-light"></div>
            )}
            {isRecording && (
              <div className="transmitting-indicator w-3 h-3 rounded-full status-light"></div>
            )}
            {!hasNewMessage && !isRecording && (
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
                <p className="text-white/80 text-sm">{recordingTime.toFixed(1)}s / 30s</p>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                  <div 
                    className="bg-red-400 h-1 rounded-full transition-all duration-100"
                    style={{ width: `${(recordingTime / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : hasNewMessage ? (
              <div>
                <p className="text-green-300 font-mono text-lg">NEW MSG</p>
                <p className="text-white/80 text-xs">From Yeti #{lastMessage?.nft_token_id}</p>
                <p className="text-white/60 text-xs">{lastMessage?.duration.toFixed(1)}s</p>
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
            onClick={playLastMessage}
            disabled={!lastMessage || isPlaying || isRecording}
            className={`play-button w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white/30 transition-all duration-200 ${
              !lastMessage || isPlaying || isRecording
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-110 active:scale-95 shadow-lg'
            }`}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* PTT Button */}
          <button
            onMouseDown={handlePTTMouseDown}
            onMouseUp={handlePTTMouseUp}
            onTouchStart={handlePTTMouseDown}
            onTouchEnd={handlePTTMouseUp}
            disabled={!isConnected}
            className={`ptt-button w-20 h-20 rounded-full flex flex-col items-center justify-center text-white font-bold border-4 border-white/50 transition-all duration-200 ${
              !isConnected
                ? 'opacity-50 cursor-not-allowed'
                : isRecording
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
            {isRecording ? 'Release to send' : 'Press & hold PTT to talk'}
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
