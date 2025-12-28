import XLSX from 'xlsx';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Use the DATABASE_URL from backend's .env
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crm_tools?schema=public'
    }
  }
});

// Helper function to parse Excel date to JS Date
function excelDateToJSDate(excelDate) {
  if (!excelDate || typeof excelDate !== 'number') return null;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date;
}

// Helper function to normalize phone number
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  // Convert to string and remove all non-numeric characters except +
  let cleaned = String(phone).replace(/[^\d+]/g, '');
  // If it starts with 62, add +
  if (cleaned.startsWith('62') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  // If it starts with 08, replace with +628
  if (cleaned.startsWith('08')) {
    cleaned = '+62' + cleaned.substring(1);
  }
  return cleaned;
}

// Helper function to map Excel status to DB status
function mapStatus(excelStatus) {
  if (!excelStatus) return 'TODO';
  const status = excelStatus.toString().toUpperCase().replace(/\s+/g, '_');

  if (status.includes('NEXT_YEAR')) return 'NEXT_YEAR';
  if (status.includes('FOLLOW_UP') || status.includes('FOLLOW-UP')) {
    if (status.includes('GHOST')) return 'GHOSTED_FOLLOW_UP';
    return 'FOLLOW_UP';
  }
  if (status.includes('TODO') || status.includes('TO_DO') || status.includes('TO-DO')) return 'TODO';
  if (status.includes('GHOST')) return 'GHOSTED_FOLLOW_UP';

  return 'TODO'; // Default
}

async function importExcelToCRM() {
  try {
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile('NT_sales_archive.xlsx');
    const worksheet = workbook.Sheets['Sheet1'];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${data.length} records to import\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // Extract phone number from CP 1st hand
        const cp1st = row['CP 1st hand'] || row['CP 2nd hand'] || '';
        const phoneNumber = normalizePhoneNumber(cp1st) || `TEMP_${Date.now()}_${Math.random()}`;

        // Check if client already exists
        const existing = await prisma.client.findUnique({
          where: { phoneNumber }
        });

        if (existing && !phoneNumber.startsWith('TEMP_')) {
          console.log(`⏭️  Skipped: ${row['Nama Event']} (already exists)`);
          skipped++;
          continue;
        }

        const clientData = {
          phoneNumber,
          eventOrganizer: row['Nama Event'] || 'Unknown',
          igLink: row['Instagram'] || null,
          cp1st: row['CP 1st hand'] ? String(row['CP 1st hand']) : null,
          cp2nd: row['CP 2nd hand'] ? String(row['CP 2nd hand']) : null,
          lastEvent: row['Tempat'] ? `${row['Tempat']}` : null,
          lastContact: excelDateToJSDate(row['Last Contact']),
          pic: row['PIC'] || null,
          status: mapStatus(row['Column']),
          startup: 'NOVATIX',
          // New Excel fields
          eventType: row['Tipe'] || null,
          location: row['Tempat'] || null,
          nextEventDate: excelDateToJSDate(row['Waktu Pelaksanaan Terdekat']),
          priceRange: row['Price Range'] ? String(row['Price Range']) : null,
          doneContact: Boolean(row['Done Contact?']),
          notes: row['Catatan'] || null,
          statistically: row['Statistically'] || null,
        };

        await prisma.client.create({
          data: clientData
        });

        console.log(`✅ Imported: ${row['Nama Event']}`);
        imported++;

      } catch (error) {
        console.error(`❌ Error importing ${row['Nama Event']}: ${error.message}`);
        errors++;
      }
    }

    console.log('\n📈 Import Summary:');
    console.log(`  ✅ Imported: ${imported}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📊 Total: ${data.length}`);

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importExcelToCRM();
