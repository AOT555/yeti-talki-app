import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const WalletConnection = () => {
  const { connectWallet, isLoading, error } = useAuth();

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-glacier border border-white/20">
      {/* Header */}
      <div className="text-center mb-8">
        <img 
          src="https://pbs.twimg.com/profile_images/1932109015816773632/VHzq_Axr_400x400.jpg" 
          alt="Frosty Ape Yeti" 
          className="w-24 h-24 rounded-full mx-auto mb-6 shadow-xl border-4 border-white/50 nft-glow"
        />
        <h1 className="text-4xl font-bold text-white mb-2 text-shadow-lg">
          Yeti Talki
        </h1>
        <p className="text-white/80 text-lg mb-2">
          Web3 Community Walkie-Talkie
        </p>
        <p className="text-white/60 text-sm">
          Exclusive access for Frosty Ape Yeti holders
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6">
          <p className="text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Connect Button */}
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
          isLoading
            ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-yeti-purple to-arctic-blue text-white hover:scale-105 hover:shadow-xl active:scale-95'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
            Connecting...
          </div>
        ) : (
          'Connect MetaMask Wallet'
        )}
      </button>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-white/50 text-xs">
          Need a Frosty Ape Yeti NFT?{' '}
          <a 
            href="https://x.com/FrostyApeYeti" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-arctic-blue hover:text-glacier-blue underline"
          >
            Learn more
          </a>
        </p>
        <p className="text-white/40 text-xs mt-2">
          Powered by Ape Chain
        </p>
      </div>
    </div>
  );
};

export default WalletConnection;
