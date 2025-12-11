#!/bin/bash

#############################################
#  HoneyTrap - Script de Oprire             #
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}[*] Oprire HoneyTrap...${NC}"

# Oprește backend
pkill -f "uvicorn server:app" 2>/dev/null && echo -e "${GREEN}[✓] Backend oprit${NC}" || echo -e "${YELLOW}[!] Backend nu rula${NC}"

# Oprește frontend
pkill -f "react-scripts start" 2>/dev/null && echo -e "${GREEN}[✓] Frontend oprit${NC}" || echo -e "${YELLOW}[!] Frontend nu rula${NC}"
pkill -f "node.*start" 2>/dev/null || true

echo -e "${GREEN}[✓] HoneyTrap oprit complet${NC}"
