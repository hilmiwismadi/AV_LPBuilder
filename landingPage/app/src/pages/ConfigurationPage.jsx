import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axios';
import { useCustomization, sections, recommendedPalettes } from '../contexts/CustomizationContext';
import { FaSave, FaPalette, FaImage, FaEye, FaSyncAlt, FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaEdit, FaArrowUp, FaArrowDown, FaFileExport, FaFileImport } from 'react-icons/fa';
import { getIcon } from '../utils/iconMapper';

const sectionLabels = {
  hero: 'Hero Section',
  about: 'About Section',
  categories: 'Event Categories',
  timeline: 'Timeline',
  prizes: 'Prizes & Benefits',
  jury: 'Jury & Speakers',
  documentation: 'Documentation',
  instagram: 'Instagram',
  sponsors: 'Sponsors',
  contact: 'Contact',
};

const ConfigurationPage = () => {
  const {
    customColors,
    updateCustomColors,
    images,
    updateImage,
    layouts,
    changeLayout,
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
    prizesText,
    updatePrizesText,
    juryText,
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
    editingConfigId,
    editingConfigName,
    clearEditingConfig,
    resetToDefaults,
    setEditingConfig,
  } = useCustomization();

  const [selectedPalette, setSelectedPalette] = useState(null);
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [useCustomPalette, setUseCustomPalette] = useState(false);
  const [configName, setConfigName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [showHeroTextForm, setShowHeroTextForm] = useState(false);
  const [showAboutTextForm, setShowAboutTextForm] = useState(false);
  const [showCategoriesTextForm, setShowCategoriesTextForm] = useState(false);
  const [showTimelineTextForm, setShowTimelineTextForm] = useState(false);
  const [showPrizesTextForm, setShowPrizesTextForm] = useState(false);
  const [showJuryTextForm, setShowJuryTextForm] = useState(false);
  const [showDocumentationTextForm, setShowDocumentationTextForm] = useState(false);
  const [showInstagramTextForm, setShowInstagramTextForm] = useState(false);
  const [showSponsorsTextForm, setShowSponsorsTextForm] = useState(false);
  const [showContactTextForm, setShowContactTextForm] = useState(false);
  const [showCategoriesCardsForm, setShowCategoriesCardsForm] = useState(false);
  const [showTimelineCardsForm, setShowTimelineCardsForm] = useState(false);
  const [showFaqCardsForm, setShowFaqCardsForm] = useState(false);

  // State for editing cards
  const [editingCategoryCard, setEditingCategoryCard] = useState(null);
  const [editingTimelineCard, setEditingTimelineCard] = useState(null);
  const [editingFaqCard, setEditingFaqCard] = useState(null);

  const logoInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const heroBackgroundInputRef = useRef(null);
  const instagram1InputRef = useRef(null);
  const instagram2InputRef = useRef(null);
  const instagram3InputRef = useRef(null);
  const instagram4InputRef = useRef(null);
  const instagram5InputRef = useRef(null);
  const instagram6InputRef = useRef(null);
  const iframeRef = useRef(null);
  const savedScrollPosition = useRef({ x: 0, y: 0 });
  const importJsonInputRef = useRef(null);

  // Load configuration when eventId is present in URL
  useEffect(() => {
    const loadConfiguration = async () => {
      // If no eventId, clear editing state (create new mode)
      if (!eventId) {
        clearEditingConfig();
        resetToDefaults();
        setConfigName('');
        return;
      }

      // If eventId exists, load the configuration
      setIsLoadingConfig(true);
      try {
        const response = await api.get(`/configurations/by-slug/${eventId}`);
        const config = response.data;

        // Set editing state
        setEditingConfig(config.id, config.name);
        setConfigName(config.name);

        // Load all configuration data
        if (config.customColors) {
          updateCustomColors(config.customColors);
        }

        if (config.images) {
          Object.keys(config.images).forEach((key) => {
            if (config.images[key]) {
              updateImage(key, config.images[key]);
            }
          });
        }

        if (config.layouts) {
          Object.keys(config.layouts).forEach((section) => {
            changeLayout(section, config.layouts[section]);
          });
        }

        if (config.sectionVisibility) {
          // We need to reconstruct visibility by toggling
          Object.keys(config.sectionVisibility).forEach((section) => {
            const shouldBeVisible = config.sectionVisibility[section];
            const isCurrentlyVisible = sectionVisibility[section];
            if (shouldBeVisible !== isCurrentlyVisible) {
              toggleSectionVisibility(section);
            }
          });
        }

        if (config.heroText) {
          Object.keys(config.heroText).forEach((key) => {
            updateHeroText(key, config.heroText[key]);
          });
        }

        if (config.aboutText) {
          Object.keys(config.aboutText).forEach((key) => {
            updateAboutText(key, config.aboutText[key]);
          });
        }

        if (config.categoriesText) {
          Object.keys(config.categoriesText).forEach((key) => {
            updateCategoriesText(key, config.categoriesText[key]);
          });
        }

        if (config.categoriesCards) {
          updateCategoriesCards(config.categoriesCards);
        }

        if (config.timelineText) {
          Object.keys(config.timelineText).forEach((key) => {
            updateTimelineText(key, config.timelineText[key]);
          });
        }

        if (config.timelineCards) {
          updateTimelineCards(config.timelineCards);
        }

        if (config.prizesText) {
          Object.keys(config.prizesText).forEach((key) => {
            updatePrizesText(key, config.prizesText[key]);
          });
        }

        if (config.juryText) {
          Object.keys(config.juryText).forEach((key) => {
            updateJuryText(key, config.juryText[key]);
          });
        }

        if (config.documentationText) {
          Object.keys(config.documentationText).forEach((key) => {
            updateDocumentationText(key, config.documentationText[key]);
          });
        }

        if (config.instagramText) {
          Object.keys(config.instagramText).forEach((key) => {
            updateInstagramText(key, config.instagramText[key]);
          });
        }

        if (config.sponsorsText) {
          Object.keys(config.sponsorsText).forEach((key) => {
            updateSponsorsText(key, config.sponsorsText[key]);
          });
        }

        if (config.contactText) {
          Object.keys(config.contactText).forEach((key) => {
            updateContactText(key, config.contactText[key]);
          });
        }

        if (config.faqCards) {
          updateFaqCards(config.faqCards);
        }

        setSaveStatus('Configuration loaded successfully!');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error loading configuration:', error);
        setSaveStatus('Error loading configuration');
        setTimeout(() => setSaveStatus(''), 3000);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadConfiguration();
  }, [eventId]);

    // Pre-fill configuration name when editing
  useEffect(() => {
    if (editingConfigName) {
      setConfigName(editingConfigName);
    }
  }, [editingConfigName]);

  // Refresh preview when configuration changes - with scroll position preservation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          // Save current scroll position
          const iframeDoc = iframeRef.current.contentWindow.document;
          savedScrollPosition.current = {
            x: iframeDoc.documentElement.scrollLeft || iframeDoc.body.scrollLeft,
            y: iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop,
          };
        } catch (e) {
          console.log('Could not access iframe scroll position:', e);
        }
      }

      setPreviewKey((prev) => prev + 1);
    }, 500); // Debounce for 500ms

    // Show loading indicator while fetching configuration
  if (isLoadingConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading configuration...</p>
        </div>
      </div>
    );
  }

    return () => clearTimeout(timer);
  }, [customColors, images, layouts, sectionVisibility, heroText, aboutText, categoriesText, categoriesCards, timelineText, timelineCards, prizesText, juryText, documentationText, instagramText, sponsorsText, contactText, faqCards]);

  // Restore scroll position after iframe loads
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      setTimeout(() => {
        try {
          const iframeDoc = iframeRef.current.contentWindow.document;
          iframeDoc.documentElement.scrollLeft = savedScrollPosition.current.x;
          iframeDoc.documentElement.scrollTop = savedScrollPosition.current.y;
          iframeDoc.body.scrollLeft = savedScrollPosition.current.x;
          iframeDoc.body.scrollTop = savedScrollPosition.current.y;
        } catch (e) {
          console.log('Could not restore iframe scroll position:', e);
        }
      }, 100); // Small delay to ensure content is loaded
    }
  };

  // Manual refresh function
  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Compress image to fit within localStorage limits
  const compressImage = (file, type) => {
    console.log(`[DEBUG] compressImage called for ${type}, file size: ${file.size}`);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(`[DEBUG] FileReader loaded, creating image...`);
        const img = new Image();
        img.onload = () => {
          console.log(`[DEBUG] Image loaded: ${img.width}x${img.height}`);
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Handle hero background with specific dimensions (1920x1080)
          if (type === 'heroBackground') {
            console.log(`[DEBUG] Processing heroBackground: ${width}x${height} -> 1920x1080`);
            const targetWidth = 1920;
            const targetHeight = 1080;
            const targetAspect = targetWidth / targetHeight;
            const imgAspect = width / height;

            // Scale to fit within the target dimensions (contain, not cover)
            let scaledWidth, scaledHeight;
            if (imgAspect > targetAspect) {
              // Image is wider - scale to width
              scaledWidth = targetWidth;
              scaledHeight = height * (targetWidth / width);
            } else {
              // Image is taller - scale to height
              scaledHeight = targetHeight;
              scaledWidth = width * (targetHeight / height);
            }

            // Set canvas to target dimensions
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const ctx = canvas.getContext('2d');

            // Fill with black background (for letterboxing/pillarboxing)
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Center the scaled image on the canvas
            const offsetX = (targetWidth - scaledWidth) / 2;
            const offsetY = (targetHeight - scaledHeight) / 2;

            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          } else {
            // Original logic for other image types
            // Determine max dimension based on image type
            const maxDimension = type === 'logo' ? 800 : 1600;

            // Scale down if needed
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height / width) * maxDimension;
                width = maxDimension;
              } else {
                width = (width / height) * maxDimension;
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Start with high quality and reduce if needed
          let quality = 0.9;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Keep reducing quality until it fits in reasonable size (max 500KB)
          const maxSize = 500 * 1024; // 500KB in base64
          while (compressedDataUrl.length > maxSize && quality > 0.3) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          console.log(`Compressed ${type}: original=${file.size} bytes, compressed=${Math.round(compressedDataUrl.length * 0.75)} bytes, quality=${quality.toFixed(1)}, dimensions=${canvas.width}x${canvas.height}`);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  // Handle image upload
  const handleImageUpload = async (type, event) => {
    console.log(`[DEBUG] handleImageUpload called for type: ${type}`, event);
    const file = event.target.files[0];
    if (file) {
      console.log(`[DEBUG] File selected:`, { name: file.name, size: file.size, type: file.type });
      try {
        console.log(`[DEBUG] Starting compression for ${type}...`);
        // Show loading status
        setSaveStatus('Compressing image...');

        const compressedImage = await compressImage(file, type);
        console.log(`[DEBUG] Compression complete for ${type}, dataURL length: ${compressedImage.length} chars`);

        console.log(`[DEBUG] Calling updateImage for ${type}...`);
        updateImage(type, compressedImage);
        console.log(`[DEBUG] updateImage completed for ${type}`);

        // Verify it was saved to localStorage
        const saved = localStorage.getItem(`${type}Image`);
        if (saved) {
          console.log(`[DEBUG] Image saved to localStorage successfully`);
          setSaveStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
          setTimeout(() => setSaveStatus(''), 2000);
        } else {
          console.warn(`[DEBUG] ${type} not in localStorage, but still in memory`);
          setSaveStatus('');
        }
      } catch (error) {
        console.error('[DEBUG] Error processing image:', error);
        alert('Error processing image. Please try a smaller file.');
        setSaveStatus('');
      }
    } else {
      console.warn(`[DEBUG] No file selected for ${type}`);
    }
  };

  // Handle palette selection
  const handlePaletteSelect = (palette) => {
    setSelectedPalette(palette.id);
    setUseCustomPalette(false);
    updateCustomColors({
      color1: palette.color1,
      color2: palette.color2,
    });
  };

  // Handle custom color change
  const handleCustomColorChange = (colorKey, value) => {
    setUseCustomPalette(true);
    setSelectedPalette(null);
    updateCustomColors({
      ...customColors,
      [colorKey]: value,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    clearEditingConfig();
        resetToDefaults();
    setConfigName('');
    setSaveStatus('');
  };

  // Available icons for cards
  const availableIcons = [
    'None', 'FaPaintBrush', 'FaCode', 'FaBriefcase', 'FaPenFancy', 'FaFlag', 'FaFileAlt',
    'FaUsers', 'FaStar', 'FaTrophy', 'FaMedal', 'FaCertificate', 'FaHandshake',
    'FaBullhorn', 'FaNetworkWired', 'FaBook', 'FaCalendar', 'FaMapMarkerAlt',
    'FaSearchPlus', 'FaPlayCircle', 'FaCog'
  ];

  // Event type presets
  const eventPresets = {
    competition: {
      name: 'Competition',
      description: 'Perfect for contests and challenges',
      icon: 'FaTrophy',
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
      icon: 'FaUsers',
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
      icon: 'FaCog',
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

  // Apply preset function
  const applyPreset = (presetKey) => {
    const preset = eventPresets[presetKey];
    if (!preset) return;

    // Update section visibility to match preset
    Object.keys(preset.sections).forEach((section) => {
      const shouldBeVisible = preset.sections[section];
      const isCurrentlyVisible = sectionVisibility[section];

      // Only toggle if different from current state
      if (shouldBeVisible !== isCurrentlyVisible) {
        toggleSectionVisibility(section);
      }
    });
  };

  // Category Card Management Functions
  const handleAddCategoryCard = () => {
    const newCard = {
      id: Date.now(),
      icon: 'None',
      image: null,
      title: '',
      description: '',
      requirements: [{ title: '', description: '' }],
      buttonUrl: '',
    };
    setEditingCategoryCard(newCard);
  };

  const handleSaveCategoryCard = (card) => {
    if (card.id && categoriesCards.find(c => c.id === card.id)) {
      // Update existing
      updateCategoriesCards(categoriesCards.map(c => c.id === card.id ? card : c));
    } else {
      // Add new
      updateCategoriesCards([...categoriesCards, card]);
    }
    setEditingCategoryCard(null);
  };

  const handleDeleteCategoryCard = (id) => {
    if (confirm('Are you sure you want to delete this category card?')) {
      updateCategoriesCards(categoriesCards.filter(c => c.id !== id));
    }
  };

  const handleMoveCategoryCard = (index, direction) => {
    const newCards = [...categoriesCards];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newCards.length) {
      [newCards[index], newCards[newIndex]] = [newCards[newIndex], newCards[index]];
      updateCategoriesCards(newCards);
    }
  };

  // Timeline Card Management Functions
  const handleAddTimelineCard = () => {
    const newCard = {
      id: Date.now(),
      icon: 'None',
      image: null,
      title: '',
      date: '',
      description: '',
    };
    setEditingTimelineCard(newCard);
  };

  const handleSaveTimelineCard = (card) => {
    if (card.id && timelineCards.find(c => c.id === card.id)) {
      // Update existing
      updateTimelineCards(timelineCards.map(c => c.id === card.id ? card : c));
    } else {
      // Add new
      updateTimelineCards([...timelineCards, card]);
    }
    setEditingTimelineCard(null);
  };

  const handleDeleteTimelineCard = (id) => {
    if (confirm('Are you sure you want to delete this timeline card?')) {
      updateTimelineCards(timelineCards.filter(c => c.id !== id));
    }
  };

  const handleMoveTimelineCard = (index, direction) => {
    const newCards = [...timelineCards];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newCards.length) {
      [newCards[index], newCards[newIndex]] = [newCards[newIndex], newCards[index]];
      updateTimelineCards(newCards);
    }
  };

  // FAQ Card Management Functions
  const handleAddFaqCard = () => {
    const newCard = {
      id: Date.now(),
      question: '',
      answer: '',
    };
    setEditingFaqCard(newCard);
  };

  const handleSaveFaqCard = (card) => {
    if (card.id && faqCards.find(c => c.id === card.id)) {
      // Update existing
      updateFaqCards(faqCards.map(c => c.id === card.id ? card : c));
    } else {
      // Add new
      updateFaqCards([...faqCards, card]);
    }
    setEditingFaqCard(null);
  };

  const handleDeleteFaqCard = (id) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      updateFaqCards(faqCards.filter(c => c.id !== id));
    }
  };

  const handleMoveFaqCard = (index, direction) => {
    const newCards = [...faqCards];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newCards.length) {
      [newCards[index], newCards[newIndex]] = [newCards[newIndex], newCards[index]];
      updateFaqCards(newCards);
    }
  };

  // Save configuration to database
  const handleSaveConfiguration = async () => {
    if (!configName.trim()) {
      alert('Please enter a configuration name');
      return;
    }

    const configData = {
      name: configName,
      customColors,
      images,
      layouts,
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
      createdAt: editingConfigId ? undefined : new Date().toISOString(),
    };

    setSaveStatus('Saving...');

    try {
      const isEditing = editingConfigId !== null;
      const url = isEditing ? `/api/configurations/${editingConfigId}` : '/api/configurations';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(configData),
      });

      if (response.ok) {
        const savedConfig = await response.json();
        setSaveStatus(isEditing ? 'Configuration updated successfully!' : 'Configuration saved successfully!');

        // FIX 3: Don't clear editing config after save to prevent duplicates
        // Instead, set the editing config to the saved one
        if (!isEditing) {
          // For new configs, update to editing mode with the new ID
          setEditingConfig(savedConfig.id, savedConfig.name);
        } else {
          // For updates, keep the same editing state but update the name if changed
          setEditingConfig(editingConfigId, savedConfig.name);
        }

        // FIX 2: Navigate to preview page after 1.5 seconds
        setTimeout(() => {
          setSaveStatus('');
          navigate(`/saved/${savedConfig.slug}`);
        }, 1500);

        console.log('Saved configuration:', savedConfig);
      } else {
        // Parse error response
        let errorMessage = `Failed to save: ${response.status} ${response.statusText}`;

        try {
          const errorData = await response.json();

          // Handle duplicate name error (409 Conflict)
          if (response.status === 409) {
            errorMessage = errorData.message || 'Event name already exists. Please choose a different name.';
            alert(`❌ ${errorMessage}

Please change the event name and try again.`);
          } else {
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } catch (e) {
          // If JSON parsing fails, use the status text
          console.error('Error parsing error response:', e);
        }

        console.error('Server error:', errorMessage);
        setSaveStatus(errorMessage);

        // Show error for longer (8 seconds)
        setTimeout(() => setSaveStatus(''), 8000);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus(`Error: ${error.message}. Make sure the API server is running on port 3001.`);

      // FIX 2: Show error for longer (5 seconds) and don't navigate
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };
  const handleExportJSON = () => {
    const configData = {
      name: configName || 'Unnamed Configuration',
      customColors,
      images,
      layouts,
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
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(configData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `landing-page-config-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSaveStatus('Configuration exported successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Import configuration from JSON
  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Update all state with imported data
        if (importedData.name) setConfigName(importedData.name);
        if (importedData.customColors) updateCustomColors(importedData.customColors);
        if (importedData.images) {
          Object.keys(importedData.images).forEach((key) => {
            if (importedData.images[key]) {
              updateImage(key, importedData.images[key]);
            }
          });
        }
        if (importedData.layouts) {
          Object.keys(importedData.layouts).forEach((section) => {
            changeLayout(section, importedData.layouts[section]);
          });
        }
        if (importedData.sectionVisibility) {
          Object.keys(importedData.sectionVisibility).forEach((section) => {
            if (sectionVisibility[section] !== importedData.sectionVisibility[section]) {
              toggleSectionVisibility(section);
            }
          });
        }
        if (importedData.heroText) {
          Object.keys(importedData.heroText).forEach((key) => {
            updateHeroText(key, importedData.heroText[key]);
          });
        }
        if (importedData.aboutText) {
          Object.keys(importedData.aboutText).forEach((key) => {
            updateAboutText(key, importedData.aboutText[key]);
          });
        }
        if (importedData.categoriesText) {
          Object.keys(importedData.categoriesText).forEach((key) => {
            updateCategoriesText(key, importedData.categoriesText[key]);
          });
        }
        if (importedData.categoriesCards) updateCategoriesCards(importedData.categoriesCards);
        if (importedData.timelineText) {
          Object.keys(importedData.timelineText).forEach((key) => {
            updateTimelineText(key, importedData.timelineText[key]);
          });
        }
        if (importedData.timelineCards) updateTimelineCards(importedData.timelineCards);
        if (importedData.prizesText) {
          Object.keys(importedData.prizesText).forEach((key) => {
            updatePrizesText(key, importedData.prizesText[key]);
          });
        }
        if (importedData.juryText) {
          Object.keys(importedData.juryText).forEach((key) => {
            updateJuryText(key, importedData.juryText[key]);
          });
        }
        if (importedData.documentationText) {
          Object.keys(importedData.documentationText).forEach((key) => {
            updateDocumentationText(key, importedData.documentationText[key]);
          });
        }
        if (importedData.instagramText) {
          Object.keys(importedData.instagramText).forEach((key) => {
            updateInstagramText(key, importedData.instagramText[key]);
          });
        }
        if (importedData.sponsorsText) {
          Object.keys(importedData.sponsorsText).forEach((key) => {
            updateSponsorsText(key, importedData.sponsorsText[key]);
          });
        }
        if (importedData.contactText) {
          Object.keys(importedData.contactText).forEach((key) => {
            updateContactText(key, importedData.contactText[key]);
          });
        }
        if (importedData.faqCards) updateFaqCards(importedData.faqCards);

        setSaveStatus('Configuration imported successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error('Error importing JSON:', error);
        alert('Error importing JSON file. Please make sure the file is valid.');
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Landing Page Configuration</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Configuration Form */}
          <div className="space-y-6">
            {/* Configuration Name */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaSave className="text-blue-600" />
                Configuration Name
                {editingConfigId && (
                  <span className="text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    Editing
                  </span>
                )}
              </h2>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Enter configuration name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Type Presets */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaSyncAlt className="text-blue-600" />
                Event Type Presets
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Quick start templates for different event types. Applies recommended section visibility settings.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(eventPresets).map((presetKey) => {
                  const preset = eventPresets[presetKey];
                  return (
                    <button
                      key={presetKey}
                      onClick={() => applyPreset(presetKey)}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl text-gray-400 group-hover:text-blue-600 transition-colors mt-1">
                          {getIcon(preset.icon)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {preset.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(preset.sections)
                              .filter(([_, visible]) => visible)
                              .map(([section]) => (
                                <span
                                  key={section}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                >
                                  {section}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaPalette className="text-blue-600" />
                Color Configuration
              </h2>

              {/* Recommended Palettes */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recommended Palettes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {recommendedPalettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => handlePaletteSelect(palette)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedPalette === palette.id
                          ? 'border-blue-500 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="h-12 rounded-md mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${palette.color1} 0%, ${palette.color2} 100%)`,
                        }}
                      />
                      <p className="text-xs font-medium text-gray-700">{palette.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Color 1</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.color1}
                        onChange={(e) => handleCustomColorChange('color1', e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColors.color1}
                        onChange={(e) => handleCustomColorChange('color1', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Color 2</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.color2}
                        onChange={(e) => handleCustomColorChange('color2', e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColors.color2}
                        onChange={(e) => handleCustomColorChange('color2', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
                {/* Preview */}
                <div className="mt-4">
                  <p className="text-xs text-gray-600 mb-2">Preview</p>
                  <div
                    className="h-16 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${customColors.color1} 0%, ${customColors.color2} 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaImage className="text-blue-600" />
                Images
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Images will be automatically compressed. Logo: max 800px, Poster/Photo: max 1600px, Hero Background: 1920x1080. Target size: ~500KB each.
              </p>

              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Logo</label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageUpload('logo', { target: { files: [file] } });
                      }
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {images.logo ? 'Change Logo' : 'Upload Logo'}
                      </button>
                      {images.logo && (
                        <>
                          <div className="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden">
                            <img src={images.logo} alt="Logo preview" className="w-full h-full object-contain" />
                          </div>
                          <button
                            onClick={() => updateImage('logo', null)}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click to upload or drag and drop</p>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo', e)}
                    className="hidden"
                  />
                </div>

                {/* Poster Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Poster</label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageUpload('poster', { target: { files: [file] } });
                      }
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => posterInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {images.poster ? 'Change Poster' : 'Upload Poster'}
                      </button>
                      {images.poster && (
                        <>
                          <div className="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden">
                            <img src={images.poster} alt="Poster preview" className="w-full h-full object-contain" />
                          </div>
                          <button
                            onClick={() => updateImage('poster', null)}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click to upload or drag and drop</p>
                  </div>
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('poster', e)}
                    className="hidden"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Photo
                    <span className="text-xs text-gray-500 ml-2">(Visible in Hero Variant 3 only)</span>
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageUpload('photo', { target: { files: [file] } });
                      }
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {images.photo ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {images.photo && (
                        <>
                          <div className="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden">
                            <img src={images.photo} alt="Photo preview" className="w-full h-full object-contain" />
                          </div>
                          <button
                            onClick={() => updateImage('photo', null)}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click to upload or drag and drop</p>
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('photo', e)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

                {/* Hero Background Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Background Image
                    <span className="text-xs text-gray-500 ml-2">(Optional - replaces gradient background)</span>
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageUpload('heroBackground', { target: { files: [file] } });
                      }
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => heroBackgroundInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {images.heroBackground ? 'Change Background' : 'Upload Background'}
                      </button>
                      {images.heroBackground && (
                        <>
                          <div className="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden">
                            <img src={images.heroBackground} alt="Hero Background preview" className="w-full h-full object-cover" />
                          </div>
                          <button
                            onClick={() => updateImage('heroBackground', null)}
                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click to upload or drag and drop. Entire image will be fitted to 1920x1080 (no cropping)</p>
                  </div>
                  <input
                    ref={heroBackgroundInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('heroBackground', e)}
                    className="hidden"
                  />
                </div>

                {/* Instagram Section Images */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Instagram Section Images</h3>
                  <p className="text-sm text-gray-600 mb-4">Upload 6 images to display in the Instagram section</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Instagram Image 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Image 1</label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload('instagram1', { target: { files: [file] } });
                          }
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => instagram1InputRef.current?.click()}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {images.instagram1 ? 'Change' : 'Upload'}
                          </button>
                          {images.instagram1 && (
                            <>
                              <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img src={images.instagram1} alt="Instagram 1" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => updateImage('instagram1', null)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        ref={instagram1InputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('instagram1', e)}
                        className="hidden"
                      />
                    </div>

                    {/* Instagram Image 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Image 2</label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload('instagram2', { target: { files: [file] } });
                          }
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => instagram2InputRef.current?.click()}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {images.instagram2 ? 'Change' : 'Upload'}
                          </button>
                          {images.instagram2 && (
                            <>
                              <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img src={images.instagram2} alt="Instagram 2" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => updateImage('instagram2', null)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        ref={instagram2InputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('instagram2', e)}
                        className="hidden"
                      />
                    </div>

                    {/* Instagram Image 3 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Image 3</label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload('instagram3', { target: { files: [file] } });
                          }
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => instagram3InputRef.current?.click()}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {images.instagram3 ? 'Change' : 'Upload'}
                          </button>
                          {images.instagram3 && (
                            <>
                              <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img src={images.instagram3} alt="Instagram 3" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => updateImage('instagram3', null)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        ref={instagram3InputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('instagram3', e)}
                        className="hidden"
                      />
                    </div>

                    {/* Instagram Image 4 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Image 4</label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload('instagram4', { target: { files: [file] } });
                          }
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => instagram4InputRef.current?.click()}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {images.instagram4 ? 'Change' : 'Upload'}
                          </button>
                          {images.instagram4 && (
                            <>
                              <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img src={images.instagram4} alt="Instagram 4" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => updateImage('instagram4', null)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        ref={instagram4InputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('instagram4', e)}
                        className="hidden"
                      />
                    </div>

                    {/* Instagram Image 5 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Image 5</label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload('instagram5', { target: { files: [file] } });
                          }
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => instagram5InputRef.current?.click()}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {images.instagram5 ? 'Change' : 'Upload'}
                          </button>
                          {images.instagram5 && (
                            <>
                              <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img src={images.instagram5} alt="Instagram 5" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => updateImage('instagram5', null)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        ref={instagram5InputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('instagram5', e)}
                        className="hidden"
                      />
                    </div>

                    {/* Instagram Image 6 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Image 6</label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload('instagram6', { target: { files: [file] } });
                          }
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => instagram6InputRef.current?.click()}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {images.instagram6 ? 'Change' : 'Upload'}
                          </button>
                          {images.instagram6 && (
                            <>
                              <div className="w-16 h-16 border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img src={images.instagram6} alt="Instagram 6" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => updateImage('instagram6', null)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        ref={instagram6InputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('instagram6', e)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

            {/* Section Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Section Configuration</h2>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">{sectionLabels[section]}</h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionVisibility[section]}
                          onChange={() => toggleSectionVisibility(section)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {sectionVisibility[section] && (
                      <>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((variant) => (
                            <button
                              key={variant}
                              onClick={() => changeLayout(section, `layout-${variant}`)}
                              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all ${
                                layouts[section] === `layout-${variant}`
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Variant {variant}
                            </button>
                          ))}
                        </div>

                        {/* Hero Section Text Customization */}
                        {section === 'hero' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowHeroTextForm(!showHeroTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Hero Text Customization</span>
                              {showHeroTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showHeroTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                              <label className="block text-xs text-gray-600 mb-1">Title</label>
                              <input
                                type="text"
                                value={heroText.title}
                                onChange={(e) => updateHeroText('title', e.target.value)}
                                placeholder="Innovation Challenge 2024"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Tag Line</label>
                              <input
                                type="text"
                                value={heroText.tagline}
                                onChange={(e) => updateHeroText('tagline', e.target.value)}
                                placeholder="Empowering Innovation Through Competition"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Date</label>
                              <input
                                type="text"
                                value={heroText.date}
                                onChange={(e) => updateHeroText('date', e.target.value)}
                                placeholder="15-20 Januari 2024"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Instagram Handle</label>
                              <input
                                type="text"
                                value={heroText.instagram}
                                onChange={(e) => updateHeroText('instagram', e.target.value)}
                                placeholder="@eventorganizer"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Instagram URL</label>
                              <input
                                type="text"
                                value={heroText.instagramUrl}
                                onChange={(e) => updateHeroText('instagramUrl', e.target.value)}
                                placeholder="https://instagram.com/eventorganizer"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Registration Button</label>
                              <input
                                type="text"
                                value={heroText.ctaPrimary}
                                onChange={(e) => updateHeroText('ctaPrimary', e.target.value)}
                                placeholder="Daftar Sekarang"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Registration Button URL</label>
                              <input
                                type="text"
                                value={heroText.ctaPrimaryUrl}
                                onChange={(e) => updateHeroText('ctaPrimaryUrl', e.target.value)}
                                placeholder="https://forms.google.com/..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Guidebook Button</label>
                              <input
                                type="text"
                                value={heroText.ctaSecondary}
                                onChange={(e) => updateHeroText('ctaSecondary', e.target.value)}
                                placeholder="Lihat Detail"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Guidebook Button URL</label>
                              <input
                                type="text"
                                value={heroText.ctaSecondaryUrl}
                                onChange={(e) => updateHeroText('ctaSecondaryUrl', e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* About Section Text Customization */}
                        {section === 'about' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowAboutTextForm(!showAboutTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>About Text Customization</span>
                              {showAboutTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showAboutTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Main Title</label>
                                  <input
                                    type="text"
                                    value={aboutText.mainTitle}
                                    onChange={(e) => updateAboutText('mainTitle', e.target.value)}
                                    placeholder="Tentang Event"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Main Description</label>
                                  <textarea
                                    value={aboutText.mainDescription}
                                    onChange={(e) => updateAboutText('mainDescription', e.target.value)}
                                    placeholder="Innovation Challenge 2024 adalah kompetisi..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Title 1</label>
                                  <input
                                    type="text"
                                    value={aboutText.subTitle1}
                                    onChange={(e) => updateAboutText('subTitle1', e.target.value)}
                                    placeholder="Tema Event"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Description 1</label>
                                  <textarea
                                    value={aboutText.subDescription1}
                                    onChange={(e) => updateAboutText('subDescription1', e.target.value)}
                                    placeholder='"Teknologi untuk Masa Depan Berkelanjutan"...'
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Title 2</label>
                                  <input
                                    type="text"
                                    value={aboutText.subTitle2}
                                    onChange={(e) => updateAboutText('subTitle2', e.target.value)}
                                    placeholder="Visi"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Description 2</label>
                                  <textarea
                                    value={aboutText.subDescription2}
                                    onChange={(e) => updateAboutText('subDescription2', e.target.value)}
                                    placeholder="Menjadi wadah terdepan..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div className="border-t pt-3 mt-2">
                                  <p className="text-xs text-gray-500 mb-2">Optional Sub-sections (leave empty if not needed)</p>
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Title 3 (Optional)</label>
                                  <input
                                    type="text"
                                    value={aboutText.subTitle3}
                                    onChange={(e) => updateAboutText('subTitle3', e.target.value)}
                                    placeholder="Additional section title..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Description 3 (Optional)</label>
                                  <textarea
                                    value={aboutText.subDescription3}
                                    onChange={(e) => updateAboutText('subDescription3', e.target.value)}
                                    placeholder="Additional section description..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Title 4 (Optional)</label>
                                  <input
                                    type="text"
                                    value={aboutText.subTitle4}
                                    onChange={(e) => updateAboutText('subTitle4', e.target.value)}
                                    placeholder="Additional section title..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Sub Description 4 (Optional)</label>
                                  <textarea
                                    value={aboutText.subDescription4}
                                    onChange={(e) => updateAboutText('subDescription4', e.target.value)}
                                    placeholder="Additional section description..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Categories Section Text Customization */}
                        {section === 'categories' && (
                          <>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowCategoriesTextForm(!showCategoriesTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Categories Text Customization</span>
                              {showCategoriesTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showCategoriesTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={categoriesText.sectionTitle}
                                    onChange={(e) => updateCategoriesText('sectionTitle', e.target.value)}
                                    placeholder="Event Categories"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Subtitle</label>
                                  <input
                                    type="text"
                                    value={categoriesText.sectionSubtitle}
                                    onChange={(e) => updateCategoriesText('sectionSubtitle', e.target.value)}
                                    placeholder="Pilih kategori lomba yang sesuai..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Categories Cards Management */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowCategoriesCardsForm(!showCategoriesCardsForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Categories Cards Management</span>
                              {showCategoriesCardsForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showCategoriesCardsForm && (
                              <div className="mt-4 space-y-3">
                                {/* List existing cards */}
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                  {categoriesCards.map((card, index) => (
                                    <div key={card.id} className="bg-white p-3 rounded-md border border-gray-200">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <h4 className="text-sm font-semibold text-gray-800">{card.title || 'Untitled'}</h4>
                                          <p className="text-xs text-gray-600 mt-1">{card.description || 'No description'}</p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                          <button
                                            onClick={() => setEditingCategoryCard(card)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
                                          >
                                            <FaEdit size={14} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteCategoryCard(card.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                          >
                                            <FaTrash size={14} />
                                          </button>
                                          {index > 0 && (
                                            <button
                                              onClick={() => handleMoveCategoryCard(index, 'up')}
                                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                              title="Move up"
                                            >
                                              <FaArrowUp size={14} />
                                            </button>
                                          )}
                                          {index < categoriesCards.length - 1 && (
                                            <button
                                              onClick={() => handleMoveCategoryCard(index, 'down')}
                                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                              title="Move down"
                                            >
                                              <FaArrowDown size={14} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Add new button */}
                                <button
                                  onClick={handleAddCategoryCard}
                                  className="w-full py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  <FaPlus size={12} />
                                  Add New Category
                                </button>

                                {/* Edit form */}
                                {editingCategoryCard && (
                                  <div className="mt-4 p-4 bg-white border-2 border-blue-500 rounded-md space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                      {editingCategoryCard.id && categoriesCards.find(c => c.id === editingCategoryCard.id) ? 'Edit Category' : 'New Category'}
                                    </h4>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-2">Icon or Image</label>

                                      {/* Image upload option */}
                                      <div
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                                        }}
                                        onDragLeave={(e) => {
                                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                        }}
                                        onDrop={async (e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                          const file = e.dataTransfer.files[0];
                                          if (file && file.type.startsWith('image/')) {
                                            try {
                                              const compressed = await compressImage(file, 'categoryIcon');
                                              setEditingCategoryCard({ ...editingCategoryCard, image: compressed, icon: 'None' });
                                            } catch (error) {
                                              alert('Error processing image');
                                            }
                                          }
                                        }}
                                        className="mb-3 border-2 border-dashed border-gray-300 rounded-md p-3 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const input = document.createElement('input');
                                              input.type = 'file';
                                              input.accept = 'image/*';
                                              input.onchange = async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                  try {
                                                    const compressed = await compressImage(file, 'categoryIcon');
                                                    setEditingCategoryCard({ ...editingCategoryCard, image: compressed, icon: 'None' });
                                                  } catch (error) {
                                                    alert('Error processing image');
                                                  }
                                                }
                                              };
                                              input.click();
                                            }}
                                            className="px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                                          >
                                            {editingCategoryCard.image ? 'Change Image' : 'Upload Image'}
                                          </button>
                                          {editingCategoryCard.image && (
                                            <>
                                              <div className="w-12 h-12 border-2 border-gray-300 rounded-md overflow-hidden">
                                                <img src={editingCategoryCard.image} alt="Preview" className="w-full h-full object-cover" />
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => setEditingCategoryCard({ ...editingCategoryCard, image: null })}
                                                className="text-red-600 text-xs hover:underline"
                                              >
                                                Remove Image
                                              </button>
                                            </>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Click to upload or drag and drop</p>
                                      </div>

                                      {/* Icon selector (only shown if no image) */}
                                      {!editingCategoryCard.image && (
                                        <>
                                          <label className="block text-xs text-gray-600 mb-1">Or Select Icon</label>
                                          <select
                                            value={editingCategoryCard.icon || 'None'}
                                            onChange={(e) => setEditingCategoryCard({ ...editingCategoryCard, icon: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                          >
                                            {availableIcons.map(icon => (
                                              <option key={icon} value={icon}>{icon}</option>
                                            ))}
                                          </select>
                                        </>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Title</label>
                                      <input
                                        type="text"
                                        value={editingCategoryCard.title}
                                        onChange={(e) => setEditingCategoryCard({ ...editingCategoryCard, title: e.target.value })}
                                        placeholder="UI/UX Design"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                                      <textarea
                                        value={editingCategoryCard.description}
                                        onChange={(e) => setEditingCategoryCard({ ...editingCategoryCard, description: e.target.value })}
                                        placeholder="Desain interface dan user experience..."
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-2">Requirements</label>
                                      {editingCategoryCard.requirements?.map((req, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                          <input
                                            type="text"
                                            value={req.title}
                                            onChange={(e) => {
                                              const newReqs = [...editingCategoryCard.requirements];
                                              newReqs[idx].title = e.target.value;
                                              setEditingCategoryCard({ ...editingCategoryCard, requirements: newReqs });
                                            }}
                                            placeholder="Tim"
                                            className="w-1/3 px-2 py-1 text-xs border border-gray-300 rounded"
                                          />
                                          <input
                                            type="text"
                                            value={req.description}
                                            onChange={(e) => {
                                              const newReqs = [...editingCategoryCard.requirements];
                                              newReqs[idx].description = e.target.value;
                                              setEditingCategoryCard({ ...editingCategoryCard, requirements: newReqs });
                                            }}
                                            placeholder="1-3 orang"
                                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                          />
                                          <button
                                            onClick={() => {
                                              const newReqs = editingCategoryCard.requirements.filter((_, i) => i !== idx);
                                              setEditingCategoryCard({ ...editingCategoryCard, requirements: newReqs });
                                            }}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                          >
                                            <FaTrash size={12} />
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => {
                                          const newReqs = [...(editingCategoryCard.requirements || []), { title: '', description: '' }];
                                          setEditingCategoryCard({ ...editingCategoryCard, requirements: newReqs });
                                        }}
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        + Add Requirement
                                      </button>
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Button URL</label>
                                      <input
                                        type="text"
                                        value={editingCategoryCard.buttonUrl || ''}
                                        onChange={(e) => setEditingCategoryCard({ ...editingCategoryCard, buttonUrl: e.target.value })}
                                        placeholder="https://forms.google.com/..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                      <button
                                        onClick={() => handleSaveCategoryCard(editingCategoryCard)}
                                        className="flex-1 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCategoryCard(null)}
                                        className="flex-1 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          </>
                        )}

                        {/* Timeline Section Text Customization */}
                        {section === 'timeline' && (
                          <>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowTimelineTextForm(!showTimelineTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Timeline Text Customization</span>
                              {showTimelineTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showTimelineTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={timelineText.sectionTitle}
                                    onChange={(e) => updateTimelineText('sectionTitle', e.target.value)}
                                    placeholder="Timeline"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Subtitle</label>
                                  <input
                                    type="text"
                                    value={timelineText.sectionSubtitle}
                                    onChange={(e) => updateTimelineText('sectionSubtitle', e.target.value)}
                                    placeholder="Jadwal lengkap pelaksanaan..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Timeline Cards Management */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowTimelineCardsForm(!showTimelineCardsForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Timeline Cards Management</span>
                              {showTimelineCardsForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showTimelineCardsForm && (
                              <div className="mt-4 space-y-3">
                                {/* List existing cards */}
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                  {timelineCards.map((card, index) => (
                                    <div key={card.id} className="bg-white p-3 rounded-md border border-gray-200">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <h4 className="text-sm font-semibold text-gray-800">{card.title || 'Untitled'}</h4>
                                          <p className="text-xs text-gray-500 mt-1">{card.date || 'No date'}</p>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                          <button
                                            onClick={() => setEditingTimelineCard(card)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
                                          >
                                            <FaEdit size={14} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteTimelineCard(card.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                          >
                                            <FaTrash size={14} />
                                          </button>
                                          {index > 0 && (
                                            <button
                                              onClick={() => handleMoveTimelineCard(index, 'up')}
                                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                              title="Move up"
                                            >
                                              <FaArrowUp size={14} />
                                            </button>
                                          )}
                                          {index < timelineCards.length - 1 && (
                                            <button
                                              onClick={() => handleMoveTimelineCard(index, 'down')}
                                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                              title="Move down"
                                            >
                                              <FaArrowDown size={14} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Add new button */}
                                <button
                                  onClick={handleAddTimelineCard}
                                  className="w-full py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  <FaPlus size={12} />
                                  Add New Timeline Item
                                </button>

                                {/* Edit form */}
                                {editingTimelineCard && (
                                  <div className="mt-4 p-4 bg-white border-2 border-blue-500 rounded-md space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                      {editingTimelineCard.id && timelineCards.find(c => c.id === editingTimelineCard.id) ? 'Edit Timeline Item' : 'New Timeline Item'}
                                    </h4>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-2">Icon or Image</label>

                                      {/* Image upload option */}
                                      <div
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                                        }}
                                        onDragLeave={(e) => {
                                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                        }}
                                        onDrop={async (e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                          const file = e.dataTransfer.files[0];
                                          if (file && file.type.startsWith('image/')) {
                                            try {
                                              const compressed = await compressImage(file, 'timelineIcon');
                                              setEditingTimelineCard({ ...editingTimelineCard, image: compressed, icon: 'None' });
                                            } catch (error) {
                                              alert('Error processing image');
                                            }
                                          }
                                        }}
                                        className="mb-3 border-2 border-dashed border-gray-300 rounded-md p-3 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const input = document.createElement('input');
                                              input.type = 'file';
                                              input.accept = 'image/*';
                                              input.onchange = async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                  try {
                                                    const compressed = await compressImage(file, 'timelineIcon');
                                                    setEditingTimelineCard({ ...editingTimelineCard, image: compressed, icon: 'None' });
                                                  } catch (error) {
                                                    alert('Error processing image');
                                                  }
                                                }
                                              };
                                              input.click();
                                            }}
                                            className="px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                                          >
                                            {editingTimelineCard.image ? 'Change Image' : 'Upload Image'}
                                          </button>
                                          {editingTimelineCard.image && (
                                            <>
                                              <div className="w-12 h-12 border-2 border-gray-300 rounded-md overflow-hidden">
                                                <img src={editingTimelineCard.image} alt="Preview" className="w-full h-full object-cover" />
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => setEditingTimelineCard({ ...editingTimelineCard, image: null })}
                                                className="text-red-600 text-xs hover:underline"
                                              >
                                                Remove Image
                                              </button>
                                            </>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Click to upload or drag and drop</p>
                                      </div>

                                      {/* Icon selector (only shown if no image) */}
                                      {!editingTimelineCard.image && (
                                        <>
                                          <label className="block text-xs text-gray-600 mb-1">Or Select Icon</label>
                                          <select
                                            value={editingTimelineCard.icon || 'None'}
                                            onChange={(e) => setEditingTimelineCard({ ...editingTimelineCard, icon: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                          >
                                            {availableIcons.map(icon => (
                                              <option key={icon} value={icon}>{icon}</option>
                                            ))}
                                          </select>
                                        </>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Title</label>
                                      <input
                                        type="text"
                                        value={editingTimelineCard.title}
                                        onChange={(e) => setEditingTimelineCard({ ...editingTimelineCard, title: e.target.value })}
                                        placeholder="Pendaftaran Dibuka"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Date</label>
                                      <input
                                        type="text"
                                        value={editingTimelineCard.date}
                                        onChange={(e) => setEditingTimelineCard({ ...editingTimelineCard, date: e.target.value })}
                                        placeholder="1 November - 15 Desember 2023"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                                      <textarea
                                        value={editingTimelineCard.description}
                                        onChange={(e) => setEditingTimelineCard({ ...editingTimelineCard, description: e.target.value })}
                                        placeholder="Peserta dapat mendaftar melalui website..."
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                      <button
                                        onClick={() => handleSaveTimelineCard(editingTimelineCard)}
                                        className="flex-1 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingTimelineCard(null)}
                                        className="flex-1 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          </>
                        )}

                        {/* Prizes Section Text Customization */}
                        {section === 'prizes' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowPrizesTextForm(!showPrizesTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Prizes Text Customization</span>
                              {showPrizesTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showPrizesTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={prizesText.sectionTitle}
                                    onChange={(e) => updatePrizesText('sectionTitle', e.target.value)}
                                    placeholder="Hadiah & Benefit"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Subtitle</label>
                                  <input
                                    type="text"
                                    value={prizesText.sectionSubtitle}
                                    onChange={(e) => updatePrizesText('sectionSubtitle', e.target.value)}
                                    placeholder="Total hadiah dan benefit..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Total Prize</label>
                                  <input
                                    type="text"
                                    value={prizesText.totalPrize}
                                    onChange={(e) => updatePrizesText('totalPrize', e.target.value)}
                                    placeholder="Rp 500.000.000"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Prize Description</label>
                                  <input
                                    type="text"
                                    value={prizesText.prizeDescription}
                                    onChange={(e) => updatePrizesText('prizeDescription', e.target.value)}
                                    placeholder="Tersebar di semua kategori lomba"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Jury Section Text Customization */}
                        {section === 'jury' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowJuryTextForm(!showJuryTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Jury Text Customization</span>
                              {showJuryTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showJuryTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={juryText.sectionTitle}
                                    onChange={(e) => updateJuryText('sectionTitle', e.target.value)}
                                    placeholder="Juri & Pembicara"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Subtitle</label>
                                  <input
                                    type="text"
                                    value={juryText.sectionSubtitle}
                                    onChange={(e) => updateJuryText('sectionSubtitle', e.target.value)}
                                    placeholder="Para ahli dan profesional..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Documentation Section Text Customization */}
                        {section === 'documentation' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowDocumentationTextForm(!showDocumentationTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Documentation Text Customization</span>
                              {showDocumentationTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showDocumentationTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={documentationText.sectionTitle}
                                    onChange={(e) => updateDocumentationText('sectionTitle', e.target.value)}
                                    placeholder="Dokumentasi"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Subtitle</label>
                                  <input
                                    type="text"
                                    value={documentationText.sectionSubtitle}
                                    onChange={(e) => updateDocumentationText('sectionSubtitle', e.target.value)}
                                    placeholder="Lihat keseruan event tahun lalu..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Instagram Section Text Customization */}
                        {section === 'instagram' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowInstagramTextForm(!showInstagramTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Instagram Text Customization</span>
                              {showInstagramTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showInstagramTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={instagramText.sectionTitle}
                                    onChange={(e) => updateInstagramText('sectionTitle', e.target.value)}
                                    placeholder="Instagram"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Subtitle (Optional)</label>
                                  <input
                                    type="text"
                                    value={instagramText.sectionSubtitle}
                                    onChange={(e) => updateInstagramText('sectionSubtitle', e.target.value)}
                                    placeholder="Leave empty if not needed"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Instagram Handle</label>
                                  <input
                                    type="text"
                                    value={instagramText.handle}
                                    onChange={(e) => updateInstagramText('handle', e.target.value)}
                                    placeholder="@eventorganizer"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Tagline</label>
                                  <input
                                    type="text"
                                    value={instagramText.tagline}
                                    onChange={(e) => updateInstagramText('tagline', e.target.value)}
                                    placeholder="Want to know more information?..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Instagram URL</label>
                                  <input
                                    type="text"
                                    value={instagramText.instagramUrl}
                                    onChange={(e) => updateInstagramText('instagramUrl', e.target.value)}
                                    placeholder="https://www.instagram.com/eventorganizer/"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sponsors Section Text Customization */}
                        {section === 'sponsors' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => setShowSponsorsTextForm(!showSponsorsTextForm)}
                              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>Sponsors Text Customization</span>
                              {showSponsorsTextForm ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showSponsorsTextForm && (
                              <div className="mt-4 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={sponsorsText.sectionTitle}
                                    onChange={(e) => updateSponsorsText('sectionTitle', e.target.value)}
                                    placeholder="Sponsor & Partner"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Section Subtitle</label>
                                  <input
                                    type="text"
                                    value={sponsorsText.sectionSubtitle}
                                    onChange={(e) => updateSponsorsText('sectionSubtitle', e.target.value)}
                                    placeholder="Terima kasih kepada sponsor..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Contact Section Text Customization */}
                        {section === 'contact' && (
                          <>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <button
                                onClick={() => setShowContactTextForm(!showContactTextForm)}
                                className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                              >
                                <span>Contact Text Customization</span>
                                {showContactTextForm ? <FaChevronUp /> : <FaChevronDown />}
                              </button>

                              {showContactTextForm && (
                                <div className="mt-4 space-y-3">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Section Title</label>
                                    <input
                                      type="text"
                                      value={contactText.sectionTitle}
                                      onChange={(e) => updateContactText('sectionTitle', e.target.value)}
                                      placeholder="Kontak & FAQ"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Section Subtitle</label>
                                    <input
                                      type="text"
                                      value={contactText.sectionSubtitle}
                                      onChange={(e) => updateContactText('sectionSubtitle', e.target.value)}
                                      placeholder="Hubungi kami atau lihat pertanyaan..."
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">WhatsApp Number</label>
                                    <input
                                      type="text"
                                      value={contactText.whatsapp}
                                      onChange={(e) => updateContactText('whatsapp', e.target.value)}
                                      placeholder="+62 812-3456-7890"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">WhatsApp URL</label>
                                    <input
                                      type="text"
                                      value={contactText.whatsappUrl}
                                      onChange={(e) => updateContactText('whatsappUrl', e.target.value)}
                                      placeholder="https://wa.me/6281234567890"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                                    <input
                                      type="text"
                                      value={contactText.email}
                                      onChange={(e) => updateContactText('email', e.target.value)}
                                      placeholder="info@innovationchallenge.com"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Email URL</label>
                                    <input
                                      type="text"
                                      value={contactText.emailUrl}
                                      onChange={(e) => updateContactText('emailUrl', e.target.value)}
                                      placeholder="mailto:info@innovationchallenge.com"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Guidebook URL</label>
                                    <input
                                      type="text"
                                      value={contactText.guidebookUrl}
                                      onChange={(e) => updateContactText('guidebookUrl', e.target.value)}
                                      placeholder="https://drive.google.com/..."
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* FAQ Cards Management */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <button
                                onClick={() => setShowFaqCardsForm(!showFaqCardsForm)}
                                className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                              >
                                <span>FAQ Cards Management</span>
                                {showFaqCardsForm ? <FaChevronUp /> : <FaChevronDown />}
                              </button>

                              {showFaqCardsForm && (
                                <div className="mt-4 space-y-3">
                                  {/* List existing cards */}
                                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {faqCards.map((card, index) => (
                                      <div key={card.id} className="bg-white p-3 rounded-md border border-gray-200">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-800">{card.question || 'No question'}</h4>
                                            <p className="text-xs text-gray-600 mt-1">{card.answer ? (card.answer.substring(0, 50) + '...') : 'No answer'}</p>
                                          </div>
                                          <div className="flex gap-1 ml-2">
                                            <button
                                              onClick={() => setEditingFaqCard(card)}
                                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                              title="Edit"
                                            >
                                              <FaEdit size={14} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteFaqCard(card.id)}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                                              title="Delete"
                                            >
                                              <FaTrash size={14} />
                                            </button>
                                            {index > 0 && (
                                              <button
                                                onClick={() => handleMoveFaqCard(index, 'up')}
                                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                title="Move up"
                                              >
                                                <FaArrowUp size={14} />
                                              </button>
                                            )}
                                            {index < faqCards.length - 1 && (
                                              <button
                                                onClick={() => handleMoveFaqCard(index, 'down')}
                                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                title="Move down"
                                              >
                                                <FaArrowDown size={14} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Add new button */}
                                  <button
                                    onClick={handleAddFaqCard}
                                    className="w-full py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <FaPlus size={12} />
                                    Add New FAQ
                                  </button>

                                  {/* Edit form */}
                                  {editingFaqCard && (
                                    <div className="mt-4 p-4 bg-white border-2 border-blue-500 rounded-md space-y-3">
                                      <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                        {editingFaqCard.id && faqCards.find(c => c.id === editingFaqCard.id) ? 'Edit FAQ' : 'New FAQ'}
                                      </h4>

                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Question</label>
                                        <input
                                          type="text"
                                          value={editingFaqCard.question}
                                          onChange={(e) => setEditingFaqCard({ ...editingFaqCard, question: e.target.value })}
                                          placeholder="Bagaimana cara mendaftar?"
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Answer</label>
                                        <textarea
                                          value={editingFaqCard.answer}
                                          onChange={(e) => setEditingFaqCard({ ...editingFaqCard, answer: e.target.value })}
                                          placeholder='Klik tombol "Daftar Sekarang" di atas...'
                                          rows={4}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>

                                      <div className="flex gap-2 pt-2">
                                        <button
                                          onClick={() => handleSaveFaqCard(editingFaqCard)}
                                          className="flex-1 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingFaqCard(null)}
                                          className="flex-1 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveConfiguration}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaSave />
                {editingConfigId ? 'Update Configuration' : 'Save Configuration'}
              </button>
              {editingConfigId && (
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Export/Import Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Export / Import</h2>
              <p className="text-sm text-gray-600 mb-4">
                Export your current configuration as a JSON file or import a previously saved configuration.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleExportJSON}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaFileExport />
                  Export JSON
                </button>
                <button
                  onClick={() => importJsonInputRef.current?.click()}
                  className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaFileImport />
                  Import JSON
                </button>
              </div>
              <input
                ref={importJsonInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>

            {saveStatus && (
              <div
                className={`p-4 rounded-lg text-center ${
                  saveStatus.includes('success')
                    ? 'bg-green-100 text-green-800'
                    : saveStatus.includes('Saving')
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {saveStatus}
              </div>
            )}
          </div>

          {/* Right Side - Preview */}
          <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FaEye className="text-blue-600" />
                  Live Preview
                </h2>
                <button
                  onClick={refreshPreview}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh preview"
                >
                  <FaSyncAlt />
                </button>
              </div>

              {/* 16:9 Preview Container */}
              <div className="relative w-full" style={{ paddingBottom: '40%' }}>
                <div className="absolute inset-0 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    ref={iframeRef}
                    key={previewKey}
                    src="/preview"
                    title="Landing Page Preview"
                    className="w-full h-full"
                    style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                    onLoad={handleIframeLoad}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4 text-center">
                Preview auto-refreshes when you make changes (500ms delay)
              </p>
{/* Mobile Preview */}              <div className="bg-white rounded-lg shadow-md p-4 mt-4">                <div className="flex items-center justify-between mb-4">                  <h2 className="text-xl font-semibold flex items-center gap-2">                    <FaEye className="text-blue-600" />                    Mobile Preview                  </h2>                </div>                {/* Mobile Phone Frame */}                <div className="flex justify-center">                  <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl" style={{ width: '280px' }}>                    {/* Phone Notch */}                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-3xl z-10"></div>                                        {/* Screen Container */}                    <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: '450px' }}>                      <iframe                        key={previewKey}                        src="/preview"                        title="Mobile Landing Page Preview"                        className="w-full h-full"                        style={{ border: 'none' }}                      />                    </div>                  </div>                </div>                <p className="text-sm text-gray-600 mt-4 text-center">                  Mobile size (280x450px)                </p>              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;
