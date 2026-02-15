import axios from 'axios';

const LANDING_PAGE_API_URL = process.env.LANDING_PAGE_API_URL || 'https://webbuild.arachnova.id/api';
const LANDING_PAGE_AUTH_TOKEN = process.env.LANDING_PAGE_AUTH_TOKEN;

// Event type presets (matching ConfigurationPage)
const EVENT_TYPE_PRESETS = {
  competition: {
    name: 'Competition',
    description: 'Perfect for contests and challenges',
    sections: {
      hero: true,
      about: true,
      categories: true,
      timeline: true,
      prizes: true,
      jury: false,
      documentation: false,
      instagram: true,
      sponsors: false,
      contact: true,
    }
  },
  seminar: {
    name: 'Seminar',
    description: 'Ideal for talks and presentations',
    sections: {
      hero: true,
      about: true,
      categories: true,
      timeline: false,
      prizes: true,
      jury: true,
      documentation: false,
      instagram: true,
      sponsors: false,
      contact: true,
    }
  },
  workshop: {
    name: 'Workshop',
    description: 'Great for hands-on training sessions',
    sections: {
      hero: true,
      about: true,
      categories: true,
      timeline: false,
      prizes: true,
      jury: true,
      documentation: false,
      instagram: true,
      sponsors: false,
      contact: true,
    }
  }
};

/**
 * Create a landing page configuration via Landing Page API
 * @param {Object} configData - Configuration data for the landing page
 * @returns {Promise<Object>} Response with slug and subdomainUrl
 */
export async function createConfiguration(configData) {
  try {
    console.log("[Debug] LANDING_PAGE_AUTH_TOKEN length:", LANDING_PAGE_AUTH_TOKEN?.length);
    const response = await axios.post(
      `${LANDING_PAGE_API_URL}/configurations`,
      configData,
      {
        headers: {
          'Authorization': `Bearer ${LANDING_PAGE_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error('Landing Page API Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Build default configuration for demo landing page
 * @param {Object} demoData - Data from Build Demo form
 * @returns {Object} Configuration object for Landing Page API
 */
export function buildDemoConfiguration(demoData) {
  const {
    eventName,
    eventType,
    eventDescription,
    logoImage,
    posterImage,
    color1,
    color2
  } = demoData;

  // Get preset sections or default to competition
  const preset = EVENT_TYPE_PRESETS[eventType] || EVENT_TYPE_PRESETS.competition;
  const sectionVisibility = {
    ...preset.sections,
    footer: true // Always include footer
  };

  return {
    name: eventName,
    customColors: {
      color1: color1 || '#667eea',
      color2: color2 || '#764ba2'
    },
    images: {
      logo: logoImage,
      poster: posterImage,
      photo: posterImage, // Reuse poster
      heroBackground: null,
      // Use poster image for all 6 Instagram slots
      instagram1: posterImage,
      instagram2: posterImage,
      instagram3: posterImage,
      instagram4: posterImage,
      instagram5: posterImage,
      instagram6: posterImage
    },
    layouts: {
      hero: 'layout1',
      about: 'layout1',
      categories: 'layout1',
      timeline: 'layout1',
      prizes: 'layout1',
      jury: 'layout1',
      documentation: 'layout1',
      instagram: 'layout1',
      sponsors: 'layout1',
      contact: 'layout1',
      footer: 'layout1'
    },
    sectionVisibility,
    heroText: {
      title: eventName,
      tagline: eventDescription || preset.description,
      date: 'Coming Soon',
      location: 'TBA',
      instagram: '@event',
      ctaPrimary: 'Register Now',
      ctaSecondary: 'Learn More'
    },
    aboutText: {
      title: 'About This Event',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    categoriesText: {
      title: 'Event Categories',
      categories: [
        {
          id: '1',
          name: 'Category 1',
          description: 'Lorem ipsum dolor sit amet',
          icon: 'FaTrophy'
        },
        {
          id: '2',
          name: 'Category 2',
          description: 'Consectetur adipiscing elit',
          icon: 'FaStar'
        },
        {
          id: '3',
          name: 'Category 3',
          description: 'Sed do eiusmod tempor',
          icon: 'FaAward'
        }
      ]
    },
    timelineText: {
      title: 'Event Timeline',
      events: [
        {
          id: '1',
          date: 'Day 1',
          title: 'Opening Ceremony',
          description: 'Lorem ipsum dolor sit amet'
        },
        {
          id: '2',
          date: 'Day 2',
          title: 'Main Event',
          description: 'Consectetur adipiscing elit'
        },
        {
          id: '3',
          date: 'Day 3',
          title: 'Closing Ceremony',
          description: 'Sed do eiusmod tempor'
        }
      ]
    },
    prizesText: {
      title: 'Prizes & Awards',
      prizes: [
        {
          id: '1',
          rank: '1st Place',
          prize: 'Grand Prize',
          description: 'Lorem ipsum dolor sit amet'
        },
        {
          id: '2',
          rank: '2nd Place',
          prize: 'Runner Up',
          description: 'Consectetur adipiscing elit'
        },
        {
          id: '3',
          rank: '3rd Place',
          prize: 'Honorable Mention',
          description: 'Sed do eiusmod tempor'
        }
      ]
    },
    juryText: {
      title: 'Meet Our Jury',
      members: [
        {
          id: '1',
          name: 'John Doe',
          role: 'Chief Judge',
          bio: 'Lorem ipsum dolor sit amet',
          photo: null
        },
        {
          id: '2',
          name: 'Jane Smith',
          role: 'Expert Panelist',
          bio: 'Consectetur adipiscing elit',
          photo: null
        }
      ]
    },
    documentationText: {
      title: 'Event Gallery',
      images: []
    },
    instagramText: {
      title: 'Follow Us on Instagram',
      username: '@event'
    },
    sponsorsText: {
      title: 'Our Sponsors',
      tiers: []
    },
    contactText: {
      title: 'Get In Touch',
      description: 'Have questions? Feel free to reach out to us!',
      email: 'info@event.com',
      phone: '+62 xxx-xxxx-xxxx',
      address: 'Jakarta, Indonesia'
    },
    footerText: {
      copyrightText: `© ${new Date().getFullYear()} ${eventName}. All rights reserved.`,
      socialLinks: {
        instagram: '',
        twitter: '',
        facebook: '',
        linkedin: ''
      }
    }
  };
}

/**
 * Generate a unique slug from event name
 * @param {string} eventName - Event name to slugify
 * @param {number} attempt - Retry attempt number (for adding suffix)
 * @returns {string} URL-safe slug
 */
export function generateSlug(eventName, attempt = 0) {
  let slug = eventName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Add suffix for retry attempts
  if (attempt > 0) {
    slug += `-${attempt}`;
  }

  return slug;
}

export default {
  createConfiguration,
  buildDemoConfiguration,
  generateSlug
};
