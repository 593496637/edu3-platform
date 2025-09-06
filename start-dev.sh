#!/bin/bash

# EDU3 Platform Development Setup Script
# This script helps start both frontend and backend for development

echo "🚀 Starting EDU3 Platform Development Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists pnpm; then
    echo -e "${YELLOW}⚠️  pnpm is not installed. Installing pnpm...${NC}"
    npm install -g pnpm
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Setup environment files
echo "🔧 Setting up environment files..."

if [ ! -f "web/.env" ]; then
    echo "📝 Creating web/.env from example..."
    cp web/.env.example web/.env
    echo -e "${YELLOW}⚠️  Please edit web/.env with your configuration${NC}"
fi

if [ ! -f "api/.env" ]; then
    echo "📝 Creating api/.env from example..."
    cp api/.env.example api/.env
    echo -e "${YELLOW}⚠️  Please edit api/.env with your configuration${NC}"
fi

# Install dependencies
echo "📦 Installing dependencies..."

echo "🔄 Installing API dependencies..."
cd api
pnpm install
cd ..

echo "🔄 Installing Web dependencies..."
cd web
pnpm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check if we should start services
read -p "🚀 Do you want to start the development servers now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌟 Starting development servers..."
    
    # Function to start a service in a new terminal
    start_service() {
        local service_name=$1
        local command=$2
        local directory=$3
        
        if command_exists gnome-terminal; then
            gnome-terminal --tab --title="$service_name" --working-directory="$(pwd)/$directory" -- bash -c "$command; exec bash"
        elif command_exists osascript; then
            # macOS
            osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$directory && $command\""
        else
            echo -e "${YELLOW}⚠️  Cannot detect terminal emulator. Please run these commands manually:${NC}"
            echo "  📁 Terminal 1 (API): cd api && pnpm dev"
            echo "  📁 Terminal 2 (Web): cd web && pnpm dev"
            exit 0
        fi
    }
    
    # Start API server
    echo "🔧 Starting API server on port 3000..."
    start_service "EDU3 API" "pnpm dev" "api"
    
    # Wait a bit for API to start
    sleep 2
    
    # Start Web server
    echo "🎨 Starting Web server on port 5173..."
    start_service "EDU3 Web" "pnpm dev" "web"
    
    echo ""
    echo -e "${GREEN}🎉 Development environment started!${NC}"
    echo ""
    echo "📡 API Server: http://localhost:3000"
    echo "🌐 Web App: http://localhost:5173"
    echo "🏥 API Health: http://localhost:3000/health"
    echo ""
    echo "📖 Check the terminal tabs for server logs"
    echo "🛑 Use Ctrl+C in each terminal to stop the servers"
    
else
    echo ""
    echo "ℹ️  To start the servers manually:"
    echo "  📁 Terminal 1 (API): cd api && pnpm dev"
    echo "  📁 Terminal 2 (Web): cd web && pnpm dev"
fi

echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
