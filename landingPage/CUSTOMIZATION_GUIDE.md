# Quick Customization Guide

This guide will help you personalize the landing page for each event quickly and easily.

## Step-by-Step: Personalizing for a New Event

### Step 1: Choose Visual Style (5 minutes)
1. Open `index.html` in your browser
2. Click the "Customize" button on the right
3. Select a color theme that matches the event brand
4. Browse through layout options for each section
5. Export your settings to save this configuration

### Step 2: Update Event Information (15 minutes)

Open `index.html` in a text editor and find these sections to update:

#### Hero Section (Lines ~103-122)
```html
<!-- Find and replace: -->
<h1 class="hero-title">YOUR EVENT NAME HERE</h1>
<p class="hero-tagline">YOUR TAGLINE HERE</p>
<p><i class="fas fa-calendar"></i> YOUR DATES HERE</p>
<p><i class="fas fa-map-marker-alt"></i> YOUR LOCATION HERE</p>
```

#### About Section (Lines ~126-145)
Replace:
- Event poster image
- Description paragraph
- Theme text
- Vision statement

#### Categories Section (Lines ~149-215)
For each category card:
- Update icon (change `fa-paint-brush` to any Font Awesome icon)
- Update category name
- Update description
- Update requirements (team size, duration, tools)

#### Timeline Section (Lines ~219-277)
For each timeline item:
- Update dates
- Update milestone names
- Update descriptions

#### Prizes Section (Lines ~281-356)
- Update total prize amount
- Update prize breakdown
- Update benefits list

#### Jury Section (Lines ~360-419)
For each jury card:
- Replace photo URL
- Update name
- Update position/title
- Update social media links

#### Contact Section (Lines ~476-563)
- Update WhatsApp number
- Update email address
- Update FAQ questions and answers

### Step 3: Replace Images (10 minutes)

#### Prepare Your Images:
1. **Event Logo**: 150x150px (square)
2. **Event Poster**: 500x700px (portrait)
3. **Jury Photos**: 300x300px (square)
4. **Gallery Photos**: Various sizes (optimize for web)
5. **Sponsor Logos**: Various sizes (transparent background recommended)

#### Upload Images:
1. Create an `images` folder in the `landingPage` directory
2. Add your images to this folder
3. Replace placeholder URLs in `index.html`:
   - Find: `https://via.placeholder.com/150`
   - Replace with: `images/your-logo.png`

Example:
```html
<!-- Before -->
<img src="https://via.placeholder.com/150" alt="Event Logo">

<!-- After -->
<img src="images/event-logo.png" alt="Innovation Challenge Logo">
```

### Step 4: Update Links (5 minutes)

Find and replace all `#` placeholders with actual URLs:

```html
<!-- Registration button -->
<button class="btn-primary" onclick="window.location.href='YOUR_REGISTRATION_LINK'">Daftar Sekarang</button>

<!-- Social media links (Footer) -->
<a href="INSTAGRAM_URL"><i class="fab fa-instagram"></i></a>
<a href="FACEBOOK_URL"><i class="fab fa-facebook"></i></a>

<!-- Guidebook download -->
<a href="guidebook.pdf" class="btn-contact">Download PDF</a>
```

## Quick Reference: What to Change

### Must Change:
- [ ] Event name and tagline
- [ ] Event dates and location
- [ ] Contact information (WhatsApp, email)
- [ ] Category names and requirements
- [ ] Timeline dates
- [ ] Prize amounts

### Should Change:
- [ ] Event logo and poster
- [ ] Jury photos and names
- [ ] Sponsor logos
- [ ] Gallery photos
- [ ] About section description
- [ ] FAQ content

### Nice to Have:
- [ ] Color theme selection
- [ ] Layout preferences
- [ ] Social media links
- [ ] Additional benefits
- [ ] Custom background images

## Templates for Different Event Types

### Tech Competition
- **Recommended Theme**: Blue Gradient (theme-3) or Purple Gradient (theme-1)
- **Hero Layout**: Layout 2 (Split Screen)
- **Categories Layout**: Layout 1 (Grid Cards)
- **Timeline Layout**: Layout 2 (Vertical Stepper)

