# Setup Instructions

This guide will help you set up and run the AI-Based Child Safety & Post-Adoption Monitoring System.

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation Steps

### 1. Clone or Download the Project

```bash
# Navigate to the project directory
cd child-safety-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your configurations
# Required configurations:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Your secret key for JWT tokens
# - PORT: Server port (default: 5000)
```

**Important**: Update the `.env` file with your actual configuration values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/child-safety
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

Update the frontend `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Make sure MongoDB is running:

```bash
# Start MongoDB (if using local installation)
mongod

# Or if using homebrew on macOS
brew services start mongodb-community
```

### 5. Create Initial Admin User

The system requires at least one admin user. You can create one using MongoDB:

```bash
# Connect to MongoDB
mongosh

# Switch to child-safety database
use child-safety

# Create admin user (password will be hashed on first login attempt)
# You'll need to register through the API or create manually
```

Or use the registration API endpoint after starting the server:

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

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

### Start Frontend Application

```bash
cd frontend
npm start
# Application will open at http://localhost:3000
```

## Testing the Application

### Default Login Credentials

After creating the admin user, you can login with:

```
Email: admin@childsafety.gov
Password: Admin@123
```

### API Health Check

```bash
curl http://localhost:5000/api/health
```

## Project Structure

```
├── backend/                 # Node.js + Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication & error handling
│   ├── utils/              # Helper functions
│   └── server.js           # Entry point
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # Reusable React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       ├── context/        # React context (Auth)
│       └── App.js          # Main app component
└── README.md
```

## Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Children
- `GET /api/children` - Get all children
- `POST /api/children` - Register new child
- `GET /api/children/:id` - Get child details
- `PUT /api/children/:id` - Update child
- `GET /api/children/stats` - Get statistics

### Parents
- `GET /api/parents` - Get all parents
- `POST /api/parents` - Register new parent
- `GET /api/parents/:id` - Get parent details
- `PUT /api/parents/:id` - Update parent
- `PUT /api/parents/:id/kyc` - Update KYC status
- `PUT /api/parents/:id/status` - Update application status

### Adoptions
- `GET /api/adoptions` - Get all adoptions
- `POST /api/adoptions` - Create adoption record
- `GET /api/adoptions/:id` - Get adoption details
- `PUT /api/adoptions/:id/status` - Update adoption status
- `POST /api/adoptions/:id/visits` - Add visit record
- `POST /api/adoptions/:id/monitoring` - Add monitoring report

### Risk Assessment
- `GET /api/risk-assessment` - Get all assessments
- `POST /api/risk-assessment` - Create assessment
- `GET /api/risk-assessment/:id` - Get assessment details
- `GET /api/risk-assessment/adoption/:adoptionId` - Get by adoption

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts/:id` - Get alert details
- `PUT /api/alerts/:id/status` - Update alert status
- `GET /api/alerts/critical` - Get critical alerts

### Dashboard
- `GET /api/dashboard/government` - Government dashboard data
- `GET /api/dashboard/trends` - Adoption trends

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection errors:

1. Ensure MongoDB is running
2. Check the `MONGODB_URI` in your `.env` file
3. Verify MongoDB is accessible on the specified port

### Port Already in Use

If port 5000 or 3000 is already in use:

1. Change the `PORT` in backend `.env`
2. Update the `REACT_APP_API_URL` in frontend `.env` accordingly

### CORS Issues

If you encounter CORS errors:

1. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Clear browser cache and restart both servers

## Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2
3. Set up a reverse proxy (nginx/Apache)
4. Use a production MongoDB instance
5. Enable HTTPS

### Frontend Deployment

1. Build the production bundle: `npm run build`
2. Serve the `build` folder using a web server
3. Update `REACT_APP_API_URL` to production API URL

## Security Notes

- Change all default passwords in production
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting (already configured)
- Regular security audits
- Keep dependencies updated

## Support

For issues or questions, please refer to the README.md or create an issue in the project repository.
