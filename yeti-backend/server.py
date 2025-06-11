from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import logging
import uuid
import json
import asyncio
from datetime import datetime, timedelta
from web3 import Web3
from eth_account.messages import encode_defunct
import jwt
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Web3 setup for Ape Chain
ape_chain_rpc = os.environ.get('APE_CHAIN_RPC_URL', 'https://ape.calderachain.xyz/http')
w3 = Web3(Web3.HTTPProvider(ape_chain_rpc))

# Contract address (placeholder - will be updated when collection launches)
FROSTY_APE_YETI_CONTRACT = os.environ.get('FROSTY_APE_YETI_CONTRACT_ADDRESS', '0x0000000000000000000000000000000000000000')

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here')

# FastAPI app
app = FastAPI(title="Yeti Talki API", description="Web3 NFT-Gated Walkie-Talkie")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class WalletConnectRequest(BaseModel):
    wallet_address: str
    signature: str
    message: str

class NFTVerificationResponse(BaseModel):
    success: bool
    token_id: Optional[int] = None
    wallet_address: str
    access_token: Optional[str] = None
    message: str

class AudioMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nft_token_id: int
    wallet_address: str
    audio_data: str  # Base64 encoded audio
    duration: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_type: str = "broadcast"  # broadcast, direct, etc.

class UserProfile(BaseModel):
    wallet_address: str
    nft_token_id: int
    total_messages_sent: int = 0
    total_messages_received: int = 0
    first_login: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    lifetime_recordings: List[str] = Field(default_factory=list)  # Audio message IDs

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, Dict] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, token_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_sessions[user_id] = {
            "token_id": token_id,
            "connected_at": datetime.utcnow(),
            "websocket": websocket
        }
        logger.info(f"User {user_id} (NFT #{token_id}) connected")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
        logger.info(f"User {user_id} disconnected")
    
    async def broadcast_audio(self, message: AudioMessage, sender_id: str):
        """Broadcast audio message to all connected users except sender"""
        if not self.active_connections:
            return
            
        message_data = {
            "type": "audio_message",
            "data": message.dict()
        }
        
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            if user_id != sender_id:  # Don't send to sender
                try:
                    await websocket.send_text(json.dumps(message_data, default=str))
                except Exception as e:
                    logger.error(f"Error sending to {user_id}: {e}")
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

manager = ConnectionManager()

