# 📖 Documentație Tehnică - HoneyTrap

## Cuprins

1. [Arhitectură](#arhitectură)
2. [Backend API](#backend-api)
3. [Detectare Atacuri](#detectare-atacuri)
4. [Frontend Components](#frontend-components)
5. [Database Schema](#database-schema)
6. [Configurare Avansată](#configurare-avansată)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Arhitectură

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
        ┌───────────────────┐   ┌───────────────────┐
        │   HONEYPOT PAGE   │   │  ADMIN DASHBOARD  │
        │   (port 3000)     │   │   (port 3000)     │
        │                   │   │                   │
        │  - Fake Login     │   │  - Stats Cards    │
        │  - Attack Capture │   │  - Charts         │
        │                   │   │  - Live Feed      │
        └─────────┬─────────┘   └─────────┬─────────┘
                  │                       │
                  └───────────┬───────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │      FASTAPI BACKEND      │
                │       (port 8001)         │
                │                           │
                │  - Attack Detection       │
                │  - Pattern Matching       │
                │  - Geolocation (fake)     │
                │  - Statistics             │
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │         MONGODB           │
                │       (port 27017)        │
                │                           │
                │  - attacks collection     │
                └───────────────────────────┘
```

---

## Backend API

### Endpoint: POST `/api/honeypot/login`

Captează încercările de login și detectează tipul de atac.

**Request:**
```json
{
  "username": "admin' OR '1'='1",
  "password": "test123"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid credentials. Please try again.",
  "error_code": "AUTH_FAILED"
}
```

**Logică internă:**
1. Extrage IP-ul clientului
2. Combină username + password în payload
3. Rulează pattern matching pentru detectare
4. Clasifică severitatea
5. Generează geolocație fake bazată pe hash IP
6. Salvează în MongoDB
7. Returnează eroare falsă

---

### Endpoint: GET `/api/attacks/stats`

Returnează statistici agregate pentru dashboard.

**Response:**
```json
{
  "total_attacks": 150,
  "unique_ips": 45,
  "attack_types": {
    "sql_injection": 50,
    "xss": 30,
    "brute_force": 60,
    "command_injection": 10
  },
  "severity_breakdown": {
    "critical": 60,
    "high": 30,
    "medium": 20,
    "low": 40
  },
  "attacks_by_country": [
    {"country": "Russia", "count": 25},
    {"country": "China", "count": 20}
  ],
  "attacks_by_hour": [
    {"hour": "00", "count": 5},
    {"hour": "01", "count": 3}
  ],
  "recent_attacks": [...]
}
```

---

### Endpoint: GET `/api/attacks/timeline`

Returnează date pentru graficul timeline.

**Query Parameters:**
- `days` (int, default: 7) - Numărul de zile

**Response:**
```json
[
  {
    "date": "2025-12-01",
    "total": 25,
    "sql_injection": 10,
    "xss": 8,
    "brute_force": 7
  }
]
```

---

### Endpoint: GET `/api/attacks/live`

Returnează ultimele atacuri pentru live feed.

**Query Parameters:**
- `limit` (int, default: 10) - Numărul de atacuri

**Response:**
```json
[
  {
    "id": "uuid-here",
    "timestamp": "2025-12-09T19:37:33.000Z",
    "ip_address": "192.168.1.100",
    "attack_type": "sql_injection",
    "severity": "critical",
    "payload": "admin' OR '1'='1",
    "country": "Russia",
    "city": "Moscow"
  }
]
```

---

## Detectare Atacuri

### Pattern-uri SQL Injection

```python
SQL_INJECTION_PATTERNS = [
    r"('|\")(\\s)*(or|and)(\\s)*('|\")?\\s*\\d",  # ' OR '1
    r"(\\s|'|\")*(union)(\\s)+(select)",          # UNION SELECT
    r"(\\s|'|\")*(select)(\\s)+(\\*|\\w+)",       # SELECT *
    r"(\\s|'|\")*(--)|(#)|(/\\*)",                # Comments
    r"(\\s|'|\")*(drop|delete|truncate)",         # DROP TABLE
    r"1(\\s)*=(\\s)*1",                           # 1=1
    r"benchmark\\s*\\(",                          # benchmark()
    r"sleep\\s*\\(",                              # sleep()
]
```

### Pattern-uri XSS

```python
XSS_PATTERNS = [
    r"<script[^>]*>",           # <script>
    r"javascript\\s*:",          # javascript:
    r"on\\w+\\s*=\\s*['\"]?",    # onclick=
    r"<iframe[^>]*>",           # <iframe>
    r"eval\\s*\\(",             # eval()
    r"document\\.cookie",        # document.cookie
]
```

### Pattern-uri Command Injection

```python
COMMAND_INJECTION_PATTERNS = [
    r"[;&|`$]",                 # ; & | ` $
    r"\\|\\|?",                 # | ||
    r"&&",                      # &&
    r"\\$\\(",                  # $(
    r"`[^`]*`",                 # `command`
]
```

### Pattern-uri Path Traversal

```python
PATH_TRAVERSAL_PATTERNS = [
    r"\\.\\.[\\\\/]",           # ../
    r"%2e%2e[\\\\/]",           # encoded ../
]
```

---

## Frontend Components

### HoneypotLogin.jsx

Componentă pentru pagina de login falsă.

**State:**
- `username` - Input username
- `password` - Input password
- `error` - Mesaj eroare
- `loading` - Status încărcare
- `attempts` - Contor încercări

**Funcționalitate:**
- Trimite POST la `/api/honeypot/login`
- Afișează întotdeauna eroare (honeypot)
- Incrementează contor încercări

---

### AdminDashboard.jsx

Dashboard principal cu vizualizări.

**State:**
- `stats` - Statistici agregate
- `timeline` - Date timeline
- `liveAttacks` - Atacuri recente
- `autoRefresh` - Toggle auto-refresh

**Componente:**
- `StatCard` - Card statistică individuală
- `AreaChart` - Grafic timeline
- `PieChart` - Distribuție tipuri/severitate
- `BarChart` - Top țări, activitate orară
- `LiveFeed` - Terminal-style feed

**Auto-refresh:**
```javascript
useEffect(() => {
  if (!autoRefresh) return;
  const interval = setInterval(fetchData, 5000);
  return () => clearInterval(interval);
}, [autoRefresh, fetchData]);
```

---

## Database Schema

### Collection: `attacks`

```javascript
{
  "id": "string (UUID)",
  "timestamp": "string (ISO 8601)",
  "ip_address": "string",
  "user_agent": "string",
  "attack_type": "string (enum: sql_injection, xss, command_injection, path_traversal, brute_force)",
  "payload": "string (max 500 chars)",
  "username_attempted": "string (max 100 chars)",
  "password_attempted": "string (max 100 chars)",
  "endpoint": "string",
  "country": "string",
  "city": "string",
  "severity": "string (enum: critical, high, medium, low)",
  "detected_patterns": ["array of strings"]
}
```

**Indexuri recomandate:**
```javascript
db.attacks.createIndex({ "timestamp": -1 })
db.attacks.createIndex({ "ip_address": 1 })
db.attacks.createIndex({ "attack_type": 1 })
db.attacks.createIndex({ "severity": 1 })
```

---

## Configurare Avansată

### Schimbare Parolă Admin

În `backend/server.py`:
```python
ADMIN_PASSWORD = "parola_ta_noua_sigura"
```

### Adăugare Pattern-uri Noi

```python
# Exemplu: Detectare LDAP Injection
LDAP_INJECTION_PATTERNS = [
    r"\\*\\)",
    r"\\(\\|",
    r"\\(\\&",
]

# Adaugă în funcția detect_attack_type()
for pattern in LDAP_INJECTION_PATTERNS:
    if re.search(pattern, payload_lower):
        detected_patterns.append(f"LDAP: {pattern[:30]}")
        attack_type = "ldap_injection"
        severity = "critical"
```

### Geolocație Reală (opțional)

Înlocuiește funcția `get_fake_geolocation()` cu un API real:

```python
import requests

def get_real_geolocation(ip: str) -> tuple[str, str]:
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}")
        data = response.json()
        return data.get("country", "Unknown"), data.get("city", "Unknown")
    except:
        return "Unknown", "Unknown"
```

---

## Deployment

### Docker (recomandat)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=honeypot_db
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001

volumes:
  mongo_data:
```

---

## Troubleshooting

### MongoDB nu pornește

```bash
# Verifică status
sudo systemctl status mongodb

# Verifică loguri
sudo journalctl -u mongodb

# Repornește
sudo systemctl restart mongodb
```

### Port ocupat

```bash
# Găsește procesul
sudo lsof -i :8001
sudo lsof -i :3000

# Oprește procesul
kill -9 <PID>
```

### Erori CORS

Verifică `CORS_ORIGINS` în backend/.env:
```env
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

### Frontend nu se conectează la Backend

1. Verifică că backend-ul rulează: `curl http://localhost:8001/api/`
2. Verifică `REACT_APP_BACKEND_URL` în frontend/.env
3. Repornește frontend-ul după modificări în .env

### Atacurile nu apar în Dashboard

1. Verifică conexiunea MongoDB: `mongo --eval "db.stats()"`
2. Verifică colecția: `mongo honeypot_db --eval "db.attacks.count()"`
3. Verifică logurile backend: `tail -f backend.log`

---

## Extinderi Posibile

1. **Notificări Email** - Alertă pentru atacuri critice
2. **Export Rapoarte** - PDF/CSV cu statistici
3. **IP Blacklist** - Blocare automată IP-uri suspecte
4. **Rate Limiting** - Limitare request-uri per IP
5. **Webhook-uri** - Integrare cu Slack/Discord
6. **Machine Learning** - Detectare anomalii
7. **Multi-tenant** - Suport pentru mai multe honeypot-uri
