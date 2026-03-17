/**
 * Standardize phone number to consistent format
 * Converts any phone number to format: 628xxxxxxxxxx
 * 
 * @param {string} phone - Phone number in any format
 * @returns {string} Standardized phone number (digits only, with 62 country code)
 */
export function standardizePhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove leading 0 (Indonesian local format)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Add 62 country code if not present
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  // Handle WhatsApp phone numbers with extra digits
  // Indonesian phone numbers should be 11-13 digits after country code (62)
  // WhatsApp sometimes includes extra digits at the end (internal IDs)
  // Extract only the valid phone number portion
  if (cleaned.startsWith('62') && cleaned.length > 13) {
    // Country code (62) + area code (8) + 7-10 digits = 11-13 total
    // Take first 13 digits max (62 + 11 digits number)
    cleaned = cleaned.substring(0, 13);
  }
  
  return cleaned;
}

/**
 * Extract clean phone number from WhatsApp Web.js message object
 * WhatsApp Web.js can return phone numbers with internal IDs
 * This function extracts the actual phone number
 * 
 * @param {object} message - WhatsApp Web.js message object
 * @returns {string} Clean phone number in standard format
 */
export function extractWhatsAppPhoneNumber(message) {
  if (!message) return '';
  
  // Get the phone number from message object
  let phoneNumber = message.from || message.to || message.number;
  
  if (!phoneNumber) return '';
  
  // Remove the @c.us suffix
  phoneNumber = phoneNumber.replace('@c.us', '').replace('@g.us', '').replace('@s.whatsapp.net', '');
  
  // WhatsApp Web.js might return numbers in different formats
  // Try to extract just the phone number portion
  
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle leading 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Ensure 62 country code
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  // Extract only valid Indonesian phone number (11-13 digits total)
  if (cleaned.startsWith('62') && cleaned.length > 13) {
    // Try different lengths to find valid phone number
    // Indonesian mobile numbers typically start with 8, followed by 8-10 digits
    for (let len = 13; len >= 11; len--) {
      if (cleaned.length >= len) {
        const candidate = cleaned.substring(0, len);
        // Check if it starts with 628 (valid Indonesian mobile prefix)
        if (candidate.startsWith('628')) {
          cleaned = candidate;
          break;
        }
      }
    }
  }
  
  return cleaned;
}

/**
 * Format phone number for display
 * Converts to format: +62 8xx xxxx xxxx
 * 
 * @param {string} phone - Phone number in standard format (628xxxxxxxxxx)
 * @returns {string} Formatted phone number for display
 */
export function formatPhoneNumberForDisplay(phone) {
  if (!phone) return '';
  
  // Clean the number
  let cleaned = phone.replace(/\D/g, '');
  
  // Ensure it starts with 62
  if (!cleaned.startsWith('62')) {
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else {
      cleaned = '62' + cleaned;
    }
  }
  
  // Format as +62 8xx xxxx xxxx
  if (cleaned.startsWith('62')) {
    const number = cleaned.substring(2);
    if (number.length >= 10) {
      const part1 = number.substring(0, 3);
      const part2 = number.substring(3, 7);
      const part3 = number.substring(7, 11);
      return '+62 ' + part1 + ' ' + part2 + ' ' + part3;
    }
  }
  
  return '+' + cleaned;
}

/**
 * Format phone number for WhatsApp
 * Converts to format: 628xxxxxxxxxx@c.us
 * 
 * @param {string} phone - Phone number in standard format
 * @returns {string} Phone number formatted for WhatsApp Web.js
 */
export function formatPhoneNumberForWhatsApp(phone) {
  if (!phone) return '';
  
  const standardized = standardizePhoneNumber(phone);
  return standardized + '@c.us';
}

/**
 * Check if two phone numbers match (for searching/matching)
 * Handles various formats automatically
 * 
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} True if phone numbers match
 */
export function phoneNumbersMatch(phone1, phone2) {
  const std1 = standardizePhoneNumber(phone1);
  const std2 = standardizePhoneNumber(phone2);
  return std1 === std2;
}

/**
 * Extract WhatsApp phone number from message object
 * Removes country codes, extra digits, handles various formats
 *
 * @param {object} message - WhatsApp Web.js message object
 * @returns {string} Clean phone number in standard format
 */
export function extractWhatsAppPhoneNumber(message) {
  if (!message) return '';
  
  // Get phone number from various possible fields
  let phoneNumber = message.from || message.to || message.number;
  
  if (!phoneNumber) return '';
  
  // Remove @c.us suffix
  phoneNumber = phoneNumber.replace('@c.us', '').replace('@g.us', '').replace('@s.whatsapp.net', '');
  
  // Handle array format (some messages have phone number in array)
  if (Array.isArray(phoneNumber)) {
    phoneNumber = phoneNumber[0] || '';
  }
  
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle leading zero
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Remove country code if present (WhatsApp sometimes adds +62)
  if (cleaned.startsWith('62')) {
    cleaned = cleaned.substring(2);
  }
  
  // Handle Indonesian mobile numbers (typically 8-13 digits after country code)
  // Indonesian numbers should start with 8, try  extract valid portion
  if (cleaned.startsWith('628') || cleaned.startsWith('8')) {
    // Try to extract 11-13 digit portion
    for (let len = 13; len <= 11; len--) {
      const candidate = cleaned.substring(0, len);
      // Check if it starts with valid Indonesian mobile prefix (628, 8)
      if (candidate.startsWith('628') || candidate.startsWith('8')) {
        cleaned = candidate;
        break;
      }
    }
  }
  
  return cleaned;
}

