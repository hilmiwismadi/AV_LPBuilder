# CRM Dashboard with WhatsApp Integration

A simple CRM Dashboard built to manage client contacts and automate WhatsApp messaging with template support.

## Features

- **Client Management**: Add, edit, and delete client information with detailed fields
- **WhatsApp Integration**: Send messages directly through WhatsApp Web
- **Template System**: Pre-defined message templates with variable substitution
- **Chat History**: Track all conversations with clients
- **Status Tracking**: Manage client status (To Do, Follow Up, Next Year)
- **Whitelist System**: Only send messages to clients in your CRM database

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **WhatsApp**: whatsapp-web.js

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v16 or higher)
- PostgreSQL (running on localhost:5432)
- A smartphone with WhatsApp

## Installation & Setup

### 1. PostgreSQL Setup

1. Install PostgreSQL if not already installed
2. Create a database:
```sql
CREATE DATABASE crm_tools;
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Edit `.env` and update your database credentials:
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/crm_tools?schema=public"
PORT=3001
UPLOAD_DIR=uploads
```

5. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## WhatsApp Setup

1. Start the backend server
2. When the server starts, a QR code will appear in the terminal
3. Open WhatsApp on your phone
4. Go to Settings > Linked Devices > Link a Device
5. Scan the QR code shown in the terminal
6. Wait for "WhatsApp client is ready!" message
7. The dashboard will show "WhatsApp: Connected" status

**Note**: The WhatsApp session persists, so you only need to scan the QR code once unless you log out.

## Usage

### Adding Clients

1. Click "Add New Client" button
2. Fill in the required fields:
   - Event Organizer (required)
   - Phone Number (required) - Format: 081234567890
   - Other optional fields
3. Click "Add Client"

**Important**: Only clients added to the CRM can receive WhatsApp messages (whitelist system).

### Sending Messages

1. Click the "Chat" button next to a client
2. View previous chat history (if any)
3. Either:
   - Select a template from the dropdown (auto-fills message with client data)
   - Type a custom message
4. Click "Send Message"

### Creating Templates

Templates can be created via the API. Example templates from your requirements:

**First Cold Chatting**
```json
{
  "name": "First Cold Chatting - Umum",
  "category": "First Contact",
  "message": "Permisi kak, apakah benar ini kontak salah satu panitia dari [event_organizer]?",
  "variables": ["event_organizer"]
}
```

**Collaborate Check Up**
```json
{
  "name": "Collaborate Check Up",
  "category": "Follow Up",
  "message": "Kalau boleh tahu apakah panitia juga membuka peluang sponsorship atau kolaborasi digital, kak?",
  "variables": []
}
```

To add templates, use POST request to `http://localhost:3001/api/templates` or use Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

## Database Schema

### Client Fields
- `phoneNumber`: Client's WhatsApp number
- `eventOrganizer`: Organization name
- `igLink`: Instagram link
- `cp1st`, `cp2nd`: Contact persons
- `imgLogo`, `imgPoster`: Image URLs
- `lastEvent`: Last event name
- `linkDemo`: Personalized demo link
- `lastSystem`: Previous system used (Forms/WA/Partner)
- `colorPalette`: Theme color
- `dateEstimation`: Event date estimate
- `igeventLink`: Previous event IG post
- `lastContact`: Last contact date
- `pic`: Person in charge (your team)
- `status`: TO_DO | FOLLOW_UP | NEXT_YEAR

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Chat
- `GET /api/chat/:clientId` - Get chat history
- `POST /api/chat` - Add chat message

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `POST /api/templates/process` - Process template with variables

### WhatsApp
- `GET /api/whatsapp/status` - Get WhatsApp connection status
- `POST /api/whatsapp/send` - Send message to client
- `POST /api/whatsapp/refresh-whitelist` - Refresh whitelist

## Development

### Backend
```bash
cd backend
npm run dev  # Runs with nodemon (auto-reload)
```

### Frontend
```bash
cd frontend
npm run dev  # Runs with Vite (hot-reload)
```

### Database Management
```bash
cd backend
npm run prisma:studio  # Opens Prisma Studio GUI
npm run prisma:migrate  # Run new migrations
```

## Troubleshooting

### WhatsApp Not Connecting
- Make sure the backend is running
- Delete `.wwebjs_auth` and `.wwebjs_cache` folders in backend directory
- Restart backend and scan QR code again

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env` file
- Ensure database exists: `psql -l`

### Messages Not Sending
- Check WhatsApp status in dashboard (must show "Connected")
- Verify client phone number is in correct format (e.g., 081234567890)
- Client must be added to CRM (whitelist) before sending messages

## Color Scheme

Primary brand color: `#22afc6` (turquoise/cyan)

## Future Enhancements

- Reminder system based on status and date estimation
- Image upload for logos and posters
- Bulk message sending
- Message scheduling
- Analytics dashboard

## License

MIT
