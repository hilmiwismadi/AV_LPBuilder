const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function analyzeChats() {
  const allMessages = await prisma.chatHistory.findMany({
    orderBy: { timestamp: 'desc' }
  });
  
  const allClients = await prisma.client.findMany({
    select: { id: true, eventOrganizer: true, phoneNumber: true }
  });
  
  // Create phone hash to client mapping
  const phoneToClient = {};
  allClients.forEach(client => {
    if (client.phoneNumber) {
      const phoneHash = crypto.createHash('md5').update(client.phoneNumber).digest('hex');
      phoneToClient[phoneHash] = client;
    }
  });
  
  const phoneGroups = {};
  allMessages.forEach(msg => {
    if (!phoneGroups[msg.phoneHash]) {
      phoneGroups[msg.phoneHash] = {
        phoneHash: msg.phoneHash,
        outgoingCount: 0,
        incomingCount: 0,
        messages: [],
        clientIds: new Set()
      };
    }
    if (msg.isOutgoing) {
      phoneGroups[msg.phoneHash].outgoingCount++;
    } else {
      phoneGroups[msg.phoneHash].incomingCount++;
    }
    phoneGroups[msg.phoneHash].messages.push(msg);
    if (msg.clientId) {
      phoneGroups[msg.phoneHash].clientIds.add(msg.clientId);
    }
  });
  
  const twoWayChats = Object.values(phoneGroups)
    .filter(group => group.incomingCount > 0 && group.outgoingCount > 0)
    .sort((a, b) => b.messages.length - a.messages.length);
  
  console.log('=== CLIENTS THAT REPLIED TO SALES TEAM ===');
  console.log('');
  
  for (let i = 0; i < twoWayChats.length; i++) {
    const chat = twoWayChats[i];
    const latestMsg = chat.messages[0];
    const timeAgo = getTimeAgo(latestMsg.timestamp);
    const clientIds = Array.from(chat.clientIds);
    
    let clientInfo = '';
    let matchedClient = phoneToClient[chat.phoneHash];
    
    if (matchedClient) {
      clientInfo = ' - ' + matchedClient.eventOrganizer + ' (' + matchedClient.phoneNumber + ')';
    } else if (clientIds.length > 0) {
      clientInfo = ' (Linked: ' + clientIds[0].substring(0, 8) + '...)';
    } else {
      clientInfo = ' (Orphan - no matching client)';
    }
    
    console.log((i + 1) + '.' + clientInfo);
    console.log('   Messages: ' + chat.outgoingCount + ' sent | ' + chat.incomingCount + ' received | Total: ' + chat.messages.length);
    console.log('   Latest: ' + timeAgo + ' | "' + latestMsg.message.substring(0, 50) + '..."');
    console.log('');
  }
  
  console.log('=== SUMMARY ===');
  console.log('Total 2-way conversations: ' + twoWayChats.length);
  console.log('Total phone numbers with messages: ' + Object.keys(phoneGroups).length);
  console.log('Total messages in database: ' + allMessages.length);
  console.log('Linked clients with replies: ' + twoWayChats.filter(c => phoneToClient[c.phoneHash]).length);
  
  process.exit(0);
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return seconds + 's ago';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}

analyzeChats().catch(console.error);
