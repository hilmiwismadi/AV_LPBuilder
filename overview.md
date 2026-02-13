# VPS Projects Overview

> **📌 NOTE:** This file is automatically updated at the end of each session to reflect current project state. Always read this file at the start of new sessions for context.

**Last Updated:** 2026-02-13

---

## 🌐 VPS Configuration

- **VPS Name:** lpbuilder
- **IP Address:** 103.175.218.159
- **SSH Host:** lpbuilder
- **User:** adminlpbuilder
- **Main Project Path:** ~/AV_LPBuilder
- **Production URLs:**
  - Sales CRM: https://sales.webbuild.arachnova.id/
  - Landing Page Builder: https://webbuild.arachnova.id/

---

## 📁 Project Structure

```
~/AV_LPBuilder/
├── backend/              # Main backend services
├── frontend/             # Main frontend application
├── landingPage/          # Landing page builder application
├── sales-crm/            # Sales CRM system (detailed below)
├── web-scraper/          # Web scraping functionality
├── competition-mockup/   # Competition mockup files
├── document/             # Documentation
├── .claude/              # VPS-side settings (settings.local.json)
└── node_modules/         # Root dependencies
```

---

## 🎯 Projects Breakdown

### 1. **Sales CRM System** (`~/AV_LPBuilder/sales-crm/`)
**Production URL:** https://sales.webbuild.arachnova.id/

#### Technology Stack:
- **Backend:** Node.js + Express + Prisma ORM + PostgreSQL
- **Frontend:** React + Vite + React Router
- **Real-time:** WhatsApp Web.js, SSE (Server-Sent Events)
- **Scraping:** Selenium WebDriver + Puppeteer
- **Process Manager:** PM2

#### Directory Structure:
```
sales-crm/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Main entry point
│   │   ├── routes/                     # API endpoints
│   │   │   ├── auth.routes.js          # Login/logout/me
│   │   │   ├── admin.routes.js         # Admin management (SUPERADMIN)
│   │   │   ├── client.routes.js        # Client CRUD + assignment
│   │   │   ├── chat.routes.js          # Chat history
│   │   │   ├── whatsapp.routes.js      # WhatsApp integration
│   │   │   ├── template.routes.js      # Message templates
│   │   │   ├── scraper.routes.js       # Instagram scraper
│   │   │   ├── logs.routes.js          # PM2 logs viewer
│   │   │   └── monitor.routes.js       # System metrics
│   │   ├── middleware/
│   │   │   └── auth.middleware.js      # JWT + role validation
│   │   ├── services/
│   │   │   └── scraperService.js       # Instagram scraping logic
│   │   └── utils/
│   │       ├── whatsappService.js      # WhatsApp Web.js wrapper
│   │       ├── phoneUtils.js           # Phone standardization
│   │       └── encryptionService.js    # Credential encryption
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema
│   │   └── seed.js                     # Seed data
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx                     # Main app with routing
    │   ├── pages/
    │   │   ├── CRMPage.jsx             # Client management
    │   │   ├── SuperadminPage.jsx      # Admin panel
    │   │   ├── TemplateManagerPage.jsx # Message templates
    │   │   ├── ScraperPage.jsx         # Start scraping
    │   │   ├── ScraperLivePage.jsx     # Live scraping view
    │   │   ├── ScraperHistoryPage.jsx  # Scraping sessions
    │   │   ├── ScraperSessionDetailPage.jsx # Session details + assign
    │   │   ├── LogsPage.jsx            # View PM2 logs
    │   │   └── MonitorPage.jsx         # System monitoring
    │   ├── components/
    │   │   ├── Sidebar.jsx             # Navigation
    │   │   ├── LoginPage.jsx           # Authentication
    │   │   ├── ProtectedRoute.jsx      # Auth guard
    │   │   ├── SuperadminProtectedRoute.jsx # SUPERADMIN guard
    │   │   ├── ClientTable.jsx         # Client list
    │   │   ├── ClientForm.jsx          # Add/edit client
    │   │   ├── ClientDetailModal.jsx   # Client details
    │   │   ├── ChatModal.jsx           # Messaging UI
    │   │   ├── WhatsAppQRModal.jsx     # QR code scanner
    │   │   └── AssignModal.jsx         # Assign leads to sales
    │   └── services/
    │       └── api.js                  # Axios API client
    └── package.json
```

