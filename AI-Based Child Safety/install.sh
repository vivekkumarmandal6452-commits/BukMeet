#!/bin/bash

# AI-Based Child Safety & Post-Adoption Monitoring System
# Installation Script

echo "=================================================="
echo "  Child Safety System - Installation Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js (v16 or higher) from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null && ! command -v mongo &> /dev/null; then
    echo -e "${YELLOW}Warning: MongoDB not found in PATH${NC}"
    echo "Please ensure MongoDB is installed and running"
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install backend dependencies
echo "1. Installing backend dependencies..."
cd backend
if npm install; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

echo ""

# Install frontend dependencies
echo "2. Installing frontend dependencies..."
cd frontend
if npm install; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo "3. Setting up environment files..."

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${YELLOW}  backend/.env already exists${NC}"
fi

# Create frontend .env if it doesn't exist
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}  frontend/.env already exists${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}Installation completed successfully!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit configuration files:"
echo "   - backend/.env (MongoDB URI, JWT secret)"
echo "   - frontend/.env (API URL)"
echo ""
echo "2. Start MongoDB:"
echo "   $ mongod"
echo "   or"
echo "   $ brew services start mongodb-community"
echo ""
echo "3. Start the backend server:"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   $ cd frontend"
echo "   $ npm start"
echo ""
echo "5. Create an admin user:"
echo "   See QUICKSTART.md for details"
echo ""
echo "6. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "For detailed instructions, see:"
echo "  - QUICKSTART.md - Quick start guide"
echo "  - SETUP.md - Complete setup guide"
echo "  - README.md - Project overview"
echo ""
echo "=================================================="
