# Dummy Images Guide

## ✅ All Dummy Images Updated!

I've replaced all placeholder images with better, more realistic dummy images using various placeholder services.

---

## 🎨 Image Services Used

### 1. **Placehold.co** - Custom Text Placeholders
Used for: Logos, Posters, Sponsors, Video placeholders
- Customizable colors matching theme
- Text overlay showing what image should be
- Professional appearance

### 2. **UI Avatars** - Avatar Generator
Used for: Jury profiles, Team winners
- Generates avatars from names/initials
- Matches color themes
- Professional looking profiles

### 3. **Picsum Photos** - Random Realistic Photos
Used for: Event documentation gallery
- Real photography
- Consistent seeded images
- Professional event-like photos

---

## 📸 Dummy Images Breakdown

### Hero Section
**Logo:**
```
https://placehold.co/150x150/667eea/white?text=EVENT+LOGO&font=raleway
```
- 150x150px square
- Purple theme color background
- White "EVENT LOGO" text
- Replace with: Your actual event logo

---

### About Section
**Event Poster:**
```
https://placehold.co/500x700/667eea/white?text=EVENT+POSTER+2024&font=raleway
```
- 500x700px portrait orientation
- Purple theme color
- "EVENT POSTER 2024" text
- Replace with: Your actual event poster

---

### Jury & Speakers (4 People)
**Profile Images (Avatar style with initials):**

1. **Dr. Ahmad Santoso** - Purple background
```
https://ui-avatars.com/api/?name=Ahmad+Santoso&size=300&background=667eea&color=fff&bold=true&format=png
```

2. **Sarah Wijaya, M.Sc** - Pink background
```
https://ui-avatars.com/api/?name=Sarah+Wijaya&size=300&background=f093fb&color=fff&bold=true&format=png
```

3. **Budi Hartono** - Blue background
```
https://ui-avatars.com/api/?name=Budi+Hartono&size=300&background=4facfe&color=fff&bold=true&format=png
```

4. **Diana Kusuma, MBA** - Green background
```
https://ui-avatars.com/api/?name=Diana+Kusuma&size=300&background=43e97b&color=fff&bold=true&format=png
```

**Replace with:** Professional headshots of actual jury members

---

### Documentation Gallery (6 Items)

**Gallery Photos (Real-looking photos):**

1. **Large Photo** (600x400px)
```
https://picsum.photos/seed/event1/600/400
```

2. **Portrait Photo 1** (300x400px)
```
https://picsum.photos/seed/event2/300/400
```

3. **Portrait Photo 2** (300x400px)
```
https://picsum.photos/seed/event3/300/400
```

4. **Landscape Photo 1** (300x200px)
```
https://picsum.photos/seed/event4/300/200
```

5. **Landscape Photo 2** (300x200px)
```
https://picsum.photos/seed/event5/300/200
```

6. **Aftermovie Placeholder** (600x300px)
```
https://placehold.co/600x300/764ba2/white?text=AFTERMOVIE+2023&font=raleway
```

**Replace with:** Actual event photos from previous years

---

### Winners Section (3 Teams)

**Team Avatars:**

1. **Team Innovators** - Purple
```
https://ui-avatars.com/api/?name=Team+Innovators&size=250&background=667eea&color=fff&bold=true&format=png
```

2. **Code Masters** - Pink
```
https://ui-avatars.com/api/?name=Code+Masters&size=250&background=f093fb&color=fff&bold=true&format=png
```

3. **Startup Heroes** - Green
```
https://ui-avatars.com/api/?name=Startup+Heroes&size=250&background=43e97b&color=fff&bold=true&format=png
```

**Replace with:** Team photos or project screenshots

---

### Sponsors

#### Platinum Sponsors (2 companies)

1. **Tech Corp Indonesia**
```
https://placehold.co/200x100/667eea/white?text=TECH+CORP&font=raleway
```

2. **Digital Startup Hub**
```
https://placehold.co/200x100/764ba2/white?text=DIGITAL+STARTUP&font=raleway
```

#### Gold Sponsors (3 companies)

3. **Innovate Solutions**
```
https://placehold.co/150x80/f093fb/white?text=INNOVATE&font=raleway
```

4. **Creative Lab Studio**
```
https://placehold.co/150x80/f5576c/white?text=CREATIVE+LAB&font=raleway
```

5. **Smart Tech Group**
```
https://placehold.co/150x80/4facfe/white?text=SMART+TECH&font=raleway
```

#### Media Partners (5 companies)

