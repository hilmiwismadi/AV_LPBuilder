import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function analyzeChats() {
  const allMessages = await prisma.chatHistory.findMany({
    orderBy: { timestamp: 'desc' }
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
    const clientInfo = clientIds.length > 0 ? ' (Linked: ' + clientIds[0].substring(0, 8) + '...)' : ' (Orphan)';
    
    console.log((i + 1) + '. Phone Hash: ' + chat.phoneHash.substring(0, 8) + '...');
    console.log('   Outgoing: ' + chat.outgoingCount + ' | Incoming: ' + chat.incomingCount + ' | Total: ' + chat.messages.length + clientInfo);
    
    // Show recent incoming message
    const recentIncoming = chat.messages.find(m => !m.isOutgoing);
    if (recentIncoming) {
      const msgTime = getTimeAgo(recentIncoming.timestamp);
      const msgText = recentIncoming.message.substring(0, 60);
      console.log('   Recent Reply: ' + msgTime + ' -  + msgText + ');
    }
    console.log('');
  }
  
  console.log('=== SUMMARY ===');
  console.log('Total 2-way conversations: ' + twoWayChats.length);
  console.log('Total phone numbers with messages: ' + Object.keys(phoneGroups).length);
  console.log('Total messages in database: ' + allMessages.length);
  
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
