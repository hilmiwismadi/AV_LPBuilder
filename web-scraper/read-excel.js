import XLSX from 'xlsx';

// Read the Excel file
const workbook = XLSX.readFile('NT_sales_archive.xlsx');

// Get all sheet names
console.log('Sheet Names:', workbook.SheetNames);
console.log('\n');

// Read each sheet
workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n=== Sheet: ${sheetName} ===\n`);

  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON for easier reading
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Display first 20 rows
  data.slice(0, 20).forEach((row, index) => {
    console.log(`Row ${index + 1}:`, row);
  });

  console.log(`\n(Total rows in this sheet: ${data.length})`);
});