6. **Tech News Daily**
```
https://placehold.co/120x60/43e97b/white?text=TECH+NEWS&font=raleway
```

7. **Startup Indonesia**
```
https://placehold.co/120x60/38f9d7/white?text=STARTUP+ID&font=raleway
```

8. **Digital Today**
```
https://placehold.co/120x60/fa709a/white?text=DIGITAL+TODAY&font=raleway
```

9. **Innovation Hub Media**
```
https://placehold.co/120x60/fee140/333?text=INNOVATION+HUB&font=raleway
```

10. **Tech Radar Indonesia**
```
https://placehold.co/120x60/30cfd0/white?text=TECH+RADAR&font=raleway
```

**Replace with:** Actual sponsor logos (PNG with transparent background recommended)

---

## 🔄 How to Replace Images

### Method 1: Use Online Images
Simply replace the URLs in `src/data/eventData.js`:

```javascript
// Before
logo: 'https://placehold.co/150x150/667eea/white?text=EVENT+LOGO&font=raleway',

// After
logo: 'https://yourdomain.com/images/your-logo.png',
```

### Method 2: Use Local Images (Recommended)

1. **Create images folder:**
```bash
mkdir landingPage/app/public/images
```

2. **Add your images:**
```
landingPage/app/public/images/
├── logo.png
├── poster.jpg
├── jury/
│   ├── ahmad.jpg
│   ├── sarah.jpg
│   ├── budi.jpg
│   └── diana.jpg
├── gallery/
│   ├── event1.jpg
│   ├── event2.jpg
│   └── ...
└── sponsors/
    ├── techcorp.png
    ├── startup.png
    └── ...
```

3. **Update paths in `src/data/eventData.js`:**
```javascript
hero: {
  logo: 'images/logo.png',  // No leading slash!
},
jury: [
  {
    name: 'Dr. Ahmad Santoso',
    image: 'images/jury/ahmad.jpg',
  },
],
sponsors: {
  platinum: [
    {
      logo: 'images/sponsors/techcorp.png',
    },
  ],
},
```

---

## 📐 Recommended Image Sizes

### Must Have (Critical)
- **Event Logo**: 150x150px (PNG with transparent background)
- **Event Poster**: 500x700px (JPG/PNG)
- **Jury Photos**: 300x300px (square, JPG/PNG)

### Nice to Have
- **Gallery Photos**: Various sizes, at least 800px wide
- **Sponsor Logos**: Various sizes, PNG with transparent background
- **Winner Photos**: 250x250px

---

## 🎨 Image Optimization Tips

### Before Adding Images:
1. **Compress images** using TinyPNG or similar
2. **Use WebP format** for modern browsers (optional)
3. **Keep total size under 5MB** for fast loading
4. **Use consistent aspect ratios** for galleries

### Recommended Tools:
- **TinyPNG.com** - Compress images
- **Remove.bg** - Remove backgrounds
- **Squoosh.app** - Convert to WebP
- **Canva** - Create/edit event graphics

---

## 🌐 Placeholder Services Reference

### Placehold.co
**Format:**
```
https://placehold.co/[WIDTH]x[HEIGHT]/[BG-COLOR]/[TEXT-COLOR]?text=YOUR+TEXT&font=raleway
```

**Example:**
```
https://placehold.co/200x100/667eea/white?text=SPONSOR+NAME&font=raleway
```

### UI Avatars
**Format:**
```
https://ui-avatars.com/api/?name=[NAME]&size=[SIZE]&background=[COLOR]&color=[TEXT-COLOR]&bold=true&format=png
```

**Example:**
```
https://ui-avatars.com/api/?name=John+Doe&size=300&background=667eea&color=fff&bold=true&format=png
```

### Picsum Photos
**Format:**
```
https://picsum.photos/seed/[SEED]/[WIDTH]/[HEIGHT]
```

**Example:**
```
https://picsum.photos/seed/myevent/600/400
```

---

## ✅ Quick Checklist

Before going live, make sure to replace:

- [ ] Event logo in hero section
- [ ] Event poster in about section
- [ ] All 4 jury profile photos
- [ ] All 6 documentation gallery images
- [ ] All 3 winner team photos
- [ ] All 10 sponsor logos (2 platinum, 3 gold, 5 media)

---

## 💡 Pro Tip

Keep the dummy images during development/demo phase! They show clients:
- **What type of image goes where**
- **The size and dimensions needed**
- **How the layout will look**
- **A professional preview**

Replace with real images only when ready to launch!

---

**Now your landing page has proper dummy images! 🎉**

View the updated page: `npm run dev` and open http://localhost:5173
