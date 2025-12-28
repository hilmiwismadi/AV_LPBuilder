# Quick Start Guide - Instagram CRM Scraper

## What This Does

Scrapes Instagram posts #1000-#1100 from @infolomba.sch, extracts dates, phone numbers, and provides a web dashboard for your sales team to manage leads.

---

## 3-Step Quick Start

### Step 1: Configure (Already Done!)

Your config.json is already set up:
- Instagram credentials: YES
- Target: @infolomba.sch
- Skip first 1000 posts
- Scrape 100 posts

### Step 2: Scrape Data

Open terminal and run:

```bash
npm run scrape-improved
```

Takes: 15-30 minutes
Gets: 100 posts with dates, phone numbers, captions

### Step 3: View Dashboard

Terminal 1 - Start server:
```bash
npm run server
```

Browser - Open dashboard:
```
http://localhost:3001
```

---

## What You'll See

### 1. Scraper Output
```
Successfully saved: 98
Failed: 2
```

### 2. Dashboard Features
- Statistics (total posts, phone numbers, status)
- Search by caption/title/phone/organizer
- Edit CRM fields (organizer, contacts, status, notes)
- View original Instagram post
- Pagination

### 3. Edit Post Details
Click "Edit Details" on any post to add:
- Event Organizer
- Contact Persons (1 & 2)
- Event Type
- Location
- Next Event Date
- Price Range
- Status (TODO/CONTACTED/FOLLOW_UP/CLOSED)
- Notes

---

## Files Created

```
scraper-improved.js    - New scraper with date extraction
schema.sql             - Database schema with CRM fields
server.js              - Backend API
public/index.html      - Frontend dashboard
config.json            - Updated with skip/scrape settings
crm-events.db          - Created after scraping
```

---

## Common Commands

```bash
# Scrape Instagram posts
npm run scrape-improved

# Start dashboard server
npm run server

# Open dashboard
# Go to: http://localhost:3001
```

---

## Troubleshooting

Scraper stuck? Instagram is rate limiting. Wait 5-10 minutes and try again.

No dates showing? The improved scraper visits each post individually, so dates should work.

Port 3001 in use? Change PORT in server.js to 3002 or another available port.

---

## Need More Help?

Read the full guide: USAGE-GUIDE.md

---

Ready? Run npm run scrape-improved to start!
