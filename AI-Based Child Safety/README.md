# AI-Based Child Safety & Post-Adoption Monitoring System

A comprehensive full-stack web application for managing child adoption processes, monitoring post-adoption welfare, and ensuring child safety through AI-powered risk assessment.

## Tech Stack

- **Frontend**: React.js with modern UI components
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **UI**: Responsive dashboard design

## Features

### Core Modules
1. **Admin Login** - Secure authentication system for administrators
2. **Child Registration** - Complete child profile management
3. **Parent Registration** - Prospective parent registration and verification
4. **Adoption Records** - Comprehensive adoption tracking system
5. **KYC Monitoring** - Know Your Customer verification for parents
6. **Risk Assessment** - AI-powered risk analysis system
7. **Alert System** - Real-time notifications for critical events
8. **Government Dashboard** - Analytics and reporting for government officials

## Project Structure

```
├── backend/                 # Node.js + Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       ├── context/        # React context
│       ├── utils/          # Utility functions
│       └── App.js          # Main app component
└── README.md
```

## Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/child-safety
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Production Integration

The backend is configured to serve the React build in production when `NODE_ENV=production`. To run the full application as a single deployable app:

1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Start the backend in production mode:
   ```bash
   cd ../backend
   npm install
   NODE_ENV=production npm start
   ```
3. Visit the application on the backend host URL.

For detailed cloud deployment steps, see `DEPLOYMENT.md`.

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
- POST `/auth/login` - Admin login
- POST `/auth/register` - Register new admin

### Children
- GET `/children` - Get all children
- POST `/children` - Register new child
- GET `/children/:id` - Get child details
- PUT `/children/:id` - Update child information

### Parents
- GET `/parents` - Get all parents
- POST `/parents` - Register new parent
- GET `/parents/:id` - Get parent details
- PUT `/parents/:id` - Update parent information

### Adoptions
- GET `/adoptions` - Get all adoption records
- POST `/adoptions` - Create adoption record
- GET `/adoptions/:id` - Get adoption details
- PUT `/adoptions/:id` - Update adoption status

### Risk Assessment
- POST `/risk-assessment` - Run risk assessment
- GET `/risk-assessment/:adoptionId` - Get assessment results

### Alerts
- GET `/alerts` - Get all alerts
- POST `/alerts` - Create new alert
- PUT `/alerts/:id` - Mark alert as resolved

## Default Credentials

```
Admin:
Email: admin@childsafety.gov
Password: Admin@123
```

## License

MIT License