#### Core Features:

**Authentication & Authorization:**
- Cookie-based JWT (7-day expiry)
- Roles: SUPERADMIN, ADMIN, CS
- Role-based route protection

**Client Management (CRM):**
- CRUD operations for clients/leads
- Multi-startup support (NOVAGATE, NOVATIX)
- Statuses: TODO, FOLLOW_UP, NEXT_YEAR, GHOSTED_FOLLOW_UP
- Client fields: phoneNumber, eventOrganizer, igLink, cp1st, cp2nd, imgLogo, imgPoster, lastEvent, linkDemo, lastSystem, colorPalette, dateEstimation, igeventLink, lastContact, pic (person in charge), assignedBy, assignedAt, status, eventType, location, nextEventDate, priceRange, notes
- **Role-based filtering:**
  - SUPERADMIN: See ALL clients
  - ADMIN/CS: Only see clients assigned to them

**Instagram Scraper:**
- Scrape Instagram profiles for contact information
- Extract: phone numbers (up to 2), event organizer, event title/date, location, post URL, caption, image
- Configurable post range (start/end index)
- Authentication support (login for private accounts)
- Real-time progress with SSE
- Session management with unique slugs
- Statuses: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED

**Client Assignment System:**
- Convert scraped posts to clients
- Auto-detect duplicate phone numbers
- SUPERADMIN can assign to any team member
- ADMIN/CS can only assign to themselves
- Track assignedBy and assignedAt

**WhatsApp Integration:**
- QR code authentication
- Send messages directly from CRM
- Auto-save incoming messages
- Phone number standardization
- Connection status monitoring
- Service restart capability
- Orphan message handling (messages saved even if client not in system yet)

**Chat History:**
- Persistent conversation storage
- Phone hash linking (MD5 hash of standardized number)
- Messages persist across client deletions
- Bidirectional tracking (incoming/outgoing)
- lastContact auto-update

**Message Templates:**
- Reusable template library
- Variable substitution: {event_organizer}, {variant_fcc}, {last_event}, {link_demo}, {pic_name}, {startup}, {phone_number}, {cp1st}, {cp2nd}, {ig_link}, {notes}
- Categories and tags
- Enable/disable toggle
- Usage tracking
- Preview mode
- Auto-detect variables from message text
- Duplicate templates

