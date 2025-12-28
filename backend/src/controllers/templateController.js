import prisma from '../db.js';

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.chatTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.chatTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const template = await prisma.chatTemplate.create({
      data: req.body
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.chatTemplate.update({
      where: { id },
      data: req.body
    });
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chatTemplate.delete({
      where: { id }
    });
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const processTemplate = async (req, res) => {
  try {
    const { templateId, variables } = req.body;
    const template = await prisma.chatTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    let message = template.message;

    // Replace variables in the template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      message = message.replace(regex, variables[key]);
    });

    res.json({ message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
