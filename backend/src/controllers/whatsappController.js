import whatsappService from '../whatsappService.js';
import prisma from '../db.js';

export const getWhatsAppStatus = async (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendWhatsAppMessage = async (req, res) => {
  try {
    const { clientId, message } = req.body;

    // Get client
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Send message
    await whatsappService.sendMessage(client.phoneNumber, message);

    // Update last contact
    await prisma.client.update({
      where: { id: clientId },
      data: { lastContact: new Date() }
    });

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const refreshWhitelist = async (req, res) => {
  try {
    await whatsappService.updateWhitelist();
    res.json({ success: true, message: 'Whitelist refreshed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
