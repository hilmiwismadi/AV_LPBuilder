import prisma from '../db.js';

export const getChatHistory = async (req, res) => {
  try {
    const { clientId } = req.params;
    const chatHistory = await prisma.chatHistory.findMany({
      where: { clientId },
      orderBy: { timestamp: 'asc' }
    });
    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addChatMessage = async (req, res) => {
  try {
    const { clientId, message, isOutgoing } = req.body;
    const chatMessage = await prisma.chatHistory.create({
      data: {
        clientId,
        message,
        isOutgoing
      }
    });
    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
