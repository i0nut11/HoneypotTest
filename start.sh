#!/bin/bash

#############################################
#  HoneyTrap - Script de Pornire            #
#############################################

# Culori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directorul proiectului
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   🍯 HoneyTrap - Pornire Aplicație                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verifică MongoDB
echo -e "${YELLOW}[*] Verificare MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null && ! pgrep -x "mongodb" > /dev/null; then
    echo -e "${YELLOW}[!] MongoDB nu rulează. Încerc să-l pornesc...${NC}"
    sudo systemctl start mongod 2>/dev/null || sudo systemctl start mongodb 2>/dev/null || sudo service mongodb start 2>/dev/null
    sleep 2
fi

if pgrep -x "mongod" > /dev/null || pgrep -x "mongodb" > /dev/null; then
    echo -e "${GREEN}[✓] MongoDB rulează${NC}"
else
    echo -e "${RED}[✗] MongoDB nu poate fi pornit. Verifică instalarea.${NC}"
    echo -e "${YELLOW}    Încearcă: sudo systemctl start mongod${NC}"
fi

# Oprește procesele existente
echo -e "${YELLOW}[*] Oprire procese existente...${NC}"
pkill -f "uvicorn server:app" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true
sleep 1

# Pornește Backend
echo -e "${YELLOW}[*] Pornire Backend (port 8001)...${NC}"
cd "$PROJECT_DIR/backend"
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
echo -e "${GREEN}[✓] Backend pornit (PID: $BACKEND_PID)${NC}"

# Așteaptă să pornească backend-ul
sleep 3

# Pornește Frontend
echo -e "${YELLOW}[*] Pornire Frontend (port 3000)...${NC}"
cd "$PROJECT_DIR/frontend"
yarn start &
FRONTEND_PID=$!
echo -e "${GREEN}[✓] Frontend pornit (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🚀 APLICAȚIA RULEAZĂ!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}  📍 Honeypot:  ${NC}${GREEN}http://localhost:3000${NC}"
echo -e "${CYAN}  📍 Admin:     ${NC}${GREEN}http://localhost:3000/admin${NC}"
echo -e "${CYAN}  🔑 Parola:    ${NC}${YELLOW}honeyadmin123${NC}"
echo ""
echo -e "${CYAN}  Pentru oprire: ${NC}${YELLOW}./stop.sh${NC} sau ${YELLOW}Ctrl+C${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Așteaptă procesele
wait
