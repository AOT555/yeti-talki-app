import React, { useState, useEffect } from 'react';
import WalletConnection from './WalletConnection';
import WalkieTalkieInterface from './WalkieTalkieInterface';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import LoadingSpinner from './LoadingSpinner';

const YetiTalkiApp = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-ice-gradient flex items-center justify-center p-4">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <WalletConnection />;
  }

  return (
    <WebSocketProvider>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <img 
            src="https://pbs.twimg.com/profile_images/1932109015816773632/VHzq_Axr_400x400.jpg" 
            alt="Frosty Ape Yeti" 
            className="w-20 h-20 rounded-full mx-auto mb-4 shadow-lg border-4 border-white/50"
          />
          <h1 className="text-3xl font-bold text-white text-shadow-lg mb-2">
            Yeti Talki
          </h1>
          <p className="text-white/80 text-sm">
            Welcome, Frosty Ape Yeti #{user?.tokenId}
          </p>
          <p className="text-white/60 text-xs mt-1">
            Web3 Community Walkie-Talkie
          </p>
          <div className="flex items-center justify-center space-x-2 text-white/50 text-xs mt-2">
            <span>Built with</span>
            <img 
              src="https://pbs.twimg.com/profile_images/1932591648753467392/wQRSESav_400x400.jpg" 
              alt="Yeti Tech" 
              className="w-4 h-4 rounded-full border border-white/30"
            />
            <span>Yeti Tech 🐾</span>
          </div>
        </div>
        
        <WalkieTalkieInterface />
        
        <div className="text-center mt-8 text-white/70 text-xs">
          <p>Connected to Ape Chain</p>
          <p className="truncate">{user?.walletAddress}</p>
        </div>
      </div>
    </WebSocketProvider>
  );
};

export default YetiTalkiApp;
