import axios from "axios";
import getPrisma from "../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// Ordered by preference. On 429/error, falls through to the next.
const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-coder:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "stepfun/step-3.5-flash:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

const TOOLS = [
  { type: "function", function: { name: "search_clients", description: "Search CCI clients by name, deal stage, risk level, or event type.", parameters: { type: "object", properties: { query: { type: "string", description: "Partial client name (optional)" }, dealStage: { type: "string", description: "Prospect, Negotiation, Closed Won, Closed Lost, On Hold" }, riskLevel: { type: "string", description: "Low, Medium, High" }, eventType: { type: "string", description: "Filter by event type (partial match)" } } } } },
  { type: "function", function: { name: "get_client_detail", description: "Get full detail of a specific client including all notes, tasks, and MoU drafts.", parameters: { type: "object", properties: { clientId: { type: "string", description: "The client ID or client name" } }, required: ["clientId"] } } },
  { type: "function", function: { name: "search_notes", description: "Search across ALL clients' notes by content text. Use this when user asks about specific note content, reminders, or information stored in notes.", parameters: { type: "object", properties: { query: { type: "string", description: "Text to search for in note content (partial match, case-insensitive)" }, category: { type: "string", description: "Optional: filter by category - tech_requirement, negotiation, legal, general" } }, required: ["query"] } } },
  { type: "function", function: { name: "list_tasks", description: "List TechSprint tasks with optional filters.", parameters: { type: "object", properties: { assignedTo: { type: "string", description: "Filter by assignee name" }, status: { type: "string", description: "TODO, IN_PROGRESS, DONE, BLOCKED" }, clientId: { type: "string", description: "Filter by client ID" }, week: { type: "string", description: "YYYY-WNN format" } } } } },
  { type: "function", function: { name: "get_workload_summary", description: "Get per-person task count summary.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_flagged_tech_notes", description: "Get all clients with unresolved tech_requirement notes.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "create_client", description: "Create a new CCI client record. WRITE action - requires user confirmation.", parameters: { type: "object", properties: { clientName: { type: "string", description: "Client/organization name" }, eventName: { type: "string", description: "Name of the event" }, eventType: { type: "string", description: "Type of event (concert, conference, competition, etc.)" }, expectedVolume: { type: "number", description: "Expected number of attendees/registrants" }, platformFee: { type: "number", description: "Platform fee percentage or amount" }, timeline: { type: "string", description: "Event timeline/date" }, dealStage: { type: "string", description: "Prospect, Negotiation, Closed Won, Closed Lost, On Hold" }, riskLevel: { type: "string", description: "Low, Medium, High" }, customDevRequired: { type: "boolean", description: "Whether custom development is needed" }, negotiationStatus: { type: "string", description: "Current negotiation status" }, mouStatus: { type: "string", description: "MoU status" } }, required: ["clientName"] } } },
  { type: "function", function: { name: "update_client_field", description: "Update a field on a CCI client record. WRITE action - requires user confirmation.", parameters: { type: "object", properties: { clientId: { type: "string", description: "The client ID to update" }, field: { type: "string", description: "clientName, eventName, eventType, expectedVolume, dealStage, riskLevel, platformFee, timeline, negotiationStatus, customDevRequired, mouStatus" }, value: { type: "string", description: "New value for the field" } }, required: ["clientId", "field", "value"] } } },
  { type: "function", function: { name: "add_client_note", description: "Add a note to a client. WRITE action - requires user confirmation.", parameters: { type: "object", properties: { clientId: { type: "string", description: "The client ID" }, content: { type: "string", description: "Note content" }, category: { type: "string", description: "tech_requirement, negotiation, legal, general" } }, required: ["clientId", "content", "category"] } } },
  { type: "function", function: { name: "create_task", description: "Create a new TechSprint task. WRITE action - requires user confirmation.", parameters: { type: "object", properties: { title: { type: "string", description: "Task title" }, description: { type: "string", description: "Task description (optional)" }, assignedTo: { type: "string", description: "Person to assign to (optional)" }, deadline: { type: "string", description: "Deadline in ISO format (optional)" }, clientId: { type: "string", description: "Related client ID (optional)" }, status: { type: "string", description: "Initial status: TODO, IN_PROGRESS, DONE, BLOCKED. Defaults to TODO." } }, required: ["title"] } } },
  { type: "function", function: { name: "update_task", description: "Update a TechSprint task. WRITE action - requires user confirmation.", parameters: { type: "object", properties: { taskId: { type: "string", description: "The task ID to update" }, status: { type: "string", description: "New status: TODO, IN_PROGRESS, DONE, BLOCKED" }, assignedTo: { type: "string", description: "New assignee" }, deadline: { type: "string", description: "New deadline in ISO format" }, title: { type: "string", description: "New title" } }, required: ["taskId"] } } },
];

const WRITE_TOOLS = new Set(["create_client", "update_client_field", "add_client_note", "create_task", "update_task"]);

const SYSTEM_PROMPT = `You are OpenClaw, an internal AI assistant for Roetix (a ticketing technology company). You help the founder and team manage client relationships (CCI), tasks (TechSprint), and MoU documents.

You have access to tools to read and write data. For READ operations, use them freely. For WRITE operations, you will propose the action and the user will confirm before it executes.

Key context:
- CCI: client database with notes, deal stages, risk levels
- TechSprint: lightweight task tracker (TODO, IN_PROGRESS, DONE, BLOCKED)
- MoU Maker: memorandum of understanding drafts

IMPORTANT: When the user asks about information stored in notes (reminders, standby schedules, action items, etc.), ALWAYS use the search_notes tool to search note content. Do NOT rely on search_clients alone - it does not search note content.

When classifying note categories:
- tech_requirement: custom features, technical needs, integrations, dev work
- negotiation: pricing, terms, discounts, fees
- legal: contracts, compliance, liability
- general: everything else (reminders, schedules, standby, follow-ups)

Be concise and helpful. When proposing write actions, briefly explain what you will do.`;

async function callLLM(messages) {
  let lastErr;
  for (const model of MODELS) {
    try {
      const res = await axios.post(OPENROUTER_URL, {
        model,
        messages,
        tools: TOOLS,
        max_tokens: 2048,
      }, {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 45000,
      });
      const msg = res.data.choices[0].message;
      if (msg) {
        console.log(`OpenClaw: using model ${model}`);
        return msg;
      }
    } catch (err) {
      const status = err.response?.status || err.response?.data?.error?.code;
      const errMsg = err.response?.data?.error?.message || err.message;
      console.log(`OpenClaw: ${model} failed (${status}): ${errMsg?.slice(0, 80)}`);
      lastErr = err;
      if (status === 429 || status === 404 || errMsg?.includes("rate-limit") || errMsg?.includes("No endpoints")) continue;
      throw err; // non-retriable error
    }
  }
  throw lastErr || new Error("All models exhausted");
}

async function executeReadTool(toolName, toolArgs) {
  const prisma = getPrisma();
  switch (toolName) {
    case "search_clients": {
      const where = {};
      if (toolArgs.dealStage) where.dealStage = toolArgs.dealStage;
      if (toolArgs.riskLevel) where.riskLevel = toolArgs.riskLevel;
      if (toolArgs.query) where.clientName = { contains: toolArgs.query, mode: "insensitive" };
      if (toolArgs.eventType) where.eventType = { contains: toolArgs.eventType, mode: "insensitive" };
      const clients = await prisma.client.findMany({ where, orderBy: { updatedAt: "desc" }, take: 20 });
      return clients.map((c) => ({ id: c.id, clientName: c.clientName, eventName: c.eventName, dealStage: c.dealStage, riskLevel: c.riskLevel, eventType: c.eventType, expectedVolume: c.expectedVolume }));
    }
    case "get_client_detail": {
      let c = await prisma.client.findUnique({ where: { id: toolArgs.clientId }, include: { tasks: true, mouDrafts: { select: { id: true, title: true, status: true } } } });
      if (!c) {
        c = await prisma.client.findFirst({ where: { clientName: { contains: toolArgs.clientId, mode: "insensitive" } }, include: { tasks: true, mouDrafts: { select: { id: true, title: true, status: true } } } });
      }
      return c || { error: "Client not found" };
    }
    case "search_notes": {
      const clients = await prisma.client.findMany({ orderBy: { updatedAt: "desc" } });
      const queryLower = (toolArgs.query || "").toLowerCase();
      const results = [];
      for (const client of clients) {
        const notes = Array.isArray(client.notes) ? client.notes : [];
        const matched = notes.filter((n) => {
          const contentMatch = (n.content || "").toLowerCase().includes(queryLower);
          const categoryMatch = !toolArgs.category || n.category === toolArgs.category;
          return contentMatch && categoryMatch;
        });
        if (matched.length > 0) {
          results.push({ clientId: client.id, clientName: client.clientName, matchedNotes: matched });
        }
      }
      return results.length > 0 ? results : { message: "No notes found matching: " + toolArgs.query };
    }
    case "list_tasks": {
      const where = { parentId: null };
      if (toolArgs.assignedTo) where.assignedTo = { contains: toolArgs.assignedTo, mode: "insensitive" };
      if (toolArgs.status) where.status = toolArgs.status;
      if (toolArgs.clientId) where.clientId = toolArgs.clientId;
      return await prisma.task.findMany({ where, include: { client: { select: { clientName: true } } }, orderBy: { createdAt: "desc" }, take: 50 });
    }
    case "get_workload_summary": {
      const tasks = await prisma.task.findMany({ select: { assignedTo: true, status: true } });
      const workload = {};
      for (const t of tasks) { const p = t.assignedTo || "Unassigned"; if (!workload[p]) workload[p] = { TODO: 0, IN_PROGRESS: 0, DONE: 0, BLOCKED: 0 }; workload[p][t.status]++; }
      return workload;
    }
    case "get_flagged_tech_notes": {
      const clients = await prisma.client.findMany({ orderBy: { updatedAt: "desc" } });
      return clients.filter((c) => { const notes = Array.isArray(c.notes) ? c.notes : []; return notes.some((n) => n.category === "tech_requirement" && !n.resolved); }).map((c) => ({ id: c.id, clientName: c.clientName, techNotes: (Array.isArray(c.notes) ? c.notes : []).filter((n) => n.category === "tech_requirement" && !n.resolved) }));
    }
    default: return { error: "Unknown tool" };
  }
}

async function resolveClientId(prisma, clientId) {
  let client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    client = await prisma.client.findFirst({ where: { clientName: { contains: clientId, mode: "insensitive" } } });
  }
  return client;
}

async function executeWriteTool(toolName, toolArgs) {
  const prisma = getPrisma();
  switch (toolName) {
    case "create_client": {
      const data = {};
      if (toolArgs.clientName) data.clientName = toolArgs.clientName;
      if (toolArgs.eventName) data.eventName = toolArgs.eventName;
      if (toolArgs.eventType) data.eventType = toolArgs.eventType;
      if (toolArgs.expectedVolume) data.expectedVolume = parseInt(toolArgs.expectedVolume) || 0;
      if (toolArgs.platformFee) data.platformFee = parseFloat(toolArgs.platformFee) || 4.0;
      if (toolArgs.timeline) data.timeline = toolArgs.timeline;
      if (toolArgs.dealStage) data.dealStage = toolArgs.dealStage;
      if (toolArgs.riskLevel) data.riskLevel = toolArgs.riskLevel;
      if (toolArgs.negotiationStatus) data.negotiationStatus = toolArgs.negotiationStatus;
      if (toolArgs.mouStatus) data.mouStatus = toolArgs.mouStatus;
      if (toolArgs.customDevRequired !== undefined) data.customDevRequired = toolArgs.customDevRequired;
      return await prisma.client.create({ data });
    }
    case "update_client_field": {
      const c = await resolveClientId(prisma, toolArgs.clientId);
      if (!c) return { error: "Client not found: " + toolArgs.clientId };
      return await prisma.client.update({ where: { id: c.id }, data: { [toolArgs.field]: toolArgs.value } });
    }
    case "add_client_note": {
      const c = await resolveClientId(prisma, toolArgs.clientId);
      if (!c) return { error: "Client not found: " + toolArgs.clientId };
      const notes = Array.isArray(c.notes) ? c.notes : [];
      const newNote = { id: uuidv4(), content: toolArgs.content, category: toolArgs.category || "general", resolved: false, createdAt: new Date().toISOString() };
      notes.push(newNote);
      await prisma.client.update({ where: { id: c.id }, data: { notes } });
      return newNote;
    }
    case "create_task": {
      const data = { ...toolArgs };
      if (data.clientId) {
        const c = await resolveClientId(prisma, data.clientId);
        if (c) data.clientId = c.id; else delete data.clientId;
      }
      if (data.deadline) data.deadline = new Date(data.deadline);
      if (!data.status) data.status = "TODO";
      return await prisma.task.create({ data, include: { client: { select: { clientName: true } } } });
    }
    case "update_task": {
      const { taskId, ...data } = toolArgs;
      if (data.deadline) data.deadline = new Date(data.deadline);
      return await prisma.task.update({ where: { id: taskId }, data, include: { client: { select: { clientName: true } } } });
    }
    default: return { error: "Unknown write tool" };
  }
}

function buildConfirmationPreview(toolName, toolArgs) {
  switch (toolName) {
    case "create_client": return { action: "Create new client", clientName: toolArgs.clientName, eventName: toolArgs.eventName, eventType: toolArgs.eventType, volume: toolArgs.expectedVolume, fee: toolArgs.platformFee, timeline: toolArgs.timeline, dealStage: toolArgs.dealStage };
    case "update_client_field": return { action: "Update client field", field: toolArgs.field, newValue: toolArgs.value, clientId: toolArgs.clientId };
    case "add_client_note": return { action: "Add note to client", content: toolArgs.content, category: toolArgs.category, clientId: toolArgs.clientId };
    case "create_task": return { action: "Create task", title: toolArgs.title, assignedTo: toolArgs.assignedTo, deadline: toolArgs.deadline, clientId: toolArgs.clientId };
    case "update_task": return { action: "Update task", taskId: toolArgs.taskId, changes: Object.fromEntries(Object.entries(toolArgs).filter(([k]) => k !== "taskId")) };
    default: return { action: toolName, args: toolArgs };
  }
}

const MAX_TOOL_ROUNDS = 5;

// ── Helper: save messages to DB conversation ──
async function saveConversation(conversationId, title, messages) {
  const prisma = getPrisma();
  if (conversationId) {
    // Append new messages to existing conversation
    const existing = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (existing) {
      // Get count of existing messages to know which are new
      const existingCount = await prisma.chatMessage.count({ where: { conversationId } });
      const newMsgs = messages.slice(existingCount);
      if (newMsgs.length > 0) {
        await prisma.chatMessage.createMany({
          data: newMsgs.map((m) => ({
            conversationId,
            role: m.role,
            content: m.content || null,
            toolCalls: m.tool_calls || null,
          })),
        });
        await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
      }
      return conversationId;
    }
  }
  // Create new conversation
  const convo = await prisma.conversation.create({
    data: {
      title: title || null,
      messages: {
        create: messages.map((m) => ({
          role: m.role,
          content: m.content || null,
          toolCalls: m.tool_calls || null,
        })),
      },
    },
  });
  return convo.id;
}

// Generate a short title from the first user message
function generateTitle(message) {
  return message.length > 60 ? message.slice(0, 57) + "..." : message;
}

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [], conversationId } = req.body;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const reply = await callLLM(messages);

      // No tool calls - return text
      if (!reply.tool_calls || reply.tool_calls.length === 0) {
        const updatedHistory = [...conversationHistory, { role: "user", content: message }, { role: "assistant", content: reply.content }];
        // Save to DB
        const title = conversationHistory.length === 0 ? generateTitle(message) : undefined;
        const savedId = await saveConversation(conversationId, title, updatedHistory);

        return res.json({
          requiresConfirmation: false,
          reply: reply.content || "I'm not sure how to help with that.",
          updatedHistory,
          conversationId: savedId,
        });
      }

      const tc = reply.tool_calls[0];
      const toolName = tc.function.name;
      let toolArgs;
      try { toolArgs = JSON.parse(tc.function.arguments); } catch { toolArgs = {}; }

      // Write tool - ask for confirmation
      if (WRITE_TOOLS.has(toolName)) {
        const updatedHistory = [...conversationHistory, { role: "user", content: message }];
        const title = conversationHistory.length === 0 ? generateTitle(message) : undefined;
        const savedId = await saveConversation(conversationId, title, updatedHistory);

        return res.json({
          requiresConfirmation: true,
          reply: reply.content || "I will " + toolName.replace(/_/g, " ") + ". Please confirm:",
          toolName,
          toolArgs,
          toolUseId: tc.id,
          confirmationPreview: buildConfirmationPreview(toolName, toolArgs),
          assistantMessage: reply,
          updatedHistory,
          conversationId: savedId,
        });
      }

      // Read tool - execute and continue loop
      const toolResult = await executeReadTool(toolName, toolArgs);
      messages.push({ role: "assistant", content: reply.content || null, tool_calls: reply.tool_calls });
      messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(toolResult) });
    }

    return res.json({
      requiresConfirmation: false,
      reply: "I performed several lookups but could not fully answer. Please try a more specific question.",
      updatedHistory: conversationHistory,
      conversationId,
    });
  } catch (err) {
    console.error("OpenClaw error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
};

export const confirm = async (req, res) => {
  try {
    const { toolName, toolArgs, toolUseId, assistantMessage, confirmed, conversationHistory = [], userMessage, conversationId } = req.body;

    if (!confirmed) return res.json({ reply: "Action cancelled. Let me know if you need anything else.", conversationId });

    const result = await executeWriteTool(toolName, toolArgs);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: userMessage || "Please proceed." },
      { role: "assistant", content: assistantMessage.content || null, tool_calls: assistantMessage.tool_calls },
      { role: "tool", tool_call_id: toolUseId, content: JSON.stringify(result) },
    ];

    const reply = await callLLM(messages);
    const updatedHistory = [...messages.slice(1), { role: "assistant", content: reply.content }];
    const savedId = await saveConversation(conversationId, undefined, updatedHistory);

    return res.json({
      reply: reply.content || "Done! Action completed successfully.",
      result,
      updatedHistory,
      conversationId: savedId,
    });
  } catch (err) {
    console.error("OpenClaw confirm error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
};

// ── Conversation CRUD endpoints ──

export const listConversations = async (req, res) => {
  try {
    const prisma = getPrisma();
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, title: true, createdAt: true, updatedAt: true, _count: { select: { messages: true } } },
    });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const prisma = getPrisma();
    const convo = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!convo) return res.status(404).json({ error: "Conversation not found" });
    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const prisma = getPrisma();
    await prisma.conversation.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
