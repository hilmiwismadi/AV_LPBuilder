import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function migrateChatHistory() {
  console.log("Starting chat history migration...");
  
  const chatHistories = await prisma.chatHistory.findMany();
  console.log("Found", chatHistories.length, "chat history records");
  
  for (const chat of chatHistories) {
    const client = await prisma.client.findUnique({
      where: { id: chat.clientId }
    });
    
    if (client) {
      const phoneHash = crypto.createHash("md5").update(client.phoneNumber).digest("hex");
      
      await prisma.chatHistory.update({
        where: { id: chat.id },
        data: { phoneHash }
      });
      
      console.log("Migrated chat for client:", client.eventOrganizer, "phoneHash:", phoneHash);
    } else {
      console.log("Warning: No client found for chat:", chat.id);
    }
  }
  
  console.log("Migration complete!");
}

migrateChatHistory()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.disconnect();
  });
