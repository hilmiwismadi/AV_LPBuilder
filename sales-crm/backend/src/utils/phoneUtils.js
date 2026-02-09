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
