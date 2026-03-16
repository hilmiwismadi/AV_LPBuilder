const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function cleanupOrphanMessages() {
  console.log('🧹 Starting database cleanup for orphan messages...');
  console.log('');
  
  try {
    // Get all clients for matching
    const allClients = await prisma.client.findMany({
      select: { id: true, phoneNumber: true, eventOrganizer: true }
    });
    
    console.log('📊 Found ' + allClients.length + ' clients in database');
    
    // Create phone to client mapping
    const phoneToClient = {};
    allClients.forEach(client => {
      if (client.phoneNumber) {
        // Generate phone hash for each client phone
        const phoneHash = crypto.createHash('md5').update(client.phoneNumber).digest('hex');
        phoneToClient[phoneHash] = client;
      }
    });
    
    console.log('📊 Generated ' + Object.keys(phoneToClient).length + ' phone hash mappings');
    console.log('');
    
    // Get all chat messages
    const allMessages = await prisma.chatHistory.findMany();
    console.log('📊 Found ' + allMessages.length + ' total chat messages');
    console.log('');
    
    // Analyze phoneHash mismatches
    const orphanMessages = allMessages.filter(msg => !msg.clientId);
    const phoneHashes = new Set(allMessages.map(m => m.phoneHash));
    const clientPhoneHashes = new Set(Object.keys(phoneToClient));
    
    console.log('📊 Orphan messages: ' + orphanMessages.length);
    console.log('📊 Unique phone hashes in messages: ' + phoneHashes.size);
    console.log('📊 Phone hashes matching clients: ' + clientPhoneHashes.size);
    console.log('');
    
    // Find phoneHashes that don't match any client
    const unmatchedHashes = [...phoneHashes].filter(hash => !clientPhoneHashes.has(hash));
    console.log('📊 Phone hashes not matching clients: ' + unmatchedHashes.length);
    console.log('');
    
    if (unmatchedHashes.length > 0) {
      console.log('=== UNMATCHED PHONE HASHES ===');
      unmatchedHashes.slice(0, 10).forEach(hash => {
        const messages = allMessages.filter(m => m.phoneHash === hash);
        console.log('Hash: ' + hash.substring(0, 8) + '... | Messages: ' + messages.length);
      });
      console.log('');
    }
    
    // Try to link orphan messages to clients by pattern matching
    console.log('🔧 Attempting to link orphan messages...');
    console.log('');
    
    let linkedCount = 0;
    let errors = [];
    
    for (const msg of orphanMessages) {
      try {
        // Check if phoneHash matches any client
        if (phoneToClient[msg.phoneHash]) {
          const client = phoneToClient[msg.phoneHash];
          await prisma.chatHistory.update({
            where: { id: msg.id },
            data: { clientId: client.id }
          });
          linkedCount++;
          console.log('✓ Linked message to: ' + client.eventOrganizer + ' (' + client.phoneNumber + ')');
        }
      } catch (error) {
        errors.push({
          messageId: msg.id,
          error: error.message
        });
        console.log('✗ Error linking message ' + msg.id + ': ' + error.message);
      }
    }
    
    console.log('');
    console.log('=== CLEANUP SUMMARY ===');
    console.log('✓ Messages linked to clients: ' + linkedCount);
    console.log('✓ Remaining orphan messages: ' + (orphanMessages.length - linkedCount));
    console.log('✗ Errors encountered: ' + errors.length);
    
    if (errors.length > 0) {
      console.log('');
      console.log('=== ERROR DETAILS ===');
      errors.forEach((err, index) => {
        console.log((index + 1) + '. Message ID: ' + err.messageId + ' - ' + err.error);
      });
    }
    
    console.log('');
    console.log('🎉 Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanMessages();
