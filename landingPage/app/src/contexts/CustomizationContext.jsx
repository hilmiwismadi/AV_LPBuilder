import { createContext, useContext, useState, useEffect } from 'react';

const CustomizationContext = createContext();

// Recommended color palettes with two-color combinations
// IDs match theme IDs for proper synchronization
export const recommendedPalettes = [
  {
    id: 'theme1',
    name: 'Purple Gradient',
    color1: '#667eea',
    color2: '#764ba2',
  },
  {
    id: 'theme2',
    name: 'Pink Gradient',
    color1: '#f093fb',
    color2: '#f5576c',
  },
  {
    id: 'theme3',
    name: 'Blue Gradient',
    color1: '#4facfe',
    color2: '#00f2fe',
  },
  {
    id: 'theme4',
    name: 'Green Gradient',
    color1: '#43e97b',
    color2: '#38f9d7',
  },
  {
    id: 'theme5',
    name: 'Warm Sunset',
    color1: '#fa709a',
    color2: '#fee140',
  },
  {
    id: 'theme6',
    name: 'Ocean Deep',
    color1: '#30cfd0',
    color2: '#330867',
  },
];

export const themes = [
  {
    id: 'theme1',
    name: 'Purple Gradient',
    gradient: 'bg-gradient-theme1',
    primary: 'theme1-primary',
    secondary: 'theme1-secondary',
  },
  {
    id: 'theme2',
    name: 'Pink Gradient',
    gradient: 'bg-gradient-theme2',
    primary: 'theme2-primary',
    secondary: 'theme2-secondary',
  },
  {
    id: 'theme3',
    name: 'Blue Gradient',
    gradient: 'bg-gradient-theme3',
    primary: 'theme3-primary',
    secondary: 'theme3-secondary',
  },
  {
    id: 'theme4',
    name: 'Green Gradient',
    gradient: 'bg-gradient-theme4',
    primary: 'theme4-primary',
    secondary: 'theme4-secondary',
  },
  {
    id: 'theme5',
    name: 'Warm Sunset',
    gradient: 'bg-gradient-theme5',
    primary: 'theme5-primary',
    secondary: 'theme5-secondary',
  },
  {
    id: 'theme6',
    name: 'Ocean Deep',
    gradient: 'bg-gradient-theme6',
    primary: 'theme6-primary',
    secondary: 'theme6-secondary',
  },
];

export const sections = [
  'hero',
  'about',
  'categories',
  'timeline',
  'prizes',
  'jury',
  'documentation',
  'instagram',
  'sponsors',
  'contact',
];

const defaultLayouts = {
  hero: 'layout-1',
  about: 'layout-2',
  categories: 'layout-3',
  timeline: 'layout-2',
  prizes: 'layout-1',
  jury: 'layout-1',
  documentation: 'layout-1',
  instagram: 'layout-1',
  sponsors: 'layout-1',
  contact: 'layout-1',
};

const defaultSectionVisibility = {
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
  footer: false,
};

