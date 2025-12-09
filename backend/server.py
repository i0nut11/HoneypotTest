from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import re
import hashlib


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Attack detection patterns
SQL_INJECTION_PATTERNS = [
    r"('|\")(\s)*(or|and)(\s)*('|\")?\s*\d",
    r"(\s|'|\")*(union)(\s)+(select)",
    r"(\s|'|\")*(select)(\s)+(\*|\w+)",
    r"(\s|'|\")*(--)|(#)|(/\*)",
    r"(\s|'|\")*(drop|delete|truncate|alter)(\s)+(table|database)",
    r"(\s|'|\")*(insert)(\s)+(into)",
    r"(\s|'|\")*(update)(\s)+\w+(\s)+(set)",
    r"1(\s)*=(\s)*1",
    r"\d+(\s)*=(\s)*\d+",
    r"(\s|'|\")*(exec|execute)(\s|\()",
    r"benchmark\s*\(",
    r"sleep\s*\(",
]

XSS_PATTERNS = [
    r"<script[^>]*>",
    r"javascript\s*:",
    r"on\w+\s*=\s*['\"]?",
    r"<iframe[^>]*>",
    r"<object[^>]*>",
    r"<embed[^>]*>",
    r"<link[^>]*>",
    r"<meta[^>]*>",
    r"<img[^>]*onerror",
    r"expression\s*\(",
    r"eval\s*\(",
    r"document\.cookie",
    r"document\.location",
    r"window\.location",
]

COMMAND_INJECTION_PATTERNS = [
    r"[;&|`$]",
    r"\|\|?",
    r"&&",
    r"\$\(",
    r"\$\{",
    r"`[^`]*`",
    r";\s*(ls|cat|rm|wget|curl|nc|bash|sh|python|perl|php)",
]

PATH_TRAVERSAL_PATTERNS = [
    r"\.\.[\\/]",
    r"%2e%2e[\\/]",
    r"\.\.%2f",
    r"%2e%2e%2f",
]

# Models
class AttackLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ip_address: str
    user_agent: str = ""
    attack_type: str
    payload: str
    username_attempted: str = ""
    password_attempted: str = ""
    endpoint: str
    country: str = "Unknown"
    city: str = "Unknown"
    severity: str = "medium"  # low, medium, high, critical
    detected_patterns: List[str] = []

class HoneypotLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginRequest(BaseModel):
    password: str

class AttackStats(BaseModel):
    total_attacks: int
    unique_ips: int
    attack_types: Dict[str, int]
    attacks_by_hour: List[Dict[str, Any]]
    attacks_by_country: List[Dict[str, Any]]
    recent_attacks: List[Dict[str, Any]]
    severity_breakdown: Dict[str, int]

# Helper functions
def detect_attack_type(payload: str) -> tuple[str, List[str], str]:
    """Detect the type of attack from payload"""
    detected_patterns = []
    attack_type = "brute_force"
    severity = "low"
    
    payload_lower = payload.lower()
    
    # Check SQL Injection
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, payload_lower, re.IGNORECASE):
            detected_patterns.append(f"SQL: {pattern[:30]}")
            attack_type = "sql_injection"
            severity = "critical"
    
    # Check XSS
    for pattern in XSS_PATTERNS:
        if re.search(pattern, payload_lower, re.IGNORECASE):
            detected_patterns.append(f"XSS: {pattern[:30]}")
            attack_type = "xss" if attack_type == "brute_force" else attack_type
            severity = "high" if severity not in ["critical"] else severity
    
    # Check Command Injection
    for pattern in COMMAND_INJECTION_PATTERNS:
        if re.search(pattern, payload_lower):
            detected_patterns.append(f"CMD: {pattern[:30]}")
            attack_type = "command_injection" if attack_type == "brute_force" else attack_type
            severity = "critical"
    
    # Check Path Traversal
    for pattern in PATH_TRAVERSAL_PATTERNS:
        if re.search(pattern, payload_lower, re.IGNORECASE):
            detected_patterns.append(f"PATH: {pattern[:30]}")
            attack_type = "path_traversal" if attack_type == "brute_force" else attack_type
            severity = "high" if severity not in ["critical"] else severity
    
    return attack_type, detected_patterns, severity

def get_fake_geolocation(ip: str) -> tuple[str, str]:
    """Generate fake geolocation based on IP hash for demo purposes"""
    countries = [
        ("Russia", "Moscow"), ("China", "Beijing"), ("United States", "New York"),
        ("Germany", "Berlin"), ("Brazil", "São Paulo"), ("India", "Mumbai"),
        ("United Kingdom", "London"), ("France", "Paris"), ("Japan", "Tokyo"),
        ("South Korea", "Seoul"), ("Netherlands", "Amsterdam"), ("Ukraine", "Kyiv"),
        ("Romania", "Bucharest"), ("Poland", "Warsaw"), ("Iran", "Tehran")
    ]
    ip_hash = int(hashlib.md5(ip.encode()).hexdigest(), 16)
    idx = ip_hash % len(countries)
    return countries[idx]

# Admin password (in production, use proper auth)
ADMIN_PASSWORD = "honeyadmin123"

