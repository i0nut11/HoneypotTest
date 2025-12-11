#!/bin/bash

#############################################
#  HoneyTrap - Script de Instalare          #
#  Pentru Kali Linux / Debian / Ubuntu      #
#############################################

set -e

# Culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🍯 HoneyTrap - Security Honeypot Dashboard              ║"
echo "║                                                           ║"
echo "║   Instalare automată pentru Kali Linux                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verifică dacă rulează ca root
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}[!] Se recomandă să NU rulezi ca root. Continuăm oricum...${NC}"
fi

# Funcție pentru logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Directorul curent
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
log_info "Directorul proiectului: $PROJECT_DIR"
echo ""

#############################################
# 1. Update sistem
#############################################
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_info "Pasul 1/6: Actualizare sistem..."
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

sudo apt update -y
log_success "Sistem actualizat"

#############################################
# 2. Instalare Python
#############################################
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_info "Pasul 2/6: Instalare Python..."
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    log_success "Python deja instalat: $PYTHON_VERSION"
else
    sudo apt install python3 python3-pip python3-venv -y
    log_success "Python instalat"
fi

#############################################
# 3. Instalare Node.js
#############################################
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_info "Pasul 3/6: Instalare Node.js..."
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js deja instalat: $NODE_VERSION"
else
    # Instalare Node.js 18.x (LTS)
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    log_success "Node.js instalat"
fi

# Instalare yarn
if command -v yarn &> /dev/null; then
    log_success "Yarn deja instalat"
else
    sudo npm install -g yarn
    log_success "Yarn instalat"
fi

#############################################
# 4. Instalare MongoDB
#############################################
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_info "Pasul 4/6: Instalare MongoDB..."
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v mongod &> /dev/null; then
    log_success "MongoDB deja instalat"
else
    # Pentru Kali/Debian/Ubuntu
    sudo apt install -y gnupg curl
    
    # Import MongoDB public GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Detectează distribuția
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "kali" ]]; then
            # Kali folosește bookworm (Debian 12)
            echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | \
                sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        elif [[ "$ID" == "debian" ]]; then
            echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian ${VERSION_CODENAME}/mongodb-org/7.0 main" | \
                sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        elif [[ "$ID" == "ubuntu" ]]; then
            echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu ${VERSION_CODENAME}/mongodb-org/7.0 multiverse" | \
                sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        fi
    fi
    
    sudo apt update
    sudo apt install -y mongodb-org || sudo apt install -y mongodb
    log_success "MongoDB instalat"
fi

# Pornește MongoDB
log_info "Pornire MongoDB..."
sudo systemctl start mongod 2>/dev/null || sudo systemctl start mongodb 2>/dev/null || sudo service mongodb start 2>/dev/null || true
sudo systemctl enable mongod 2>/dev/null || sudo systemctl enable mongodb 2>/dev/null || true
log_success "MongoDB pornit"

#############################################
# 5. Configurare Backend
#############################################
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_info "Pasul 5/6: Configurare Backend..."
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_DIR/backend"

# Creează virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    log_success "Virtual environment creat"
else
    log_success "Virtual environment există deja"
fi

# Activează venv și instalează dependențe
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
log_success "Dependențe Python instalate"

# Creează .env dacă nu există
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="honeypot_db"
CORS_ORIGINS="*"
EOF
    fi
    log_success "Fișier .env creat"
else
    log_success "Fișier .env există deja"
fi

deactivate

#############################################
# 6. Configurare Frontend
#############################################
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_info "Pasul 6/6: Configurare Frontend..."
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_DIR/frontend"

# Instalează dependențe
yarn install || npm install
log_success "Dependențe Node.js instalate"

# Creează .env dacă nu există
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF
    fi
    log_success "Fișier .env creat"
else
    log_success "Fișier .env există deja"
fi

#############################################
# Finalizare
#############################################
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ INSTALARE COMPLETĂ!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Pentru a porni aplicația, rulează:${NC}"
echo ""
echo -e "  ${YELLOW}./start.sh${NC}"
echo ""
echo -e "${CYAN}Sau manual:${NC}"
echo ""
echo -e "  ${YELLOW}# Terminal 1 - Backend:${NC}"
echo -e "  cd $PROJECT_DIR/backend"
echo -e "  source venv/bin/activate"
echo -e "  uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo ""
echo -e "  ${YELLOW}# Terminal 2 - Frontend:${NC}"
echo -e "  cd $PROJECT_DIR/frontend"
echo -e "  yarn start"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  📍 Honeypot:  ${NC}${GREEN}http://localhost:3000${NC}"
echo -e "${CYAN}  📍 Admin:     ${NC}${GREEN}http://localhost:3000/admin${NC}"
echo -e "${CYAN}  🔑 Parola:    ${NC}${YELLOW}honeyadmin123${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
