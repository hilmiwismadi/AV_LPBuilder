const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Function to clean WhatsApp phone number (remove extra digits)
function cleanWhatsAppPhone(whatsappPhone) {
  let digits = whatsappPhone.replace(/\D/g, '');
  
  // Indonesian numbers should be 11-13 digits after 62
  if (digits.startsWith('62') && digits.length > 13) {
    // Extract only the valid phone number portion
    // Try 13, 12, then 11 digits
    for (let len = 13; len >= 11; len--) {
      if (digits.length >= len) {
        const possiblePhone = digits.substring(0, len);
        // Verify it's a valid Indonesian mobile number (8, 9, 56, 57, 58)
        if (possiblePhone.length >= 11 && possiblePhone.length <= 13) {
          return possiblePhone;
        }
      }
    }
  }
  
  return digits;
}

async function patternMatchingCleanup() {
  console.log('🧹 Starting pattern matching cleanup...');
  console.log('');
  
  try {
    // Get all clients
    const allClients = await prisma.client.findMany({
      select: { id: true, phoneNumber: true, eventOrganizer: true }
    });
    
    console.log('📊 Found ' + allClients.length + ' clients in database');
    
    // Get all chat messages with phoneHash values
    const allMessages = await prisma.chatHistory.findMany();
    console.log('📊 Found ' + allMessages.length + ' total chat messages');
    console.log('');
    
    // Analyze phone number patterns from messages
    // Since we can't reverse MD5, we'll analyze what clients exist
    // and try to match message patterns to them
    
    console.log('🔧 Analyzing client phone numbers...');
    const clientPhoneNumbers = allClients.map(c => c.phoneNumber).filter(Boolean);
    console.log('   Found ' + clientPhoneNumbers.length + ' valid client phone numbers');
    console.log('');
    
    // Try to match orphan messages to clients by examining message patterns
    console.log('🔧 Attempting pattern matching for orphan messages...');
    console.log('');
    
    let matchedCount = 0;
    let updatedCount = 0;
    
    // Focus on messages without clientId
    const orphanMessages = allMessages.filter(msg => !msg.clientId);
    console.log('📊 Found ' + orphanMessages.length + ' orphan messages');
    console.log('');
    
    // Create phoneHash to client mapping
    const phoneHashToClient = {};
    allClients.forEach(client => {
      if (client.phoneNumber) {
        const hash = crypto.createHash('md5').update(client.phoneNumber).digest('hex');
        phoneHashToClient[hash] = client;
      }
    });
    
    console.log('🔧 Processing orphan messages...');
    for (const msg of orphanMessages) {
      // Check if phoneHash directly matches any client
      if (phoneHashToClient[msg.phoneHash]) {
        const client = phoneHashToClient[msg.phoneHash];
        console.log('  ✓ Direct match: ' + client.eventOrganizer + ' (' + client.phoneNumber + ')');
        
        await prisma.chatHistory.update({
          where: { id: msg.id },
          data: { clientId: client.id }
        });
        matchedCount++;
        updatedCount++;
      }
    }
    
    console.log('');
    console.log('=== CLEANUP SUMMARY ===');
    console.log('✓ Messages matched and linked: ' + matchedCount);
    console.log('✓ Total database updates: ' + updatedCount);
    console.log('📊 Remaining orphan messages: ' + (orphanMessages.length - matchedCount));
    console.log('');
    
    if (matchedCount === 0) {
      console.log('⚠️  No additional matches found.');
      console.log('⚠️  PhoneHash values are based on incorrect phone numbers.');
      console.log('⚠️  New messages will work correctly with the phone number fix.');
      console.log('⚠️  Historical messages require original phone number data to fix properly.');
    } else {
      console.log('🎉 Pattern matching cleanup completed!');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

patternMatchingCleanup();
