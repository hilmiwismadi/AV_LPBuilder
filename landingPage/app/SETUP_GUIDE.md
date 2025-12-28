# Landing Page Configuration System - Setup Guide

## Overview

This application is a customizable landing page builder with advanced configuration capabilities. It now includes:

- **Main Landing Page** (`/`) - The customizable landing page with theme and layout options
- **Configuration Page** (`/configuration`) - Advanced configuration with image uploads, custom colors, and section management
- **Saved Configurations** (`/saved`) - View, manage, and load previously saved configurations

## New Features

### 1. Advanced Configuration Page (`/configuration`)

#### Left Side - Configuration Form:
- **Configuration Name**: Name your configuration for easy identification
- **Color Configuration**:
  - 6 recommended color palettes
  - Custom color picker for creating your own 2-color gradient
  - Live preview of selected gradient
- **Image Uploads**:
  - Event Logo upload
  - Event Poster upload
- **Section Configuration**:
  - Toggle each section on/off
  - Select from 3 layout variants per section
  - 9 sections total: Hero, About, Categories, Timeline, Prizes, Jury, Documentation, Sponsors, Contact

#### Right Side - Live Preview:
- 16:9 ratio preview screen
- Real-time preview of changes
- Iframe showing the actual landing page with applied settings

#### Save Functionality:
- Saves complete configuration to database
- Includes colors, images, layouts, and section visibility
- Configurations are stored with timestamp

### 2. Saved Configurations Page (`/saved`)

- Table view of all saved configurations
- Displays:
  - Configuration name
  - Color gradient preview
  - Number of active sections
  - Creation date and time
- Actions per configuration:
  - **Preview**: View configuration details in modal
  - **Load**: Apply configuration to current landing page
  - **Download**: Export configuration as JSON
  - **Delete**: Remove configuration from database

### 3. Database Integration

- **Technology**: Prisma ORM with SQLite
- **Schema**: `Configuration` model storing:
  - id (UUID)
  - name
  - customColors (JSON)
  - images (JSON)
  - layouts (JSON)
  - sectionVisibility (JSON)
  - timestamps

### 4. API Server

- **Technology**: Express.js
- **Port**: 3001
- **Endpoints**:
  - `GET /api/configurations` - Get all configurations
  - `GET /api/configurations/:id` - Get single configuration
  - `POST /api/configurations` - Create new configuration
  - `PUT /api/configurations/:id` - Update configuration
  - `DELETE /api/configurations/:id` - Delete configuration

## Installation & Setup

### 1. Install Dependencies

```bash
cd D:\Hilmi\Coding\CRM_Tools\landingPage\app
npm install
```

### 2. Setup Database

The database is already initialized with Prisma. If you need to reset or migrate:

```bash
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
```

### 3. Start Development Server

```bash
npm run dev
```

This command starts both:
- **Vite dev server** (Frontend) - http://localhost:5173
- **Express API server** (Backend) - http://localhost:3001

## File Structure

```
landingPage/app/
├── src/
│   ├── components/
│   │   ├── ControlPanel.jsx       # Updated with links to new pages
│   │   ├── Navigation.jsx          # NEW - Navigation bar
│   │   └── sections/               # Landing page sections
│   ├── contexts/
│   │   └── CustomizationContext.jsx # Updated with new features
│   ├── pages/
│   │   ├── LandingPage.jsx         # NEW - Main landing page component
│   │   ├── ConfigurationPage.jsx   # NEW - Configuration interface
│   │   └── SavedPage.jsx           # NEW - Saved configs management
│   ├── generated/
│   │   └── prisma/                 # Generated Prisma client
│   └── App.jsx                     # Updated with routing
├── server/
│   └── index.js                    # NEW - Express API server
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── dev.db                      # SQLite database
│   └── migrations/                 # Database migrations
├── package.json                    # Updated with new scripts
└── prisma.config.ts                # Prisma configuration

```

## Navigation

### From Landing Page:
1. Click the "Customize" button (floating or sidebar)
2. In the Control Panel, look for "Advanced Configuration" section
3. Click "Advanced Config" to go to `/configuration`
4. Click "View Saved" to go to `/saved`

### Using Navigation Bar:
Available on Configuration and Saved pages at the top:
- **Landing Page** - Return to main landing page
- **Configuration** - Go to configuration page
- **Saved Configs** - Go to saved configurations

## Workflow

### Creating a Configuration:

1. Go to `/configuration`
2. Enter a configuration name
3. Choose or create color palette
4. Upload logo and poster images (optional)
5. Configure each section:
   - Toggle on/off
   - Select variant (1, 2, or 3)
6. Click "Save Configuration"
7. Configuration is saved to database

### Loading a Configuration:

1. Go to `/saved`
2. Find your configuration in the table
3. Click the **Load** button (green icon)
4. Configuration is applied to landing page
5. Navigate to `/` to see the result

### Managing Configurations:

- **Preview**: Click eye icon to see details
- **Download**: Click download icon to export as JSON
- **Delete**: Click trash icon to remove (with confirmation)

## Database Operations

### View Database:
You can inspect the database using Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface at http://localhost:5555

### Reset Database:
If you need to start fresh:

```bash
# Delete the database file
del prisma\dev.db

# Recreate with migrations
npx prisma migrate dev --name init
```

## Customization Context

The CustomizationContext now includes:

- `customColors` - Two-color gradient object
- `updateCustomColors()` - Update gradient colors
- `images` - Logo and poster images (base64)
- `updateImage()` - Update specific image
- `sectionVisibility` - Boolean object for each section
- `toggleSectionVisibility()` - Toggle section on/off

## API Examples

### Create Configuration:

```javascript
const response = await fetch('/api/configurations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Event Config',
    customColors: { color1: '#667eea', color2: '#764ba2' },
    images: { logo: 'data:image/png;base64,...', poster: null },
    layouts: { hero: 'layout-1', about: 'layout-2', ... },
    sectionVisibility: { hero: true, about: true, ... }
  })
});
```

### Load All Configurations:

```javascript
const response = await fetch('/api/configurations');
const configs = await response.json();
```

## Troubleshooting

### Server Won't Start:
- Check if port 3001 is available
- Make sure all dependencies are installed
- Check for errors in the console

### Database Errors:
- Run `npm run db:push` to sync schema
- Run `npm run db:generate` to regenerate Prisma client
- Check `.env` file has correct DATABASE_URL

### Images Not Saving:
- Check file size (large images may exceed limits)
- Server has 50MB limit for JSON payloads
- Images are stored as base64 in database

## Development Notes

- The preview iframe on Configuration page loads the root `/` path
- All configuration data is stored in localStorage AND database
- Database provides persistence across sessions
- localStorage provides immediate preview updates

## Future Enhancements

Potential features to add:
- Export configuration as standalone HTML/CSS
- Import from external sources
- Configuration templates/presets
- Version control for configurations
- Share configurations via URL
- Multi-user support with authentication
