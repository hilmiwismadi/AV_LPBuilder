import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/templates - Get all templates with filters
router.get("/", async (req, res) => {
  try {
    const { category, enabled, search, sortBy = "createdAt", order = "desc" } = req.query;

    const where = {};
    if (category) where.category = category;
    if (enabled !== undefined) where.enabled = enabled === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const orderBy = {};
    orderBy[sortBy] = order;

    const templates = await prisma.chatTemplate.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        message: true,
        variables: true,
        enabled: true,
        usageCount: true,
        tags: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Group by category
    const grouped = templates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {});

    res.json({
      templates: grouped,
      categories: Object.keys(grouped).sort(),
      total: templates.length
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// GET /api/templates/:id - Get single template
router.get("/:id", async (req, res) => {
  try {
    const template = await prisma.chatTemplate.findUnique({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

// POST /api/templates - Create new template
router.post("/", async (req, res) => {
  try {
    const { name, category, message, description, variables, tags, enabled } = req.body;

    if (!name || !category || !message) {
      return res.status(400).json({ error: "name, category, and message are required" });
    }

    // Detect variables from message if not provided
    let detectedVariables = variables || [];
    if (!detectedVariables.length) {
      const variablePattern = /\{([^}]+)\}/g;
      const matches = message.match(variablePattern);
      if (matches) {
        detectedVariables = [...new Set(matches.map(m => m.replace(/[{}]/g, "")))];
      }
    }

    const template = await prisma.chatTemplate.create({
      data: {
        name,
        category,
        message,
        description: description || null,
        variables: detectedVariables,
        tags: tags || [],
        enabled: enabled !== undefined ? enabled : true,
        createdBy: req.user?.id || null
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating template:", error);

    if (error.code === "P2002") {
      return res.status(400).json({ error: "Template with this name already exists" });
    }

    res.status(500).json({ error: "Failed to create template" });
  }
});

// PUT /api/templates/:id - Update template
router.put("/:id", async (req, res) => {
  try {
    const { name, category, message, description, variables, tags, enabled } = req.body;

    // Detect variables from message if updating message
    let detectedVariables = variables;
    if (message && !detectedVariables) {
      const variablePattern = /\{([^}]+)\}/g;
      const matches = message.match(variablePattern);
      if (matches) {
        detectedVariables = [...new Set(matches.map(m => m.replace(/[{}]/g, "")))];
      }
    }

    const template = await prisma.chatTemplate.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(message && { message }),
        ...(description !== undefined && { description }),
        ...(detectedVariables && { variables: detectedVariables }),
        ...(tags && { tags }),
        ...(enabled !== undefined && { enabled })
      }
    });

    res.json(template);
  } catch (error) {
    console.error("Error updating template:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Template not found" });
    }

    res.status(500).json({ error: "Failed to update template" });
  }
});

// PATCH /api/templates/:id/toggle - Toggle template enabled status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const template = await prisma.chatTemplate.findUnique({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const updated = await prisma.chatTemplate.update({
      where: { id: req.params.id },
      data: { enabled: !template.enabled }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error toggling template:", error);
    res.status(500).json({ error: "Failed to toggle template" });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete("/:id", async (req, res) => {
  try {
    await prisma.chatTemplate.delete({
      where: { id: req.params.id }
    });

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Template not found" });
    }

    res.status(500).json({ error: "Failed to delete template" });
  }
});

// POST /api/templates/:id/duplicate - Duplicate template
router.post("/:id/duplicate", async (req, res) => {
  try {
    const original = await prisma.chatTemplate.findUnique({
      where: { id: req.params.id }
    });

    if (!original) {
      return res.status(404).json({ error: "Template not found" });
    }

    const duplicate = await prisma.chatTemplate.create({
      data: {
        name: `${original.name} (Copy)`,
        category: original.category,
        message: original.message,
        description: original.description,
        variables: original.variables,
        tags: original.tags,
        enabled: false
      }
    });

    res.status(201).json(duplicate);
  } catch (error) {
    console.error("Error duplicating template:", error);
    res.status(500).json({ error: "Failed to duplicate template" });
  }
});

// POST /api/templates/preview - Preview template with sample data
router.post("/preview", async (req, res) => {
  try {
    const { message, variables } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    let preview = message;
    const detectedVariables = [];

    // Find all variables
    const variablePattern = /\{([^}]+)\}/g;
    let match;
    while ((match = variablePattern.exec(message)) !== null) {
      detectedVariables.push(match[1]);
    }

    // Replace with provided variables or sample values
    if (variables && typeof variables === "object") {
      Object.keys(variables).forEach(key => {
        const placeholder = `{${key}}`;
        preview = preview.replace(new RegExp(placeholder, "g"), variables[key]);
      });
    }

    // Replace remaining variables with placeholders
    detectedVariables.forEach(key => {
      if (!variables || !variables[key]) {
        const placeholder = `{${key}}`;
        preview = preview.replace(new RegExp(placeholder, "g"), `[${key}]`);
      }
    });

    res.json({
      preview,
      variables: detectedVariables,
      hasUnfilledVariables: detectedVariables.some(v => !variables || !variables[v])
    });
  } catch (error) {
    console.error("Error previewing template:", error);
    res.status(500).json({ error: "Failed to preview template" });
  }
});

// GET /api/templates/categories - Get all categories
router.get("/meta/categories", async (req, res) => {
  try {
    const templates = await prisma.chatTemplate.findMany({
      select: { category: true },
      distinct: ["category"]
    });

    const categories = templates.map(t => t.category).sort();

    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/templates/variables/available - Get available variables from client model
router.get("/meta/variables", async (req, res) => {
  try {
    const availableVariables = [
      { key: "event_organizer", label: "Event Organizer", description: "Client's event organizer name" },
      { key: "variant_fcc", label: "Variant FCC", description: "Contact person variant (e.g., salah satu panitia)" },
      { key: "last_event", label: "Last Event", description: "Client's last event name" },
      { key: "link_demo", label: "Demo Link", description: "Link to demo (default: arachnova.id/demo)" },
      { key: "pic_name", label: "PIC Name", description: "Person in Charge name" },
      { key: "startup", label: "Startup", description: "Startup name (NOVAGATE/NOVATIX)" },
      { key: "phone_number", label: "Phone Number", description: "Client's phone number" },
      { key: "cp1st", label: "CP 1st", description: "First contact person" },
      { key: "cp2nd", label: "CP 2nd", description: "Second contact person" },
      { key: "ig_link", label: "Instagram Link", description: "Instagram profile link" },
      { key: "notes", label: "Notes", description: "Additional notes" }
    ];

    res.json({ variables: availableVariables });
  } catch (error) {
    console.error("Error fetching variables:", error);
    res.status(500).json({ error: "Failed to fetch variables" });
  }
});

// POST /api/templates/:id/usage - Increment usage count
router.post("/:id/usage", async (req, res) => {
  try {
    const template = await prisma.chatTemplate.update({
      where: { id: req.params.id },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    res.json({ usageCount: template.usageCount });
  } catch (error) {
    console.error("Error incrementing usage:", error);
    res.status(500).json({ error: "Failed to increment usage" });
  }
});

export default router;
