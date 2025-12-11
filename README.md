# 🍯 HoneyTrap - Security Honeypot Dashboard

Un sistem complet de honeypot pentru captarea și analiza atacurilor web, cu dashboard în stil Grafana.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📸 Screenshots

### Pagina de Login (Honeypot)
Pagină falsă de autentificare care captează toate încercările de login.

### Dashboard Admin
Dashboard în stil Grafana cu vizualizări în timp real ale atacurilor.

---

## 🎯 Funcționalități

### Detectare Atacuri
- **SQL Injection** - `' OR 1=1`, `UNION SELECT`, `DROP TABLE`, etc.
- **XSS (Cross-Site Scripting)** - `<script>`, `javascript:`, `onerror=`, etc.
- **Command Injection** - `; ls`, `| cat`, `&& rm`, etc.
- **Path Traversal** - `../`, `..%2f`, etc.
- **Brute Force** - Încercări repetate de autentificare

### Dashboard Admin
- 📊 Statistici în timp real (atacuri totale, IP-uri unice, amenințări critice)
- 📈 Timeline atacuri (ultimele 7 zile)
- 🥧 Distribuție tipuri de atacuri (pie chart)
- 🌍 Top țări de origine atacuri
- ⚠️ Distribuție severitate (critical, high, medium, low)
- 📉 Activitate pe ore (24h)
- 🖥️ Live Attack Feed (terminal-style, actualizare automată)

### Clasificare Severitate
| Severitate | Tip Atac |
|------------|----------|
| 🔴 Critical | SQL Injection, Command Injection |
| 🟠 High | XSS, Path Traversal |
| 🟡 Medium | Payloads suspecte |
| 🟢 Low | Brute Force simplu |

---

## 🛠️ Tehnologii

### Backend
- **FastAPI** - Framework Python async pentru API
- **Motor** - Driver async MongoDB
- **Pydantic** - Validare date
- **Regex Patterns** - Detectare atacuri

### Frontend
- **React 19** - UI Framework
- **Tailwind CSS** - Styling
- **Recharts** - Grafice și vizualizări
- **Shadcn/UI** - Componente UI
- **Lucide React** - Iconițe

### Database
- **MongoDB** - Stocare atacuri și statistici

---

## 🚀 Instalare Rapidă (Kali Linux)

```bash
# Clonează repository-ul
git clone https://github.com/YOUR_USERNAME/honeytrap.git
cd honeytrap

# Rulează scriptul de instalare
chmod +x install.sh
./install.sh
```

---

## 📦 Instalare Manuală

### Cerințe
- Python 3.9+
- Node.js 18+
- MongoDB 4.4+
- Git

### 1. Clonează Proiectul

```bash
git clone https://github.com/YOUR_USERNAME/honeytrap.git
cd honeytrap
```

### 2. Configurează Backend

```bash
cd backend

# Creează virtual environment
python3 -m venv venv
source venv/bin/activate

# Instalează dependențe
pip install -r requirements.txt

# Configurează environment
cp .env.example .env
# Editează .env dacă e necesar

# Pornește serverul
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Configurează Frontend

```bash
cd frontend

# Instalează dependențe
npm install
# sau
yarn install

# Configurează environment
cp .env.example .env

# Pornește aplicația
npm start
# sau
yarn start
```

---

## 🔐 Acces

| Pagină | URL | Descriere |
|--------|-----|-----------|
| Honeypot | http://localhost:3000 | Pagina falsă de login |
| Admin Login | http://localhost:3000/admin | Autentificare admin |
| Dashboard | http://localhost:3000/admin/dashboard | Dashboard principal |

**Credențiale Admin:**
- Parola: `honeyadmin123`

---

## 🧪 Testare

### Test SQL Injection
```
Username: admin' OR '1'='1
Password: ' OR '1'='1' --
```

### Test XSS
```
Username: <script>alert('xss')</script>
Password: test
```

### Test Command Injection
```
Username: admin; cat /etc/passwd
Password: test
```

### Test Path Traversal
```
Username: ../../../etc/passwd
Password: test
```

---

## 📁 Structura Proiectului

```
honeytrap/
├── backend/
│   ├── server.py              # FastAPI server + detectare atacuri
│   ├── requirements.txt       # Dependențe Python
│   ├── .env.example          # Template environment
│   └── .env                  # Configurație locală (ignorat git)
│
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML principal
│   ├── src/
│   │   ├── components/ui/    # Componente Shadcn/UI
│   │   ├── pages/
│   │   │   ├── HoneypotLogin.jsx    # Pagină login fals
│   │   │   ├── AdminLogin.jsx       # Login admin
│   │   │   └── AdminDashboard.jsx   # Dashboard Grafana-style
│   │   ├── App.js            # Componenta principală
│   │   ├── App.css           # Stiluri aplicație
│   │   ├── index.js          # Entry point
│   │   └── index.css         # Stiluri globale + Tailwind
│   ├── package.json          # Dependențe Node.js
│   ├── tailwind.config.js    # Configurare Tailwind
│   ├── .env.example          # Template environment
│   └── .env                  # Configurație locală (ignorat git)
│
├── install.sh                # Script instalare Kali Linux
├── start.sh                  # Script pornire aplicație
├── README.md                 # Documentație principală
├── DOCUMENTATION.md          # Documentație tehnică detaliată
└── LICENSE                   # Licență MIT
```

---

## 🔧 API Endpoints

### Honeypot
| Method | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/honeypot/login` | Captează încercări de login |

### Admin
| Method | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/admin/login` | Autentificare admin |

### Atacuri
| Method | Endpoint | Descriere |
|--------|----------|-----------|
| GET | `/api/attacks` | Lista toate atacurile |
| GET | `/api/attacks/stats` | Statistici generale |
| GET | `/api/attacks/timeline` | Timeline atacuri |
| GET | `/api/attacks/live` | Atacuri recente (live feed) |
| DELETE | `/api/attacks` | Șterge toate logurile |

---

## ⚙️ Configurare

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="honeypot_db"
CORS_ORIGINS="*"
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🔒 Securitate

> ⚠️ **ATENȚIE:** Acest proiect este destinat pentru **scopuri educaționale și de cercetare**. 

- Nu expune honeypot-ul direct pe internet fără protecție suplimentară
- Schimbă parola admin implicită în producție
- Folosește HTTPS în producție
- Configurează firewall și rate limiting

---

## 📝 Licență

Acest proiect este licențiat sub [MIT License](LICENSE).

---

## 🤝 Contribuții

Contribuțiile sunt binevenite! Deschide un Issue sau Pull Request.

---

## 📧 Contact

Creat cu ❤️ pentru comunitatea de security
