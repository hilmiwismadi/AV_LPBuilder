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
      prizes: false,
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
      prizes: false,
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
      prizes: false,
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
      hero: 'layout-2',        // Variant 2
      about: 'layout-2',       // Variant 2
      categories: 'layout-3',  // Variant 3
      timeline: 'layout-2',    // Variant 2
      prizes: 'layout-1',
      jury: 'layout-1',
      documentation: 'layout-1',
      instagram: 'layout-1',   // Variant 1
      sponsors: 'layout-1',
      contact: 'layout-1',     // Variant 1
      footer: 'layout-1'
    },
    sectionVisibility,

    // Hero Section - Variant 2
    heroText: {
      title: eventName,
      tagline: eventDescription || 'Tagline event bisa diisi disini untuk menarik perhatian pengunjung',
      date: 'Tanggal Event',
      location: 'Lokasi Event',
      instagram: '@instagram_event',
      instagramUrl: 'https://instagram.com/event',
      ctaPrimary: 'Daftar Sekarang',
      ctaPrimaryUrl: '',
      ctaSecondary: 'Info Lebih Lanjut',
      ctaSecondaryUrl: ''
    },

    // About Section - Variant 2 (with 2 subtitles)
    aboutText: {
      mainTitle: 'Tentang Event',
      mainDescription: 'Bagian ini bisa diisi panitia untuk menjelaskan deskripsi event, tujuan diselenggarakan, dan informasi umum lainnya yang penting untuk diketahui peserta.',
      subTitle1: 'Sub Judul 1',
      subDescription1: 'Bagian ini bisa diisi untuk menjelaskan poin-poin penting terkait event, seperti manfaat mengikuti, hal yang akan dipelajari, atau keunggulan event ini dibanding event sejenis.',
      subTitle2: 'Sub Judul 2',
      subDescription2: 'Bagian ini bisa diisi untuk menjelaskan persyaratan peserta, target audiens, atau informasi tambahan yang perlu disampaikan kepada calon peserta.',
      subTitle3: '',
      subDescription3: '',
      subTitle4: '',
      subDescription4: ''
    },

    // Event Categories Section - Variant 3 (with 3 cards)
    categoriesText: {
      sectionTitle: 'Kategori',
      sectionSubtitle: 'Bagian ini bisa diisi untuk menjelaskan kategori-kategori yang tersedia di event'
    },
    categoriesCards: [
      {
        id: 1,
        icon: 'FaPaintBrush',
        image: null,
        title: 'Kategori Jenis Lomba 1',
        description: 'Disini bisa diisi deskripsi lomba kategori 1, aturan main, dan informasi penting lainnya',
        requirements: [
          { title: 'Tim', description: '2-3 orang per tim' },
          { title: 'Peserta', description: 'Mahasiswa aktif S1/D3' },
          { title: 'Karya', description: 'Original & belum dipublikasi' }
        ],
        buttonUrl: ''
      },
      {
        id: 2,
        icon: 'FaCode',
        image: null,
        title: 'Kategori Jenis Lomba 2',
        description: 'Disini bisa diisi deskripsi lomba kategori 2, aturan main, dan informasi penting lainnya',
        requirements: [
          { title: 'Tim', description: '3-5 orang per tim' },
          { title: 'Platform', description: 'Web, Mobile, atau Desktop' },
          { title: 'Deliverable', description: 'Prototype dan dokumentasi' }
        ],
        buttonUrl: ''
      },
      {
        id: 3,
        icon: 'FaBriefcase',
        image: null,
        title: 'Kategori Jenis Lomba 3',
        description: 'Disini bisa diisi deskripsi lomba kategori 3, aturan main, dan informasi penting lainnya',
        requirements: [
          { title: 'Tim', description: '3-4 orang per tim' },
          { title: 'Proposal', description: 'Rencana bisnis lengkap' },
          { title: 'Presentasi', description: 'Pitch deck maksimal 15 slide' }
        ],
        buttonUrl: ''
      }
    ],

    // Timeline Section - Variant 2 (with 5 timeline cards)
    timelineText: {
      sectionTitle: 'Timeline Event',
      sectionSubtitle: 'Bagian ini bisa diisi untuk menjelaskan tahapan-tahapan penting dalam event'
    },
    timelineCards: [
      {
        id: 1,
        icon: 'FaFlag',
        image: null,
        title: 'Tahap 1',
        date: '1-15 Bulan Tahun',
        description: 'Bagian ini bisa diisi untuk menjelaskan kegiatan yang dilakukan di tahap 1, seperti pendaftaran, registrasi, atau pembukaan event.'
      },
      {
        id: 2,
        icon: 'FaFileAlt',
        image: null,
        title: 'Tahap 2',
        date: '16-31 Bulan Tahun',
        description: 'Bagian ini bisa diisi untuk menjelaskan kegiatan yang dilakukan di tahap 2, seperti pengumpulan berkas, seleksi administrasi, atau babak penyisihan.'
      },
      {
        id: 3,
        icon: 'FaCheckCircle',
        image: null,
        title: 'Tahap 3',
        date: 'Tanggal Bulan Tahun',
        description: 'Bagian ini bisa diisi untuk menjelaskan kegiatan yang dilakukan di tahap 3, seperti pengumuman hasil, technical meeting, atau persiapan final.'
      },
      {
        id: 4,
        icon: 'FaUsers',
        image: null,
        title: 'Tahap 4',
        date: 'Tanggal Bulan Tahun',
        description: 'Bagian ini bisa diisi untuk menjelaskan kegiatan yang dilakukan di tahap 4, seperti babak final, presentasi, penjurian, atau acara puncak.'
      },
      {
        id: 5,
        icon: 'FaTrophy',
        image: null,
        title: 'Tahap 5',
        date: 'Tanggal Bulan Tahun',
        description: 'Bagian ini bisa diisi untuk menjelaskan kegiatan yang dilakukan di tahap 5, seperti pengumuman pemenang, awarding, atau penutupan event.'
      }
    ],

    // Prizes Section
    prizesText: {
      sectionTitle: 'Hadiah & Penghargaan',
      sectionSubtitle: 'Bagian ini bisa diisi untuk menjelaskan total hadiah atau benefit yang akan didapatkan pemenang'
    },

    // Jury Section (if enabled)
    juryText: {
      sectionTitle: 'Dewan Juri',
      sectionSubtitle: 'Para ahli dan praktisi berpengalaman di bidangnya'
    },

    // Instagram Section - Variant 1
    instagramText: {
      username: '@event',
      title: 'Follow Our Journey',
      sectionTitle: 'Galeri Kegiatan'
    },

    // Contact Section - Variant 1 (with 4 FAQ cards)
    contactText: {
      mainTitle: 'Hubungi Kami',
      mainDescription: 'Bagian ini bisa diisi untuk mengajak peserta menghubungi panitia jika ada pertanyaan',
      contactTitle: 'Informasi Kontak',
      email: 'info@event.com',
      phone: '+62 812-3456-7890',
      whatsapp: '+62 812-3456-7890',
      address: 'Kota, Indonesia',
      instagramUrl: 'https://instagram.com/event',
      lineUrl: '',
      twitterUrl: ''
    },
    faqCards: [
      {
        id: 1,
        question: 'Pertanyaan 1: Siapa yang boleh mendaftar?',
        answer: 'Bagian ini bisa diisi untuk menjawab pertanyaan umum seputar persyaratan peserta, target audiens, atau eligibilitas mengikuti event.'
      },
      {
        id: 2,
        question: 'Pertanyaan 2: Apakah ada biaya pendaftaran?',
        answer: 'Bagian ini bisa diisi untuk menjawab pertanyaan tentang biaya, early bird, atau sistem pembayaran yang berlaku untuk event ini.'
      },
      {
        id: 3,
        question: 'Pertanyaan 3: Bagaimana format event berlangsung?',
        answer: 'Bagian ini bisa diisi untuk menjelaskan apakah event dilakukan online/offline, berapa lama durasinya, atau format kegiatan yang akan dilaksanakan.'
      },
      {
        id: 4,
        question: 'Pertanyaan 4: Bagaimana cara mendaftar?',
        answer: 'Bagian ini bisa diisi untuk menjelaskan step-by-step proses pendaftaran, dokumen yang diperlukan, dan deadline pengumpulan berkas.'
      }
    ],

    // Footer
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
