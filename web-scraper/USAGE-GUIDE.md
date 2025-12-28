# Instagram Scraper CRM System - Complete Usage Guide

## Overview

This is a complete CRM system that scrapes Instagram posts, extracts data (dates, phone numbers, captions), and provides a web interface for the sales team to manage leads.

## System Components

1. **Improved Scraper** (`scraper-improved.js`) - Scrapes Instagram posts with proper date extraction
2. **Database** (`crm-events.db`) - SQLite database with enhanced schema for CRM fields
3. **Backend API** (`server.js`) - Express REST API for data management
4. **Frontend UI** (`public/index.html`) - Beautiful dashboard for viewing and editing scraped data

## Features

### Scraper Features
- ✅ **Skip first N posts** - Configure to skip first 1000 posts
- ✅ **Scrape specific range** - Get exactly 100 posts (#1000-#1100)
- ✅ **Proper date extraction** - Visits each post to extract accurate dates
- ✅ **Phone number detection** - Extracts Indonesian phone numbers
- ✅ **Event title extraction** - Gets event names from captions
- ✅ **Image URL extraction** - Saves Instagram image URLs

### Database Schema
**Automatically Scraped Fields:**
- `post_url` - Instagram post link
- `post_date` - Post publication date
- `caption` - Full post caption
- `phone_number` - Extracted phone number
- `event_title` - Event name
- `source_account` - Instagram account
- `image_url` - Post image URL

**Manual CRM Fields (for sales team):**
- `event_organizer` - Organization name
- `contact_person_1` - First contact
- `contact_person_2` - Second contact
- `event_type` - Type of event
- `location` - Event location
- `next_event_date` - Upcoming event date
- `price_range` - Ticket prices
- `status` - TODO, CONTACTED, FOLLOW_UP, CLOSED, REJECTED
- `notes` - Sales notes
- `last_contact_date` - Last contact timestamp

### API Endpoints
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (CRM fields)
- `DELETE /api/posts/:id` - Delete post
- `GET /api/stats` - Get statistics
- `GET /api/posts/search/:query` - Search posts
- `GET /api/posts/filter/:field/:value` - Filter by field

### Frontend Features
- 📊 **Dashboard Statistics** - Total posts, phone numbers, status counts
- 🔍 **Search** - Search by caption, title, organizer, phone
- ✏️ **Edit Modal** - Update CRM fields for each post
- 📱 **Responsive Design** - Beautiful gradient UI
- 🎨 **Visual Cards** - Display images, titles, dates, badges
- 📄 **Pagination** - Navigate through 100s of posts

---

## Step-by-Step Usage

### Step 1: Configure Scraping Parameters

Edit `config.json`:

```json
{
  "instagram": {
    "username": "your_instagram_username",
    "password": "your_instagram_password"
  },
  "scraping": {
    "targetAccounts": ["infolomba.sch"],
    "startDate": "2024-12-01",
    "endDate": "2025-05-31",
    "maxScrolls": 30,
    "skipFirstN": 1000,    // Skip first 1000 posts
    "scrapeCount": 100     // Scrape 100 posts
  }
}
```

### Step 2: Run the Improved Scraper

```bash
npm run scrape-improved
```

**What happens:**
1. Browser opens automatically
2. Logs into Instagram with your credentials
3. Navigates to @infolomba.sch
4. Scrolls to collect 1100+ posts
5. Skips first 1000 posts
6. Scrapes posts #1001-#1100 (100 posts)
7. Visits each post individually to extract:
   - Accurate post date
   - Caption text
   - Phone numbers
   - Image URLs
8. Saves to `crm-events.db`

**Expected Time:** 15-30 minutes (depending on Instagram's loading speed)

**Output Example:**
```
🚀 Starting Improved Instagram Scraper...
✓ Browser launched
✓ Login successful!

==============================================================
  Scraping account: @infolomba.sch
  Strategy: Skip first 1000 posts, then scrape 100 posts
==============================================================

📜 Scrolling to collect 1100+ posts...
  📊 Progress: 10 scrolls | 87 posts collected
  📊 Progress: 20 scrolls | 245 posts collected
  ...
✓ Collected 1151 posts!

✓ Posts collected: 1151
✓ Skipping first: 1000
✓ Scraping posts: 100 (from #1001 to #1100)

[1/100] Processing post #1001...
  ✓ SAVED
  📅 Date: 5/9/2025
  📌 Title: gudanglomba.ind and infolomba.sch...
  📱 Phone: 628123456789

[2/100] Processing post #1002...
...

==============================================================
  SCRAPING COMPLETE!
==============================================================
  Posts processed: 100
  Successfully saved: 98
  Failed: 2
==============================================================
```

### Step 3: Start the Backend Server

```bash
npm run server
```

**Output:**
```
============================================================
  🚀 CRM Events Server Running
============================================================
  Local:            http://localhost:3001
  API Endpoints:    http://localhost:3001/api/posts
  Frontend:         http://localhost:3001
============================================================
```

### Step 4: Open the Frontend Dashboard

Open your browser and go to: **http://localhost:3001**

### Step 5: Use the Dashboard

#### View Posts
- See all 100 scraped posts in a beautiful card layout
- Each card shows:
  - Post image
  - Event title
  - Post date
  - Caption preview
  - Phone number badge (if available)
  - Status badge

#### Search Posts
1. Type in the search box (caption, title, phone, organizer)
2. Click "Search" or press Enter
3. Click "Show All" to reset

#### Edit Post Details
1. Click "Edit Details" on any post card
2. Fill in the CRM fields:
   - Event Organizer
   - Contact Persons (1 & 2)
   - Event Type (Conference, Workshop, etc.)
   - Location
   - Next Event Date
   - Price Range
   - Status (TODO, CONTACTED, FOLLOW_UP, CLOSED, REJECTED)
   - Last Contact Date
   - Notes
3. Click "Save Changes"

#### View Original Post
- Click "View Post" to open the Instagram post in a new tab

---

## Configuration Options

### Adjust Scraping Range

To scrape different posts, edit `config.json`:

**Example: Skip first 2000, scrape 50 posts**
```json
{
  "scraping": {
    "skipFirstN": 2000,
    "scrapeCount": 50
  }
}
```

**Example: Start from beginning, scrape 200 posts**
```json
{
  "scraping": {
    "skipFirstN": 0,
    "scrapeCount": 200
  }
}
```

---

## Troubleshooting

### Scraper Issues

**Problem:** "Unknown date" in results
- **Solution:** The improved scraper visits each post individually, so dates should work. If still failing, Instagram may have changed their HTML structure.

**Problem:** Browser closes immediately
- **Solution:** Check your credentials in `config.json`

**Problem:** Instagram blocks/rate limits
- **Solution:** The scraper includes automatic delays and breaks. If still blocked, wait a few hours and try again.

### Server Issues

**Problem:** Port 3001 already in use
- **Solution:** Edit `server.js` and change `const PORT = 3001` to another port (e.g., 3002)

**Problem:** CORS errors in browser
- **Solution:** The server has CORS enabled. Make sure you're accessing via `http://localhost:3001`, not `file://`

### Database Issues

**Problem:** Database locked
- **Solution:** Close any other processes accessing `crm-events.db`

---

## API Usage Examples

### Get All Posts
```bash
curl http://localhost:3001/api/posts
```

### Get Post by ID
```bash
curl http://localhost:3001/api/posts/1
```

### Update Post
```bash
curl -X PUT http://localhost:3001/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "event_organizer": "Tech Conference Inc",
    "status": "CONTACTED",
    "notes": "Spoke with organizer, interested in our services"
  }'
```

### Search Posts
```bash
curl http://localhost:3001/api/posts/search/conference
```

### Get Statistics
```bash
curl http://localhost:3001/api/stats
```

---

## Database Management

### View Database Directly
```bash
sqlite3 crm-events.db

sqlite> SELECT * FROM scraped_posts LIMIT 5;
sqlite> SELECT COUNT(*) FROM scraped_posts WHERE phone_number IS NOT NULL;
sqlite> .quit
```

### Backup Database
```bash
# Windows
copy crm-events.db crm-events-backup.db

# Linux/Mac
cp crm-events.db crm-events-backup.db
```

### Reset Database
```bash
# Delete the database file
del crm-events.db

# Run scraper again to create fresh data
npm run scrape-improved
```

---

## Next Steps

### For Testing (Current Phase)
1. ✅ Run scraper with posts #1000-#1100
2. ✅ Review data quality in dashboard
3. ✅ Test editing CRM fields
4. ✅ Verify phone number extraction accuracy
5. ✅ Check date accuracy

### For Production (Future)
1. Integrate into main NovaGate CRM Tab
2. Add user authentication
3. Add bulk edit features
4. Add export to Excel/CSV
5. Add email notifications for follow-ups
6. Add more sophisticated lead scoring

---

## File Structure

```
web-scraper/
├── config.json              # Configuration (credentials, scraping params)
├── scraper-improved.js      # NEW: Improved scraper with date extraction
├── schema.sql               # NEW: Enhanced database schema
├── server.js                # NEW: Express backend API
├── crm-events.db           # NEW: SQLite database (created after scraping)
├── public/
│   └── index.html          # NEW: Frontend dashboard
├── package.json            # Updated with new scripts
├── instagram-cookies.json  # Saved Instagram session
└── USAGE-GUIDE.md          # This file
```

---

## Quick Command Reference

```bash
# Scrape posts #1000-#1100
npm run scrape-improved

# Start backend server
npm run server

# View database statistics
sqlite3 crm-events.db "SELECT COUNT(*) FROM scraped_posts;"

# Backup database
copy crm-events.db backup.db
```

---

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your Instagram credentials in `config.json`
3. Ensure ports 3001 is available
4. Check the database exists: `crm-events.db`
5. Review this guide's troubleshooting section

---

## Summary

You now have a complete CRM system that:
- ✅ Scrapes Instagram posts with accurate dates
- ✅ Extracts phone numbers and event info
- ✅ Provides a beautiful web interface
- ✅ Allows sales team to manage leads
- ✅ Stores everything in a structured database

**Ready to test with 100 posts from #1000-#1100!**