### Business Competition
- **Recommended Theme**: Ocean Deep (theme-6) or Purple Gradient (theme-1)
- **Hero Layout**: Layout 1 (Centered)
- **Categories Layout**: Layout 2 (List with Icons)
- **Timeline Layout**: Layout 1 (Horizontal)

### Creative Arts Event
- **Recommended Theme**: Pink Gradient (theme-2) or Warm Sunset (theme-5)
- **Hero Layout**: Layout 3 (Asymmetric)
- **Categories Layout**: Layout 3 (Carousel)
- **Documentation Layout**: Layout 2 (Masonry)

### Academic Conference
- **Recommended Theme**: Green Gradient (theme-4) or Blue Gradient (theme-3)
- **Hero Layout**: Layout 1 (Centered)
- **Jury Layout**: Layout 1 (Grid Cards)
- **Timeline Layout**: Layout 2 (Vertical Stepper)

## Brand Color Customization (Advanced)

If you want to use exact brand colors instead of preset themes:

1. Open `styles.css`
2. Find the `:root` section (top of file)
3. Modify these variables:

```css
:root {
    --primary-color: #YOUR_PRIMARY_COLOR;
    --secondary-color: #YOUR_SECONDARY_COLOR;
    --accent-color: #YOUR_ACCENT_COLOR;
    --gradient: linear-gradient(135deg, #COLOR1 0%, #COLOR2 100%);
}
```

## Creating Multiple Versions

### Method 1: Separate Files
1. Duplicate the entire `landingPage` folder
2. Rename to `event-name-landing`
3. Customize each copy independently

### Method 2: Settings Files
1. Customize one landing page
2. Export settings
3. Save settings file as `event-name-settings.json`
4. Import settings when needed

## Content Writing Tips

### Hero Tagline
- Keep it under 10 words
- Focus on the value proposition
- Examples:
  - "Empowering Innovation Through Competition"
  - "Where Ideas Become Reality"
  - "Connect, Compete, Create"

### About Section
- **First paragraph**: What is the event? (2-3 sentences)
- **Theme**: What's the focus this year? (1-2 sentences)
- **Vision**: Why does this event exist? (1-2 sentences)

### Category Descriptions
- Start with a verb: "Design...", "Create...", "Develop..."
- Keep under 15 words
- Highlight what participants will do

### Timeline Content
- Use present tense for ongoing items
- Use future tense for upcoming items
- Include specific dates, not just ranges

## Testing Checklist

Before showing to client:
- [ ] Open page in browser - does it load?
- [ ] Click all buttons - do they work?
- [ ] Test on mobile device - is it responsive?
- [ ] Check all images - do they display?
- [ ] Verify contact info - is it correct?
- [ ] Test FAQ dropdowns - do they expand?
- [ ] Try different color themes - do they apply?
- [ ] Export/import settings - does it work?

## Common Issues & Solutions

### Images Not Showing
- Check file path is correct
- Ensure images are in the right folder
- Verify file extensions match (`.jpg` vs `.jpeg`)

### Colors Look Wrong
- Clear browser cache
- Check if theme is applied to `<body>` tag
- Verify CSS file is linked correctly

### Layout Breaks on Mobile
- Test different layout options
- Some layouts work better on mobile than others
- Layout 1 is usually the safest for mobile

### Text Overflows Container
- Shorten the text
- Increase container padding in CSS
- Choose a different layout option

## Pro Tips

1. **Start with Content**: Write all your text content first, then choose layouts that fit
2. **Image Quality**: Use high-quality images, but compress them for faster loading
3. **Consistency**: Keep tone and style consistent across all sections
4. **Test Early**: Show the client a draft with placeholder content to confirm layout choices
5. **Save Everything**: Export settings and keep a backup of your customized HTML

## Getting Client Approval

### Show Options:
1. Open the landing page
2. Demo 2-3 different color themes
3. Show 2 different layout combinations
4. Let client choose their favorite

### Presentation Tips:
- Start with your recommended configuration
- Explain that everything is customizable
- Highlight the sections most relevant to their event
- Show mobile version
- Emphasize quick turnaround for changes

## Time Estimates

- Basic customization (text only): **30 minutes**
- With images: **1 hour**
- Full customization with client revision: **2-3 hours**
- Advanced styling (custom colors/fonts): **+1 hour**

---

**Ready to start?** Open `index.html` in your favorite text editor and begin with the Hero section!
