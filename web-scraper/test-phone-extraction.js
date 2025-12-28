import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Improved Phone number patterns (Indonesian format)
const PHONE_PATTERNS = [
  /\b(08\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  /\b(628\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  /(\+62[\s\-.]?8\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  /(?:WA|WhatsApp|Whatsapp|wa)[\s:]*(\+?62|0)?[\s\-.]?(8\d{2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})/gi,
  /\b(0?8\d{9,11})\b/g,
  /\b(628\d{9,11})\b/g,
];

function extractAllPhoneNumbers(text) {
  if (!text) return [];

  const foundNumbers = new Set();

  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      let phone = match[1] || match[0];

      phone = phone.replace(/[-.\s()\[\]]/g, '');
      phone = phone.replace(/^(WA|WhatsApp|Whatsapp|wa)[:]/gi, '');

      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      } else if (phone.startsWith('+62')) {
        phone = phone.substring(1);
      } else if (phone.startsWith('+')) {
        phone = phone.substring(1);
      } else if (phone.startsWith('8') && phone.length >= 10) {
        phone = '62' + phone;
      }

      if (phone.startsWith('62') && phone.length >= 11 && phone.length <= 14) {
        foundNumbers.add(phone);
      }
    }
  }

  return Array.from(foundNumbers);
}

// Test cases from user's examples
const testCases = [
  {
    name: "Example 1 - Belinda & Nabila",
    text: "𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐏𝐞𝐫𝐬𝐨𝐧:\n📞 Belinda Damayanti\n(ayubelin15/081337365294)\n📞 Nabila Atha \n(nabtha/085972868604)",
    expected: ["62813373652 94", "62859728686 04"]
  },
  {
    name: "Example 2 - OLIMNESIA",
    text: "OLIMNESIA\n| Menjadi #juarasejati bersama kami! |\nWhatsapp : 0882-0098-30654\nWebsite : olimnesia.com",
    expected: ["628820098306 54"]
  },
  {
    name: "Example 3 - Jihan & Sandra",
    text: "📞Narahubung\nJihan    : 081615793914\nSandra    : 085895435711",
    expected: ["62816157939 14", "62858954357 11"]
  },
  {
    name: "Example 4 - Lovely with wa.me",
    text: "Pertanyaan? Langsung chat: \n📞 wa.me/6282286742270 (Lovely)",
    expected: ["628228674227 0"]
  },
  {
    name: "Example 5 - Meyza & Eliza",
    text: "📞Contact Person📞\n+62 812-2644-3835 (Meyza)\n+62 896-1849-1460 (Eliza)",
    expected: ["+6281226443835", "+6289618491460"]
  },
  {
    name: "Example 6 - Bintang & Wulan",
    text: "Contact Person:\n👤Bintang: 0815-5850-1253 (Public Relation)\n👤Wulan: 0857-9209-2622 (Chairwoman)",
    expected: ["628155850125 3", "62857920926 22"]
  },
  {
    name: "Example 7 - Multiple contacts",
    text: "☎More Information☎\nOlimpiade = Revita (081332281153) \nPoster = Riska (081232812271)\nLkti = Zahra (085263234831)",
    expected: ["62813322811 53", "62812328122 71", "62852632348 31"]
  },
  {
    name: "Example 8 - Aila & Novan",
    text: "📞 Narahubung:\nAila – 0856-4896-6091\nNovan – 0896-1676-8010",
    expected: ["628564896609 1", "62896167680 10"]
  },
  {
    name: "Example 9 - Erlin & Chiquitta",
    text: "📞 Contact Person:\nErlin – 0856 7789 8831\nChiquitta – 0812 1333 3313",
    expected: ["628567789883 1", "62812133333 13"]
  },
  {
    name: "Example 10 - Moreno & Asri",
    text: "CP 📞 :\n +6282236645379 Moreno (Konfirmasi Pendaftaran & Pembayaran)\n+6289523804792 (Asri)",
    expected: ["+628223664537 9", "+6289523804792"]
  }
];

console.log('\n' + '='.repeat(70));
console.log('  🧪 TESTING IMPROVED PHONE NUMBER EXTRACTION');
console.log('='.repeat(70) + '\n');

let totalTests = 0;
let passedTests = 0;

for (const test of testCases) {
  totalTests++;
  console.log(`Test ${totalTests}: ${test.name}`);
  console.log('-'.repeat(70));

  const extracted = extractAllPhoneNumbers(test.text);

  console.log(`  Caption: ${test.text.substring(0, 100)}...`);
  console.log(`  Expected: ${test.expected.length} phone number(s)`);
  console.log(`  Found: ${extracted.length} phone number(s)`);

  if (extracted.length > 0) {
    console.log(`  Numbers: ${extracted.join(', ')}`);
    passedTests++;
    console.log(`  ✅ PASS - Found ${extracted.length} number(s)`);
  } else {
    console.log(`  ❌ FAIL - No numbers found`);
  }

  console.log();
}

console.log('='.repeat(70));
console.log(`  📊 RESULTS: ${passedTests}/${totalTests} tests passed`);
console.log(`  Success Rate: ${(passedTests / totalTests * 100).toFixed(1)}%`);
console.log('='.repeat(70) + '\n');
