/**
 * Pure-JS regex date extractor. Returns { date: Date, snippet: string } | null.
 * All extracted dates are interpreted as Asia/Jakarta (UTC+7).
 * No external dependencies.
 */

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const TZ_OFFSET = 7; // UTC+7 for Asia/Jakarta

function parseMonth(str) {
  return MONTHS[str.toLowerCase()];
}

function resolveYear(month, day, ref) {
  const year = ref.getFullYear();
  const candidate = new Date(year, month, day);
  const twoMonthsAgo = new Date(ref);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  if (candidate < twoMonthsAgo) {
    return year + 1;
  }
  return year;
}

/**
 * Create a Date object where the given hours/minutes are interpreted as UTC+7.
 * Stored internally as UTC so that when displayed in UTC+7 timezone, it shows correctly.
 */
function makeDate(year, month, day, hours = 0, minutes = 0) {
  return new Date(Date.UTC(year, month, day, hours - TZ_OFFSET, minutes));
}

export function extractDate(text, refDate = new Date()) {
  if (!text || typeof text !== 'string') return null;

  // 1. ISO format with timezone: 2026-03-15T14:00:00+07:00
  const isoTzRe = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?([+-]\d{2}:\d{2}|Z)/;
  const isoTzMatch = text.match(isoTzRe);
  if (isoTzMatch) {
    const d = new Date(isoTzMatch[0]);
    if (!isNaN(d.getTime())) return { date: d, snippet: isoTzMatch[0] };
  }

  // 2. ISO format without timezone: 2026-03-15 or 2026-03-15T14:00 (assume UTC+7)
  const isoRe = /(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;
  const isoMatch = text.match(isoRe);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]);
    const month = parseInt(isoMatch[2]) - 1;
    const day = parseInt(isoMatch[3]);
    const hours = isoMatch[4] ? parseInt(isoMatch[4]) : 0;
    const minutes = isoMatch[5] ? parseInt(isoMatch[5]) : 0;
    const d = makeDate(year, month, day, hours, minutes);
    if (!isNaN(d.getTime())) return { date: d, snippet: isoMatch[0] };
  }

  // 3. "15 March" / "15th March" / "15th March 2026" / "15th March at 14:00"
  const dayMonthRe = /\b(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)(?:\s+(\d{4}))?(?:\s+(?:at|@)\s*(\d{1,2})[.:](\d{2}))?/i;
  const dmMatch = text.match(dayMonthRe);
  if (dmMatch) {
    const day = parseInt(dmMatch[1]);
    if (day >= 1 && day <= 31) {
      const month = parseMonth(dmMatch[3]);
      const year = dmMatch[4] ? parseInt(dmMatch[4]) : resolveYear(month, day, refDate);
      const hours = dmMatch[5] ? parseInt(dmMatch[5]) : 0;
      const minutes = dmMatch[6] ? parseInt(dmMatch[6]) : 0;
      const d = makeDate(year, month, day, hours, minutes);
      if (!isNaN(d.getTime())) return { date: d, snippet: dmMatch[0] };
    }
  }

  // 4. "March 15" / "March 15th" / "March 15, 2026" / "March 15th at 14:00"
  const monthDayRe = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(st|nd|rd|th)?(?!\d)(?:\s*,?\s*(\d{4}))?(?:\s+(?:at|@)\s*(\d{1,2})[.:](\d{2}))?/i;
  const mdMatch = text.match(monthDayRe);
  if (mdMatch) {
    const day = parseInt(mdMatch[2]);
    if (day >= 1 && day <= 31) {
      const month = parseMonth(mdMatch[1]);
      const year = mdMatch[4] ? parseInt(mdMatch[4]) : resolveYear(month, day, refDate);
      const hours = mdMatch[5] ? parseInt(mdMatch[5]) : 0;
      const minutes = mdMatch[6] ? parseInt(mdMatch[6]) : 0;
      const d = makeDate(year, month, day, hours, minutes);
      if (!isNaN(d.getTime())) return { date: d, snippet: mdMatch[0] };
    }
  }

  // 5. Ordinal with time: "21st at 14:00" / "5th at 10:00" (no month -> current/next month)
  const ordinalTimeRe = /\b(\d{1,2})(st|nd|rd|th)\s+(?:at|@)\s*(\d{1,2})[.:](\d{2})/i;
  const otMatch = text.match(ordinalTimeRe);
  if (otMatch) {
    const day = parseInt(otMatch[1]);
    const hours = parseInt(otMatch[3]);
    const minutes = parseInt(otMatch[4]);
    let month = refDate.getMonth();
    let year = refDate.getFullYear();
    if (day < refDate.getDate()) {
      month++;
      if (month > 11) { month = 0; year++; }
    }
    const d = makeDate(year, month, day, hours, minutes);
    if (!isNaN(d.getTime())) return { date: d, snippet: otMatch[0] };
  }

  // 6. "by/on/deadline + Month Day" patterns
  const byRe = /\b(?:by|on|deadline|before|until|due)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(st|nd|rd|th)?(?!\d)(?:\s*,?\s*(\d{4}))?(?:\s+(?:at|@)\s*(\d{1,2})[.:](\d{2}))?/i;
  const byMatch = text.match(byRe);
  if (byMatch) {
    const day = parseInt(byMatch[2]);
    if (day >= 1 && day <= 31) {
      const month = parseMonth(byMatch[1]);
      const year = byMatch[4] ? parseInt(byMatch[4]) : resolveYear(month, day, refDate);
      const hours = byMatch[5] ? parseInt(byMatch[5]) : 0;
      const minutes = byMatch[6] ? parseInt(byMatch[6]) : 0;
      const d = makeDate(year, month, day, hours, minutes);
      if (!isNaN(d.getTime())) return { date: d, snippet: byMatch[0] };
    }
  }

  // 7. DD/MM/YYYY or DD-MM-YYYY or DD/MM/YY format
  const dMyRe = /\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})\b/;
  const dMyMatch = text.match(dMyRe);
  if (dMyMatch) {
    const day = parseInt(dMyMatch[1]);
    const month = parseInt(dMyMatch[2]) - 1;
    let year = parseInt(dMyMatch[3]);
    if (year < 100) year += 2000; // 26 -> 2026
    const d = makeDate(year, month, day);
    if (!isNaN(d.getTime())) return { date: d, snippet: dMyMatch[0] };
  }

  return null;
}

export default extractDate;
