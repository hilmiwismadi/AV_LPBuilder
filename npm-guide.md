# NPM Commands Guide - CRM Tools

Complete reference for all npm commands across Web Scraper, Backend, and Frontend Dashboard projects.

BE: 
PS D:\Hilmi\Coding\CRM_Tools\web-scraper> npm start

FE :
cd D:\Hilmi\Coding\CRM_Tools\web-scraper
  npm run server

  Then open: http://localhost:3002
---

## Web Scraper

### Setup
```bash
cd web-scraper
npm install
```

### Main Commands
```bash
# Run basic scraper
npm start

# Run improved scraper with date extraction
npm run scrape-improved

# Start backend server (for CRM dashboard)
npm run server
```

### Database & Utilities
```bash
# Initialize database schema
npm run init-db

# View scraped data
npm run view

# Migrate phone numbers
npm run migrate

# Check post dates
npm run check-date

# Deep scroll and check dates
npm run deep-scroll
```

### Details
- **npm start**: Runs `scraper.js` (basic scraper)
- **npm run scrape-improved**: Runs `scraper-improved.js` (visits each post for accurate dates)
- **npm run server**: Starts Express API server on port 3001
- **npm run init-db**: Sets up SQLite database schema
- **npm run view**: View database contents
- **npm run migrate**: Migration script for phone number format
- **npm run check-date**: Test date extraction functionality
- **npm run deep-scroll**: Advanced scrolling with date checking

---

## Backend (CRM API)

### Setup
```bash
cd backend
npm install

# Setup environment
copy .env.example .env
# Edit .env with your PostgreSQL credentials
```

### Development
```bash
# Start development server (with nodemon auto-reload)
npm run dev

# Start production server
npm start
```

### Prisma Database Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed initial data (templates)
npm run prisma:seed
```

### Details
- **npm run dev**: Runs backend with nodemon (auto-restarts on changes)
- **npm start**: Runs backend in production mode
- **npm run prisma:generate**: Generates Prisma client types
- **npm run prisma:migrate**: Creates/updates database schema
- **npm run prisma:studio**: Opens GUI at http://localhost:5555
- **npm run prisma:seed**: Seeds initial message templates

### Backend runs on: `http://localhost:3001`

---

## Frontend Dashboard

### Setup
```bash
cd frontend
npm install
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Details
- **npm run dev**: Starts Vite dev server with hot reload
- **npm run build**: Builds optimized production bundle
- **npm run preview**: Preview production build locally
- **npm run lint**: Run ESLint code quality checks

### Frontend runs on: `http://localhost:5173`

---

## Quick Start Workflow

### First Time Setup

1. **Database Setup**
```sql
CREATE DATABASE crm_tools;
```

2. **Backend Setup**
```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

3. **Frontend Setup** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Web Scraper Setup** (optional)
```bash
cd web-scraper
npm install
npm run scrape-improved
```

---

## Development Workflow

### Daily Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Scraping New Leads
```bash
# Terminal 3 - Web Scraper
cd web-scraper
npm run scrape-improved
```

---

## Production Build

### Build Frontend for Production
```bash
cd frontend
npm run build
npm run preview  # Test production build
```

---

## Database Management

### Backend (PostgreSQL via Prisma)
```bash
cd backend

# View/edit database in GUI
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database and seed
npm run prisma:migrate
npm run prisma:seed
```

### Web Scraper (SQLite)
```bash
cd web-scraper

# Initialize fresh database
npm run init-db

# View scraped data
npm run view
```

---

## Troubleshooting Commands

### Check Node/NPM Version
```bash
node --version
npm --version
```

### Clean Install
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port Already in Use
```bash
# Find process using port 3001 (backend)
netstat -ano | findstr :3001

# Find process using port 5173 (frontend)
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /PID <process_id> /F
```

---

## Quick Command Reference

### Web Scraper
| Command | Description |
|---------|-------------|
| `npm start` | Run basic scraper |
| `npm run scrape-improved` | Run improved scraper with dates |
| `npm run server` | Start CRM API server |
| `npm run init-db` | Initialize SQLite database |
| `npm run view` | View scraped data |

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (nodemon) |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open database GUI |
| `npm run prisma:seed` | Seed initial data |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

---

## Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://username:password@localhost:5432/crm_tools"
PORT=3001
```

### Web Scraper `config.json`
```json
{
  "instagram": {
    "username": "your_instagram_username",
    "password": "your_instagram_password"
  },
  "scraping": {
    "targetAccounts": ["infolomba.sch"],
    "skipFirstN": 1000,
    "scrapeCount": 100
  }
}
```

---

## Ports Reference
- **Backend API**: http://localhost:3001
- **Frontend Dashboard**: http://localhost:5173
- **Prisma Studio**: http://localhost:5555
- **Web Scraper API**: http://localhost:3001 (when running `npm run server`)

---

## Additional Notes

### Backend Dependencies
- Express (API server)
- Prisma (ORM)
- WhatsApp Web.js (messaging)
- CORS, Multer, dotenv

### Frontend Dependencies
- React 19
- Vite (build tool)
- TanStack React Table
- Axios (HTTP client)
- date-fns

### Web Scraper Dependencies
- Puppeteer (browser automation)
- better-sqlite3 (database)
- Express, CORS (API)
- xlsx (Excel export)

---

## Support

For more detailed guides, see:
- **Web Scraper**: `web-scraper/USAGE-GUIDE.md`
- **Quick Start**: `QUICKSTART.md`
- **Main README**: `README.md`
