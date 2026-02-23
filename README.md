# Parenting Project

Node.js + Express + MongoDB backend.

## Setup

### Prerequisites
- Node.js (v18+) - [Download](https://nodejs.org/)
- Docker Desktop - [Download](https://www.docker.com/products/docker-desktop/)

Check if installed:
```bash
node --version
docker --version
```

### Run the project

```bash
# Start MongoDB
docker compose up -d

# Setup backend
cd backend
cp .env.example .env
npm install
npm run dev
```

### Verify it works
Visit http://localhost:3000/api/health - should show `"database": "connected"`

## Environment Contract (Firebase Ready)

When Firebase auth is enabled, the backend uses the following environment variables:

- Server secrets: `SESSION_SECRET`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `FIREBASE_SERVICE_ACCOUNT_JSON`
- Web config (safe for frontend use): `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`, `FIREBASE_MEASUREMENT_ID`

Notes:
- Never commit real service account JSON or private keys to git.
- Keep `SESSION_SECRET` unique per deployed environment.
- Use `backend/.env.example` as the required key contract.

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Entry point
│   ├── config/database.js # DB connection
│   ├── routes/index.js    # API endpoints
│   └── models/User.js     # Example model
├── .env.example          # Environment template
└── package.json
```

## Useful Commands

```bash
docker compose up -d      # Start MongoDB
docker compose down       # Stop MongoDB
docker compose down -v    # Stop + delete data
npm run dev               # Start server (auto-reload)
npm start                 # Start server (production)
```