# Routes
@api_router.get("/")
async def root():
    return {"message": "Secure System API"}

@api_router.post("/honeypot/login")
async def honeypot_login(request: Request, login_data: HoneypotLoginRequest):
    """Fake login endpoint that captures attack attempts"""
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Combine username and password for pattern detection
    payload = f"{login_data.username}:{login_data.password}"
    
    # Detect attack type
    attack_type, detected_patterns, severity = detect_attack_type(payload)
    
    # Get fake geolocation
    country, city = get_fake_geolocation(client_ip)
    
    # Create attack log
    attack_log = AttackLog(
        ip_address=client_ip,
        user_agent=user_agent,
        attack_type=attack_type,
        payload=payload[:500],  # Limit payload size
        username_attempted=login_data.username[:100],
        password_attempted=login_data.password[:100],
        endpoint="/login",
        country=country,
        city=city,
        severity=severity,
        detected_patterns=detected_patterns
    )
    
    # Store in database
    doc = attack_log.model_dump()
    await db.attacks.insert_one(doc)
    
    # Always return fake error to attacker
    return {
        "success": False,
        "message": "Invalid credentials. Please try again.",
        "error_code": "AUTH_FAILED"
    }

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLoginRequest):
    """Real admin login for dashboard access"""
    if login_data.password == ADMIN_PASSWORD:
        # Simple token (in production use JWT)
        token = hashlib.sha256(f"{ADMIN_PASSWORD}{datetime.now().isoformat()}".encode()).hexdigest()
        return {"success": True, "token": token}
    raise HTTPException(status_code=401, detail="Invalid admin password")

@api_router.get("/attacks")
async def get_attacks(limit: int = 100, offset: int = 0):
    """Get all attack logs"""
    attacks = await db.attacks.find({}, {"_id": 0}).sort("timestamp", -1).skip(offset).limit(limit).to_list(limit)
    total = await db.attacks.count_documents({})
    return {"attacks": attacks, "total": total}

@api_router.get("/attacks/stats")
async def get_attack_stats():
    """Get attack statistics for dashboard"""
    # Total attacks
    total_attacks = await db.attacks.count_documents({})
    
    # Unique IPs
    unique_ips = len(await db.attacks.distinct("ip_address"))
    
    # Attack types breakdown
    type_pipeline = [
        {"$group": {"_id": "$attack_type", "count": {"$sum": 1}}}
    ]
    type_results = await db.attacks.aggregate(type_pipeline).to_list(100)
    attack_types = {item["_id"]: item["count"] for item in type_results}
    
    # Severity breakdown
    severity_pipeline = [
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
    ]
    severity_results = await db.attacks.aggregate(severity_pipeline).to_list(100)
    severity_breakdown = {item["_id"]: item["count"] for item in severity_results}
    
    # Attacks by country
    country_pipeline = [
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    country_results = await db.attacks.aggregate(country_pipeline).to_list(100)
    attacks_by_country = [{"country": item["_id"], "count": item["count"]} for item in country_results]
    
    # Attacks by hour (last 24 hours)
    now = datetime.now(timezone.utc)
    hours_ago_24 = (now - timedelta(hours=24)).isoformat()
    
    hour_pipeline = [
        {"$match": {"timestamp": {"$gte": hours_ago_24}}},
        {"$addFields": {
            "hour": {"$substr": ["$timestamp", 11, 2]}
        }},
        {"$group": {"_id": "$hour", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    hour_results = await db.attacks.aggregate(hour_pipeline).to_list(100)
    attacks_by_hour = [{"hour": item["_id"], "count": item["count"]} for item in hour_results]
    
    # Recent attacks
    recent = await db.attacks.find({}, {"_id": 0}).sort("timestamp", -1).limit(20).to_list(20)
    
    return {
        "total_attacks": total_attacks,
        "unique_ips": unique_ips,
        "attack_types": attack_types,
        "severity_breakdown": severity_breakdown,
        "attacks_by_country": attacks_by_country,
        "attacks_by_hour": attacks_by_hour,
        "recent_attacks": recent
    }

@api_router.get("/attacks/timeline")
async def get_attack_timeline(days: int = 7):
    """Get attack timeline for the last N days"""
    now = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=days)).isoformat()
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$addFields": {
            "date": {"$substr": ["$timestamp", 0, 10]}
        }},
        {"$group": {
            "_id": {"date": "$date", "type": "$attack_type"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.date": 1}}
    ]
    
    results = await db.attacks.aggregate(pipeline).to_list(500)
    
    # Organize by date
    timeline = {}
    for item in results:
        date = item["_id"]["date"]
        attack_type = item["_id"]["type"]
        if date not in timeline:
            timeline[date] = {"date": date, "total": 0}
        timeline[date][attack_type] = item["count"]
        timeline[date]["total"] += item["count"]
    
    return list(timeline.values())

@api_router.get("/attacks/live")
async def get_live_attacks(limit: int = 10):
    """Get most recent attacks for live feed"""
    attacks = await db.attacks.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return attacks

@api_router.delete("/attacks")
async def clear_attacks():
    """Clear all attack logs (admin only)"""
    result = await db.attacks.delete_many({})
    return {"deleted": result.deleted_count}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
