# Event Landing Page - Semi-Custom Template

A fully customizable landing page template for events, designed to create personalized experiences for potential clients. Each section offers 3 different layout options and 6 color themes to choose from.

## Features

- **6 Color Themes** - Choose from beautiful gradient color schemes
- **9 Customizable Sections** - Each with 3 unique layout options
- **Interactive Control Panel** - Real-time customization preview
- **Persistent Settings** - Preferences saved in browser localStorage
- **Export/Import Settings** - Share or save your customization configurations
- **Responsive Design** - Mobile-friendly and tablet-optimized
- **Smooth Animations** - Professional transitions and effects

## Sections Included

1. **Hero Section** - Event name, logo, tagline, date, location, and CTA buttons
2. **About/Overview** - Event poster, description, theme, and vision
3. **Event Categories** - Competition categories with requirements
4. **Timeline** - Registration, selection, semifinal, and final dates
5. **Prizes & Benefits** - Prize money, certificates, mentorship, and networking opportunities
6. **Jury & Speakers** - Profiles of judges and speakers with social links
7. **Documentation** - Photo gallery and previous year's winners
8. **Sponsors & Media Partners** - Sponsor logos organized by tier
9. **Contact & Help** - Contact information and FAQ section
10. **Footer/CTA** - Final call-to-action and site links

## Layout Options

### Hero Section
- **Layout 1**: Centered - Classic centered layout with all content in the middle
- **Layout 2**: Split Screen - Half content, half visual with side-by-side design
- **Layout 3**: Asymmetric - Content on left with floating design element

### About Section
- **Layout 1**: Side by Side - Poster on left, content on right
- **Layout 2**: Card Style - Poster centered, content in cards below
- **Layout 3**: Overlapping - Poster overlaps content card for depth

### Event Categories
- **Layout 1**: Grid Cards - Traditional card grid layout
- **Layout 2**: List with Icons - Horizontal list with large icons
- **Layout 3**: Carousel - Scrollable carousel for browsing categories

### Timeline
- **Layout 1**: Horizontal - Timeline flows left to right
- **Layout 2**: Vertical Stepper - Classic vertical timeline with cards
- **Layout 3**: Card Timeline - Individual cards for each milestone

### Prizes & Benefits
- **Layout 1**: Centered Cards - Total prize featured, benefits in grid
- **Layout 2**: Split Benefits - Full-width prize banner, two-column benefits
- **Layout 3**: Icon Grid - Compact icon-based benefit grid

### Jury & Speakers
- **Layout 1**: Grid Cards - Photo cards in grid layout
- **Layout 2**: Carousel - Scrollable carousel of jury profiles
- **Layout 3**: Staggered - Alternating heights with circular photos

### Documentation
- **Layout 1**: Gallery Grid - Traditional photo grid with featured items
- **Layout 2**: Masonry - Pinterest-style masonry layout
- **Layout 3**: Slideshow - Focused slideshow presentation

### Sponsors
- **Layout 1**: Simple Grid - Basic logo grid by tier
- **Layout 2**: Tiered - Visually distinct tier badges
- **Layout 3**: Carousel - Scrollable sponsor carousel

### Contact
- **Layout 1**: Two Column - Contact info left, FAQ right
- **Layout 2**: Card Style - Contact cards stacked, FAQ below
- **Layout 3**: Centered - All content centered and stacked

## Color Themes

1. **Purple Gradient** - Professional purple to violet gradient
2. **Pink Gradient** - Vibrant pink to coral gradient
3. **Blue Gradient** - Fresh light blue to cyan gradient
4. **Green Gradient** - Natural green to turquoise gradient
5. **Warm Sunset** - Pink to yellow warm gradient
6. **Ocean Deep** - Cyan to deep purple dramatic gradient

## How to Use

### 1. Open the Landing Page
Simply open `index.html` in a web browser.

