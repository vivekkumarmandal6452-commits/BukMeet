# Deployment Guide

This guide describes how to deploy the AI-Based Child Safety & Post-Adoption Monitoring System to Render, Vercel, and MongoDB Atlas.

## Architecture Overview

- `backend/` — Node.js + Express API and server
- `frontend/` — React SPA
- MongoDB Atlas — cloud database
- Auth via JWT with role-based protection
- AI risk assessment and face recognition modules integrated into backend workflows

---

## 1. MongoDB Atlas Setup

1. Create an Atlas account at https://www.mongodb.com/cloud/atlas.
2. Create a new project and cluster.
3. Configure a database user with `Read and write to any database` or scoped to your app database.
4. Add your application IP address to the network access list, or allow access from anywhere with `0.0.0.0/0` for initial testing.
5. Create a database named `child-safety` and note the connection string.

Example connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/child-safety?retryWrites=true&w=majority
```

---

## 2. Backend Production Configuration

Create `backend/.env` with the following values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/child-safety?retryWrites=true&w=majority
JWT_SECRET=<strong-jwt-secret>
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://<your-frontend-url>
```

### Recommended security settings

- Use strong secrets for `JWT_SECRET`.
- Set `NODE_ENV=production`.
- Restrict database IP access in Atlas.
- Use HTTPS in Render/Vercel.

---

## 3. Frontend Production Configuration

Create `frontend/.env` with:

```env
REACT_APP_API_URL=https://<your-backend-url>/api
```

Build the frontend before deployment if deploying as a static app or when serving from the backend.

---

## 4. Deploying on Render

### Backend service

1. Create a new Web Service on Render.
2. Connect to your GitHub repository.
3. Set the root directory to `backend`.
4. Set the build command to:

```bash
npm install
```

5. Set the start command to:

```bash
npm run start
```

6. Add environment variables for Atlas and JWT:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `NODE_ENV=production`
- `FRONTEND_URL=https://<your-frontend-url>`

7. Deploy the backend.

### Frontend service

1. Create a new Static Site on Render.
2. Connect to the same repository.
3. Set the root directory to `frontend`.
4. Set the build command to:

```bash
npm install && npm run build
```

5. Set the publish directory to:

```bash
build
```

6. Add the env var:

- `REACT_APP_API_URL=https://<your-backend-url>/api`

7. Deploy the frontend.

---

## 5. Deploying on Vercel

### Frontend deployment

1. Create a new Vercel project linked to this repo.
2. Set the root directory to `frontend`.
3. Set the Build Command to:

```bash
npm install && npm run build
```

4. Set the Output Directory to:

```bash
build
```

5. Add environment variable:

- `REACT_APP_API_URL=https://<your-backend-url>/api`

6. Deploy.

### Backend deployment (serverless or custom)

Use Render, Railway, or a custom hosting provider for the backend because the app requires a persistent Node.js server with Express and MongoDB.

If you want to deploy backend on Vercel, use a separate service with `vercel.json` and a `serverless` approach. For production, Render is simpler and recommended.

---

## 6. Full-stack Production Deployment Example

### Option A: Backend on Render + Frontend on Render

- Backend service: `backend/`
- Frontend static site: `frontend/`
- `REACT_APP_API_URL` points to backend URL
- `MONGODB_URI` points to MongoDB Atlas

### Option B: Backend on Render + Frontend on Vercel

- Backend service: `backend/`
- Frontend app: `frontend/`
- Set `REACT_APP_API_URL` to backend service URL

---

## 7. Secure API Checklist

- `backend/middleware/auth.js` protects all private routes with JWT.
- `backend/routes/dashboard.js` uses role-based `authorize('admin', 'government')`.
- `backend/server.js` uses `helmet()` and rate limiting.
- `backend/config/db.js` uses secure MongoDB connection options.
- Store secrets in environment variables, not in source control.

---

## 8. Notes for AI and Face Recognition

- AI risk assessment is implemented through `RiskAssessment` schema and controller logic.
- Face recognition is supported by frontend `face-api.js` and backend verification endpoints.
- Ensure any model assets or external weights are served over HTTPS.

---

## 9. Running Locally in Production Mode

From project root:

```bash
cd frontend
npm install
npm run build
cd ../backend
npm install
npm start
```

Then visit the backend and frontend URLs, or use the production backend to serve the built React app.
