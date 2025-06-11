import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface AudioMessage {
  id: string;
  nft_token_id: number;
  wallet_address: string;
  audio_data: string;
  duration: number;
  timestamp: string;
  message_type: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastMessage: AudioMessage | null;
  hasNewMessage: boolean;
  markMessageAsPlayed: () => void;
  sendAudioMessage: (audioData: string, duration: number) => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<AudioMessage | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const WS_URL = process.env.REACT_APP_YETI_WS_URL || 'ws://localhost:8002';

  useEffect(() => {
    if (!user) return;

    // Create WebSocket connection
    const newSocket = io(WS_URL, {
      query: {
        token: user.accessToken
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Yeti Talki WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Yeti Talki WebSocket');
      setIsConnected(false);
    });

    newSocket.on('audio_message', (data: AudioMessage) => {
      console.log('Received audio message:', data);
      setLastMessage(data);
      setHasNewMessage(true);
      
      // Play notification sound (optional)
      playNotificationSound();
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user, WS_URL]);

  const playNotificationSound = () => {
    // Create a simple beep sound for incoming messages
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // 800Hz frequency
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const markMessageAsPlayed = (): void => {
    setHasNewMessage(false);
  };

  const sendAudioMessage = async (audioData: string, duration: number): Promise<void> => {
    if (!socket || !isConnected) {
      throw new Error('Not connected to server');
    }

    try {
      // Send audio via HTTP API rather than WebSocket for better reliability
      const response = await fetch(`${process.env.REACT_APP_YETI_BACKEND_URL}/api/audio/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        },
        body: JSON.stringify({
          audio_data: audioData,
          duration: duration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send audio message');
      }

      const result = await response.json();
      console.log('Audio message sent successfully:', result);
      
    } catch (error) {
      console.error('Error sending audio message:', error);
      throw error;
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    lastMessage,
    hasNewMessage,
    markMessageAsPlayed,
    sendAudioMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
