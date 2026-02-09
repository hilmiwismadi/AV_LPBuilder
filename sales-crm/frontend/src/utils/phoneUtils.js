export function formatPhoneNumberForDisplay(phone) {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned.startsWith("62")) {
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else {
      cleaned = "62" + cleaned;
    }
  }
  if (cleaned.startsWith("62") && cleaned.length > 10) {
    const number = cleaned.substring(2);
    const part1 = number.substring(0, 3);
    const part2 = number.substring(3, 7);
    const part3 = number.substring(7, 11);
    return "+62 " + part1 + " " + part2 + " " + part3;
  }
  return "+" + cleaned;
}
