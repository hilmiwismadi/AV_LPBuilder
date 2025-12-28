# Tagged Account Scraping Implementation

## Overview

Successfully implemented tagged person/organizer extraction from Instagram posts. The scraper now extracts @mentioned accounts from captions, visits their profiles, and saves organizer information to the database.

---

## Test Results

### Test 1: https://www.instagram.com/medialombaplus/p/DJWu8MXTB4y/

**@Mentioned Accounts Found:**

1. **IG Account:** https://www.instagram.com/christinnn.1/
   **Name:** 🇮🇩 | 🇳🇱ᴬᶜᶜ | @president_universityaccademic | @api.cabinetsecretary | @coolpresunivofficial𝒆𝒂𝒔𝒕 𝒏𝒖𝒔𝒂 𝒕𝒆𝒏𝒈𝒈𝒂𝒓𝒂📍🌴

2. **IG Account:** https://www.instagram.com/daillyynaaaa/
   **Name:** (Private account)

3. **IG Account:** https://www.instagram.com/tashasrsw/
   **Name:** (Private account)

---

### Test 2: https://www.instagram.com/infolomba.sch/p/DJUEzfIzr0N/

**@Mentioned Accounts Found:**

1. **IG Account:** https://www.instagram.com/amsaday.ui/
   **Name:** an Annual Social Service Event by AMSA-UI Youth Members✨ㅤAMSA Day 2025: Know TB, No TB!

2. **IG Account:** https://www.instagram.com/diindaakirana/
   **Name:** (Private account)

3. **IG Account:** https://www.instagram.com/pttiaa._/
   **Name:** (Private account)

---

### Test 3: https://www.instagram.com/infolomba.sch/p/DJTLtX7zSX7/

**@Mentioned Accounts Found:**

1. **IG Account:** https://www.instagram.com/digibattlesis/
   **Name:** 🚀 By School of Information Systems - BINUS University💻 Information Systems | Business Analytics Case Competition for...

---

## Implementation Details

### 1. Database Schema Changes

Added 3 new columns to `scraped_posts` table:

- `tagged_accounts` (TEXT) - JSON array storing all tagged accounts with username, name, and profile URL
- `organizer_ig` (TEXT) - Instagram handle of primary organizer (first tagged account)
- `organizer_name` (TEXT) - Name/bio of primary organizer

### 2. New Methods in scraper-improved.js

#### `getProfileName(username)`
- Opens Instagram profile in a new browser page
- Extracts name/bio from header or meta tags
- Handles both public and private accounts
- Returns profile name or null

#### `extractMentionedAccounts()`
- Scans current page for @mentions in caption
- Looks for both `@username` text and profile links within caption area
- Visits up to 2 profiles to avoid rate limiting
- Returns array of {username, name, profileUrl} objects
- Logs progress with account names

### 3. Updated Methods

#### `scrapePost()`
- Now calls `extractMentionedAccounts()` after extracting caption
- Adds `taggedAccounts` to returned post data
- Example output shows organizer info in console

#### `savePost()`
- Converts tagged accounts array to JSON for storage
- Extracts first tagged account as primary organizer
- Saves organizer_ig and organizer_name separately for easy querying
- Updated INSERT statement to include new columns

### 4. Console Output Enhancement

When a post is saved, console now shows:
```
✓ SAVED
📅 Date: 1/15/2025
📌 Title: AMSA Day 2025
📱 Phones: 628123456789
🏢 Organizer: @amsaday.ui (an Annual Social Service Event by AMSA-UI...)
```

---

## How It Works

### During Scraping:

1. **Navigate to post** - Scraper opens Instagram post URL
2. **Extract caption** - Gets full caption text
3. **Find @mentions** - Searches caption for @username links
4. **Visit profiles** - Opens each mentioned account's profile (limit: 2)
5. **Extract organizer info** - Gets name/bio from profile header
6. **Save to database** - Stores tagged accounts as JSON + primary organizer

### Data Storage:

```json
{
  "tagged_accounts": [
    {
      "username": "amsaday.ui",
      "name": "an Annual Social Service Event by AMSA-UI Youth Members✨ㅤAMSA Day 2025: Know TB, No TB!",
      "profileUrl": "https://www.instagram.com/amsaday.ui/"
    }
  ],
  "organizer_ig": "amsaday.ui",
  "organizer_name": "an Annual Social Service Event by AMSA-UI Youth Members✨ㅤAMSA Day 2025: Know TB, No TB!"
}
```

---

## Rate Limiting & Performance

- **Limits tagged accounts to first 2** per post to avoid Instagram rate limits
- **1.5 second delay** between profile visits
- **Creates new browser page** for each profile to avoid interfering with main scraping
- **Closes profile pages** immediately after extraction

---

## Handling Edge Cases

✅ **Private accounts** - Detected and skipped (shows "Follow to see their photos and videos")
✅ **No @mentions** - Returns empty array, no organizer saved
✅ **Invalid usernames** - Filtered out (length checks, no special chars)
✅ **Multiple @mentions** - Extracts up to 2, prioritizes first as primary organizer

---

## Next Steps

To use this feature:

1. **Run scraper-improved.js** - All new posts will have tagged accounts extracted
2. **Query database** - Access `organizer_ig` and `organizer_name` columns
3. **Frontend integration** - Display organizer info in CRM dashboard
4. **Backfill existing posts** - Run re-scrape on old posts to add organizer data

---

## Example Query

To find all posts by a specific organizer:

```sql
SELECT * FROM scraped_posts
WHERE organizer_ig = 'amsaday.ui';
```

To get all unique organizers:

```sql
SELECT DISTINCT organizer_ig, organizer_name
FROM scraped_posts
WHERE organizer_ig IS NOT NULL
ORDER BY organizer_name;
```

---

## Files Modified

1. ✅ `scraper-improved.js` - Added tagged account extraction logic
2. ✅ `add-tagged-columns.js` - Database schema update script
3. ✅ `test-tagged-scraper.js` - Test script for validation
4. ✅ `crm-events.db` - Updated with new columns

---

**Implementation Complete! ✨**

The scraper now automatically extracts event organizer information from Instagram posts via @mentions and tagged accounts.
