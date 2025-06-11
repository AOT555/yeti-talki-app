import React, { useState, useEffect } from 'react';
import WalletConnection from './WalletConnection';
import SimpleWalkieTalkie from './SimpleWalkieTalkie';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
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
  const { isAuthenticated, isLoading, user, demoMode } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <WalletConnection />;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-3 mb-6 text-center">
          <p className="text-yellow-200 text-sm font-medium">
            🚧 DEMO MODE
          </p>
          <p className="text-yellow-200/80 text-xs">
            Wallet connection will be enabled when we go live!
          </p>
        </div>
      )}

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
      
      <SimpleWalkieTalkie />
      
      <div className="text-center mt-8 text-white/70 text-xs">
        {demoMode ? (
          <>
            <p>Demo Mode - Ape Chain Ready</p>
            <p className="truncate">Demo Wallet: {user?.walletAddress}</p>
          </>
        ) : (
          <>
            <p>Connected to Ape Chain</p>
            <p className="truncate">{user?.walletAddress}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default YetiTalkiApp;
