# Quick Start Guide

Follow these steps to get your CRM Dashboard up and running quickly.

## Step 1: PostgreSQL Setup

1. Open PostgreSQL (psql or pgAdmin)
2. Create the database:
```sql
CREATE DATABASE crm_tools;
```

## Step 2: Backend Setup

Open a terminal and run:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# (On Mac/Linux: cp .env.example .env)

# Edit .env with your PostgreSQL credentials
# Change USERNAME and PASSWORD to match your PostgreSQL setup

# Generate Prisma client and create tables
npm run prisma:generate
npm run prisma:migrate

# Seed initial templates
npm run prisma:seed

# Start backend server
npm run dev
```

The backend will start on `http://localhost:3001`

**IMPORTANT**: Keep this terminal open! A QR code will appear for WhatsApp authentication.

## Step 3: Frontend Setup

Open a NEW terminal (keep the backend running) and run:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 4: WhatsApp Setup

1. Look at the backend terminal - you should see a QR code
2. Open WhatsApp on your phone
3. Go to: **Settings** → **Linked Devices** → **Link a Device**
4. Scan the QR code from the terminal
5. Wait for "WhatsApp client is ready!" message
6. Check the dashboard - it should show "WhatsApp: Connected"

## Step 5: Test the System

1. Open your browser to `http://localhost:5173`
2. Click "Add New Client"
3. Fill in:
   - Event Organizer: "Test Organization"
   - Phone Number: YOUR_PHONE_NUMBER (format: 081234567890)
4. Click "Add Client"
5. Click the "Chat" button
6. Send yourself a test message!

## Common Issues

### QR Code Not Showing
- Make sure backend is running
- Check for errors in backend terminal
- Try deleting `.wwebjs_auth` folder and restart

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# Verify your .env DATABASE_URL is correct
# Format: postgresql://username:password@localhost:5432/crm_tools
```

### Frontend Can't Connect to Backend
- Make sure backend is running on port 3001
- Check `frontend/src/config.js` - should be `http://localhost:3001/api`

## What's Next?

- Add more clients to your CRM
- Create custom message templates
- Explore the chat history feature
- Track client status and follow-ups

For detailed documentation, see [README.md](README.md)
