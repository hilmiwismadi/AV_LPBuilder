// ===================================
// CONTROL PANEL TOGGLE
// ===================================

function toggleControlPanel() {
    const panel = document.querySelector('.control-panel');
    panel.classList.toggle('open');
}

// ===================================
// THEME CHANGER
// ===================================

function changeTheme(themeName) {
    // Remove all theme classes from body
    document.body.className = '';

    // Add the selected theme class
    document.body.classList.add(themeName);

    // Update active button state
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');

    // Store theme preference in localStorage
    localStorage.setItem('selectedTheme', themeName);
}

// ===================================
// LAYOUT CHANGER
// ===================================

function changeLayout(sectionName, layoutName) {
    const section = document.getElementById(sectionName);

    if (!section) return;

    // Remove all layout classes
    section.classList.remove('layout-1', 'layout-2', 'layout-3');

    // Add the selected layout class
    section.classList.add(layoutName);

    // Store layout preference in localStorage
    const layoutKey = `layout-${sectionName}`;
    localStorage.setItem(layoutKey, layoutName);

    // Add smooth scroll animation when layout changes
    section.style.opacity = '0';
    setTimeout(() => {
        section.style.transition = 'opacity 0.5s ease';
        section.style.opacity = '1';
    }, 100);
}

// ===================================
// FAQ TOGGLE
// ===================================

function toggleFaq(element) {
    const faqItem = element.closest('.faq-item');

    // Toggle the active class on the FAQ item
    faqItem.classList.toggle('active');

    // Close other FAQs (optional - remove if you want multiple FAQs open)
    const allFaqItems = document.querySelectorAll('.faq-item');
    allFaqItems.forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
}

// ===================================
// SMOOTH SCROLLING FOR NAVIGATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all links with hash
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#" or empty
            if (!href || href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ===================================
// LOAD SAVED PREFERENCES
// ===================================

window.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        changeTheme(savedTheme);
    } else {
        // Set default theme
        document.body.classList.add('theme-1');
    }

    // Load saved layouts for each section
    const sections = ['hero', 'about', 'categories', 'timeline', 'prizes', 'jury', 'documentation', 'sponsors', 'contact'];

    sections.forEach(sectionName => {
        const layoutKey = `layout-${sectionName}`;
        const savedLayout = localStorage.getItem(layoutKey);

        if (savedLayout) {
            const section = document.getElementById(sectionName);
            if (section) {
                section.classList.remove('layout-1', 'layout-2', 'layout-3');
                section.classList.add(savedLayout);
            }

            // Update the select dropdown to match
            const select = document.querySelector(`select[onchange*="${sectionName}"]`);
            if (select) {
                select.value = savedLayout;
            }
        }
    });
});

// ===================================
// GALLERY LIGHTBOX (Simple Implementation)
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // You can add a lightbox library here or implement a simple modal
            console.log('Gallery item clicked');
            // For now, just a simple alert showing it's interactive
        });
    });
});

// ===================================
// SCROLL ANIMATIONS
// ===================================

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

window.addEventListener('DOMContentLoaded', function() {
    // Add initial styles and observe sections
    document.querySelectorAll('section').forEach(section => {
        // Skip hero section from fade animation
        if (!section.classList.contains('section-hero')) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(section);
        }
    });
});

// ===================================
// CAROUSEL AUTO-SCROLL (for Layout 3 variations)
// ===================================

function initCarouselAutoScroll() {
    const carousels = document.querySelectorAll('.layout-3 .categories-grid, .layout-2 .jury-grid, .layout-3 .sponsors-grid');

    carousels.forEach(carousel => {
        let isScrolling = false;

        // Add scroll indicators
        carousel.addEventListener('scroll', function() {
            isScrolling = true;
        });

        // Optional: Auto-scroll for carousel layouts
        // Uncomment if you want automatic scrolling
        /*
        setInterval(() => {
            if (!isScrolling && carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth) {
                carousel.scrollBy({
                    left: 350,
                    behavior: 'smooth'
                });
            } else if (!isScrolling) {
                carousel.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }, 3000);
        */
    });
}

// Initialize carousel when DOM is ready
window.addEventListener('DOMContentLoaded', initCarouselAutoScroll);

// ===================================
// RESET ALL CUSTOMIZATIONS
// ===================================

function resetCustomizations() {
    // Clear all saved preferences
    localStorage.clear();

    // Reset to default theme
    changeTheme('theme-1');

    // Reset all layouts to layout-1
    const sections = ['hero', 'about', 'categories', 'timeline', 'prizes', 'jury', 'documentation', 'sponsors', 'contact'];

    sections.forEach(sectionName => {
        changeLayout(sectionName, 'layout-1');

        // Reset select dropdowns
        const select = document.querySelector(`select[onchange*="${sectionName}"]`);
        if (select) {
            select.value = 'layout-1';
        }
    });

    alert('All customizations have been reset to default!');
}

// ===================================
// EXPORT CUSTOMIZATION SETTINGS
// ===================================

function exportSettings() {
    const settings = {
        theme: localStorage.getItem('selectedTheme') || 'theme-1',
        layouts: {}
    };

    const sections = ['hero', 'about', 'categories', 'timeline', 'prizes', 'jury', 'documentation', 'sponsors', 'contact'];

    sections.forEach(sectionName => {
        const layoutKey = `layout-${sectionName}`;
        settings.layouts[sectionName] = localStorage.getItem(layoutKey) || 'layout-1';
    });

    // Convert to JSON and download
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'landing-page-settings.json';
    link.click();

    URL.revokeObjectURL(url);
}