**Superadmin Panel:**
- Create admin accounts (ADMIN, CS roles)
- List all admins
- Delete admins (can't delete self)
- Change own password
- Get sales list for assignment dropdown
- Email validation, password requirements (8+ chars)

**System Monitoring:**
- CPU usage (real-time %)
- Memory usage
- Disk usage
- System uptime
- Load average
- PM2 process monitoring (status, memory, CPU, restarts)

**Logs Viewer:**
- View PM2 logs
- Filter: all/errors/output
- Configurable line count
- Service status checks
- Restart services
- Flush logs

#### Database Schema (PostgreSQL):

**Models:**
1. **Admin** - User accounts (id, email, password, name, role, createdAt)
2. **Client** - Client/lead info (id, phoneNumber, eventOrganizer, igLink, cp1st, cp2nd, imgLogo, imgPoster, lastEvent, linkDemo, lastSystem, colorPalette, dateEstimation, igeventLink, lastContact, pic, assignedBy, assignedAt, status, startup, eventType, location, nextEventDate, priceRange, doneContact, notes, statistically, createdAt, updatedAt)
3. **ChatHistory** - Messages (id, phoneHash, clientId, message, isOutgoing, timestamp)
4. **ChatTemplate** - Templates (id, name, category, message, variables, description, enabled, usageCount, tags, createdAt, updatedAt, createdBy)
5. **TemplateUsage** - Usage tracking
6. **ScrapingSession** - Scraping sessions (id, slug, profileUrl, username, startPostIndex, endPostIndex, status, useAuth, instagramUsername, instagramPassword, totalPosts, successfulPosts, postsWithPhone, errorMessage, startedAt, completedAt)
7. **ScrapedPost** - Scraped data (id, sessionId, postIndex, postUrl, postDate, eventTitle, eventOrganizer, phoneNumber1, phoneNumber2, location, nextEventDate, imageUrl, caption, rawSource)

**Enums:**
- AdminRole: SUPERADMIN, ADMIN, CS
- ClientStatus: TODO, FOLLOW_UP, NEXT_YEAR, GHOSTED_FOLLOW_UP
- StartupType: NOVAGATE, NOVATIX
- SessionStatus: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED

#### API Endpoints Summary:

```
POST   /api/auth/login                    # Login
POST   /api/auth/logout                   # Logout
GET    /api/auth/me                       # Get current user

POST   /api/admin/create                  # Create admin (SUPERADMIN)
POST   /api/admin/change-password         # Change password
GET    /api/admin/list                    # List admins (SUPERADMIN)
DELETE /api/admin/:id                     # Delete admin (SUPERADMIN)
GET    /api/admin/sales-list              # Get sales team list (SUPERADMIN)

GET    /api/clients                       # Get all clients (filtered by role)
GET    /api/clients/:id                   # Get client by ID
POST   /api/clients                       # Create client
PUT    /api/clients/:id                   # Update client
DELETE /api/clients/:id                   # Delete client
POST   /api/clients/assign                # Assign scraped post to client
GET    /api/clients/check-assignment/:postId # Check if post assigned

GET    /api/chat/:clientId                # Get chat history
POST   /api/chat                          # Send message
GET    /api/chat/history/phone/:phoneNumber # Get chat by phone

GET    /api/whatsapp/status               # Get WhatsApp status
POST   /api/whatsapp/send                 # Send WhatsApp message
POST   /api/whatsapp/restart              # Restart WhatsApp service
GET    /api/whatsapp/client-info          # Get connected account info
POST   /api/whatsapp/parse-number         # Parse phone number

GET    /api/templates                     # Get all templates
GET    /api/templates/:id                 # Get template
POST   /api/templates                     # Create template
PUT    /api/templates/:id                 # Update template
PATCH  /api/templates/:id/toggle          # Toggle enabled
DELETE /api/templates/:id                 # Delete template
POST   /api/templates/:id/duplicate       # Duplicate template
POST   /api/templates/preview             # Preview with variables
GET    /api/templates/meta/categories     # Get categories
GET    /api/templates/meta/variables      # Get available variables
POST   /api/templates/:id/usage           # Increment usage count

POST   /api/scraper/start                 # Start scraping
GET    /api/scraper/sessions              # Get all sessions
GET    /api/scraper/sessions/:id          # Get session by ID
GET    /api/scraper/sessions/by-slug/:slug # Get session by slug
GET    /api/scraper/live/:sessionId       # SSE live updates
POST   /api/scraper/sessions/:id/cancel   # Cancel session
DELETE /api/scraper/sessions/:id          # Delete session

GET    /api/logs/:serviceName             # Get PM2 logs
GET    /api/logs/:serviceName/status      # Get service status
POST   /api/logs/:serviceName/restart     # Restart service
POST   /api/logs/:serviceName/flush       # Flush logs

GET    /api/monitor/metrics               # Get system metrics

GET    /api/health                        # Health check
```

#### Frontend Routes:

```
/login                      # Login page
/crm                        # Main CRM (client management)
/crm/templates              # Message templates
/scraper                    # Start new scraping session
/scraper/live               # Watch live scraping
/scraper/history            # View past sessions
/scraper/history/:slug      # Session details + assignment
/logs                       # System logs
/monitor                    # System monitoring
/superadmin                 # Admin management (SUPERADMIN only)
/sales                      # Coming soon
/lpbuilder                  # Coming soon
```

#### Environment Variables (.env):

```
DATABASE_URL="postgresql://username:password@localhost:5432/sales_crm_db?schema=public"
PORT=3002
NODE_ENV=production
JWT_ACCESS_SECRET="your-secret"
JWT_REFRESH_SECRET="your-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
COOKIE_DOMAIN=".arachnova.id"
```

#### Security Features:
- bcrypt password hashing (10 salt rounds)
- JWT HTTP-only cookies
- CORS whitelist protection
- Role-based middleware
- Prisma parameterized queries
- Input validation (email regex, password length)

---

### 2. **Landing Page Builder** (`~/AV_LPBuilder/landingPage/`)
**Production URL:** https://webbuild.arachnova.id/

#### Technology Stack:
- React + Vite
- Tailwind CSS
- Prisma + PostgreSQL

#### Key Features:
- **Customizable sections:**
  - HeroSection.jsx
  - AboutSection.jsx
  - SponsorsSection.jsx
  - DocumentationSection.jsx
  - AllSections.jsx
- **Configuration system:**
  - ConfigurationPage.jsx
  - CustomizationContext.jsx
- **Authentication:**
  - LoginPage.jsx
  - ProtectedRoute.jsx
  - RoleBasedRoute.jsx
  - AuthContext.jsx
- **Dashboard types:**
  - SuperadminDashboard.jsx
  - OrganizerDashboard.jsx
  - DashboardPage.jsx
- **Client management:**
  - ManageClientsPage.jsx
- **Preview & deployment:**
  - PreviewPage.jsx
  - SubdomainLandingPage.jsx
  - SavedPage.jsx

#### Directory Structure:
```
landingPage/app/
├── src/
│   ├── pages/
│   ├── components/
│   │   ├── sections/
│   │   ├── auth/
│   │   └── ControlPanel.jsx
│   ├── contexts/
│   │   └── CustomizationContext.jsx
│   └── utils/
│       └── iconMapper.jsx
├── server/
├── prisma/
└── dist/
```

---

### 3. **Backend** (`~/AV_LPBuilder/backend/`)
Main backend services for the platform.

---

### 4. **Frontend** (`~/AV_LPBuilder/frontend/`)
Main frontend application.

---

### 5. **Web Scraper** (`~/AV_LPBuilder/web-scraper/`)
Web scraping functionality (possibly integrated with sales-crm scraper).

---

## 🚀 Deployment & Process Management

### PM2 Services:
- **sales-crm-backend** - Backend API (Port 3002)
- **sales-crm-frontend** - Frontend React app
- **landingpage-app** - Landing page builder

### Common PM2 Commands:
```bash
pm2 list                    # List all processes
pm2 restart [app-name]      # Restart service
pm2 logs [app-name]         # View logs
pm2 stop [app-name]         # Stop service
pm2 start [app-name]        # Start service
pm2 flush                   # Clear logs
```

---

## 🔑 Access & Credentials

### VPS Access:
```bash
ssh lpbuilder
```

### Database:
- PostgreSQL running on VPS
- Database: sales_crm_db
- Access via Prisma ORM

### WhatsApp:
- QR code authentication via Sales CRM UI
- Session stored in: ~/.wwebjs_auth_sales_crm

---

## 📝 Development Workflow (Critical Rules)

### From rules.md:

1. **VPS is source of truth** - All code updates MUST be deployed to VPS
2. **Deployment workflow:**
   - Backup to local `.claude` folder first
   - Deploy immediately to VPS
   - Verify at production URL
   - Delete local backup after success
3. **Local .claude folder:** `C:\Users\L E N O V O\.ssh\.claude\`
4. **Never create/edit files outside `.claude`** on local machine
5. **Never create files in VPS root directory**
6. **Root access:** Only for SSH checks, never for development

---

## 📂 Important Files

### Local:
- `C:\Users\L E N O V O\.ssh\.claude\rules.md` - Development workflow rules
- `C:\Users\L E N O V O\.ssh\.claude\overview.md` - This file
- `C:\Users\L E N O V O\.claude\projects\C--Users-L-E-N-O-V-O--ssh\memory\MEMORY.md` - Claude memory

### VPS:
- `~/AV_LPBuilder/.claude/settings.local.json` - VPS-side configuration
- `~/AV_LPBuilder/sales-crm/backend/.env` - Backend environment variables
- `~/AV_LPBuilder/sales-crm/backend/prisma/schema.prisma` - Database schema

---

## 🎯 Quick Start Guide for New Sessions

1. **Read this file** to understand project structure
2. **Read rules.md** to understand workflow
3. **Check VPS status:**
   ```bash
   ssh lpbuilder "pm2 list"
   ```
4. **Access production:**
   - Sales CRM: https://sales.webbuild.arachnova.id/
   - Landing Page: https://webbuild.arachnova.id/

---

## 📊 Current System State

**Sales CRM Features Deployed:**
✅ Authentication & role-based access
✅ Client management with assignment
✅ Instagram scraper with real-time progress
✅ WhatsApp integration
✅ Chat history with phone hashing
✅ Message templates with variables
✅ Superadmin panel
✅ System monitoring & logs viewer

**Next Planned Features:**
- Sales analytics dashboard
- LP Builder integration
- Advanced reporting

---

**End of Overview** | Last Updated: 2026-02-13