# Utility functions
async def verify_nft_ownership(wallet_address: str) -> Optional[int]:
    """
    Verify if wallet owns Frosty Ape Yeti NFT
    Returns token_id if owned, None otherwise
    """
    try:
        # ERC-721 ABI for balanceOf and tokenOfOwnerByIndex
        erc721_abi = [
            {
                "inputs": [{"name": "owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            },
            {
                "inputs": [{"name": "owner", "type": "address"}, {"name": "index", "type": "uint256"}],
                "name": "tokenOfOwnerByIndex",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            }
        ]
        
        if FROSTY_APE_YETI_CONTRACT == '0x0000000000000000000000000000000000000000':
            # For development - mock NFT ownership
            # Generate a mock token ID based on wallet address
            mock_token_id = int(wallet_address[-4:], 16) % 5000 + 1
            logger.info(f"Mock NFT verification - Wallet {wallet_address} owns token #{mock_token_id}")
            return mock_token_id
        
        contract = w3.eth.contract(address=FROSTY_APE_YETI_CONTRACT, abi=erc721_abi)
        
        # Check balance
        balance = contract.functions.balanceOf(wallet_address).call()
        
        if balance == 0:
            return None
        
        # Get the first token owned by this address
        token_id = contract.functions.tokenOfOwnerByIndex(wallet_address, 0).call()
        return int(token_id)
        
    except Exception as e:
        logger.error(f"Error verifying NFT ownership: {e}")
        return None

def verify_signature(message: str, signature: str, wallet_address: str) -> bool:
    """Verify MetaMask signature"""
    try:
        encoded_message = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(encoded_message, signature=signature)
        return recovered_address.lower() == wallet_address.lower()
    except Exception as e:
        logger.error(f"Error verifying signature: {e}")
        return False

def create_access_token(wallet_address: str, token_id: int) -> str:
    """Create JWT access token"""
    payload = {
        "wallet_address": wallet_address,
        "token_id": token_id,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Routes
@app.post("/api/auth/verify-nft", response_model=NFTVerificationResponse)
async def verify_nft_and_authenticate(request: WalletConnectRequest):
    """Verify NFT ownership and authenticate user"""
    
    # Verify signature
    if not verify_signature(request.message, request.signature, request.wallet_address):
        return NFTVerificationResponse(
            success=False,
            wallet_address=request.wallet_address,
            message="Invalid signature"
        )
    
    # Check NFT ownership
    token_id = await verify_nft_ownership(request.wallet_address)
    
    if token_id is None:
        return NFTVerificationResponse(
            success=False,
            wallet_address=request.wallet_address,
            message="No Frosty Ape Yeti NFT found in this wallet"
        )
    
    # Create or update user profile
    user_profile = await db.user_profiles.find_one({"nft_token_id": token_id})
    
    if not user_profile:
        # Create new user profile
        new_profile = UserProfile(
            wallet_address=request.wallet_address,
            nft_token_id=token_id
        )
        await db.user_profiles.insert_one(new_profile.dict())
    else:
        # Update last active
        await db.user_profiles.update_one(
            {"nft_token_id": token_id},
            {"$set": {"last_active": datetime.utcnow(), "wallet_address": request.wallet_address}}
        )
    
    # Create access token
    access_token = create_access_token(request.wallet_address, token_id)
    
    return NFTVerificationResponse(
        success=True,
        token_id=token_id,
        wallet_address=request.wallet_address,
        access_token=access_token,
        message=f"Access granted! Welcome, Frosty Ape Yeti #{token_id}"
    )

@app.post("/api/audio/broadcast")
async def broadcast_audio_message(
    audio_data: str,
    duration: float,
    token_data: dict = Depends(verify_token)
):
    """Broadcast audio message to all users"""
    
    if duration > 30:
        raise HTTPException(status_code=400, detail="Audio message too long (max 30 seconds)")
    
    # Create audio message
    audio_message = AudioMessage(
        nft_token_id=token_data["token_id"],
        wallet_address=token_data["wallet_address"],
        audio_data=audio_data,
        duration=duration
    )
    
    # Save to database
    await db.audio_messages.insert_one(audio_message.dict())
    
    # Update user profile
    await db.user_profiles.update_one(
        {"nft_token_id": token_data["token_id"]},
        {
            "$inc": {"total_messages_sent": 1},
            "$push": {"lifetime_recordings": audio_message.id},
            "$set": {"last_active": datetime.utcnow()}
        }
    )
    
    # Broadcast to all connected users
    await manager.broadcast_audio(audio_message, str(token_data["token_id"]))
    
    return {"success": True, "message_id": audio_message.id}

@app.get("/api/audio/latest")
async def get_latest_audio_message(token_data: dict = Depends(verify_token)):
    """Get the latest audio message in the community"""
    
    latest_message = await db.audio_messages.find_one(
        {},
        sort=[("timestamp", -1)]
    )
    
    if not latest_message:
        return {"message": "No messages available"}
    
    return {
        "success": True,
        "message": AudioMessage(**latest_message).dict()
    }

@app.get("/api/user/profile")
async def get_user_profile(token_data: dict = Depends(verify_token)):
    """Get user profile information"""
    
    profile = await db.user_profiles.find_one({"nft_token_id": token_data["token_id"]})
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return UserProfile(**profile).dict()

@app.get("/api/user/recordings/{token_id}")
async def get_nft_lifetime_recordings(
    token_id: int,
    token_data: dict = Depends(verify_token)
):
    """Get all lifetime recordings for a specific NFT (future feature)"""
    
    profile = await db.user_profiles.find_one({"nft_token_id": token_id})
    
    if not profile:
        return {"recordings": []}
    
    # Get all recordings for this NFT
    recording_ids = profile.get("lifetime_recordings", [])
    
    recordings = await db.audio_messages.find(
        {"id": {"$in": recording_ids}}
    ).sort("timestamp", 1).to_list(1000)
    
    return {
        "success": True,
        "token_id": token_id,
        "total_recordings": len(recordings),
        "recordings": [AudioMessage(**recording).dict() for recording in recordings]
    }

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time communication"""
    
    try:
        # Verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = str(payload["token_id"])
        token_id = payload["token_id"]
        
        await manager.connect(websocket, user_id, token_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                # Handle any WebSocket messages if needed
                logger.info(f"Received WebSocket message from {user_id}: {data}")
                
        except WebSocketDisconnect:
            manager.disconnect(user_id)
            
    except jwt.JWTError:
        await websocket.close(code=4001, reason="Invalid token")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=4000, reason="Internal error")

@app.get("/api/community/stats")
async def get_community_stats():
    """Get community statistics"""
    
    total_users = await db.user_profiles.count_documents({})
    total_messages = await db.audio_messages.count_documents({})
    active_connections = len(manager.active_connections)
    
    return {
        "total_registered_nfts": total_users,
        "total_messages_sent": total_messages,
        "currently_online": active_connections,
        "collection_size": 5000
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Yeti Talki API",
        "ape_chain_connected": w3.is_connected(),
        "database_connected": True  # TODO: Add actual DB health check
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
