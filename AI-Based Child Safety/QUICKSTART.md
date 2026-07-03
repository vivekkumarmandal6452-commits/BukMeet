# Quick Start Guide

Get the AI-Based Child Safety & Post-Adoption Monitoring System up and running in 5 minutes!

## Prerequisites

✅ Node.js (v16+)  
✅ MongoDB (v5+)  
✅ npm or yarn

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Configure Environment

### Backend Configuration

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/child-safety
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

Create `frontend/.env`:

```bash
cd ../frontend
cp .env.example .env
```

Content should be:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 3: Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or manual start
mongod

# Windows
# Start MongoDB service from Services

# Linux
sudo systemctl start mongod
```

## Step 4: Start the Application

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: localhost
Server running in development mode on port 5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

Browser will automatically open at `http://localhost:3000`

## Step 5: Create Admin User

Using curl or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@childsafety.gov",
    "password": "Admin@123",
    "role": "admin",
    "department": "Child Welfare"
  }'
```

## Step 6: Login

Navigate to `http://localhost:3000/login`

```
Email: admin@childsafety.gov
Password: Admin@123
```

## 🎉 You're Ready!

You should now see the dashboard with all modules available.

## Quick Test

1. **Add a Child**: Go to Children → Add Child
2. **Register a Parent**: Go to Parents → Add Parent  
3. **Create Adoption**: Go to Adoptions → Create Adoption
4. **View Dashboard**: Check the Government Dashboard for analytics

## Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh
```

If not connected, start MongoDB service.

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
```

### Module Not Found Error

```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

## Default Routes

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Key Features to Explore

1. **Dashboard** - Overview of all statistics
2. **Children Management** - Register and track children
3. **Parent Management** - Handle parent applications
4. **Adoption Records** - Complete adoption lifecycle
5. **Risk Assessment** - AI-powered risk analysis
6. **Alert System** - Real-time notifications
7. **Government Dashboard** - Analytics and trends

## Next Steps

- Read the [README.md](README.md) for detailed information
- Check [SETUP.md](SETUP.md) for complete setup guide
- Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture details

## Need Help?

- Check the console logs for errors
- Verify all environment variables are set
- Ensure MongoDB is running
- Check firewall settings for ports 3000 and 5000

---

**Happy coding! 🚀**
