#!/usr/bin/env python3
import requests
import json
import base64
import time
import asyncio
import websockets
import jwt
import os
import random
import string
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3
import unittest

# Configuration
# Use the direct port since we're testing locally
BACKEND_URL = "http://localhost:8002/api"
WS_URL = "ws://localhost:8002/ws"
JWT_SECRET = "your-secret-key-here-change-in-production"  # Same as in .env

class YetiTalkiBackendTest(unittest.TestCase):
    """Test suite for Yeti Talki Backend API"""
    
    def setUp(self):
        """Set up test environment"""
        # Generate a random wallet address for testing
        self.private_key = Account.create().key
        self.account = Account.from_key(self.private_key)
        self.wallet_address = self.account.address
        
        # Generate a random message for signing
        self.message = f"Yeti Talki Authentication Request: {int(time.time())}"
        
        # Auth token
        self.auth_token = None
        self.token_id = None
        
        # Sample audio data (base64 encoded)
        self.sample_audio = base64.b64encode(b"test audio data").decode('utf-8')
        
        print(f"\nTesting with wallet address: {self.wallet_address}")
    
    def sign_message(self, message):
        """Sign a message with the test wallet"""
        encoded_message = encode_defunct(text=message)
        signed_message = Account.sign_message(encoded_message, self.private_key)
        return signed_message.signature.hex()
    
    def create_mock_jwt(self, wallet_address, token_id):
        """Create a mock JWT token for testing"""
        payload = {
            "wallet_address": wallet_address,
            "token_id": token_id,
            "exp": int(time.time()) + 3600,  # 1 hour expiry
            "iat": int(time.time())
        }
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    
    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n--- Testing Health Check Endpoint ---")
        response = requests.get(f"{BACKEND_URL}/health")
        print(f"Response: {response.status_code} - {response.text}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "Yeti Talki API")
        self.assertTrue(data["ape_chain_connected"])
        self.assertTrue(data["database_connected"])
        print("✅ Health check endpoint working correctly")
    
    def test_02_community_stats(self):
        """Test the community stats endpoint"""
        print("\n--- Testing Community Stats Endpoint ---")
        response = requests.get(f"{BACKEND_URL}/community/stats")
        print(f"Response: {response.status_code} - {response.text}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_registered_nfts", data)
        self.assertIn("total_messages_sent", data)
        self.assertIn("currently_online", data)
        self.assertIn("collection_size", data)
        self.assertEqual(data["collection_size"], 5000)  # As defined in the code
        print("✅ Community stats endpoint working correctly")
    
    def test_03_nft_verification(self):
        """Test the NFT verification and authentication endpoint"""
        print("\n--- Testing NFT Verification Endpoint ---")
        
        # Sign the message
        signature = self.sign_message(self.message)
        
        # Prepare request data
        data = {
            "wallet_address": self.wallet_address,
            "signature": signature,
            "message": self.message
        }
        
        # Send request
        response = requests.post(f"{BACKEND_URL}/auth/verify-nft", json=data)
        print(f"Response: {response.status_code} - {response.text}")
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertTrue(result["success"])
        self.assertIsNotNone(result["token_id"])
        self.assertIsNotNone(result["access_token"])
        self.assertEqual(result["wallet_address"], self.wallet_address)
        
        # Save token for later tests
        self.auth_token = result["access_token"]
        self.token_id = result["token_id"]
        
        print(f"✅ NFT verification successful. Token ID: {self.token_id}")
    
    def test_04_user_profile(self):
        """Test the user profile endpoint"""
        print("\n--- Testing User Profile Endpoint ---")
        
        # Skip if auth failed
        if not self.auth_token:
            self.skipTest("Authentication token not available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{BACKEND_URL}/user/profile", headers=headers)
        print(f"Response: {response.status_code} - {response.text}")
        
        self.assertEqual(response.status_code, 200)
        profile = response.json()
        self.assertEqual(profile["wallet_address"], self.wallet_address)
        self.assertEqual(profile["nft_token_id"], self.token_id)
        self.assertIn("total_messages_sent", profile)
        self.assertIn("total_messages_received", profile)
        
        print("✅ User profile endpoint working correctly")
    
    def test_05_broadcast_audio(self):
        """Test the audio broadcast endpoint"""
        print("\n--- Testing Audio Broadcast Endpoint ---")
        
        # Skip if auth failed
        if not self.auth_token:
            self.skipTest("Authentication token not available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        params = {
            "audio_data": self.sample_audio,
            "duration": 5.0  # 5 seconds
        }
        
        response = requests.post(
            f"{BACKEND_URL}/audio/broadcast", 
            params=params, 
            headers=headers
        )
        print(f"Response: {response.status_code} - {response.text}")
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertTrue(result["success"])
        self.assertIn("message_id", result)
        
        print("✅ Audio broadcast endpoint working correctly")
    
    def test_06_get_latest_audio(self):
        """Test the latest audio endpoint"""
        print("\n--- Testing Latest Audio Endpoint ---")
        
        # Skip if auth failed
        if not self.auth_token:
            self.skipTest("Authentication token not available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{BACKEND_URL}/audio/latest", headers=headers)
        print(f"Response: {response.status_code} - {response.text}")
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        if "message" in result and result["message"] == "No messages available":
            print("⚠️ No audio messages available in the database")
        else:
            self.assertTrue(result["success"])
            self.assertIn("message", result)
            self.assertIn("audio_data", result["message"])
            self.assertIn("duration", result["message"])
            self.assertIn("wallet_address", result["message"])
            print("✅ Latest audio endpoint working correctly")
    
    def test_07_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("\n--- Testing Unauthorized Access ---")
        
        # Try accessing protected endpoint without token
        response = requests.get(f"{BACKEND_URL}/user/profile")
        print(f"Response without token: {response.status_code} - {response.text}")
        self.assertIn(response.status_code, [401, 403])
        
        # Try with invalid token
        invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRfYWRkcmVzcyI6IjB4MTIzNDU2Nzg5MCIsInRva2VuX2lkIjoxMjM0LCJleHAiOjE3MTY5MjgwMDAsImlhdCI6MTcxNjg0MTYwMH0.invalid_signature"
        headers = {"Authorization": f"Bearer {invalid_token}"}
        response = requests.get(f"{BACKEND_URL}/user/profile", headers=headers)
        print(f"Response with invalid token: {response.status_code} - {response.text}")
        self.assertIn(response.status_code, [401, 403])
        
        print("✅ Unauthorized access properly rejected")
    
    def test_08_websocket_connection(self):
        """Test WebSocket connection"""
        print("\n--- Testing WebSocket Connection ---")
        
        # Skip if auth failed
        if not self.auth_token:
            self.skipTest("Authentication token not available")
        
        # This is a synchronous test for WebSocket which is normally async
        # We'll use a simple approach to test basic connectivity
        
        async def test_websocket():
            try:
                uri = f"{WS_URL}/{self.auth_token}"
                print(f"Connecting to WebSocket: {uri}")
                
                async with websockets.connect(uri) as websocket:
                    print("WebSocket connected successfully")
                    
                    # Send a test message
                    test_message = json.dumps({"type": "ping", "data": "test"})
                    await websocket.send(test_message)
                    print(f"Sent message: {test_message}")
                    
                    # Wait briefly to allow server to process
                    await asyncio.sleep(1)
                    
                    # Close connection
                    await websocket.close()
                    print("WebSocket closed successfully")
                    return True
            except Exception as e:
                print(f"WebSocket error: {e}")
                return False
        
        # Run the async test
        result = asyncio.run(test_websocket())
        self.assertTrue(result, "WebSocket connection failed")
        print("✅ WebSocket connection working correctly")

if __name__ == "__main__":
    # Run tests in order
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
