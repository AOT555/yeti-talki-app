import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_YETI_BACKEND_URL || 'http://localhost:8002';
  
  // Demo mode - bypass wallet connection
  const DEMO_MODE = true;

  useEffect(() => {
    if (DEMO_MODE) {
      // Auto-login with demo user for demonstration
      setTimeout(() => {
        const demoUser = {
          walletAddress: '0x1234...Demo',
          tokenId: 2547,
          accessToken: 'demo_token'
        };
        setUser(demoUser);
        setIsLoading(false);
      }, 1000); // Show loading for 1 second
      return;
    }

    // Check if user is already logged in (real mode)
    const storedUser = localStorage.getItem('yeti_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        localStorage.removeItem('yeti_user');
      }
    }
    setIsLoading(false);
  }, []);

  const connectWallet = async () => {
    if (DEMO_MODE) {
      // In demo mode, just show a message
      setError('Demo mode: Wallet connection disabled. This will be enabled when we go live!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Check if we're on Ape Chain (you may need to adjust the chain ID)
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      // Create signature message
      const message = `Welcome to Yeti Talki!\n\nBy signing this message, you're proving ownership of your Frosty Ape Yeti NFT.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;

      // Request signature
      const signature = await signer.signMessage(message);

      // Verify NFT ownership and authenticate with backend
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-nft`, {
        wallet_address: walletAddress,
        signature: signature,
        message: message
      });

      if (response.data.success) {
        const userData = {
          walletAddress: response.data.wallet_address,
          tokenId: response.data.token_id,
          accessToken: response.data.access_token
        };

        setUser(userData);
        localStorage.setItem('yeti_user', JSON.stringify(userData));
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }

    } catch (err) {
      console.error('Wallet connection error:', err);
      
      if (err.code === 4001) {
        setError('Please connect your wallet to continue.');
      } else if (err.message.includes('NFT')) {
        setError('No Frosty Ape Yeti NFT found in your wallet. You need to own a Frosty Ape Yeti NFT to access Yeti Talki.');
      } else {
        setError(err.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    if (DEMO_MODE) {
      // In demo mode, just reload the page
      window.location.reload();
      return;
    }
    setUser(null);
    localStorage.removeItem('yeti_user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    connectWallet,
    disconnect,
    error,
    demoMode: DEMO_MODE
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