// ===================================
// IMPORT CUSTOMIZATION SETTINGS
// ===================================

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const settings = JSON.parse(e.target.result);

                // Apply theme
                if (settings.theme) {
                    changeTheme(settings.theme);
                }

                // Apply layouts
                if (settings.layouts) {
                    Object.entries(settings.layouts).forEach(([sectionName, layoutName]) => {
                        changeLayout(sectionName, layoutName);

                        // Update select dropdown
                        const select = document.querySelector(`select[onchange*="${sectionName}"]`);
                        if (select) {
                            select.value = layoutName;
                        }
                    });
                }

                alert('Settings imported successfully!');
            } catch (error) {
                alert('Error importing settings. Please make sure the file is valid.');
                console.error('Import error:', error);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// ===================================
// PRINT PREVIEW
// ===================================

function printPreview() {
    // Hide control panel before printing
    const controlPanel = document.querySelector('.control-panel');
    const originalDisplay = controlPanel.style.display;
    controlPanel.style.display = 'none';

    window.print();

    // Restore control panel after printing
    setTimeout(() => {
        controlPanel.style.display = originalDisplay;
    }, 1000);
}

// ===================================
// COPY CUSTOMIZATION CODE
// ===================================

function copyCustomizationCode() {
    const settings = {
        theme: localStorage.getItem('selectedTheme') || 'theme-1',
        layouts: {}
    };

    const sections = ['hero', 'about', 'categories', 'timeline', 'prizes', 'jury', 'documentation', 'sponsors', 'contact'];

    sections.forEach(sectionName => {
        const layoutKey = `layout-${sectionName}`;
        settings.layouts[sectionName] = localStorage.getItem(layoutKey) || 'layout-1';
    });

    const code = `
// Landing Page Customization Settings
// Theme: ${settings.theme}
//
// To apply these settings, add the following classes:
// Body: class="${settings.theme}"
${sections.map(section => `// #${section}: class="section-${section} ${settings.layouts[section]}"`).join('\n')}
`;

    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
        alert('Customization code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy code. Please try again.');
    });
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to toggle control panel
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleControlPanel();
    }

    // Ctrl/Cmd + Shift + R to reset customizations
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (confirm('Are you sure you want to reset all customizations?')) {
            resetCustomizations();
        }
    }
});

// ===================================
// MOBILE MENU (if needed)
// ===================================

// Close control panel on mobile when clicking outside
document.addEventListener('click', function(e) {
    const panel = document.querySelector('.control-panel');
    const toggleBtn = document.querySelector('.toggle-panel-btn');

    if (window.innerWidth <= 768 && panel.classList.contains('open')) {
        if (!panel.contains(e.target) && e.target !== toggleBtn) {
            panel.classList.remove('open');
        }
    }
});

// ===================================
// ADD UTILITY BUTTONS TO CONTROL PANEL
// ===================================

window.addEventListener('DOMContentLoaded', function() {
    const panelContent = document.querySelector('.panel-content');

    // Create utility buttons section
    const utilitySection = document.createElement('div');
    utilitySection.className = 'utility-buttons';
    utilitySection.style.cssText = 'margin-top: 30px; padding-top: 30px; border-top: 2px solid #e2e8f0;';

    utilitySection.innerHTML = `
        <h4 style="margin-bottom: 15px;">Utility Tools</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="resetCustomizations()" style="padding: 10px; background: #f56565; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Reset All
            </button>
            <button onclick="exportSettings()" style="padding: 10px; background: #48bb78; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Export Settings
            </button>
            <button onclick="importSettings()" style="padding: 10px; background: #4299e1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Import Settings
            </button>
            <button onclick="copyCustomizationCode()" style="padding: 10px; background: #9f7aea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Copy Code
            </button>
        </div>
        <p style="margin-top: 15px; font-size: 0.8rem; color: #a0aec0; text-align: center;">
            Tip: Press Ctrl+K to toggle this panel
        </p>
    `;

    panelContent.appendChild(utilitySection);
});

// ===================================
// CONSOLE WELCOME MESSAGE
// ===================================

console.log('%c🎨 Event Landing Page - Customizable', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cKeyboard Shortcuts:', 'color: #4a5568; font-size: 14px; font-weight: bold;');
console.log('%c- Ctrl/Cmd + K: Toggle customization panel', 'color: #718096; font-size: 12px;');
console.log('%c- Ctrl/Cmd + Shift + R: Reset all customizations', 'color: #718096; font-size: 12px;');
console.log('%c\nAvailable Functions:', 'color: #4a5568; font-size: 14px; font-weight: bold;');
console.log('%c- changeTheme(themeName)', 'color: #718096; font-size: 12px;');
console.log('%c- changeLayout(sectionName, layoutName)', 'color: #718096; font-size: 12px;');
console.log('%c- exportSettings()', 'color: #718096; font-size: 12px;');
console.log('%c- importSettings()', 'color: #718096; font-size: 12px;');
console.log('%c- resetCustomizations()', 'color: #718096; font-size: 12px;');
