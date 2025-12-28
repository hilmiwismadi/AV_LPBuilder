# Getting Started - Event Landing Page

## ✅ Everything is Ready!

Your semi-custom event landing page with React + Vite + Tailwind CSS is fully set up and tested.

---

## 🚀 Quick Commands

### Development (with hot reload)
```bash
cd landingPage/app
npm run dev
```
Opens at: **http://localhost:5173** (or next available port)

### Production Build
```bash
cd landingPage/app
npm run build
```
Creates optimized files in `dist/` folder

### Preview Production Build
```bash
cd landingPage/app
npm run preview
```

---

## 📝 First-Time Setup for New Event

### Step 1: Customize Content (5 minutes)
Open `landingPage/app/src/data/eventData.js` and update:

```javascript
export const eventData = {
  hero: {
    logo: 'images/your-logo.png',           // Your logo
    title: 'Your Event Name 2024',          // Event name
    tagline: 'Your Custom Tagline',         // Tagline
    date: '15-20 January 2024',             // Dates
    location: 'Your Venue',                 // Location
  },
  // Continue updating all sections...
};
```

### Step 2: Add Images (5 minutes)
1. Create folder: `landingPage/app/public/images/`
2. Add your images there
3. Reference them as: `images/filename.jpg`

### Step 3: Choose Theme & Layouts (2 minutes)
1. Run `npm run dev`
2. Click "Customize" button
3. Select color theme
4. Choose layouts for each section
5. Click "Export Settings" to save

### Step 4: Build & Deploy (2 minutes)
```bash
npm run build
```
Upload `dist/` folder to your hosting

---

## 🎨 Customization Panel

### Access
- **Click** the "Customize" button on right side
- **Keyboard**: Press `Ctrl+K` (or `Cmd+K` on Mac)

### Features
- ✅ 6 Color Themes
- ✅ 3 Layouts per Section (9 sections)
- ✅ Export/Import Settings
- ✅ Reset to Defaults

---

## 📂 Key Files to Know

### Must Edit
- **`src/data/eventData.js`** - All event content (text, links, data)

### Optional Edit
- **`tailwind.config.js`** - Add custom colors
- **`src/index.css`** - Add custom styles

### Don't Touch (unless you know what you're doing)
- **`src/components/`** - React components
- **`src/contexts/`** - State management
- **`vite.config.js`** - Build configuration

---

## 🎯 Common Tasks

### Change Event Name
**File**: `src/data/eventData.js`
```javascript
hero: {
  title: 'NEW EVENT NAME',  // Change this
}
```

### Change Colors to Match Brand
**File**: `tailwind.config.js`
```javascript
extend: {
  colors: {
    'brand-primary': '#YOUR_COLOR',
    'brand-secondary': '#YOUR_COLOR',
  }
}
```

### Add New Category
**File**: `src/data/eventData.js`
```javascript
categories: [
  // ... existing categories
  {
    id: 5,
    icon: 'FaMusic',  // Icon name from react-icons
    title: 'Music Competition',
    description: 'Your description',
    requirements: ['Requirement 1', 'Requirement 2'],
  }
]
```

### Replace Placeholder Images
1. Put images in `public/images/`
2. Update paths in `src/data/eventData.js`:
```javascript
hero: {
  logo: 'images/my-logo.png',  // Instead of placeholder URL
}
```

---

## 🌐 Deployment Options

### Netlify (Recommended)
1. Build: `npm run build`
2. Drag `dist` folder to Netlify
3. Done! ✅

### Vercel
1. Connect your Git repository
2. Vercel auto-detects Vite
3. Deploy! ✅

### GitHub Pages
```bash
npm run build
# Use dist/ folder
```

### Any Static Host
Just upload the `dist/` folder contents

---

## 🐛 Troubleshooting

### Build Fails
**Solution**: Make sure Tailwind CSS v3 is installed
```bash
npm uninstall tailwindcss
npm install -D tailwindcss@3 postcss autoprefixer
```

### Dev Server Won't Start
**Solution**: Port might be in use
```bash
# Kill the process or it will auto-select next port
```

### Changes Not Showing
**Solution**: Hard refresh
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Images Not Loading
**Solution**: Check paths
- Put images in `public/images/`
- Reference as `images/filename.jpg` (no leading /)

---

## 💡 Pro Tips

### Workflow for New Client
1. **Gather Info** - Get event details, logo, photos
2. **Update `eventData.js`** - Replace all placeholder text
3. **Add Images** - Put in `public/images/`
4. **Choose Theme** - Use control panel
5. **Export Config** - Save settings
6. **Build** - Create production version
7. **Deploy** - Upload to hosting

### Reuse for Multiple Events
1. Create different branches in Git
2. Or duplicate the `app/` folder
3. Customize each separately
4. Keep same theme/layout configs

### Make it Faster
- Optimize images before adding (use TinyPNG, etc.)
- Keep total images under 5MB for fast loading
- Use WebP format for modern browsers

---

## 📚 More Help

- **Full Documentation**: See `PROJECT_SUMMARY.md`
- **Customization Guide**: See `CUSTOMIZATION_GUIDE.md`
- **Technical Details**: See `app/README.md`

---

## ✅ You're All Set!

Everything is installed, configured, and tested. Just:

1. Edit `src/data/eventData.js`
2. Run `npm run dev` to see changes
3. Use control panel to pick theme/layouts
4. Run `npm run build` when ready
5. Deploy the `dist/` folder

**Happy Building! 🚀**
