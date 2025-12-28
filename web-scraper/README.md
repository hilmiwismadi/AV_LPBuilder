# Instagram Event Scraper

Automatically scrapes Instagram posts from event promotion accounts to find potential clients for your event services startup.

## Features

- 🔍 Scrapes Instagram posts from specified accounts
- 📅 Filters posts by date range (December 2024 - May 2025)
- 📱 Automatically extracts phone numbers from captions
- 🚫 Filters out free events (free registration/free entry)
- 💾 Stores data in SQLite database
- 📊 Easy data viewing and export

## Setup

1. Install dependencies:
   ```bash
   cd web-scraper
   npm install
   ```

2. Initialize the database:
   ```bash
   npm run init-db
   ```

3. **Configure your Instagram credentials:**

   Edit `config.json` and add your Instagram login:
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
       "maxScrolls": 30
     }
   }
   ```

   **Security Notes:**
   - `config.json` is automatically ignored by git
   - Your credentials are stored locally only
   - Session cookies are saved after first login
   - You only need to login once

## Usage

### Run the Scraper

```bash
npm start
```

**How it works:**
1. Browser opens automatically
2. Scraper reads your credentials from `config.json`
3. Automatically logs into Instagram
4. Saves session for future runs (no need to login again!)
5. Starts collecting posts from target accounts

**First Run:**
- Make sure your credentials are in `config.json`
- The scraper will login automatically
- Session is saved after successful login

**Subsequent Runs:**
- Uses saved session (no login needed)
- Only re-authenticates if session expires

### View Scraped Data

```bash
node view-data.js
```

This will display all scraped events with:
- Event title
- Instagram post link
- Post date
- Phone number (if found)
- Source account
- Caption preview

## Configuration

All settings are in `config.json`:

```json
{
  "instagram": {
    "username": "your_username",
    "password": "your_password"
  },
  "scraping": {
    "targetAccounts": ["infolomba.sch", "another_account"],
    "startDate": "2024-12-01",
    "endDate": "2025-05-31",
    "maxScrolls": 30
  }
}
```

**Settings explained:**
- `targetAccounts`: List of Instagram accounts to scrape
- `startDate` / `endDate`: Only collect posts within this date range
- `maxScrolls`: How many times to scroll down (30 = ~90-150 posts)

## Database Schema

The `events.db` SQLite database contains:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-incrementing primary key |
| event_title | TEXT | Event name/title |
| instagram_link | TEXT | Full Instagram post URL |
| post_date | TEXT | Date when post was published |
| caption | TEXT | Full Instagram caption |
| phone_number | TEXT | Extracted phone number (normalized to +62 format) |
| is_free_event | BOOLEAN | Whether event is marked as free |
| scraped_at | TIMESTAMP | When the data was scraped |
| source_account | TEXT | Instagram account that posted it |

## Phone Number Detection

The scraper detects various Indonesian phone formats:
- `0812-3456-7890`
- `62 812-3456-7890`
- `+62 812-3456-7890`
- `WA: 08123456789`

All numbers are normalized to international format: `628123456789`

## Free Event Detection

Posts are filtered out if they contain:
- "free registration"
- "free entry"
- "gratis"
- "tanpa biaya"
- "bebas biaya"

## Workflow

1. **Scrape data**: `npm start`
2. **View results**: `node view-data.js`
3. **Use in CRM**: The database file `events.db` can be merged with your backend later

## Tips

- Run the scraper during off-peak hours to avoid rate limiting
- Start with one account to test, then add more
- The scraper saves progress to database, so you can stop and resume
- Check the browser window if scraping seems stuck

## Future Integration

The `events.db` database is ready to be integrated with your CRM backend. You can:
1. Export data to CSV/JSON
2. Import into your main CRM database
3. Set up automated daily scraping
4. Add webhook notifications for new events

## Troubleshooting

**Browser doesn't open:**
- Make sure you have Chrome/Chromium installed
- Check that puppeteer installed correctly

**Login issues:**
- If Instagram blocks login, try using a different IP or VPN
- Consider using Instagram's official API for production use

**No data found:**
- Check that the date range matches available posts
- Verify the Instagram account name is correct
- Instagram may have changed their HTML structure

## Legal Note

This scraper is for personal/business use to find public information. Make sure to:
- Respect Instagram's Terms of Service
- Don't scrape private accounts
- Use rate limiting to avoid overwhelming servers
- Consider using Instagram's official API for production
