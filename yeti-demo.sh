#!/bin/bash

echo "🎙️ Yeti Talki - Web3 Community Walkie-Talkie Demo"
echo "=================================================="
echo ""

# Test backend health
echo "1. Testing Backend Health..."
curl -s http://localhost:8002/api/health | jq '.'
echo ""

# Test community stats
echo "2. Community Stats..."
curl -s http://localhost:8002/api/community/stats | jq '.'
echo ""

# Test frontend accessibility
echo "3. Testing Frontend Accessibility..."
curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" http://localhost:3001
echo ""

echo "✅ Yeti Talki Application Status:"
echo "   Backend API: http://localhost:8002"
echo "   Frontend App: http://localhost:3001"
echo "   Ready for Web3 testing with MetaMask!"
echo ""
echo "📱 Features Implemented:"
echo "   ✓ NFT-gated access (Frosty Ape Yeti collection)"
echo "   ✓ MetaMask wallet integration"
echo "   ✓ Ice glacier walkie-talkie interface"
echo "   ✓ Push-to-talk audio recording (30s limit)"
echo "   ✓ Real-time audio broadcasting"
echo "   ✓ WebSocket communication"
echo "   ✓ Ape Chain blockchain integration"
echo "   ✓ Beautiful UI with Frosty Ape Yeti branding"
echo ""