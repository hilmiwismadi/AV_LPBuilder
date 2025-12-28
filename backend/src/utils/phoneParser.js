/**
 * Parse and normalize Indonesian phone numbers to standard format
 * Handles formats: +628124523521, 08124523521, 8124523521, 62812345xxxx
 * Returns: 081234567890 (standard format without country code)
 */
export function parsePhoneNumber(phone) {
  if (!phone) return '';

  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove country code if present
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.substring(2);
  }

  // Add leading 0 if not present
  if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

/**
 * Format phone number for WhatsApp (with country code, without +)
 * Input: 081234567890
 * Output: 6281234567890@c.us
 */
export function formatPhoneForWhatsApp(phone) {
  let cleaned = parsePhoneNumber(phone);

  // Remove leading 0 and add country code 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }

  return cleaned + '@c.us';
}

/**
 * Display phone number in user-friendly format
 * Input: 081234567890 or 6281234567890
 * Output: 0812-3456-7890
 */
export function displayPhoneNumber(phone) {
  const cleaned = parsePhoneNumber(phone);

  // Format: 0812-3456-7890
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  }

  return cleaned;
}
