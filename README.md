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