export const CustomizationProvider = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState('theme1');
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // New state for custom colors
  const [customColors, setCustomColors] = useState({
    color1: '#667eea',
    color2: '#764ba2',
  });

  // New state for images
  const [images, setImages] = useState({
    logo: null,
    poster: null,
    photo: null,
    heroBackground: null,
    instagram1: null,
    instagram2: null,
    instagram3: null,
    instagram4: null,
    instagram5: null,
    instagram6: null,
  });

  // New state for section visibility
  const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);

  // New state for hero text customization
  const [heroText, setHeroText] = useState({
    title: 'Lorem Ipsum Dolor Amet',
    tagline: 'Consectetur adipiscing elit sed do eiusmod',
    date: '12-15 Lorem 2024',
    instagram: '@loremipsum',
    instagramUrl: 'https://instagram.com/loremipsum',
    ctaPrimary: 'Lorem Ipsum',
    ctaPrimaryUrl: '',
    ctaSecondary: 'Dolor Sit',
    ctaSecondaryUrl: '',
  });

  // State to track which configuration is being edited
  const [editingConfigId, setEditingConfigId] = useState(null);
  const [editingConfigName, setEditingConfigName] = useState('');

  // New state for about text customization
  const [aboutText, setAboutText] = useState({
    mainTitle: 'Lorem Ipsum',
    mainDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    subTitle1: 'Dolor Sit',
    subDescription1: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
    subTitle2: 'Consectetur',
    subDescription2: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis.',
    subTitle3: '',
    subDescription3: '',
    subTitle4: '',
    subDescription4: '',
  });

  // State for categories text and cards
  const [categoriesText, setCategoriesText] = useState({
    sectionTitle: 'Lorem Ipsum',
    sectionSubtitle: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt',
  });

  const [categoriesCards, setCategoriesCards] = useState([
    {
      id: 1,
      icon: 'FaPaintBrush',
      image: null,
      title: 'Lorem Ipsum',
      description: 'Dolor sit amet consectetur adipiscing elit sed do',
      requirements: [
        { title: 'Lorem', description: 'Ipsum dolor' },
        { title: 'Amet', description: 'Consectetur' },
        { title: 'Elit', description: 'Sed do' }
      ],
      buttonUrl: '',
    },
    {
      id: 2,
      icon: 'FaCode',
      image: null,
      title: 'Dolor Consectetur',
      description: 'Eiusmod tempor incididunt ut labore et dolore magna',
      requirements: [
        { title: 'Quis', description: 'Nostrud ex' },
        { title: 'Veniam', description: 'Ullamco laboris' },
        { title: 'Nisi', description: 'Aliquip' }
      ],
      buttonUrl: '',
    },
    {
      id: 3,
      icon: 'FaBriefcase',
      image: null,
      title: 'Adipiscing Elit',
      description: 'Sed ut perspiciatis unde omnis iste natus error',
      requirements: [
        { title: 'Voluptatem', description: 'Accusantium' },
        { title: 'Doloremque', description: 'Laudantium totam' },
        { title: 'Aperiam', description: 'Eaque ipsa' }
      ],
      buttonUrl: '',
    },
    {
      id: 4,
      icon: 'FaPenFancy',
      image: null,
      title: 'Tempor Incididunt',
      description: 'Nemo enim ipsam voluptatem quia voluptas sit',
      requirements: [
        { title: 'Neque', description: 'Porro quisquam' },
        { title: 'Magnam', description: 'Aliquam quaerat' },
        { title: 'Eius', description: 'Modi tempora' }
      ],
      buttonUrl: '',
    },
  ]);

  // State for timeline text and cards
  const [timelineText, setTimelineText] = useState({
    sectionTitle: 'Tempus Fugit',
    sectionSubtitle: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
  });

  const [timelineCards, setTimelineCards] = useState([
    {
      id: 1,
      icon: 'FaFlag',
      image: null,
      title: 'Lorem Initium',
      date: '1-15 Tempus 2024',
      description: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.',
    },
    {
      id: 2,
      icon: 'FaFileAlt',
      image: null,
      title: 'Dolor Selectio',
      date: '16-22 Tempus 2024',
      description: 'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
    },
    {
      id: 3,
      icon: 'FaUsers',
      image: null,
      title: 'Ipsum Phase',
      date: '5-10 Annus 2024',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
    },
    {
      id: 4,
      icon: 'FaStar',
      image: null,
      title: 'Semi Finalis',
      date: '15 Annus 2024',
      description: 'Excepteur sint occaecat cupidatat non proident sunt in culpa qui.',
    },
    {
      id: 5,
      icon: 'FaTrophy',
      image: null,
      title: 'Magnus Finalis',
      date: '20 Annus 2024',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
    },
  ]);

  // State for prizes text
  const [prizesText, setPrizesText] = useState({
    sectionTitle: 'Praemium Lorem',
    sectionSubtitle: 'Magna aliqua ut enim ad minim veniam quis',
    totalPrize: 'L 500.000',
    prizeDescription: 'Distributed across omnis categories',
  });

  // State for jury text
  const [juryText, setJuryText] = useState({
    sectionTitle: 'Iudices Lorem',
    sectionSubtitle: 'Consectetur adipiscing elit sed do eiusmod tempor',
  });

  // State for documentation text
  const [documentationText, setDocumentationText] = useState({
    sectionTitle: 'Documenta',
    sectionSubtitle: 'Ut enim ad minim veniam quis nostrud exercitation',
  });

  // State for instagram text
  const [instagramText, setInstagramText] = useState({
    sectionTitle: 'Social Media',
    sectionSubtitle: '',
    handle: '@loremipsum',
    tagline: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium!',
    instagramUrl: 'https://www.instagram.com/loremipsum/',
  });

  // State for sponsors text
  const [sponsorsText, setSponsorsText] = useState({
    sectionTitle: 'Patroni Lorem',
    sectionSubtitle: 'Duis aute irure dolor in reprehenderit in voluptate',
  });

  // State for contact text
  const [contactText, setContactText] = useState({
    sectionTitle: 'Contactus & FAQ',
    sectionSubtitle: 'Lorem ipsum dolor sit amet consectetur adipiscing',
    whatsapp: '+00 000-0000-0000',
    whatsappUrl: '',
    email: 'lorem@ipsum.dolor',
    emailUrl: '',
    guidebookUrl: '',
  });

  const [faqCards, setFaqCards] = useState([
    {
      id: 1,
      question: 'Quomodo lorem ipsum?',
      answer: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.',
    },
    {
      id: 2,
      question: 'Quantum pretium dolor sit?',
      answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
    },
    {
      id: 3,
      question: 'Possumne multiplex categories?',
      answer: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa.',
    },
    {
      id: 4,
      question: 'Quid aetas limitatio?',
      answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.',
    },
  ]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedColors = localStorage.getItem('customColors');

    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }

    const savedLayouts = {};
    sections.forEach((section) => {
      const saved = localStorage.getItem(`layout-${section}`);
      if (saved) {
        savedLayouts[section] = saved;
      }
    });

    if (Object.keys(savedLayouts).length > 0) {
      setLayouts((prev) => ({ ...prev, ...savedLayouts }));
    }

    // Load custom colors or sync with saved theme
    if (savedColors) {
      setCustomColors(JSON.parse(savedColors));
    } else if (savedTheme) {
      // If no custom colors saved but theme is saved, sync colors with theme
      const selectedPalette = recommendedPalettes.find((p) => p.id === savedTheme);
      if (selectedPalette) {
        const newColors = {
          color1: selectedPalette.color1,
          color2: selectedPalette.color2,
        };
        setCustomColors(newColors);
        localStorage.setItem('customColors', JSON.stringify(newColors));
      }
    }

    // Load images
    const savedLogo = localStorage.getItem('logoImage');
    const savedPoster = localStorage.getItem('posterImage');
    const savedHeroBackground = localStorage.getItem('heroBackgroundImage');
    const savedPhoto = localStorage.getItem('photoImage');
    const savedInstagram1 = localStorage.getItem('instagram1Image');
    const savedInstagram2 = localStorage.getItem('instagram2Image');
    const savedInstagram3 = localStorage.getItem('instagram3Image');
    const savedInstagram4 = localStorage.getItem('instagram4Image');
    const savedInstagram5 = localStorage.getItem('instagram5Image');
    const savedInstagram6 = localStorage.getItem('instagram6Image');
    if (savedLogo || savedPoster || savedPhoto || savedHeroBackground || savedInstagram1 || savedInstagram2 || savedInstagram3 || savedInstagram4 || savedInstagram5 || savedInstagram6) {
      setImages({
        logo: savedLogo,
        poster: savedPoster,
        photo: savedPhoto,
        heroBackground: savedHeroBackground,
        instagram1: savedInstagram1,
        instagram2: savedInstagram2,
        instagram3: savedInstagram3,
        instagram4: savedInstagram4,
        instagram5: savedInstagram5,
        instagram6: savedInstagram6,
      });
    }

    // Load section visibility
    const savedVisibility = {};
    sections.forEach((section) => {
      const saved = localStorage.getItem(`visibility-${section}`);
      if (saved !== null) {
        savedVisibility[section] = saved === 'true';
      }
    });

    if (Object.keys(savedVisibility).length > 0) {
      setSectionVisibility((prev) => ({ ...prev, ...savedVisibility }));
    }

    // Load hero text
    const savedHeroText = localStorage.getItem('heroText');
    if (savedHeroText) {
      setHeroText(JSON.parse(savedHeroText));
    }

    // Load about text
    const savedAboutText = localStorage.getItem('aboutText');
    if (savedAboutText) {
      setAboutText(JSON.parse(savedAboutText));
    }

    // Load categories text
    const savedCategoriesText = localStorage.getItem('categoriesText');
    if (savedCategoriesText) {
      setCategoriesText(JSON.parse(savedCategoriesText));
    }

    // Load timeline text
    const savedTimelineText = localStorage.getItem('timelineText');
    if (savedTimelineText) {
      setTimelineText(JSON.parse(savedTimelineText));
    }

    // Load prizes text
    const savedPrizesText = localStorage.getItem('prizesText');
    if (savedPrizesText) {
      setPrizesText(JSON.parse(savedPrizesText));
    }

    // Load jury text
    const savedJuryText = localStorage.getItem('juryText');
    if (savedJuryText) {
      setJuryText(JSON.parse(savedJuryText));
    }

    // Load documentation text
    const savedDocumentationText = localStorage.getItem('documentationText');
    if (savedDocumentationText) {
      setDocumentationText(JSON.parse(savedDocumentationText));
    }

    // Load instagram text
    const savedInstagramText = localStorage.getItem('instagramText');
    if (savedInstagramText) {
      setInstagramText(JSON.parse(savedInstagramText));
    }

    // Load sponsors text
    const savedSponsorsText = localStorage.getItem('sponsorsText');
    if (savedSponsorsText) {
      setSponsorsText(JSON.parse(savedSponsorsText));
    }

    // Load contact text
    const savedContactText = localStorage.getItem('contactText');
    if (savedContactText) {
      setContactText(JSON.parse(savedContactText));
    }

    // Load categories cards
    const savedCategoriesCards = localStorage.getItem('categoriesCards');
    if (savedCategoriesCards) {
      setCategoriesCards(JSON.parse(savedCategoriesCards));
    }

    // Load timeline cards
    const savedTimelineCards = localStorage.getItem('timelineCards');
    if (savedTimelineCards) {
      setTimelineCards(JSON.parse(savedTimelineCards));
    }

    // Load FAQ cards
    const savedFaqCards = localStorage.getItem('faqCards');
    if (savedFaqCards) {
      setFaqCards(JSON.parse(savedFaqCards));
    }
  }, []);

  // Save theme to localStorage and update custom colors
  const changeTheme = (themeId) => {
    setSelectedTheme(themeId);
    localStorage.setItem('selectedTheme', themeId);

    // Update custom colors to match the selected theme
    const selectedPalette = recommendedPalettes.find((p) => p.id === themeId);
    if (selectedPalette) {
      const newColors = {
        color1: selectedPalette.color1,
        color2: selectedPalette.color2,
      };
      setCustomColors(newColors);
      localStorage.setItem('customColors', JSON.stringify(newColors));
    }
  };

  // Save layout to localStorage
  const changeLayout = (section, layout) => {
    setLayouts((prev) => ({ ...prev, [section]: layout }));
    localStorage.setItem(`layout-${section}`, layout);
  };

  // Update custom colors
  const updateCustomColors = (colors) => {
    setCustomColors(colors);
    localStorage.setItem('customColors', JSON.stringify(colors));
  };

  // Update images
  const updateImage = (type, imageDataUrl) => {
    setImages((prev) => ({ ...prev, [type]: imageDataUrl }));

    // Try to save to localStorage, but don't fail if quota exceeded
    try {
      localStorage.setItem(`${type}Image`, imageDataUrl);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn(`localStorage quota exceeded for ${type}Image. Image will be stored in memory only.`);
        // Image is still in state, just not persisted to localStorage
        // It will still be saved to the database when configuration is saved
      } else {
        throw e;
      }
    }
  };

  // Toggle section visibility
  const toggleSectionVisibility = (section) => {
    setSectionVisibility((prev) => {
      const newVisibility = { ...prev, [section]: !prev[section] };
      localStorage.setItem(`visibility-${section}`, newVisibility[section]);
      return newVisibility;
    });
  };

  // Update hero text
  const updateHeroText = (field, value) => {
    setHeroText((prev) => {
      const newHeroText = { ...prev, [field]: value };
      localStorage.setItem('heroText', JSON.stringify(newHeroText));
      return newHeroText;
    });
  };

  // Set configuration being edited
  const setEditingConfig = (configId, configName) => {
    setEditingConfigId(configId);
    setEditingConfigName(configName);
  };

  // Clear editing config
  const clearEditingConfig = () => {
    setEditingConfigId(null);
    setEditingConfigName('');
  };

  // Reset all configuration data to defaults
  const resetToDefaults = () => {
    // Reset theme and layouts
    setSelectedTheme('theme1');
    setLayouts(defaultLayouts);

    // Reset colors
    setCustomColors({
      color1: '#667eea',
      color2: '#764ba2',
    });

    // Reset images
    setImages({
      logo: null,
      poster: null,
      photo: null,
      heroBackground: null,
      instagram1: null,
      instagram2: null,
      instagram3: null,
      instagram4: null,
      instagram5: null,
      instagram6: null,
    });

    // Reset section visibility
    setSectionVisibility(defaultSectionVisibility);

    // Reset hero text
    setHeroText({
      title: 'Lorem Ipsum Dolor Amet',
      tagline: 'Consectetur adipiscing elit sed do eiusmod',
      date: '12-15 Lorem 2024',
      instagram: '@loremipsum',
      instagramUrl: 'https://instagram.com/loremipsum',
      ctaPrimary: 'Lorem Ipsum',
      ctaPrimaryUrl: '',
      ctaSecondary: 'Dolor Sit',
      ctaSecondaryUrl: '',
    });

    // Reset about text
    setAboutText({
      mainTitle: 'Lorem Ipsum',
      mainDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      subTitle1: 'Dolor Sit',
      subDescription1: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
      subTitle2: 'Consectetur',
      subDescription2: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis.',
      subTitle3: '',
      subDescription3: '',
      subTitle4: '',
      subDescription4: '',
    });

    // Reset categories
    setCategoriesText({
      sectionTitle: 'Lorem Ipsum',
      sectionSubtitle: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt',
    });

    setCategoriesCards([
      {
        id: 1,
        icon: 'FaPaintBrush',
        image: null,
        title: 'Lorem Ipsum',
        description: 'Dolor sit amet consectetur adipiscing elit sed do',
        requirements: [
          { title: 'Lorem', description: 'Ipsum dolor' },
          { title: 'Amet', description: 'Consectetur' },
          { title: 'Elit', description: 'Sed do' }
        ],
        buttonUrl: '',
      },
      {
        id: 2,
        icon: 'FaCode',
        image: null,
        title: 'Dolor Consectetur',
        description: 'Eiusmod tempor incididunt ut labore et dolore magna',
        requirements: [
          { title: 'Quis', description: 'Nostrud ex' },
          { title: 'Veniam', description: 'Ullamco laboris' },
          { title: 'Nisi', description: 'Aliquip' }
        ],
        buttonUrl: '',
      },
      {
        id: 3,
        icon: 'FaBriefcase',
        image: null,
        title: 'Adipiscing Elit',
        description: 'Sed ut perspiciatis unde omnis iste natus error',
        requirements: [
          { title: 'Voluptatem', description: 'Accusantium' },
          { title: 'Doloremque', description: 'Laudantium totam' },
          { title: 'Aperiam', description: 'Eaque ipsa' }
        ],
        buttonUrl: '',
      },
      {
        id: 4,
        icon: 'FaPenFancy',
        image: null,
        title: 'Tempor Incididunt',
        description: 'Nemo enim ipsam voluptatem quia voluptas sit',
        requirements: [
          { title: 'Neque', description: 'Porro quisquam' },
          { title: 'Magnam', description: 'Aliquam quaerat' },
          { title: 'Eius', description: 'Modi tempora' }
        ],
        buttonUrl: '',
      },
    ]);

    // Reset timeline
    setTimelineText({
      sectionTitle: 'Tempus Fugit',
      sectionSubtitle: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    });

    setTimelineCards([
      {
        id: 1,
        icon: 'FaFlag',
        image: null,
        title: 'Lorem Initium',
        date: '1-15 Tempus 2024',
        description: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.',
      },
      {
        id: 2,
        icon: 'FaFileAlt',
        image: null,
        title: 'Dolor Selectio',
        date: '16-22 Tempus 2024',
        description: 'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
      },
      {
        id: 3,
        icon: 'FaUsers',
        image: null,
        title: 'Ipsum Phase',
        date: '5-10 Annus 2024',
        description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
      },
      {
        id: 4,
        icon: 'FaStar',
        image: null,
        title: 'Semi Finalis',
        date: '15 Annus 2024',
        description: 'Excepteur sint occaecat cupidatat non proident sunt in culpa qui.',
      },
      {
        id: 5,
        icon: 'FaTrophy',
        image: null,
        title: 'Magnus Finalis',
        date: '20 Annus 2024',
        description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
      },
    ]);

    // Reset other sections
    setPrizesText({
      sectionTitle: 'Praemium Lorem',
      sectionSubtitle: 'Magna aliqua ut enim ad minim veniam quis',
      totalPrize: 'L 500.000',
      prizeDescription: 'Distributed across omnis categories',
    });

    setJuryText({
      sectionTitle: 'Iudices Lorem',
      sectionSubtitle: 'Consectetur adipiscing elit sed do eiusmod tempor',
    });

    setDocumentationText({
      sectionTitle: 'Documenta',
      sectionSubtitle: 'Ut enim ad minim veniam quis nostrud exercitation',
    });

    setInstagramText({
      sectionTitle: 'Social Media',
      sectionSubtitle: '',
      handle: '@loremipsum',
      tagline: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium!',
      instagramUrl: 'https://www.instagram.com/loremipsum/',
    });

    setSponsorsText({
      sectionTitle: 'Patroni Lorem',
      sectionSubtitle: 'Duis aute irure dolor in reprehenderit in voluptate',
    });

    setContactText({
      sectionTitle: 'Contactus & FAQ',
      sectionSubtitle: 'Lorem ipsum dolor sit amet consectetur adipiscing',
      whatsapp: '+00 000-0000-0000',
      whatsappUrl: '',
      email: 'lorem@ipsum.dolor',
      emailUrl: '',
      guidebookUrl: '',
    });

    setFaqCards([
      {
        id: 1,
        question: 'Quomodo lorem ipsum?',
        answer: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.',
      },
      {
        id: 2,
        question: 'Quantum pretium dolor sit?',
        answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
      },
      {
        id: 3,
        question: 'Possumne multiplex categories?',
        answer: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa.',
      },
      {
        id: 4,
        question: 'Quid aetas limitatio?',
        answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.',
      },
    ]);

    console.log('All configuration data reset to defaults');
  };

  // Update about text
  const updateAboutText = (field, value) => {
    setAboutText((prev) => {
      const newAboutText = { ...prev, [field]: value };
      localStorage.setItem('aboutText', JSON.stringify(newAboutText));
      return newAboutText;
    });
  };

  // Update categories text
  const updateCategoriesText = (field, value) => {
    setCategoriesText((prev) => {
      const newCategoriesText = { ...prev, [field]: value };
      localStorage.setItem('categoriesText', JSON.stringify(newCategoriesText));
      return newCategoriesText;
    });
  };

  // Update timeline text
  const updateTimelineText = (field, value) => {
    setTimelineText((prev) => {
      const newTimelineText = { ...prev, [field]: value };
      localStorage.setItem('timelineText', JSON.stringify(newTimelineText));
      return newTimelineText;
    });
  };

  // Update prizes text
  const updatePrizesText = (field, value) => {
    setPrizesText((prev) => {
      const newPrizesText = { ...prev, [field]: value };
      localStorage.setItem('prizesText', JSON.stringify(newPrizesText));
      return newPrizesText;
    });
  };

  // Update jury text
  const updateJuryText = (field, value) => {
    setJuryText((prev) => {
      const newJuryText = { ...prev, [field]: value };
      localStorage.setItem('juryText', JSON.stringify(newJuryText));
      return newJuryText;
    });
  };

  // Update documentation text
  const updateDocumentationText = (field, value) => {
    setDocumentationText((prev) => {
      const newDocumentationText = { ...prev, [field]: value };
      localStorage.setItem('documentationText', JSON.stringify(newDocumentationText));
      return newDocumentationText;
    });
  };

  // Update instagram text
  const updateInstagramText = (field, value) => {
    setInstagramText((prev) => {
      const newInstagramText = { ...prev, [field]: value };
      localStorage.setItem('instagramText', JSON.stringify(newInstagramText));
      return newInstagramText;
    });
  };

  // Update sponsors text
  const updateSponsorsText = (field, value) => {
    setSponsorsText((prev) => {
      const newSponsorsText = { ...prev, [field]: value };
      localStorage.setItem('sponsorsText', JSON.stringify(newSponsorsText));
      return newSponsorsText;
    });
  };

  // Update contact text
  const updateContactText = (field, value) => {
    setContactText((prev) => {
      const newContactText = { ...prev, [field]: value };
      localStorage.setItem('contactText', JSON.stringify(newContactText));
      return newContactText;
    });
  };

  // Update categories cards
  const updateCategoriesCards = (cards) => {
    setCategoriesCards(cards);
    localStorage.setItem('categoriesCards', JSON.stringify(cards));
  };

  // Update timeline cards
  const updateTimelineCards = (cards) => {
    setTimelineCards(cards);
    localStorage.setItem('timelineCards', JSON.stringify(cards));
  };

  // Update FAQ cards
  const updateFaqCards = (cards) => {
    setFaqCards(cards);
    localStorage.setItem('faqCards', JSON.stringify(cards));
  };

  // Reset all customizations
  const resetCustomizations = () => {
    setSelectedTheme('theme1');
    setLayouts({
      hero: 'layout-1',
      about: 'layout-2',
      categories: 'layout-3',
      timeline: 'layout-2',
      prizes: 'layout-1',
      jury: 'layout-1',
      documentation: 'layout-1',
      instagram: 'layout-1',
      sponsors: 'layout-1',
      contact: 'layout-1',
    });
    setCustomColors({ color1: '#667eea', color2: '#764ba2' });
    setImages({ logo: null, poster: null, photo: null, heroBackground: null, instagram1: null, instagram2: null, instagram3: null, instagram4: null, instagram5: null, instagram6: null });
    setSectionVisibility({
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
  footer: false,
    });
    setHeroText({
      title: 'Innovation Challenge 2024',
      tagline: 'Empowering Innovation Through Competition',
      date: '15-20 Januari 2024',
      instagram: '@eventorganizer',
      instagramUrl: 'https://instagram.com/eventorganizer',
      ctaPrimary: 'Daftar Sekarang',
      ctaSecondary: 'Lihat Detail',
    });
    setAboutText({
      mainTitle: 'Tentang Event',
      mainDescription: 'Innovation Challenge 2024 adalah kompetisi bergengsi yang menghadirkan platform bagi para inovator muda untuk mengembangkan ide-ide kreatif mereka. Event ini dirancang untuk mendorong semangat kewirausahaan dan inovasi di berbagai bidang.',
      subTitle1: 'Tema Event',
      subDescription1: '"Teknologi untuk Masa Depan Berkelanjutan" - Menghadirkan solusi inovatif untuk tantangan global melalui teknologi dan kreativitas.',
      subTitle2: 'Visi',
      subDescription2: 'Menjadi wadah terdepan bagi generasi muda Indonesia untuk mengembangkan potensi dan menciptakan dampak positif bagi masyarakat melalui inovasi dan teknologi.',
      subTitle3: '',
      subDescription3: '',
      subTitle4: '',
      subDescription4: '',
    });
    setCategoriesText({
      sectionTitle: 'Event Categories',
      sectionSubtitle: 'Pilih kategori lomba yang sesuai dengan keahlian dan minat Anda',
    });
    setTimelineText({
      sectionTitle: 'Timeline',
      sectionSubtitle: 'Jadwal lengkap pelaksanaan Innovation Challenge 2024',
    });
    setPrizesText({
      sectionTitle: 'Hadiah & Benefit',
      sectionSubtitle: 'Total hadiah dan benefit yang bisa Anda dapatkan',
      totalPrize: 'Rp 500.000.000',
      prizeDescription: 'Tersebar di semua kategori lomba',
    });
    setJuryText({
      sectionTitle: 'Juri & Pembicara',
      sectionSubtitle: 'Para ahli dan profesional yang akan menilai karya Anda',
    });
    setDocumentationText({
      sectionTitle: 'Dokumentasi',
      sectionSubtitle: 'Lihat keseruan event tahun lalu dan para pemenangnya',
    });
    setInstagramText({
      sectionTitle: 'Instagram',
      sectionSubtitle: '',
      handle: '@eventorganizer',
      tagline: 'Want to know more information? Check our Instagram for the latest updates!',
      instagramUrl: 'https://www.instagram.com/eventorganizer/',
    });
    setSponsorsText({
      sectionTitle: 'Sponsor & Partner',
      sectionSubtitle: 'Terima kasih kepada sponsor dan partner yang mendukung event ini',
    });
    setContactText({
      sectionTitle: 'Kontak & FAQ',
      sectionSubtitle: 'Hubungi kami atau lihat pertanyaan yang sering diajukan',
      whatsapp: '+62 812-3456-7890',
      email: 'info@innovationchallenge.com',
      guidebookUrl: '#',
    });
    setCategoriesCards([
      {
        id: 1,
        icon: 'FaPaintBrush',
        title: 'UI/UX Design',
        description: 'Desain interface dan user experience untuk aplikasi atau website',
        requirements: [
          { title: 'Tim', description: '1-3 orang' },
          { title: 'Tools', description: 'Bebas' },
          { title: 'Durasi', description: '3 hari' }
        ],
      },
      {
        id: 2,
        icon: 'FaCode',
        title: 'Competitive Programming',
        description: 'Pemecahan masalah algoritmik dan pemrograman kompetitif',
        requirements: [
          { title: 'Tim', description: '1-3 orang' },
          { title: 'Bahasa', description: 'C++, Java, Python' },
          { title: 'Durasi', description: '5 jam' }
        ],
      },
      {
        id: 3,
        icon: 'FaBriefcase',
        title: 'Business Plan',
        description: 'Rencana bisnis untuk startup atau produk inovatif',
        requirements: [
          { title: 'Tim', description: '3-5 orang' },
          { title: 'Format', description: 'Presentasi & Dokumen' },
          { title: 'Durasi', description: '2 minggu' }
        ],
      },
      {
        id: 4,
        icon: 'FaPenFancy',
        title: 'Essay Competition',
        description: 'Menulis esai tentang tema inovasi dan teknologi',
        requirements: [
          { title: 'Tim', description: 'Individual' },
          { title: 'Panjang', description: '1500-2000 kata' },
          { title: 'Bahasa', description: 'Indonesia/Inggris' }
        ],
      },
    ]);
    setTimelineCards([
      {
        id: 1,
        icon: 'FaFlag',
        title: 'Pendaftaran Dibuka',
        date: '1 November - 15 Desember 2023',
        description: 'Peserta dapat mendaftar melalui website resmi dan mengumpulkan berkas pendaftaran.',
      },
      {
        id: 2,
        icon: 'FaFileAlt',
        title: 'Seleksi Administrasi',
        date: '16 - 22 Desember 2023',
        description: 'Tim panitia akan melakukan verifikasi berkas dan menyeleksi peserta yang memenuhi syarat.',
      },
      {
        id: 3,
        icon: 'FaUsers',
        title: 'Babak Penyisihan',
        date: '5 - 10 Januari 2024',
        description: 'Peserta mengikuti babak penyisihan sesuai kategori lomba masing-masing.',
      },
      {
        id: 4,
        icon: 'FaStar',
        title: 'Semifinal',
        date: '15 Januari 2024',
        description: '20 tim terbaik dari setiap kategori akan berkompetisi di babak semifinal.',
      },
      {
        id: 5,
        icon: 'FaTrophy',
        title: 'Grand Final',
        date: '20 Januari 2024',
        description: 'Babak final dan pengumuman pemenang dengan hadiah total ratusan juta rupiah.',
      },
    ]);
    setFaqCards([
      {
        id: 1,
        question: 'Bagaimana cara mendaftar?',
        answer: 'Klik tombol "Daftar Sekarang" di atas, isi formulir pendaftaran, dan upload berkas yang diperlukan. Setelah itu, Anda akan menerima email konfirmasi.',
      },
      {
        id: 2,
        question: 'Berapa biaya pendaftaran?',
        answer: 'Biaya pendaftaran adalah Rp 100.000 per tim untuk semua kategori. Biaya sudah termasuk akses ke workshop dan seminar.',
      },
      {
        id: 3,
        question: 'Apakah boleh mendaftar lebih dari satu kategori?',
        answer: 'Ya, peserta diperbolehkan mendaftar di lebih dari satu kategori dengan mendaftar dan membayar secara terpisah untuk setiap kategori.',
      },
      {
        id: 4,
        question: 'Apakah ada batasan usia peserta?',
        answer: 'Kompetisi terbuka untuk pelajar SMA/SMK dan mahasiswa S1/D3 yang masih aktif berkuliah pada tahun ajaran 2023/2024.',
      },
    ]);
    localStorage.clear();
  };

  // Export settings
  const exportSettings = () => {
    const settings = {
      theme: selectedTheme,
      layouts,
      customColors,
      images,
      sectionVisibility,
      heroText,
      aboutText,
      categoriesText,
      categoriesCards,
      timelineText,
      timelineCards,
      prizesText,
      juryText,
      documentationText,
      instagramText,
      sponsorsText,
      contactText,
      faqCards,
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'landing-page-settings.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  // Import settings
  const importSettings = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          if (settings.theme) {
            changeTheme(settings.theme);
          }
          if (settings.layouts) {
            Object.entries(settings.layouts).forEach(([section, layout]) => {
              changeLayout(section, layout);
            });
          }
          if (settings.customColors) {
            updateCustomColors(settings.customColors);
          }
          if (settings.images) {
            // Set images to state first
            setImages({
              logo: settings.images.logo || null,
              poster: settings.images.poster || null,
              photo: settings.images.photo || null,
              heroBackground: settings.images.heroBackground || null,
            });

            // Try to save to localStorage (may fail if quota exceeded)
            if (settings.images.logo) {
              try {
                localStorage.setItem('logoImage', settings.images.logo);
              } catch (e) {
                if (e.name === 'QuotaExceededError') {
                  console.warn('localStorage quota exceeded for logo. Image stored in memory only.');
                }
              }
            }
            if (settings.images.poster) {
              try {
                localStorage.setItem('posterImage', settings.images.poster);
              } catch (e) {
                if (e.name === 'QuotaExceededError') {
                  console.warn('localStorage quota exceeded for poster. Image stored in memory only.');
                }
              }
            }
            if (settings.images.photo) {
              try {
                localStorage.setItem('photoImage', settings.images.photo);
              } catch (e) {
                if (e.name === 'QuotaExceededError') {
                  console.warn('localStorage quota exceeded for photo. Image stored in memory only.');
                }
              }
            }
            if (settings.images.heroBackground) {
              try {
                localStorage.setItem('heroBackgroundImage', settings.images.heroBackground);
              } catch (e) {
                if (e.name === 'QuotaExceededError') {
                  console.warn('localStorage quota exceeded for heroBackground. Image stored in memory only.');
                }
              }
            }
          }
          if (settings.sectionVisibility) {
            setSectionVisibility(settings.sectionVisibility);
            Object.entries(settings.sectionVisibility).forEach(([section, visible]) => {
              localStorage.setItem(`visibility-${section}`, visible);
            });
          }
          if (settings.heroText) {
            setHeroText(settings.heroText);
            localStorage.setItem('heroText', JSON.stringify(settings.heroText));
          }
          if (settings.aboutText) {
            setAboutText(settings.aboutText);
            localStorage.setItem('aboutText', JSON.stringify(settings.aboutText));
          }
          if (settings.categoriesText) {
            setCategoriesText(settings.categoriesText);
            localStorage.setItem('categoriesText', JSON.stringify(settings.categoriesText));
          }
          if (settings.timelineText) {
            setTimelineText(settings.timelineText);
            localStorage.setItem('timelineText', JSON.stringify(settings.timelineText));
          }
          if (settings.prizesText) {
            setPrizesText(settings.prizesText);
            localStorage.setItem('prizesText', JSON.stringify(settings.prizesText));
          }
          if (settings.juryText) {
            setJuryText(settings.juryText);
            localStorage.setItem('juryText', JSON.stringify(settings.juryText));
          }
          if (settings.documentationText) {
            setDocumentationText(settings.documentationText);
            localStorage.setItem('documentationText', JSON.stringify(settings.documentationText));
          }
          if (settings.instagramText) {
            setInstagramText(settings.instagramText);
            localStorage.setItem('instagramText', JSON.stringify(settings.instagramText));
          }
          if (settings.sponsorsText) {
            setSponsorsText(settings.sponsorsText);
            localStorage.setItem('sponsorsText', JSON.stringify(settings.sponsorsText));
          }
          if (settings.contactText) {
            setContactText(settings.contactText);
            localStorage.setItem('contactText', JSON.stringify(settings.contactText));
          }
          if (settings.categoriesCards) {
            setCategoriesCards(settings.categoriesCards);
            localStorage.setItem('categoriesCards', JSON.stringify(settings.categoriesCards));
          }
          if (settings.timelineCards) {
            setTimelineCards(settings.timelineCards);
            localStorage.setItem('timelineCards', JSON.stringify(settings.timelineCards));
          }
          if (settings.faqCards) {
            setFaqCards(settings.faqCards);
            localStorage.setItem('faqCards', JSON.stringify(settings.faqCards));
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  // Get current theme object
  const currentTheme = themes.find((t) => t.id === selectedTheme) || themes[0];

  const value = {
    selectedTheme,
    currentTheme,
    layouts,
    isPanelOpen,
    setIsPanelOpen,
    changeTheme,
    changeLayout,
    resetCustomizations,
    exportSettings,
    importSettings,
    // New values
    customColors,
    updateCustomColors,
    images,
    updateImage,
    sectionVisibility,
    toggleSectionVisibility,
    heroText,
    updateHeroText,
    aboutText,
    updateAboutText,
    categoriesText,
    updateCategoriesText,
    categoriesCards,
    updateCategoriesCards,
    timelineText,
    updateTimelineText,
    timelineCards,
    updateTimelineCards,
    setCustomColors,
    setImages,
    setLayouts,
    setSectionVisibility,
    prizesText,
    updatePrizesText,
    juryText,
    setHeroText,
    setAboutText,
    setCategoriesText,
    setCategoriesCards,
    setTimelineText,
    setTimelineCards,
    setPrizesText,
    setJuryText,
    setDocumentationText,
    setInstagramText,
    setSponsorsText,
    setContactText,
    setFaqCards,
    updateJuryText,
    documentationText,
    updateDocumentationText,
    instagramText,
    updateInstagramText,
    sponsorsText,
    updateSponsorsText,
    contactText,
    updateContactText,
    faqCards,
    updateFaqCards,
    // Edit tracking
    editingConfigId,
    editingConfigName,
    setEditingConfig,
    clearEditingConfig,
    resetToDefaults,
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within CustomizationProvider');
  }
  return context;
};
