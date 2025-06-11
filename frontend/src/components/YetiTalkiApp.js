import React, { useState, useEffect } from 'react';
import WalletConnection from './WalletConnection';
import FuturisticHamRadio from './FuturisticHamRadio';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const YetiTalkiApp = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center p-4">
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

  return <FuturisticHamRadio />;
};

export default YetiTalkiApp;
