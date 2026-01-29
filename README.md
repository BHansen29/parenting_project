# Parenting Project

A full-stack application built with Node.js, Express, and MongoDB.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Understanding the Stack](#understanding-the-stack)
- [Environment Variables](#environment-variables)
- [Docker Explained](#docker-explained)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Learning Resources](#learning-resources)

---

## Prerequisites

Before you begin, make sure you have these installed:

### 1. Node.js (v18 or higher)

Node.js lets you run JavaScript outside the browser.

```bash
# Check if installed
node --version

# If not installed, download from: https://nodejs.org/
# Or use nvm (Node Version Manager) - recommended for managing versions:
# https://github.com/nvm-sh/nvm
```

### 2. npm (comes with Node.js)

npm is the package manager for Node.js - it installs libraries your project needs.

```bash
# Check if installed
npm --version
```

### 3. Docker Desktop

Docker runs applications in containers - isolated environments that work the same on everyone's computer.

```bash
# Check if installed
docker --version
docker-compose --version

# If not installed, download from: https://www.docker.com/products/docker-desktop/
```

### 4. Git

Version control for tracking changes and collaborating.

```bash
# Check if installed
git --version
```

---

## Quick Start

Follow these steps to get the project running:

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Parenting
```

### Step 2: Start MongoDB with Docker

```bash
# Start MongoDB in the background
docker-compose up -d

# Verify it's running
docker ps
# You should see "parenting-mongodb" in the list
```

### Step 3: Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Copy the environment template to create your local .env file
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Step 4: Verify Everything Works

Open your browser and visit:
- http://localhost:3000 - Welcome message
- http://localhost:3000/api - API info
- http://localhost:3000/api/health - Health check (should show database connected)

---

## Project Structure

```
Parenting/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── index.js           # Entry point - starts the server
│   │   ├── config/
│   │   │   └── database.js    # MongoDB connection logic
│   │   ├── routes/
│   │   │   └── index.js       # API route definitions
│   │   └── models/
│   │       └── User.js        # Example Mongoose model (schema)
│   ├── package.json           # Dependencies and scripts
│   ├── .env.example           # Template for environment variables
│   └── .env                   # Your local environment variables (not in git)
│
├── frontend/                   # Frontend application (to be set up)
│
├── docker-compose.yml         # Docker configuration for MongoDB
├── .gitignore                 # Files Git should ignore
└── README.md                  # This file
```

---

## Understanding the Stack

### Node.js

**What it is:** A JavaScript runtime that lets you run JavaScript on your computer (not just in browsers).

**Why we use it:** One language (JavaScript) for both frontend and backend. Great for APIs.

### Express

**What it is:** A web framework for Node.js that makes building APIs easy.

**Why we use it:** Without Express, you'd write hundreds of lines of code just to handle HTTP requests. Express does the heavy lifting.

**Key concepts:**
- **Routes:** URLs your API responds to (e.g., `/api/users`)
- **Middleware:** Functions that run on every request (e.g., parse JSON, check authentication)
- **Request (req):** Information about the incoming request (URL, body, headers)
- **Response (res):** How you send data back (JSON, HTML, status codes)

### MongoDB

**What it is:** A NoSQL database that stores data as JSON-like documents.

**Why we use it:** Flexible schema, easy to learn, scales well, great for JavaScript apps.

**Key concepts:**
- **Database:** Container for collections (like a filing cabinet)
- **Collection:** Group of documents (like a folder)
- **Document:** A single record (like a piece of paper)

**Example document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Mongoose

**What it is:** An ODM (Object Data Modeling) library for MongoDB.

**Why we use it:** Adds structure and validation to MongoDB's flexibility. Makes it harder to save bad data.

### Docker

**What it is:** A tool that runs applications in containers - isolated environments.

**Why we use it:** Everyone gets the exact same MongoDB version. No "it works on my machine" problems.

---

## Environment Variables

Environment variables store configuration that changes between environments (development, production, etc.).

### Why use them?

1. **Security:** Keep passwords out of your code
2. **Flexibility:** Different settings for dev vs production
3. **Teamwork:** Each developer can have their own settings

### How they work

1. `.env.example` - Template committed to Git (no real secrets)
2. `.env` - Your local copy with real values (ignored by Git)
3. `dotenv` package loads `.env` into `process.env`
4. Access in code: `process.env.VARIABLE_NAME`

### Current Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | See .env.example |

---

## Docker Explained

### What is a Container?

Think of it as a lightweight, isolated computer inside your computer. It has its own files, processes, and network - but shares your computer's resources.

### Key Commands

```bash
# Start all services defined in docker-compose.yml
docker-compose up -d
# -d means "detached" (run in background)

# Stop all services
docker-compose down

# Stop and DELETE all data (reset database)
docker-compose down -v
# -v means "remove volumes" (where data is stored)

# View running containers
docker ps

# View logs for MongoDB
docker logs parenting-mongodb

# Follow logs in real-time
docker logs -f parenting-mongodb

# Access MongoDB shell (for debugging)
docker exec -it parenting-mongodb mongosh -u admin -p password123
```

### Why Docker for MongoDB?

1. **Consistency:** Everyone uses the exact same MongoDB version
2. **Isolation:** Doesn't conflict with other projects
3. **Easy setup:** One command to start, one to stop
4. **Easy reset:** Delete and recreate if something breaks

---

## Common Commands

### Backend Development

```bash
cd backend

# Install dependencies (run after cloning or when package.json changes)
npm install

# Start development server (auto-restarts on file changes)
npm run dev

# Start production server (no auto-restart)
npm start
```

### Docker

```bash
# Start MongoDB
docker-compose up -d

# Stop MongoDB (keeps data)
docker-compose down

# Stop MongoDB and delete data
docker-compose down -v

# Check if MongoDB is running
docker ps
```

### Git (for team collaboration)

```bash
# Get latest changes from team
git pull

# See what files you've changed
git status

# Stage changes for commit
git add <filename>
git add .  # Stage all changes

# Commit changes
git commit -m "Description of what you changed"

# Push to remote repository
git push

# Create a new branch for a feature
git checkout -b feature/my-new-feature

# Switch to an existing branch
git checkout main
```

---

## Troubleshooting

### "Cannot connect to MongoDB"

1. **Check Docker is running:**
   ```bash
   docker ps
   # Should show "parenting-mongodb"
   ```

2. **Check MongoDB logs:**
   ```bash
   docker logs parenting-mongodb
   ```

3. **Restart MongoDB:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### "npm install fails"

1. **Delete node_modules and try again:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

### "Port 3000 already in use"

Another application is using that port. Either:
1. Stop the other application
2. Change PORT in your `.env` file

Find what's using the port:
```bash
lsof -i :3000
```

### "ECONNREFUSED 127.0.0.1:27017"

MongoDB isn't running. Start it with:
```bash
docker-compose up -d
```

---

## Learning Resources

### Node.js & Express
- [Express.js Official Docs](https://expressjs.com/)
- [Node.js Official Docs](https://nodejs.org/docs/)

### MongoDB & Mongoose
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [Mongoose Documentation](https://mongoosejs.com/docs/)

### Docker
- [Docker Getting Started](https://docs.docker.com/get-started/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

### JavaScript
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://javascript.info/)

---

## Team Workflow

### When You Join the Project

1. Clone the repo
2. Install Docker Desktop
3. Run `docker-compose up -d` (starts MongoDB)
4. Run `cd backend && cp .env.example .env && npm install && npm run dev`
5. Visit http://localhost:3000/api/health to verify

### Daily Development

1. `git pull` - Get latest changes
2. `docker-compose up -d` - Ensure MongoDB is running
3. `cd backend && npm run dev` - Start the server
4. Code, test, commit, push

### Before Committing

1. Make sure the server runs without errors
2. Test your changes
3. Write clear commit messages
