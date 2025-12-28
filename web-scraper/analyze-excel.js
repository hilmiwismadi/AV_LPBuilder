import XLSX from 'xlsx';

// Read the Excel file
const workbook = XLSX.readFile('NT_sales_archive.xlsx');
const worksheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('=== NT SALES ARCHIVE ANALYSIS ===\n');

console.log('📊 Total Records:', data.length);
console.log('\n📋 Column Headers:');
if (data.length > 0) {
  Object.keys(data[0]).forEach((key, index) => {
    console.log(`  ${index + 1}. ${key}`);
  });
}

console.log('\n🎭 Event Types Distribution:');
const typeCount = {};
data.forEach(row => {
  const type = row['Tipe'] || 'Unknown';
  typeCount[type] = (typeCount[type] || 0) + 1;
});
Object.entries(typeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\n📍 Top Locations:');
const locationCount = {};
data.forEach(row => {
  const location = row['Tempat'] || 'Unknown';
  locationCount[location] = (locationCount[location] || 0) + 1;
});
Object.entries(locationCount).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([location, count]) => {
  console.log(`  ${location}: ${count}`);
});

console.log('\n✅ Contact Status:');
const contactedCount = data.filter(row => row['Done Contact?']).length;
const notContactedCount = data.length - contactedCount;
console.log(`  Contacted: ${contactedCount}`);
console.log(`  Not Contacted: ${notContactedCount}`);

console.log('\n📈 Status Distribution (Column):');
const statusCount = {};
data.forEach(row => {
  const status = row['Column'] || 'No Status';
  statusCount[status] = (statusCount[status] || 0) + 1;
});
Object.entries(statusCount).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}`);
});

console.log('\n👥 PIC Distribution:');
const picCount = {};
data.forEach(row => {
  const pic = row['PIC'] || 'Unassigned';
  picCount[pic] = (picCount[pic] || 0) + 1;
});
Object.entries(picCount).sort((a, b) => b[1] - a[1]).forEach(([pic, count]) => {
  console.log(`  ${pic}: ${count}`);
});

console.log('\n💰 Price Range Stats:');
const pricesWithValues = data.filter(row => row['Price Range'] && typeof row['Price Range'] === 'number');
if (pricesWithValues.length > 0) {
  const prices = pricesWithValues.map(row => row['Price Range']);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  console.log(`  Records with price: ${pricesWithValues.length}`);
  console.log(`  Average: Rp ${avgPrice.toLocaleString('id-ID')}`);
  console.log(`  Min: Rp ${minPrice.toLocaleString('id-ID')}`);
  console.log(`  Max: Rp ${maxPrice.toLocaleString('id-ID')}`);
} else {
  console.log('  No price data available');
}

console.log('\n📱 Sample Records (First 5):');
data.slice(0, 5).forEach((row, index) => {
  console.log(`\n${index + 1}. ${row['Nama Event']}`);
  console.log(`   Type: ${row['Tipe'] || 'N/A'}`);
  console.log(`   Location: ${row['Tempat'] || 'N/A'}`);
  console.log(`   Instagram: ${row['Instagram'] || 'N/A'}`);
  console.log(`   Status: ${row['Column'] || 'N/A'}`);
  console.log(`   PIC: ${row['PIC'] || 'N/A'}`);
});