### 2. Access Customization Panel
Click the **"Customize"** button on the right side of the screen, or press `Ctrl+K` (or `Cmd+K` on Mac).

### 3. Select Color Theme
Choose one of the 6 color themes from the theme selector. Your choice is saved automatically.

### 4. Customize Section Layouts
For each section, select your preferred layout from the dropdown menu. Changes apply instantly.

### 5. Save Your Configuration
Your settings are automatically saved to browser localStorage. They will persist when you reload the page.

## Keyboard Shortcuts

- **Ctrl/Cmd + K** - Toggle customization panel
- **Ctrl/Cmd + Shift + R** - Reset all customizations (with confirmation)

## Utility Functions

### Reset All
Clears all customizations and returns to default theme and layouts.

### Export Settings
Downloads a JSON file containing your current customization settings. Share this with your team or save for later use.

### Import Settings
Load a previously exported settings file to apply those customizations.

### Copy Code
Copies CSS class information to clipboard for manual implementation.

## Customization for Your Event

### Update Text Content
Edit `index.html` to change:
- Event name and tagline
- Dates and locations
- Category descriptions
- Timeline milestones
- Prize amounts
- Jury names and positions
- Contact information
- FAQ content

### Update Images
Replace placeholder images with your own:
- Hero section: Event background image
- About section: Event poster
- Jury section: Profile photos
- Documentation: Event photos and videos
- Sponsors: Company logos

Image placeholders use `https://via.placeholder.com` - replace these URLs with your actual image paths.

### Update Links
Replace `#` placeholders with actual URLs:
- Registration forms
- Social media profiles
- Guidebook PDFs
- Video content

## File Structure

```
landingPage/
├── index.html          # Main HTML structure
├── styles.css          # All styles, themes, and layouts
├── script.js           # Interactive functionality
├── brief-LP.txt        # Original requirements
└── README.md           # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technical Details

### Dependencies
- Font Awesome 6.4.0 (CDN) - for icons
- No JavaScript framework required - vanilla JS

### Browser Storage
- Uses `localStorage` to save preferences
- No server-side storage required
- Settings are device-specific

### Performance
- Lightweight and fast loading
- No heavy external dependencies
- Optimized CSS animations
- Smooth transitions

## Customization Tips for Clients

1. **Start with Theme** - Choose a color theme that matches your brand
2. **Browse Layouts** - Try each layout option to see which fits your content best
3. **Mix and Match** - Different sections can have different layouts
4. **Export Settings** - Save your configuration before making experimental changes
5. **Mobile Preview** - Check responsive design by resizing your browser

## Making it Production-Ready

### Before Launch:
1. Replace all placeholder images with real event photos
2. Update all text content with actual event information
3. Add real links to registration forms and external resources
4. Test all buttons and links
5. Verify contact information is correct
6. Add Google Analytics or tracking codes if needed
7. Optimize images for web (compress large files)
8. Test on multiple devices and browsers

### Optional Enhancements:
- Add a favicon (`<link rel="icon" href="favicon.ico">`)
- Implement actual lightbox for gallery (e.g., using Lightbox2 or Fancybox)
- Add form validation for registration
- Integrate with backend for actual registration processing
- Add Google Maps embed for venue location
- Implement social media share buttons
- Add structured data for SEO

## Support & Customization

This template is designed to be easily customizable without deep coding knowledge. For advanced customizations:

- **Colors**: Modify CSS variables in `:root` section of `styles.css`
- **Fonts**: Change `font-family` in the body selector
- **Spacing**: Adjust padding and margins in section styles
- **New Layouts**: Copy existing layout styles and modify

## License

This template is created for CRM Tools project. Customize and use as needed for your events.

## Credits

- Icons: Font Awesome
- Design: Custom design based on modern web trends
- Development: Created for personalized event landing pages

---

**Need Help?** Check the browser console (F12) for available JavaScript functions and keyboard shortcuts.
