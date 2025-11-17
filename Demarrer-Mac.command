#!/bin/bash

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear

echo "╔════════════════════════════════════════════╗"
echo "║   APPLICATION DE GESTION DE STOCKS        ║"
echo "║   Démarrage en cours...                   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Se déplacer dans le répertoire du script
cd "$(dirname "$0")"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERREUR: Node.js n'est pas installé!${NC}"
    echo ""
    echo -e "${BLUE}📥 Veuillez installer Node.js depuis: https://nodejs.org${NC}"
    echo ""
    read -p "Appuyez sur Entrée pour fermer..."
    exit 1
fi

echo -e "${GREEN}✓ Node.js détecté${NC}"
echo ""

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances (première fois seulement)...${NC}"
    echo "Ceci peut prendre quelques minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erreur lors de l'installation${NC}"
        read -p "Appuyez sur Entrée pour fermer..."
        exit 1
    fi
fi

echo -e "${GREEN}✓ Dépendances installées${NC}"
echo ""

# Générer le client Prisma si nécessaire
echo -e "${BLUE}🔧 Configuration de la base de données...${NC}"
npx prisma generate > /dev/null 2>&1
npx prisma db push > /dev/null 2>&1

echo -e "${GREEN}✓ Base de données prête${NC}"
echo ""

# Démarrer l'application
echo -e "${BLUE}🚀 Lancement de l'application...${NC}"
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  L'application va s'ouvrir dans votre      ║"
echo "║  navigateur à l'adresse:                   ║"
echo "║                                            ║"
echo "║  👉 http://localhost:3000                  ║"
echo "║                                            ║"
echo "║  ⚠️  NE FERMEZ PAS CETTE FENÊTRE           ║"
echo "║     tant que vous utilisez l'application   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Ouvrir le navigateur après 3 secondes
sleep 3
open http://localhost:3000

# Démarrer le serveur
npm run dev
