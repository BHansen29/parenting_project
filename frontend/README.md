# ShareCare Frontend

The ShareCare frontend is a React-based web application designed to guide users through a multi-step parenting questionnaire.

This project is built using **React + Vite**, providing fast development with hot module replacement (HMR) and modern frontend tooling.

---

## Tech Stack

- **React** – Component-based UI library
- **Vite** – Development server and build tool with fast hot module replacement (HMR)
- **React Router DOM** – Client-side routing between questionnaire sections
- **Context API** – Shared state management for form data
- **ESLint & Prettier** – Code linting and formatting
- **Vitest & Testing Library** – Unit and component testing

---

## Development Notes

This project uses Vite’s React plugin to enable fast refresh during development.  
The React Compiler is not enabled due to its potential impact on development and build performance.

TypeScript is not currently used. However, the project structure allows for future migration if needed.

---

## Required Software

Before you begin, ensure you have the following installed:

| Software | Minimum Version | Check Command | Download Link |
|--------|----------------|---------------|---------------|
| Node.js | v18.0.0+ | `node --version` | https://nodejs.org/ |
| npm | v9.0.0+ | `npm --version` | Included with Node.js |
| Git | v2.0.0+ | `git --version` | https://git-scm.com/ |

---

## Verify Installation

```bash
# Check Node.js version (should be v18+)
node --version

# Check npm version (should be v9+)
npm --version

# Check Git version
git --version

If any of these commands fail, install the missing software before proceeding.

---

Initial Setup
Step 1: Clone the Repository

# Navigate to your desired projects directory
cd ~/Desktop  # Or wherever you want the project

# Clone the repository
git clone https://github.com/Yuris2/parenting_project.git

# Navigate into the project
cd parenting_project

# Navigate to the frontend folder
cd frontend

Step 2: Install Dependencies

npm install

This will install:

    React – UI library

    React Router DOM – Client-side routing

    Vite – Build tool and development server

    ESLint – Code linting

    Prettier – Code formatting

    Vitest – Testing framework

    Testing Library – React component testing utilities

Step 3: Verify Setup

npm run dev

Expected output:

VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h + enter to show help

Open your browser to http://localhost:3000
— you should see the ShareCare application.

---

Project Structure
Key Directories Explained

src/
├── components/     # Reusable UI components
│   ├── common/     # Generic components (Button, Input, etc.)
│   ├── layout/     # Layout components (Header, Footer)
│   └── forms/      # Form-specific components
├── pages/          # Route-level components (one per URL)
├── context/        # Global state management
│   └── FormContext # Shared questionnaire data
├── hooks/          # Custom React hooks
├── utils/          # Helper functions (validation, formatting, storage)
├── services/       # API integration (backend communication)

Each page represents a step in the questionnaire flow.

---

Running the Application

Start the development server with hot module replacement:

npm run dev

    Automatically opens browser to http://localhost:3000

    Changes auto-reload without losing component state

    Fast refresh enabled

Dev Mode Keyboard Shortcuts

    h + Enter – Show help

    r + Enter – Restart server

    q + Enter – Quit server

---

Preview Production Build

Test the production build locally:

# Build the app
npm run build

# Preview the build
npm run preview

Preview opens at http://localhost:4173
by default.

---

Available Scripts
Command	Description
npm run dev	Start development server (port 3000)
npm run build	Build optimized production bundle
npm run preview	Preview production build
npm run lint	Check for linting errors
npm run lint:fix	Auto-fix linting issues
npm run format	Format code using Prettier
npm run test	Run tests in watch mode
npm run test:ui	Run tests with UI
npm run test:coverage	Generate test coverage report

---

Code Quality Checks

Before committing code, always run:

npm run lint
npm run lint:fix
npm run format
npm run test

---

Building for Production
Create Production Build

npm run build

This generates a dist/ folder containing:

    Minified JavaScript

    Optimized CSS

    Compressed assets

    Source maps for debugging

Output location: frontend/dist/

---

Build Verification

npm run preview

Thoroughly test the application in preview mode before deployment.

---

Testing
Running Tests

# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test -- --run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

Test File Locations

    tests/components/ – Component tests

    tests/pages/ – Page-level tests

    tests/utils/ – Utility function tests


Last Updated: February 9, 2026
