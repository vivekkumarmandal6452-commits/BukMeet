@echo off
REM AI-Based Child Safety & Post-Adoption Monitoring System
REM Installation Script for Windows

echo ==================================================
echo   Child Safety System - Installation Script
echo ==================================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js (v16 or higher) from https://nodejs.org/
    pause
    exit /b 1
)

node -v
echo Node.js found
echo.

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Warning: MongoDB not found in PATH
    echo Please ensure MongoDB is installed and running
)

echo.
echo Installing dependencies...
echo.

REM Install backend dependencies
echo 1. Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed
cd ..

echo.

REM Install frontend dependencies
echo 2. Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed
cd ..

echo.
echo 3. Setting up environment files...

REM Create backend .env if it doesn't exist
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env
    echo Please edit backend\.env with your configuration
) else (
    echo backend\.env already exists
)

REM Create frontend .env if it doesn't exist
if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Created frontend\.env
) else (
    echo frontend\.env already exists
)

echo.
echo ==================================================
echo Installation completed successfully!
echo ==================================================
echo.
echo Next steps:
echo.
echo 1. Edit configuration files:
echo    - backend\.env (MongoDB URI, JWT secret)
echo    - frontend\.env (API URL)
echo.
echo 2. Start MongoDB:
echo    - Start MongoDB service from Windows Services
echo    - Or run: mongod
echo.
echo 3. Start the backend server:
echo    cd backend
echo    npm run dev
echo.
echo 4. In a new terminal, start the frontend:
echo    cd frontend
echo    npm start
echo.
echo 5. Create an admin user:
echo    See QUICKSTART.md for details
echo.
echo 6. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo For detailed instructions, see:
echo   - QUICKSTART.md - Quick start guide
echo   - SETUP.md - Complete setup guide
echo   - README.md - Project overview
echo.
echo ==================================================
pause
