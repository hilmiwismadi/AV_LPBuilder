const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Function to extract possible base phone numbers from WhatsApp numbers with extra digits
function extractPossiblePhoneNumbers(longPhone) {
  const results = [];
  const digits = longPhone.replace(/\D/g, '');
  
  // Indonesian numbers should be 11-13 digits after 62
  // Try different lengths starting from longest (13) down to shortest (11)
  for (let len = 13; len >= 11; len--) {
    if (digits.length >= len) {
      const basePhone = digits.substring(0, len);
      // Must start with 62
      if (basePhone.startsWith('62')) {
        results.push(basePhone);
      }
    }
  }
  
  return results;
}

// Function to try to match phone number to client using variations
function findMatchingClient(phoneNumber, allClients) {
  // Direct match
  let match = allClients.find(c => c.phoneNumber === phoneNumber);
  if (match) return match;
  
  // Try removing digits from end
  let modifiedPhone = phoneNumber;
  while (modifiedPhone.length > 11) {
    modifiedPhone = modifiedPhone.substring(0, modifiedPhone.length - 1);
    match = allClients.find(c => c.phoneNumber === modifiedPhone);
    if (match) return match;
  }
  
  return null;
}

async function aggressiveCleanup() {
  console.log('🧹 Starting aggressive database cleanup...');
  console.log('');
  
  try {
    // Get all clients
    const allClients = await prisma.client.findMany({
      select: { id: true, phoneNumber: true, eventOrganizer: true }
    });
    
    console.log('📊 Found ' + allClients.length + ' clients in database');
    console.log('');
    
    // Get all chat messages
    const allMessages = await prisma.chatHistory.findMany();
    console.log('📊 Found ' + allMessages.length + ' total chat messages');
    console.log('');
    
    // Group messages by phoneHash to understand what phone numbers were used
    const phoneHashGroups = {};
    allMessages.forEach(msg => {
      if (!phoneHashGroups[msg.phoneHash]) {
        phoneHashGroups[msg.phoneHash] = {
          phoneHash: msg.phoneHash,
          messages: [],
          hasClientId: false
        };
      }
      phoneHashGroups[msg.phoneHash].messages.push(msg);
      if (msg.clientId) {
        phoneHashGroups[msg.phoneHash].hasClientId = true;
      }
    });
    
    console.log('📊 Found ' + Object.keys(phoneHashGroups).length + ' unique phone hash groups');
    console.log('📊 Phone hash groups with client: ' + Object.values(phoneHashGroups).filter(g => g.hasClientId).length);
    console.log('📊 Phone hash groups without client: ' + Object.values(phoneHashGroups).filter(g => !g.hasClientId).length);
    console.log('');
    
    // Try to match orphan phoneHash groups to clients
    console.log('🔧 Attempting aggressive matching...');
    console.log('');
    
    let matchedCount = 0;
    let updatedCount = 0;
    
    for (const [phoneHash, group] of Object.entries(phoneHashGroups)) {
      if (group.hasClientId) continue; // Skip already linked
      
      console.log('--- Processing phoneHash: ' + phoneHash.substring(0, 8) + '... (' + group.messages.length + ' messages)');
      
      // Since we can't reverse MD5, we'll try a different approach:
      // Look at client phone numbers and see if any could be related
      for (const client of allClients) {
        if (!client.phoneNumber) continue;
        
        // Calculate client phone hash
        const clientPhoneHash = crypto.createHash('md5').update(client.phoneNumber).digest('hex');
        
        // Check if phoneHash matches
        if (phoneHash === clientPhoneHash) {
          console.log('  ✓ Direct match to: ' + client.eventOrganizer + ' (' + client.phoneNumber + ')');
          
          // Update all messages in this group
          for (const msg of group.messages) {
            await prisma.chatHistory.update({
              where: { id: msg.id },
              data: { clientId: client.id }
            });
            updatedCount++;
          }
          matchedCount++;
          break;
        }
      }
    }
    
    console.log('');
    console.log('=== CLEANUP SUMMARY ===');
    console.log('✓ Phone hash groups matched: ' + matchedCount);
    console.log('✓ Messages updated: ' + updatedCount);
    console.log('📊 Total phone hash groups: ' + Object.keys(phoneHashGroups).length);
    console.log('📊 Phone hash groups still orphan: ' + (Object.values(phoneHashGroups).filter(g => !g.hasClientId).length - matchedCount));
    console.log('');
    console.log('🎉 Aggressive cleanup completed!');
    
  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

aggressiveCleanup();
